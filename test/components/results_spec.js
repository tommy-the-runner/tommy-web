import chai from 'chai'
import vdomToHtml from 'vdom-to-html'
import {TestScheduler, ReactiveTest} from 'rx'
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
  tests: [{
    title: 'Siema',
    state: 'passed'
  }],
  suites: []
}

const RED_SUITE = {
  tests: [{
    title: 'Siema',
    state: 'failed',
    err: {
      stack: {}
    }
  }],
  suites: []
}

describe('Specs Panel', function () {
  beforeEach(function () {
    this.scheduler = new TestScheduler();

    this.render = (Component, sources, sinkName) => {
      return this.scheduler.startScheduler(() => {
        const sinks = Component(sources)
        return sinks[sinkName]
      })
    }
  })

  it('should render empty on the beginning', function () {
    var testResults = this.scheduler.createHotObservable(
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

    const res = this.render(Results, { DOM, testResults }, 'DOM')
    const message = res.messages[0].value
    const html = vdomToHtml(message.value)

    expect(html).to.contain('<div><div></div></div>')
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
      var testResults = this.scheduler.createHotObservable(
        onNext(250, {
          type: 'report',
          reporter: this.reporter
        })
      );

      const res = this.render(Results, { DOM, testResults }, 'DOM')
      const message = res.messages[1].value
      const html = vdomToHtml(message.value)

      expect(html).to.contain('<p class="status-passed">Siema</p>')
    })

    it('should render test suite summary', function () {
      var testResults = this.scheduler.createHotObservable(
        onNext(250, {
          type: 'report',
          reporter: this.reporter
        })
      );

      const res = this.render(Results, { DOM, testResults }, 'DOM')
      const message = res.messages[1].value
      const html = vdomToHtml(message.value)

      expect(html).to.contain('<p class="summary status-passed">1 test(s) run. 1 passed, 0 failed, 0 pending</p><')
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
      var testResults = this.scheduler.createHotObservable(
        onNext(250, {
          type: 'report',
          reporter: this.reporter
        })
      );

      const res = this.render(Results, { DOM, testResults }, 'DOM')
      const message = res.messages[1].value
      const html = vdomToHtml(message.value)

      expect(html).to.contain('<p class="status-failed">Siema</p>')
    })

    it('should render test suite summary', function () {
      var testResults = this.scheduler.createHotObservable(
        onNext(250, {
          type: 'report',
          reporter: this.reporter
        })
      );

      const res = this.render(Results, { DOM, testResults }, 'DOM')
      const message = res.messages[1].value
      const html = vdomToHtml(message.value)

      expect(html).to.contain('<p class="summary status-failed">1 test(s) run. 0 passed, 1 failed, 0 pending</p><')
    })
  })
})
