let Cycle = require('@cycle/core');
let {Observable} = require('rx');
let {makeDOMDriver} = require('@cycle/dom');
let { makeHTTPDriver } = require('@cycle/http');
let app = require('./app');

function clientSideApp(responses) {
    let requests = app(responses);

    return requests;
}

Cycle.run(clientSideApp, {
    DOM: makeDOMDriver('.app-container'),
    HTTP: makeHTTPDriver(),
    context: () => Observable.just(window.appContext)
});
