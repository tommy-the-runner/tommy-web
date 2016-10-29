import {Observable, Subject} from 'rx'
import {p, hJSX} from '@cycle/dom'
import isolate from '@cycle/isolate'
import {parse} from '../services/stacktrace'

function intent(sources) {
  const {context, testResults$} = sources

  const exerciseTitle$ = context.map(json => {
    return json.title || 'Exercise'
  })

  return {
    testResults$,
    exerciseTitle$
  }
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
      return Observable.just(reporter.runner.suite)
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

function viewTests(tests) {
  return tests.map(test => {
    let lines = [
      <div className={`status-${test.state}`}>{test.title}</div>
    ]

    if (test.state == 'failed') {
      const stacktrace = parse(test.err.stack)
      const stack = stacktrace.map(line => <div>{line}</div>)

      lines = lines.concat(
        <div className={`status-${test.state} is-error_message log_node`}>
          {test.err.name}: {test.err.message}

          <div className="status-stack_trace">
            {stack}
          </div>
        </div>)
    }

    return lines
  })
}

function viewSuite(suite, originalTitle) {
  const children = suite.suites.map(s => viewSuite(s))

  const tests = viewTests(suite.tests)

  return <div className="log_node">
    {suite.root ? originalTitle : suite.title}

    <div className="log_node">
      {tests} {children}
    </div>
  </div>
}

function viewSpecs(sources) {
  const {tests$, exerciseTitle$} = sources

  return Observable
    .zip(tests$, exerciseTitle$, (suite, title) => {
      const results = suite.suites.map(s => viewSuite(s))
      return <div>{title} {results}</div>
    })
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

function view({exerciseTitle$, testReport$, executionErrors$, stats$}) {
  const specResultsVtree$ = Observable
    .zip(testReport$, stats$, (tests$, stats) => {
      const specs$ = viewSpecs({tests$, exerciseTitle$})
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
  const {testResults$, exerciseTitle$} = intent(sources)
  const {testReport$, executionErrors$, stats$} = model({testResults$})
  const vtree$ = view({exerciseTitle$, testReport$, executionErrors$, stats$})

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
