import {Observable} from 'rx'
import {p, hJSX} from '@cycle/dom'
import isolate from '@cycle/isolate'
import {parse} from '../services/stacktrace'

function intent(sources) {
  const {testResults$} = sources

  return {
    testResults$
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

function viewRootSuite(suite) {
  const testsDOM = viewTests(suite.tests || [])
  const suitesDOM = suite.suites.map(s => viewSuite(s))

  const results = []

  if (testsDOM && testsDOM.length) {
    results.push(<div className='log_node'>{testsDOM}</div>)
  }

  return results.concat(suitesDOM)
}

function viewSuite(suite) {
  const children = suite.suites.map(s => viewSuite(s))

  const tests = viewTests(suite.tests)

  return <div className='log_node'>
    {suite.title}

    <div className='log_node'>
      {tests} {children}
    </div>
  </div>
}

function viewSpecs(sources) {
  const {tests$} = sources

  return Observable
    .zip(tests$, (suite) => {
      return viewRootSuite(suite)
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

function view({testReport$, executionErrors$, stats$}) {
  const specResultsVtree$ = Observable
    .zip(testReport$, stats$, (tests$, stats) => {
      const specs$ = viewSpecs({tests$})
      const summary$ = viewSummary(Observable.just(stats))

      return Observable.from([specs$, summary$]).concatAll().toArray().map(els => <div className="log_root_node">{els}</div>)
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
  const {testResults$} = intent(sources)
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
