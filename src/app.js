let {Observable, ReplaySubject} = require('rx')

import {
    div,
    span,
    hJSX
} from '@cycle/dom'

let tommy = require('tommy-the-runner')

import CodePanel from './components/code_panel'
import SpecsPanel from './components/specs_panel'
import Results from './components/results'

function executeSpecs(userCode, specsCode) {
    let promise = tommy.run(userCode, specsCode)

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

          return letter == 's'
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
            console.log(userCode, specsCode)
            return {userCode, specsCode}
        })
        .multicast(sourceCodes$)

    programs$.connect()

    const testResults$ = Observable.merge(ctrlSaves$, buttonClicks$)
        .debounce(20)
        .flatMap(() => sourceCodes$.take(1))
        .flatMap(({userCode, specsCode}) => {
            console.log(userCode, specsCode)
            return executeSpecs(userCode, specsCode)
        })

    return {
        testResults$
    }
}

function renderPageContent(codePanel$, specsPanel$, $results) {
    return Observable.combineLatest(codePanel$, specsPanel$, $results, (codePanel, specsPanel, results) => {
        return (<div>
            <div id="container" className="clearfix">
                { codePanel }
                { specsPanel }
            </div>

            <div className="footer clearfix">
                <div id="terminal">
                    <span>{ results }</span>
                </div>
                <div className="copyright">
                    <span>Copyright @ 2016</span>
                </div>
            </div>
        </div>)
    })
}

function app(sources) {
    const {actions, context, config, DOM, HTTP} = sources

    const context$ = context
        .concat(HTTP
            .flatMap(res => res)
            .map(apiResponse => {
                return apiResponse.body
            })
            .shareReplay(1)
        )

    const specsPanel = SpecsPanel({DOM, context: context$})
    const codePanel = CodePanel({DOM, context: context$})

    const {ctrlSaves$} = intent({DOM})
    const {testResults$} = model({
        ctrlSaves$,
        buttonClicks$: codePanel.buttonClicks$,
        specCode$: specsPanel.code$,
        subjectCode$: codePanel.code$
    })

    const results$ = Results({DOM, testResults: testResults$})
    const vtree$ = renderPageContent(codePanel.DOM, specsPanel.DOM, results$.DOM)

    const request$ = Observable.combineLatest(actions, config, (action, cfg) => {
        const exerciseSlug = action.data.exerciseSlug
        const apiUrl = cfg.api_url

        return {url: `${apiUrl}?slug=${exerciseSlug}`}
    })

    return {
        DOM: vtree$,
        HTTP: request$,
        context: context$
    }
}

module.exports = app
