import {div, header, footer, button, p, hJSX} from '@cycle/dom'
import isolate from '@cycle/isolate'
import AceEditor from 'cyclejs-ace-editor'

let tommy = require('tommy-the-runner')
let {Observable, ReplaySubject} = require('rx')

function intent({DOM, context, specCode$}) {
    const buttonClicks$ = DOM.select('.submit-button').events('click')

    return {
        buttonClicks$,
        specCode$
    }
}

function model(sources) {
    const {buttonClicks$, subjectCode$, specCode$} = sources

    const subject$ = new ReplaySubject(1)

    const programs$ = Observable
        .combineLatest(subjectCode$, specCode$, (userCode, specsCode) => {
            return {userCode, specsCode}
        })
       .multicast(subject$)

    programs$.connect()
    const testResults$ = buttonClicks$
        .flatMap(() => subject$.take(1))
        .flatMap(({userCode, specsCode}) => {
            let promise = tommy.run(userCode, specsCode)
            return Observable.fromPromise(promise)
        })

    return testResults$
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
    const codeTemplate = 'function sum() {\n\n}\n\nmodule.exports = sum'

    const {DOM} = sources
    const initialValue$ = Observable.just(codeTemplate)

    const {buttonClicks$, specCode$} = intent(sources)

    const params$ = Observable.just({
      theme: 'ace/theme/monokai',
      mode: 'ace/mode/javascript'
    })

    const subjectCodeEditor = AceEditor({DOM, initialValue$, params$})
    const testResults$ = model({
        buttonClicks$,
        subjectCode$: subjectCodeEditor.value$,
        specCode$
    })
    const vtree$ = view(subjectCodeEditor)

    return {
        DOM: vtree$,
        testResults: testResults$
    }
}

function CodePanelWrapper(sources) {
    return isolate(CodePanel)(sources)
}

export default CodePanelWrapper
