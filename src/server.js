let Cycle = require('@cycle/core')
let Rx = require('rx')
let express = require('express')
let browserify = require('browserify')
let serverConfig = require('config')

let {Observable, ReplaySubject} = require('rx')
let {makeHTMLDriver} = require('@cycle/dom')
let {makeHTTPDriver} = require('@cycle/http')

let layout = require('./components/layout')
let app = require('./app')

function wrapVTreeWithHTMLBoilerplate(vtree, config, clientBundle) {
    return layout({vtree, config, clientBundle})
}

function injectContext(html, context) {
    return html.replace('##CONTEXT##', JSON.stringify(context))
}
function prependHTML5Doctype(html) {
    return `<!doctype html>${html}`
}

function wrapAppResultWithBoilerplate(appFn, config$, bundle$) {
    return function wrappedAppFn(sources) {
        let sinks = appFn(sources)
        let vtree$ = sinks.DOM
        let wrappedVTree$ = Observable.combineLatest(vtree$, config$, bundle$,
            wrapVTreeWithHTMLBoilerplate
        )

        return {
            DOM: wrappedVTree$,
            HTTP: sinks.HTTP,
            context: sinks.context
        }
    }
}

let clientBundle$ = (() => {
    let replaySubject = new ReplaySubject(1)
    let bundleString = ''
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
        .bundle()
    bundleStream.on('data', (data) => {
        bundleString += data
    })
    bundleStream.on('end', () => {
        replaySubject.onNext(bundleString)
        replaySubject.onCompleted()
        console.log('Client bundle successfully compiled.')
    })
    return replaySubject
})()

let server = express()

server.use('/assets', express.static(__dirname + '/../public'))
server.use('/assets', express.static(__dirname + '/../build/css'))

server.get('/:exerciseSlug', (req, res) => {

    // Ignore favicon requests
    if (req.url === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'})
        res.end()
        return
    }

    console.log(`req: ${req.method} ${req.url} ${req.params.exerciseSlug}`)

    let config$ = Observable.just(Object.assign({}, serverConfig))

    let actions$ = Observable.just({
        type: 'navigate',
        data: {
            route: req.url,
            exerciseSlug: req.params.exerciseSlug
        }
    })

    let wrappedAppFn = wrapAppResultWithBoilerplate(app, config$, clientBundle$)
    let {sources, sinks} = Cycle.run(wrappedAppFn, {
        DOM: makeHTMLDriver(),
        HTTP: makeHTTPDriver(),
        actions: () => actions$,
        context: () => Observable.empty(),
        config: () => config$
    })

    let html$ = Rx.Observable
        .combineLatest(sources.DOM, sinks.context, injectContext)
        .map(prependHTML5Doctype)

    html$.subscribe(html => res.send(html))
})

let port = process.env.PORT || 3000
server.listen(port)
console.log(`Listening on port ${port}`)
