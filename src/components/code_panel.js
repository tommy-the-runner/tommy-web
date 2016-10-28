import {div, header, footer, button, p, hJSX} from '@cycle/dom'
import isolate from '@cycle/isolate'
import AceEditor from 'cyclejs-ace-editor'

let {Observable} = require('rx')

const defaultEditorOptions = {
  theme: 'ace/theme/clouds_midnight',
  fontSize: 13,
  sessionOptions: {
    mode: 'ace/mode/javascript',
    tabSize: 2
  }
}

function intent({DOM, context}) {
    const buttonClicks$ = DOM.select('.submit-button').events('click')

    const initialCodeValue$ = context.map(json => {
      return json.initialCode || ''
    })

  const initialCodeEditable$ = context.map(json => {
    if (json.initialCodeEditable === false) {
      return false
    }

    return true
  })

  return {
    buttonClicks$,
    initialCodeValue$,
    initialCodeEditable$
  }
}

function view(subjectCodeEditor) {

    return Observable
        .just(
            <div id="code">
                <header className="clearfix">
                    <div className="container-header">
                        Your code
                    </div>
                </header>
                <div className="code">
                    { subjectCodeEditor.DOM }
                </div>
                <footer>
                    <button className="submit-button">Run</button>
                </footer>
            </div>
        )
}

function CodePanel(sources) {
    const {DOM} = sources

    const {buttonClicks$, initialCodeValue$, initialCodeEditable$} = intent(sources)

    const params$ = initialCodeEditable$.map(isEditable => {
      return Object.assign({}, defaultEditorOptions, {
        readOnly: !isEditable
      })
    })

    const subjectCodeEditor = AceEditor({DOM, initialValue$: initialCodeValue$, params$})
    const vtree$ = view(subjectCodeEditor)

    return {
        DOM: vtree$,
        buttonClicks$: buttonClicks$,
        code$: subjectCodeEditor.value$
    }
}

function CodePanelWrapper(sources) {
    return isolate(CodePanel)(sources)
}

export default CodePanelWrapper
