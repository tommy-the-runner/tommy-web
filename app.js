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
    sources.exercise = sources.HTTP
        .flatMap(res => res)
        .map(apiResponse => {
            return apiResponse.body
        })
        .startWith({})
        .shareReplay(1)

    let codePanel$ = CodePanel(sources)
    let specsPanel$ = SpecsPanel(sources)

    let vtree$ = renderPageContent(codePanel$.DOM, specsPanel$.DOM)

    const request$ = Rx.Observable.combineLatest(sources.context, sources.config, (ctx, cfg) => {
        const exerciseSlug = ctx.exerciseSlug
        const apiUrl = cfg.apiUrl

        return { url: `${apiUrl}?slug=${exerciseSlug}`}
    })

    return {
        DOM: vtree$,
        HTTP: request$
    };
}

module.exports = app;
