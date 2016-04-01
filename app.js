let Rx = require('rx')
let {div, ul, li, a, section, h1, p, button, label, hJSX} = require('@cycle/dom');
import TimestampButton from './timestamp_button.js'

function renderMenu() {
    return (
        <ul>
            <li><a href="/" class="link">Home</a></li>
            <li><a href="/about" class="link">About</a></li>
        </ul>
    );
}

function renderHomePage(timestampButton) {
    return (
        <section className="home">
            <h1>The homepage</h1>
            <p>Welcome to our spectacular web page with nothing special here.</p>
            {renderMenu()}
            {timestampButton.DOM}
        </section>
    )
}

function renderAboutPage() {
    return (
        <section className="about">
            <h1>Read more about us</h1>
            <p>This is the page where we describe ourselves.</p>
            <p>Contact us</p>
            {renderMenu()}
        </section>
    )
}

function app(sources) {
    let routeFromClick$ = sources.DOM.select('.link').events('click')
        .doOnNext(ev => ev.preventDefault())
        .map(ev => {
            console.log('app.js map for route clicks')
            return ev.currentTarget.attributes.href.value

        });

    let ongoingContext$ = sources.context
        .merge(routeFromClick$)
        .scan((acc, x) => {
            acc.route = x;
            return acc;
        })

    let vtree$ = ongoingContext$
        .map(({route}) => {
            if (typeof window !== 'undefined') {
                window.history.pushState(null, '', route);
            }
            switch (route) {
                case '/': return renderHomePage(TimestampButton(sources));
                case '/about': return renderAboutPage();
                default: return div(`Unknown page ${route}`)
            }
        });

    return {
        DOM: vtree$
    };
}

module.exports = app;