let {Observable, ReplaySubject} = require('rx')

import {div, span, hJSX} from '@cycle/dom'

let tommy = require('tommy-the-runner')
const sinonChai = require('sinon-chai')

import CodePanel from './components/code_panel'
import SpecsPanel from './components/specs_panel'
import Results from './components/results'

function executeSpecs(userCode, specsCode) {
  let promise = tommy.run(userCode, specsCode, {
    subjectPackageName: 'the code from the left panel',
    extraModules: {
      'sinon-chai': sinonChai
    }
  })

  return Observable
    .fromPromise(promise)
    .map(reporter => {
      return {
        type: 'report',
        reporter: reporter
      }
    })
    .catch(err => Observable.just({
      type: 'error',
      err: err
    }))
}

function intent({DOM}) {
  const ctrlSaves$ = DOM
    .select('#container')
    .events('keydown')
    .filter(event => {
      if (!event.ctrlKey && !event.metaKey) {
        return false
      }

      const letter = String.fromCharCode(event.which).toLowerCase()

      return letter === 's'
    })
    .do(event => event.preventDefault())

  return {
    ctrlSaves$
  }
}

function model({ctrlSaves$, buttonClicks$, specCode$, subjectCode$}) {
  const sourceCodes$ = new ReplaySubject(1)

  const programs$ = Observable
    .combineLatest(subjectCode$, specCode$, (userCode, specsCode) => {
      return {userCode, specsCode}
    })
    .multicast(sourceCodes$)

  programs$.connect()

  const testResults$ = Observable.merge(ctrlSaves$, buttonClicks$)
    .debounce(20)
    .flatMap(() => sourceCodes$.take(1))
    .flatMap(({userCode, specsCode}) => {
      return executeSpecs(userCode, specsCode)
    })
    .share()

  return {
    testResults$
  }
}

function renderPageContent(context$, codePanel$, specsPanel$, $results) {
  return Observable.combineLatest(context$, codePanel$, specsPanel$, $results, (context, codePanel, specsPanel, results) => {
    return <div>
      <header className="top clearfix">
        <img className="logo" src="/assets/images/tommy-logo.png" alt="Tommy the Runner"/>
        <h2 className="title">{context.title}</h2>

        <button className="submit-button">Run</button>
      </header>

      <div id="container" className="clearfix">
        { codePanel }
        { specsPanel }
      </div>

      <div className="footer clearfix">
        { results }
      </div>
    </div>
  })
}

function app(sources) {
  const {actions, context, config, DOM, HTTP} = sources

  const buttonClicks$ = DOM.select('.submit-button').events('click')

  const context$ = context
    .concat(HTTP
      .flatMap(res => res)
      .map(apiResponse => {
        return apiResponse.body
      })
      .catch(err => {
        return Observable.just({
          title: err.message
        })
      })
      .shareReplay(1)
    )

  const specsPanel = SpecsPanel({DOM, context: context$})
  const codePanel = CodePanel({DOM, context: context$})

  const {ctrlSaves$} = intent({DOM})
  const {testResults$} = model({
    ctrlSaves$,
    buttonClicks$: buttonClicks$,
    specCode$: specsPanel.code$,
    subjectCode$: codePanel.code$
  })

  const results$ = Results({DOM, testResults$})
  const vtree$ = renderPageContent(context$, codePanel.DOM, specsPanel.DOM, results$.DOM)

  const request$ = Observable.combineLatest(actions, config, (action, cfg) => {
    const exerciseSlug = action.data.exerciseSlug
    const apiUrl = cfg.api_url

    return {url: `${apiUrl}?slug=${exerciseSlug}`}
  })

  const analytics$ = testResults$.map(results => {
    const type = results.type

    if (type !== 'report') {
      return null
    }

    const reporter = results.reporter
    const stats = reporter.stats

    return {
      hitType: 'event',
      eventCategory: 'Exercises',
      eventAction: 'run',
      eventValue: stats.failures + stats.pending
    }
  })

  return {
    DOM: vtree$,
    HTTP: request$,
    context: context$,
    analytics: analytics$
  }
}

module.exports = app
