import chai from 'chai'
import vdomToHtml from 'vdom-to-html'
import {Observable, TestScheduler, ReactiveTest} from 'rx'
import RxAdapter from '@cycle/rx-adapter'
import {mockDOMSource} from '@cycle/dom'
import Results from '../../src/components/results.js'

const {expect} = chai
const {onNext, onCompleted} = ReactiveTest

const DOM = mockDOMSource(RxAdapter, {
  '.ace_editor': {
  }
});

const GREEN_STATS = {
  tests: 1,
  passes: 1,
  failures: 0,
  pending: 0
}

const RED_STATS = {
  tests: 1,
  passes: 0,
  failures: 1,
  pending: 0
}

const GREEN_SUITE = {
  suites: [{
    title: 'Green Suite',
    suites: [],
    tests: [{
      title: 'Siema',
      state: 'passed'
    }]
  }]
}

const COMPLEX_GREEN_SUITE = {
  tests: [{
    title: 'Root level test',
    state: 'passed'
  }],
  suites: [{
    title: 'Green Suite',
    tests: [],
    suites: [{
      title: 'Hi',
      suites: [],
      tests: [{
        title: 'Siema',
        state: 'passed'
      }]
    }]
  }]
}

const RED_SUITE = {
  suites: [{
    title: 'Red Suite',
    suites: [],
    tests: [{
      title: 'Siema',
      state: 'failed',
      err: {
        stack: {}
      }
    }]
  }]
}

describe('Results', function () {
  beforeEach(function () {
    this.scheduler = new TestScheduler()
    this.context = Observable.just({})

    this.render = (Component, sources, sinkName) => {
      return this.scheduler.startScheduler(() => {
        const sinks = Component(sources)
        return sinks[sinkName]
      })
    }
  })

  it('should render empty on the beginning', function () {
    var testResults$ = this.scheduler.createHotObservable(
      onNext(250, {
        type: 'report',
        reporter: {
          stats: GREEN_STATS,
          runner: {
            suite: GREEN_SUITE
          }
        }
      })
    );

    const res = this.render(Results, { DOM, testResults$, context: this.context }, 'DOM')
    const message = res.messages[0].value
    const html = vdomToHtml(message.value)

    expect(html).to.contain('<div class="terminal"><div class="log_root_node"></div></div>')
  })

  context('when suite is green', function () {
    beforeEach(function () {
      this.reporter = {
        stats: GREEN_STATS,
        runner: {
          suite: GREEN_SUITE
        }
      }
    })

    it('should render test suite status', function () {
      var testResults$ = this.scheduler.createHotObservable(
        onNext(250, {
          type: 'report',
          reporter: this.reporter
        })
      );

      const res = this.render(Results, { DOM, testResults$, context: this.context }, 'DOM')
      const message = res.messages[1].value
      const html = vdomToHtml(message.value)

      expect(html).to.contain('<div class="status-passed">Siema</div>')
    })

    it('should render test suite summary', function () {
      var testResults$ = this.scheduler.createHotObservable(
        onNext(250, {
          type: 'report',
          reporter: this.reporter
        })
      );

      const res = this.render(Results, { DOM, testResults$, context: this.context }, 'DOM')
      const message = res.messages[1].value
      const html = vdomToHtml(message.value)

      expect(html).to.contain('<p class="summary status-passed">1 test(s) run. 1 passed, 0 failed, 0 pending</p>')
    })

    it('should render intermediate suite titles', function () {
      var testResults$ = this.scheduler.createHotObservable(
        onNext(250, {
          type: 'report',
          reporter: {
            stats: GREEN_STATS,
            runner: {
              suite: COMPLEX_GREEN_SUITE
            }
          }
        })
      );

      const res = this.render(Results, { DOM, testResults$, context: this.context }, 'DOM')
      const message = res.messages[1].value
      const html = vdomToHtml(message.value)

      expect(html).to.contain('<div>Hi')
      expect(html).to.contain('<div class="status-passed">Root level test')
    })
  })

  context('when suite is red', function () {
    beforeEach(function () {
      this.reporter = {
        stats: RED_STATS,
        runner: {
          suite: RED_SUITE
        }
      }
    })

    it('should render test suite status', function () {
      var testResults$ = this.scheduler.createHotObservable(
        onNext(250, {
          type: 'report',
          reporter: this.reporter
        })
      );

      const res = this.render(Results, { DOM, testResults$, context: this.context }, 'DOM')
      const message = res.messages[1].value
      const html = vdomToHtml(message.value)

      expect(html).to.contain('<div class="status-failed">Siema</div>')
    })

    it('should render test suite summary', function () {
      var testResults$ = this.scheduler.createHotObservable(
        onNext(250, {
          type: 'report',
          reporter: this.reporter
        })
      );

      const res = this.render(Results, { DOM, testResults$, context: this.context }, 'DOM')
      const message = res.messages[1].value
      const html = vdomToHtml(message.value)

      expect(html).to.contain('<p class="summary status-failed">1 test(s) run. 0 passed, 1 failed, 0 pending</p>')
    })
  })
})
