let Rx = require('rx')

let {
    div,
    a,
    section,
    h1,
    p,
    button,
    label,
    hJSX
} = require('@cycle/dom');

import CodePanel from './components/code_panel.js'
import SpecsPanel from './components/specs_panel.js'

function renderPageContent(codePanel$, specsPanel$) {

    return Rx.Observable.combineLatest(codePanel$, specsPanel$, (codePanel, specsPanel) => (
        <div id="container" className="clearfix">
            { codePanel }
            { specsPanel }
        </div>
    ))
}

function app(sources) {
    const { actions, context, config, DOM, HTTP } = sources

    const context$ = context
        .concat(HTTP
            .flatMap(res => res)
            .map(apiResponse => {
                return apiResponse.body
            })
            .shareReplay(1)
        )

    const codePanel$ = CodePanel({ DOM, context: context$ })
    const specsPanel$ = SpecsPanel({ DOM, context: context$ })

    const vtree$ = renderPageContent(codePanel$.DOM, specsPanel$.DOM)

    const request$ = Rx.Observable.combineLatest(actions, config, (action, cfg) => {
        const exerciseSlug = action.data.exerciseSlug
        const apiUrl = cfg.api_url

        return { url: `${apiUrl}?slug=${exerciseSlug}`}
    })

    return {
        DOM: vtree$,
        HTTP: request$,
        context: context$
    };
}

module.exports = app;
