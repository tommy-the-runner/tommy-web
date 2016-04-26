let {div, button, p, hJSX} = require('@cycle/dom')
import isolate from '@cycle/isolate';

function intent({ DOM, context }) {
    let buttonClick$ = DOM.select('.current-timestamp').events('click')
        .map(ev => {
            return new Date().getTime()
        })

    return context
        .map(ctx => ctx.timestamp)
        .concat(buttonClick$)
}

function view(timestamp$) {
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
    const timestamp$ = intent(sources)
    const vtree$ = view(timestamp$)
    return {
        DOM: vtree$
    }
}

function TimestampButtonWrapper(sources) {
    return isolate(TimestampButton)(sources);
}

export default TimestampButtonWrapper
