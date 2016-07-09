let fs = require('fs')
let Cycle = require('@cycle/core')
let express = require('express')
let serverConfig = require('config')

let {Observable, ReplaySubject} = require('rx')
let {makeHTMLDriver} = require('@cycle/dom')
let {makeHTTPDriver} = require('@cycle/http')

let layout = require('./components/layout')
let app = require('./app')

function wrapVTreeWithHTMLBoilerplate(canonicalUrl, vtree, context, config, clientBundle) {
    return layout({canonicalUrl, vtree, context, config, clientBundle})
}

function prependHTML5Doctype(html) {
    return `<!doctype html>${html}`
}

function wrapAppResultWithBoilerplate(appFn, canonicalUrl, config$, bundle$) {
    return function wrappedAppFn(sources) {
        const sinks = appFn(sources)
        const vtree$ = sinks.DOM
        const context$ = sinks.context
        const canonicalUrl$ = Observable.just(canonicalUrl)

        const wrappedVTree$ = Observable.combineLatest(canonicalUrl$, vtree$, context$, config$, bundle$,
            wrapVTreeWithHTMLBoilerplate
        )

        return {
            DOM: wrappedVTree$,
            HTTP: sinks.HTTP
        }
    }
}

let clientBundle$ = (() => {
    // const replaySubject = new ReplaySubject(1)
    //
    // console.log('Start compilaton of the frontend bundle')
    // const bundleStream = bundle().pipe(fs.createWriteStream(__dirname + '/../build/js/bundle.js'))
    //
    // bundleStream.on('finish', () => {
    //     console.log('Client bundle successfully compiled.')
    //     replaySubject.onNext('/assets/js/bundle.js')
    //     replaySubject.onCompleted()
    // })
    // return replaySubject
    return Observable.just('/assets/js/bundle.js')
})()

let server = express()

server.use('/assets', express.static(__dirname + '/../public'))
server.use('/assets', express.static(__dirname + '/../build'))

server.get('/:exerciseSlug', (req, res) => {

    console.log(`req: ${req.method} ${req.url} ${req.params.exerciseSlug}`)

    // Ignore favicon requests
    if (req.url === '/favicon.ico') {
        res.writeHead(200, {'Content-Type': 'image/x-icon'})
        res.end()
        return
    }

    const canonicalUrl = `${serverConfig.base_url}${req.url}`

    let config$ = Observable.just(Object.assign({}, serverConfig))

    let actions$ = Observable.just({
        type: 'navigate',
        data: {
            route: req.url,
            exerciseSlug: req.params.exerciseSlug
        }
    })

    let wrappedAppFn = wrapAppResultWithBoilerplate(app, canonicalUrl, config$, clientBundle$)
    let {sources} = Cycle.run(wrappedAppFn, {
        DOM: makeHTMLDriver(),
        HTTP: makeHTTPDriver(),
        actions: () => actions$,
        context: () => Observable.empty(),
        config: () => config$
    })

    let html$ = sources.DOM
      .map(prependHTML5Doctype)

    html$.subscribe(html => res.send(html))
})

clientBundle$.subscribe(() => {
    let port = process.env.PORT || 3000
    server.listen(port)
    console.log(`Listening on port ${port}`)
})

