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

function intent({context}) {

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
      </div>
    )
}

function CodePanel(sources) {
  const {DOM} = sources

  const {initialCodeValue$, initialCodeEditable$} = intent(sources)

  const params$ = initialCodeEditable$.map(isEditable => {
    return Object.assign({}, defaultEditorOptions, {
      readOnly: !isEditable
    })
  })

  const subjectCodeEditor = AceEditor({DOM, initialValue$: initialCodeValue$, params$})
  const vtree$ = view(subjectCodeEditor)

  return {
    DOM: vtree$,
    code$: subjectCodeEditor.value$
  }
}

function CodePanelWrapper(sources) {
  return isolate(CodePanel)(sources)
}

export default CodePanelWrapper
