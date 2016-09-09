import {div, header, footer, button, p, hJSX} from '@cycle/dom'
import isolate from '@cycle/isolate'
import AceEditor from 'cyclejs-ace-editor'
import {Observable, Subject} from 'rx'

function intent({context}) {
    return context.map(json => {
        const specsCodeRaw = json.specsCode || ''
        return specsCodeRaw.replace('require(\'subject\')', '/* your code here */')
    })
}

function view(editor) {
    return Observable.just(
        <div id="spec">
            <header>
                <div className="container-header">
                    Specs
                </div>
                <div className="header-triangle"></div>
            </header>
            <div className="spec-body">
                {editor.DOM}
            </div>
        </div>
    )
}

function SpecsPanel(sources) {
    const {DOM} = sources
    const initialValue$ = intent(sources)

    const params$ = Observable.just({
        theme: 'ace/theme/clouds_midnight',
        mode: 'ace/mode/javascript',
        readOnly: true
    })
    const editor = AceEditor({DOM, initialValue$, params$})
    const vtree$ = view(editor)

    const code$ = editor.value$.map(sources => {
        return sources.replace('/* your code here */', 'require(\'subject\')')
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
