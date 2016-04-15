let Cycle = require('@cycle/core');
let express = require('express');
let browserify = require('browserify');
let serialize = require('serialize-javascript');
let {Observable, ReplaySubject} = require('rx');
let {html, head, title, body, div, script, makeHTMLDriver, hJSX} = require('@cycle/dom');
let app = require('./app');

function wrapVTreeWithHTMLBoilerplate(vtree, context, clientBundle) {
    return (
        <html>
            <head>
                <title>Cycle Isomorphism Example</title>
            </head>
            <body>
                <div className="app-container">
                    {vtree}
                </div>
                <script>window.appContext = {serialize(context)}</script>
                <script>{clientBundle}</script>
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
        );
        return {
            DOM: wrappedVTree$
        };
    };
}

let clientBundle$ = (() => {
    let replaySubject = new ReplaySubject(1);
    let bundleString = '';
    let bundleStream = browserify()
        .transform('babelify')
        .transform({ global: true }, 'uglifyify')
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

server.get('/template', function(req, res) {
    var options = {
        root: __dirname
    }

    res.sendFile('template.html', options, function (err) {
        if (err) {
            console.log(err)
            res.status(err.status).end()
        }
    })
})

server.use(express.static('public'))
server.use(express.static('build/css'))


server.get('/', function (req, res) {
    // Ignore favicon requests
    if (req.url === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'});
        res.end();
        return;
    }
    console.log(`req: ${req.method} ${req.url}`);

    let context$ = Observable.just({
        route: req.url,
        timestamp: new Date().getTime()
    });

    let wrappedAppFn = wrapAppResultWithBoilerplate(app, context$, clientBundle$);
    let { sources } = Cycle.run(wrappedAppFn, {
        DOM: makeHTMLDriver(),
        context: () => context$
    });
    let html$ = sources.DOM.map(prependHTML5Doctype);
    html$.subscribe(html => res.send(html));
});

let port = process.env.PORT || 3000;
server.listen(port);
console.log(`Listening on port ${port}`);
