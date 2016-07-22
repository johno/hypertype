const { shell } = require('electron')

exports.decorateTerm = (Term, { React }) => {
  return class extends React.Component {
    constructor (props, context) {
      super(props, context)

      this.onTerminal = this.onTerminal.bind(this)
      this.onCursorChange = this.onCursorChange.bind(this)

      this.div = null
      this.cursor = null
      this.observer = null
    }

    onTerminal (term) {
      if (this.props.onTerminal) {
        this.props.onTerminal(term)
      }

      this.div = term.div
      this.cursor = term.cursorNode_;
      this.observer = new MutationObserver(this.onCursorChange)
      this.observer.observe(this.cursor, {
        attributes: true,
        childList: false,
        characterData: false
      })
    }

    onCursorChange () {
      console.log('cursor changed')
      console.log(this.cursor)
    }

    render () {
      const props = Object.assign({}, this.props, {
        onTerminal: this.onTerminal
      })

      return React.createElement(Term, props)
    }
  }
}
