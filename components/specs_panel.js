let Rx = require('rx')

let {div, header, footer, button, p, hJSX} = require('@cycle/dom')
import isolate from '@cycle/isolate';

function intent({ DOM, context }) {
    return Rx.Observable.empty()
        .startWith("x")
}

function view(empty$) {
    return empty$.map(e => {
        var specCodeRaw = `const expect = require('chai').expect
const sum = require('subject')

describe('sum', function () {

    it('should sum two numbers', function () {
        expect(sum(1, 1)).to.equal(2)
    })

})`

        var specCode = specCodeRaw.replace('require(\'subject\')', '/* your code here */')

        return (
            <div id="spec">
                <header>
                    <div className="container-header">
                        Specs
                    </div>
                    <div className="header-triangle"></div>
                </header>
                <div className="spec-body">
                    <pre>{ specCode }</pre>
                </div>
            </div>
        )
    })
}

function SpecsPanel(sources) {
    const empty$ = intent(sources)
    const vtree$ = view(empty$)

    return {
        DOM: vtree$
    }
}

function SpecsPanelWrapper(sources) {
    return isolate(SpecsPanel)(sources)
}

export default SpecsPanelWrapper