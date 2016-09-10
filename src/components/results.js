import {Observable, Subject} from 'rx'
import {p, hJSX} from '@cycle/dom'
import isolate from '@cycle/isolate'
import {parse} from '../services/stacktrace'

function intent({testResults}) {
  return testResults
}

function getTests(suite) {
  const tests = Observable.from(suite.tests)
  const subsuites = suite.suites
    .map(s => getTests(s))

  const childrenTests = Observable.from(subsuites).concatAll()

  return tests.concat(childrenTests)
}

function model({testResults$}) {
  const executionErrors$ = testResults$
    .filter(res => res.type == 'error')
    .map(res => res.err)

  const executionReports$ = testResults$
    .filter(res => res.type == 'report')
    .map(res => res.reporter)

  const testReport$ = executionReports$
    .map(reporter => {
      return getTests(reporter.runner.suite)
    })
    .startWith(Observable.empty())

  const stats$ = executionReports$
    .map(reporter => reporter.stats)
    .startWith(false)

  return {
    executionReports$,
    executionErrors$,
    testReport$,
    stats$
  }
}

function viewSpecs(tests$) {
  return tests$
    .concatMap(test => {
      let lines = []

      lines = lines.concat(<p className={`status-${test.state}`}>{test.title}</p>)

      if (test.state == 'failed') {
        const stacktrace = parse(test.err.stack)
        lines = lines.concat(<pre className={`status-${test.state}`}>    {test.err.message}</pre>)
        lines = lines.concat(stacktrace.map(line => <pre className={`status-${test.state}`}>    {line}</pre>))
      }

      return Observable.from(lines)
    })
    .toArray()
    .map(results => <div>{results}</div>)
}

function viewSummary(stats$) {
  return stats$.map(stats => {
    if (!stats) {
      return ''
    }

    const statusClassName = (stats.failures > 0) ? 'status-failed' : 'status-passed'

    return <p className={`summary ${statusClassName}`}>
      {`${stats.tests} test(s) run. ${stats.passes} passed, ${stats.failures} failed, ${stats.pending} pending`}
    </p>
  })
}

function view({testReport$, executionErrors$, stats$}) {
  const specResultsVtree$ = Observable
    .zip(testReport$, stats$, (tests$, stats) => {
      const specs$ = viewSpecs(tests$)
      const summary$ = viewSummary(Observable.just(stats))

      return Observable.from([specs$, summary$]).concatAll().toArray().map(els => <div>{els}</div>)
    })
    .concatAll()

  const executionErrorsVtree$ = executionErrors$.map(err => {
    return <p className='summary status-failed'>
      {err.message} <br/>
      <br/>
      <pre>{err.stack}</pre>
    </p>
  })

  return Observable.merge(specResultsVtree$, executionErrorsVtree$)
    .map(el => <div className="terminal">{el}</div>)
}

function Results(sources) {
  const testResults$ = intent(sources)
  const {testReport$, executionErrors$, stats$} = model({testResults$})
  const vtree$ = view({testReport$, executionErrors$, stats$})

  sources.DOM.select('.terminal').observable
    .filter(els => els.length)
    .map(els => els[0])
    .skip(1)
    .subscribe(el => {
      el.classList.remove('is-active')
      setTimeout(() => { el.classList.add('is-active') }, 50)
    })

  return {
    DOM: vtree$
  }
}

function ResultsWrapper(sources) {
  return isolate(Results)(sources)
}

export default ResultsWrapper
