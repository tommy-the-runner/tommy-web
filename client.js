let Cycle = require('@cycle/core');
let {Observable} = require('rx');
let {makeDOMDriver} = require('@cycle/dom');
let app = require('./app');

function clientSideApp(responses) {
    let requests = app(responses);

    return requests;
}

Cycle.run(clientSideApp, {
    DOM: makeDOMDriver('.app-container'),
    context: () => Observable.just(window.appContext)
});
