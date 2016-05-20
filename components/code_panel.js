let {div, header, footer, button, p, hJSX} = require('@cycle/dom')
import isolate from '@cycle/isolate';

let tommy = require('tommy-the-runner')
let Rx = require('rx')

function intent({ DOM, exercise, context }) {

    let buttonClicks$ = DOM.select('.submit-button').events('click')
    let combined$ = Rx.Observable.combineLatest(buttonClicks$, exercise, (c, ex) => {
            return ex
        })
        .flatMap(ex => {
            var userCode = document.getElementById('user-code').value
            return Rx.Observable.fromPromise(tommy.run(userCode, ex.specsCode))
        })
        .map(reporter => {
            var stats = reporter.stats

            var failed = stats.failures
            var passed = stats.passes
            var pending = stats.pending

            var numTests = stats.tests

            var result = { failed, passed, pending, numTests, status: 'unknown' }

            if (failed > 0) {
                result.status = 'failed'
            }

            if (passed == numTests) {
                result.status = 'passed'
            }

            return result
        })
        .catch(err => {
            return { status: 'error', error: `Execution error: ${err}}` }
        })

    return context
        .map(ctx => ctx.timestamp)
        .concat(combined$)
}

function view(testResults$) {
    return testResults$
        .map(res => {
            var codeTemplate = 'function sum() {\n\n}\n\nmodule.exports = sum'

            var resultElement = ''
            switch(res.status) {
                case 'error':
                    resultElement = (
                        <p className= { res.status }>{ `${res.error}` }</p>
                    )
                    break
                case 'passed':
                case 'failed':
                    resultElement = (
                        <p className={ res.status }>{`${res.numTests} test(s) run. ${res.passed} passed, ${res.failed} failed, ${res.pending} pending`}</p>
                    )
                    break
            }

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
                        { resultElement }
                    </footer>
                </div>
            )
    })
}

function CodePanel(sources) {
    const timestamp$ = intent(sources)
    const vtree$ = view(timestamp$)

    return {
        DOM: vtree$
    }
}

function CodePanelWrapper(sources) {
    return isolate(CodePanel)(sources)
}

export default CodePanelWrapper