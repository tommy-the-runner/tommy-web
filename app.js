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

import TimestampButton from './components/timestamp_button.js'
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
    let codePanel$ = CodePanel(sources)
    let specsPanel$ = SpecsPanel(sources)

    let vtree$ = renderPageContent(codePanel$.DOM, specsPanel$.DOM)

    return {
        DOM: vtree$
    };
}

module.exports = app;
