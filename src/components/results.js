import Rx from 'rx'
import {p, hJSX} from '@cycle/dom'
import isolate from '@cycle/isolate'

function intent({testResults}) {
  return testResults
}

function model({testResults}) {
  const testReport = testResults
    .map(reporter => {
      const stats = reporter.stats

      const failed = stats.failures
      const passed = stats.passes
      const pending = stats.pending

      const numTests = stats.tests

      const result = {failed, passed, pending, numTests, status: 'unknown'}

      if (failed > 0) {
        result.status = 'failed'
      }

      if (passed === numTests) {
        result.status = 'passed'
      }

      return result
    })
    .catch(err => {
      return {status: 'error', error: `Execution error: ${err}}`}
    })
    .startWith({})

  return {
    testReport
  }
}
function getResultElement(res) {
  let resultElement = <p>&gt; </p>

  if (!res.status) {
    return resultElement
  }

  switch(res.status) {
    case 'error':
      resultElement = <p className={ res.status }>{ res.error }</p>
      break

    case 'passed':
    case 'failed':
      resultElement =
        <p className={ res.status }>
          {`${res.numTests} test(s) run. ${res.passed} passed, ${res.failed} failed, ${res.pending} pending`}
        </p>
      break

    default:
      resultElement = <p>Unrecognized status: {res.status}</p>
  }

  return resultElement
}

function view(testReport) {
  const vtree$ = testReport.map(getResultElement)
  return vtree$
}

function Results(sources) {
  const testResults$ = intent(sources)
  const testReport = model({testResults: testResults$}).testReport
  const vtree$ = view(testReport)

  return {
    DOM: vtree$
  }
}

function ResultsWrapper(sources) {
  return isolate(Results)(sources)
}

export default ResultsWrapper
