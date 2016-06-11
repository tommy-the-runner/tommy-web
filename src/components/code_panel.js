import {div, header, footer, button, p, hJSX} from '@cycle/dom'
import isolate from '@cycle/isolate'

let tommy = require('tommy-the-runner')
let Rx = require('rx')

function intent({DOM, context}) {
    let buttonClicks$ = DOM.select('.submit-button').events('click')
    let testResult$ = Rx.Observable
        .combineLatest(buttonClicks$, context, (c, ex) => {
            return ex
        })
        .flatMap(ex => {
            const userCode = document.getElementById('user-code').value
            return Rx.Observable.fromPromise(tommy.run(userCode, ex.specsCode))
        })
        .map(reporter => {
            const stats = reporter.stats

            const failed = stats.failures
            const passed = stats.passes
            const pending = stats.pending

            const numTests = stats.tests

            const result = {failed, passed, pending, numTests, status: 'unknown'}

            if (failed > 0) {
                result.status = 'failed'
            }

            if (passed === numTests) {
                result.status = 'passed'
            }

            return result
        })
        .catch(err => {
            return {status: 'error', error: `Execution error: ${err}}`}
        })

    return testResult$.startWith({})
}

function getResultElement(res) {
    if (!res.status) {
        return ''
    }

    let resultElement = ''

    switch(res.status) {
    case 'error':
        resultElement = <p className= { res.status }>{ res.error }</p>
        break

    case 'passed':
    case 'failed':
        resultElement =
        <p className={ res.status }>
          {`${res.numTests} test(s) run. ${res.passed} passed, ${res.failed} failed, ${res.pending} pending`}
        </p>
        break

    default:
        resultElement = <p>Unrecognized status: {res.status}</p>
    }

    return resultElement
}

function view(testResults$) {
    return testResults$
        .map(res => {
            const codeTemplate = 'function sum() {\n\n}\n\nmodule.exports = sum'

            return (
                <div id="code">
                    <header>
                        <div className="container-header">
                            Your code
                        </div>
                    </header>
                    <div className="code">
                        <textarea id="user-code">{ codeTemplate }</textarea>
                    </div>
                    <footer>
                        <button className="submit-button">Submit</button>
                        { getResultElement(res) }
                    </footer>
                </div>
            )
        })
}

function CodePanel(sources) {
    const testResult$ = intent(sources)
    const vtree$ = view(testResult$)

    return {
        DOM: vtree$
    }
}

function CodePanelWrapper(sources) {
    return isolate(CodePanel)(sources)
}

export default CodePanelWrapper
