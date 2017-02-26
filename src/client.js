let Cycle = require('@cycle/core')
let {Observable} = require('rx')
let {makeDOMDriver} = require('@cycle/dom')
let {makeHTTPDriver} = require('@cycle/http')
let {makeAnalyticsDriver} = require('./drivers/analytics')

let app = require('./app')

const trackingId = location.hostname !== 'localhost' && 'UA-33547155-3'

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
  analytics: makeAnalyticsDriver(trackingId),
  actions: () => Observable.empty(),
  context: () => Observable.just(window.appContext),
  config: () => Observable.just(window.appConfig)
})
