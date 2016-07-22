const { shell } = require('electron')
const isBlank = require('is-blank')

exports.middleware = store => next => action => {
  if ('SESSION_USER_DATA' === action.type) {
    const { data } = action

    store.dispatch({
      type: 'HYPERTYPE_USER_DATA',
      data
    })
  }

  console.log(action)
  next(action)
}

exports.reduceUI = (state, action) => {
  console.log(state)
  console.log(action)
  switch (action.type) {
    case 'HYPERTYPE_USER_DATA':
      const hypertypeUserData = state.hypertypeUserData || []
      console.log(hypertypeUserData, 'wooo')
      return state.set('hypertypeUserData', hypertypeUserData.concat(action.data))
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

      this.displayKeys()
    }

    displayKeys () {
      console.log(this.props, 'lol')
      const { hypertypeUserData } = this.props

      if (!hypertypeUserData || !hypertypeUserData.length) return

      const keys = document.createElement('div')
      keys.style = 'position: absolute; bottom: 0; right: 0; padding: 50px; background-color: rebeccapurple; color: tomato; font-size:2rem; font-family: sans-serif;'

      keys.appendChild(
        document.createTextNode(hypertypeUserData.join(''))
      )

      this.div = keys
      document.body.appendChild(keys)
    }

    onCursorChange () {
      console.log(this.cursor)
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
