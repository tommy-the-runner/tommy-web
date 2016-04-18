let {div, button, p, hJSX} = require('@cycle/dom')
import isolate from '@cycle/isolate';

function intent(DOM) {
    let buttonClick$ = DOM.select('.current-timestamp').events('click')
        .map(ev => new Date().getTime())

    return buttonClick$
}

function view(timestamp$) {
    timestamp$ = timestamp$.startWith('(click to update)')

    return timestamp$.map(ts => {

       return (
            <div className="timestamp-area">
                <button className="current-timestamp">
                    Show timestamp
                </button>
                <p>{`${ts}`}</p>
            </div>
       )
    })
}

function TimestampButton(sources) {
    const timestamp$ = intent(sources.DOM)
    const vtree$ = view(timestamp$)
    return {
        DOM: vtree$
    }
}

function TimestampButtonWrapper(sources) {
    const button = isolate(TimestampButton)({
        DOM: sources.DOM
    });

    return {
        DOM: button.DOM
    }
}

export default TimestampButtonWrapper
