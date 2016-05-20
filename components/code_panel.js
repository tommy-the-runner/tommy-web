let {div, header, footer, button, p, hJSX} = require('@cycle/dom')
import isolate from '@cycle/isolate';

let tommy = require('tommy-the-runner')
let Rx = require('rx')

function intent({ DOM, context }) {
    let buttonClicks$ = DOM.select('.submit-button').events('click')
        .flatMap(ev => {
           var userCode = document.getElementById('user-code').value

            // TODO: retrieve specs from the original JSON (store in context?)
            var specs = `
                            const expect = require('chai').expect
                            const sum = require('subject')
                            describe('sum', function () {
                                it('should sum two numbers', function () {
                                    expect(sum(1, 1)).to.equal(2)
                                })
                            })
                        `

            return Rx.Observable.fromPromise(tommy.run(userCode, specs))
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
        .concat(buttonClicks$)
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