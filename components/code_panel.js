let {div, header, footer, button, p, hJSX} = require('@cycle/dom')
import isolate from '@cycle/isolate';

function intent({ DOM, context }) {
    let buttonClicks$ = DOM.select('.submit-button').events('click')
        .map(ev => {
            return new Date().getTime()
        })

    return context
        .map(ctx => ctx.timestamp)
        .concat(buttonClicks$)
}

function view(timestamp$) {
    return timestamp$.map(ts => {
        return (
            <div id="code">
                <header>
                    <div className="container-header">
                        Your code
                    </div>
                </header>
                <div className="code">
                    <textarea>{ 'function() {}' }</textarea>
                </div>
                <footer>
                    <button className="submit-button">Submit</button>
                    <p>{`${ts}`}</p>
                </footer>
            </div>
        )
    })
}

function CodePanel(sources) {
    const timestamp$ = intent(sources)
    const vtree$ = view(timestamp$)

    return {
        DOM: vtree$
    }
}

function CodePanelWrapper(sources) {
    return isolate(CodePanel)(sources)
}

export default CodePanelWrapper