import {div, header, footer, button, p, hJSX} from '@cycle/dom'
import isolate from '@cycle/isolate'
import AceEditor from 'cyclejs-ace-editor'

let {Observable} = require('rx')

function intent({DOM, context}) {
    const buttonClicks$ = DOM.select('.submit-button').events('click')

    const initialCodeValue$ = context.map(json => {
      return json.initialCode || ''
    })

    return {
        buttonClicks$,
        initialCodeValue$
    }
}

function view(subjectCodeEditor) {

    return Observable
        .just(
            <div id="code">
                <header>
                    <div className="container-header">
                        Your code
                    </div>
                </header>
                <div className="code">
                    { subjectCodeEditor.DOM }
                </div>
                <footer>
                    <button className="submit-button">Submit</button>
                </footer>
            </div>
        )
}

function CodePanel(sources) {
    const {DOM} = sources

    const {buttonClicks$, initialCodeValue$} = intent(sources)

    const params$ = Observable.just({
      theme: 'ace/theme/clouds_midnight',
      mode: 'ace/mode/javascript'
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
