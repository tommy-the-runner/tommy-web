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

import TimestampButton from './timestamp_button.js'

function renderHomePage(child$, child2$) {

    return Rx.Observable.combineLatest(child$, child2$, (button, button2) => (
        <section className="home">
            <h1>The homepage</h1>
            <p>Welcome to our spectacular web page with nothing special here.</p>
            { button }
            { button2 }
        </section>
    ))
}

function app(sources) {
    let button$ = TimestampButton(sources)
    let button2$ = TimestampButton(sources)

    let vtree$ = renderHomePage(button$.DOM, button2$.DOM)

    return {
        DOM: vtree$
    };
}

module.exports = app;
