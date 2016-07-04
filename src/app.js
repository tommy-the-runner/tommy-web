let Rx = require('rx')

import {
    div,
    span,
    hJSX
} from '@cycle/dom'

import CodePanel from './components/code_panel'
import SpecsPanel from './components/specs_panel'
import Results from './components/results'

function renderPageContent(codePanel$, specsPanel$, $results) {
    return Rx.Observable.combineLatest(codePanel$, specsPanel$, $results, (codePanel, specsPanel, results) => {
        return (<div>
            <div id="container" className="clearfix">
                { codePanel }
                { specsPanel }
            </div>

            <div className="footer clearfix">
                <div id="terminal">
                    <span>{ results }</span>
                </div>
                <div className="copyright">
                    <span>Copyright @ 2016</span>
                </div>
            </div>
        </div>)
    })
}

function app(sources) {
    const {actions, context, config, DOM, HTTP} = sources

    const context$ = context
        .concat(HTTP
            .flatMap(res => res)
            .map(apiResponse => {
                return apiResponse.body
            })
            .shareReplay(1)
        )

    const specsPanel = SpecsPanel({DOM, context: context$})
    const specCode$ = specsPanel.code$
    const codePanel = CodePanel({DOM, context: context$, specCode$})
    const results$ = Results({DOM, testResults: codePanel.testResults})
    const vtree$ = renderPageContent(codePanel.DOM, specsPanel.DOM, results$.DOM)

    const request$ = Rx.Observable.combineLatest(actions, config, (action, cfg) => {
        const exerciseSlug = action.data.exerciseSlug
        const apiUrl = cfg.api_url

        return {url: `${apiUrl}?slug=${exerciseSlug}`}
    })

    return {
        DOM: vtree$,
        HTTP: request$,
        context: context$
    }
}

module.exports = app
