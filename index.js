const { shell } = require('electron')
const isBlank = require('is-blank')

let keySinceLastDispatch = null
let timeSinceLastDispatch = new Date()

exports.middleware = store => next => action => {
  if ('SESSION_USER_DATA' == action.type) {
    const hiddenDisplay = !config.getConfig().hypertype

    if (hiddenDisplay) {
      store.dispatch({
        type: 'HYPERTYPE_USER_DATA_CLEAR'
      })
    } else if (keySinceLastDispatch) {
      const now = new Date()

      if (now - timeSinceLastDispatch < 1000 || hiddenDisplay) {
        store.dispatch({
          type: 'HYPERTYPE_USER_DATA',
          data: keySinceLastDispatch
        })
      }

      timeSinceLastDispatch = now
      keySinceLastDispatch = null
    }
  }

  next(action)
}

exports.reduceUI = (state, action) => {
  switch (action.type) {
    case 'HYPERTYPE_USER_DATA_CLEAR':
      return state.set('hypertypeUserData', [])
    case 'HYPERTYPE_USER_DATA':
      const hypertypeUserData = state.hypertypeUserData || []
      hypertypeUserData.push(action.data)
      return state.set('hypertypeUserData', hypertypeUserData)
    default:
      return state
  }
}

exports.mapTermsState = (state, map) => {
  return Object.assign(map, {
    hypertypeUserData: state.ui.hypertypeUserData
  })
}

exports.getTermProps = (uid, parentProps, props) => {
  return Object.assign(props, {
    hypertypeUserData: parentProps.hypertypeUserData
  })
}

exports.decorateTerm = (Term, { React }) => {
  return class extends React.Component {
    constructor (props, context) {
      super(props, context)

      this.onTerminal = this.onTerminal.bind(this)
      this.onCursorChange = this.onCursorChange.bind(this)

      this.div = null
      this.cursor = null
      this.window = null
      this.observer = null
    }

    onTerminal (term) {
      if (this.props.onTerminal) {
        this.props.onTerminal(term)
      }

      this.div = term.div
      this.window = term.document_.defaultView
      this.cursor = term.cursorNode_;
      this.observer = new MutationObserver(this.onCursorChange)
      this.observer.observe(this.cursor, {
        attributes: true,
        childList: false,
        characterData: false
      })

      this.window.addEventListener('keydown', e => {
        keySinceLastDispatch = e.key
      })

      this.displayKeys()
    }

    displayKeys () {
      let { hypertypeUserData } = this.props

      if (!hypertypeUserData || !hypertypeUserData.length) return

      hypertypeUserData = hypertypeUserData.asMutable()

      const prevKeys = document.getElementById('hypertype')

      if (prevKeys) {
        prevKeys.parentNode.removeChild(prevKeys)
      }

      const keys = document.createElement('div')
      keys.id = 'hypertype'

      // TODO: Make configurable
      keys.style = `
        position: absolute;
        bottom: 0;
        right: 0;
        padding: 50px;
        background-color: #777;
        color: white;
        font-size:2rem;
        font-family: sans-serif;
        opacity: .8
      `

      keys.appendChild(document.createTextNode(hypertypeUserData.join('')))

      this.div = keys
      document.body.appendChild(keys)
      window.setTimeout(() => {
        keys.parentNode && keys.parentNode.removeChild(keys)
      }, 1000)
    }

    onCursorChange () {
      this.displayKeys()
    }

    render () {
      const props = Object.assign({}, this.props, {
        onTerminal: this.onTerminal
      })

      return React.createElement(Term, props)
    }
  }
}
