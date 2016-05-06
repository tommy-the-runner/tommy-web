let Rx = require('rx')

let {div, header, footer, button, p, hJSX} = require('@cycle/dom')
import isolate from '@cycle/isolate';

function intent({ DOM, context }) {
    return Rx.Observable.empty()
        .startWith("x")
}

function view(empty$) {
    return empty$.map(e => {
        return (
            <div id="spec">
                <header>
                    <div className="container-header">
                        Specs
                    </div>
                    <div className="header-triangle"></div>
                </header>
                <div className="spec-body">
                    <span>{ 'describe("Sum", () => { it("can sum two digits", () => { }) })'}</span>
                    <span>{ 'describe("Sum", () => { it("can sum two digits", () => { }) })'}</span>
                    <span>{ 'describe("Sum", () => { it("can sum two digits", () => { }) })'}</span>
                    <span>{ 'describe("Sum", () => { it("can sum two digits", () => { }) })'}</span>
                    <span>{ 'describe("Sum", () => { it("can sum two digits", () => { }) })'}</span>
                    <span>{ 'describe("Sum", () => { it("can sum two digits", () => { }) })'}</span>
                    <span>{ 'describe("Sum", () => { it("can sum two digits", () => { }) })'}</span>
                    <span>{ 'describe("Sum", () => { it("can sum two digits", () => { }) })'}</span>
                    <span>{ 'describe("Sum", () => { it("can sum two digits", () => { }) })'}</span>
                    <span>{ 'describe("Sum", () => { it("can sum two digits", () => { }) })'}</span>

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