import {div, header, footer, button, p, hJSX} from '@cycle/dom'
import isolate from '@cycle/isolate'
import AceEditor from 'cyclejs-ace-editor'
import {Observable, Subject} from 'rx'

const defaultEditorOptions = {
  theme: 'ace/theme/clouds_midnight',
  readOnly: true,
  fontSize: 13,
  sessionOptions: {
    mode: 'ace/mode/javascript',
    tabSize: 2
  }
}

function intent({context}) {
  const specCodeValue$ = context.map(json => {
    const specsCodeRaw = json.specsCode || ''
    return specsCodeRaw.replace('require(\'subject\')', '/* the code from the left panel */')
  })

  const specCodeEditable$ = context.map(json => {
    if (json.specsCodeEditable === false) {
      return false
    }
    return true
  })

  return {
    specCodeValue$,
    specCodeEditable$
  }
}

function view(editor) {
  return Observable.just(
        <div id="spec">
            <header className="clearfix">
                <div className="container-header">
                    Specs
                </div>
            </header>
            <div className="spec-body">
                {editor.DOM}
            </div>
        </div>
    )
}

function SpecsPanel(sources) {
  const {DOM} = sources
  const {specCodeValue$, specCodeEditable$} = intent(sources)

  const params$ = specCodeEditable$.map(isEditable => {
    return Object.assign({}, defaultEditorOptions, {
      readOnly: !isEditable
    })
  })
  const editor = AceEditor({DOM, initialValue$: specCodeValue$, params$})
  const vtree$ = view(editor)

  const code$ = editor.value$.map(code => {
    return code.replace('/* your code here */', 'require(\'subject\')')
  })

  return {
    DOM: vtree$,
    code$: code$
  }
}

function SpecsPanelWrapper(sources) {
  return isolate(SpecsPanel)(sources)
}

export default SpecsPanelWrapper
