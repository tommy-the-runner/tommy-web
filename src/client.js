let Cycle = require('@cycle/core')
let {Observable} = require('rx')
let {makeDOMDriver} = require('@cycle/dom')
let {makeHTTPDriver} = require('@cycle/http')
let app = require('./app')

// Ace editor settings
require('brace/mode/javascript')
require('brace/theme/clouds_midnight')

function clientSideApp(responses) {
  let requests = app(responses)

  return requests
}

Cycle.run(clientSideApp, {
  DOM: makeDOMDriver('.app-container'),
  HTTP: makeHTTPDriver(),
  actions: () => Observable.empty(),
  context: () => Observable.just(window.appContext),
  config: () => Observable.just(window.appConfig)
})
