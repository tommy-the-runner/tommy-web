let path = require('path');
let Cycle = require('@cycle/core');
let express = require('express');
let browserify = require('browserify');
let config = require('config')

let { Observable, ReplaySubject } = require('rx');
let { makeHTMLDriver } = require('@cycle/dom');
let { makeHTTPDriver } = require('@cycle/http');

let layout = require('./components/layout');
let app = require('./app');

function wrapVTreeWithHTMLBoilerplate(vtree, context, config, clientBundle) {
    return layout(vtree, context, config, clientBundle)
}

function prependHTML5Doctype(html) {
    return `<!doctype html>${html}`;
}

function wrapAppResultWithBoilerplate(appFn, context$, config$, bundle$) {
    return function wrappedAppFn(sources) {
        let app = appFn(sources)
        let vtree$ = app.DOM
        let wrappedVTree$ = Observable.combineLatest(vtree$, context$, config$, bundle$,
            wrapVTreeWithHTMLBoilerplate
        )

        return {
            DOM: wrappedVTree$,
            HTTP: app.HTTP
        };
    };
}

let clientBundle$ = (() => {
    let replaySubject = new ReplaySubject(1);
    let bundleString = '';
    let bundleStream = browserify()
        .transform('babelify')
        .transform('brfs')
        .transform({
            global: true,
            mangle: {
                except: ['require']
            }
        },
        'uglifyify')
        .add('./src/client.js')
        .bundle();
    bundleStream.on('data', function (data) {
        bundleString += data;
    });
    bundleStream.on('end', function () {
        replaySubject.onNext(bundleString);
        replaySubject.onCompleted();
        console.log('Client bundle successfully compiled.');
    });
    return replaySubject;
})();

let server = express();

server.use('/assets', express.static(__dirname + '/../public'))
server.use('/assets', express.static(__dirname + '/../build/css'))

server.get('/:exerciseSlug', function (req, res) {

    // Ignore favicon requests
    if (req.url === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'});
        res.end();
        return;
    }

    console.log(`req: ${req.method} ${req.url} ${req.params.exerciseSlug}`);

    let config$ = Observable.just(Object.assign({}, config))

    let context$ = Observable.just({
        route: req.url,
        exerciseSlug: req.params.exerciseSlug
    });

    let wrappedAppFn = wrapAppResultWithBoilerplate(app, context$, config$, clientBundle$);
    let { sources } = Cycle.run(wrappedAppFn, {
        DOM: makeHTMLDriver(),
        HTTP: makeHTTPDriver(),
        context: () => context$,
        config: () => config$
    });

    let html$ = sources.DOM.map(prependHTML5Doctype);
    html$.subscribe(html => res.send(html));
})

let port = process.env.PORT || 3000;
server.listen(port);
console.log(`Listening on port ${port}`);
