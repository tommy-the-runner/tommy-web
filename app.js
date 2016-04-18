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

function renderHomePage(timestampButton) {
    return (
        <section className="home">
            <h1>The homepage</h1>
            <p>Welcome to our spectacular web page with nothing special here.</p>
            {timestampButton}
        </section>
    )
}

function app(sources) {
    let button$ = TimestampButton(sources)

    let vtree$ = button$.DOM
        .map(buttonVtree => renderHomePage(buttonVtree));

    return {
        DOM: vtree$
    };
}

module.exports = app;
