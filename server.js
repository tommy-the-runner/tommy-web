let Cycle = require('@cycle/core');
let express = require('express');
let browserify = require('browserify');
let serialize = require('serialize-javascript');
let { Observable, ReplaySubject } = require('rx');
let { html, head, title, body, div, script, makeHTMLDriver, hJSX } = require('@cycle/dom');
let { makeHTTPDriver } = require('@cycle/http');
let app = require('./app');

function wrapVTreeWithHTMLBoilerplate(vtree, context, clientBundle) {

    return (
        <html lang="en">
            <head>
                <link href="reset.css" rel="stylesheet" type="text/css" />
                <link href="styles.css" rel="stylesheet" type="text/css" />
                <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,700' rel='stylesheet' type='text/css' />
                <meta charset="UTF-8" />
                <title>Tommy the Runner</title>
            </head>
            <body>

                <header className="top clearfix">
                    <img className="logo" src="music_note.png" alt="Tommy the Runner"/>
                    <h2 className="title">Sum two digits</h2>
                </header>

                <div className="app-container">
                    {vtree}
                </div>
                <script>window.appContext = {serialize(context)}</script>
                <script>{clientBundle}</script>

                <div className="footer clearfix">
                    <div id="terminal">
                        <span>{ '>_ I\'m the terminal' }</span>
                    </div>
                    <div className="copyright">
                        <span>Copyright @ 2016</span>
                    </div>
                </div>

            </body>
        </html>
    )
}

function prependHTML5Doctype(html) {
    return `<!doctype html>${html}`;
}

function wrapAppResultWithBoilerplate(appFn, context$, bundle$) {
    return function wrappedAppFn(sources) {
        let app = appFn(sources)
        let vtree$ = app.DOM
        let wrappedVTree$ = Observable.combineLatest(vtree$, context$, bundle$,
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
        .add('./client.js')
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

server.use(express.static('public'))
server.use(express.static('build/css'))

server.get('/:exerciseSlug', function (req, res) {

    // Ignore favicon requests
    if (req.url === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'});
        res.end();
        return;
    }

    console.log(`req: ${req.method} ${req.url} ${req.params.exerciseSlug}`);

    let context$ = Observable.just({
        route: req.url,
        exerciseSlug: req.params.exerciseSlug,
        timestamp: new Date().getTime()
    });

    let wrappedAppFn = wrapAppResultWithBoilerplate(app, context$, clientBundle$);
    let { sources } = Cycle.run(wrappedAppFn, {
        DOM: makeHTMLDriver(),
        HTTP: makeHTTPDriver(),
        context: () => context$
    });

    let html$ = sources.DOM.map(prependHTML5Doctype);
    html$.subscribe(html => res.send(html));
})

let port = process.env.PORT || 3000;
server.listen(port);
console.log(`Listening on port ${port}`);
