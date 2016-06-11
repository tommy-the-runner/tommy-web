import {div, header, footer, button, p, hJSX} from '@cycle/dom'
import isolate from '@cycle/isolate'

function intent({context}) {
    return context
}

function view(context$) {
    return context$.map(json => {
        const specsCodeRaw = json.specsCode || ''

        const specCode = specsCodeRaw.replace('require(\'subject\')', '/* your code here */')

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
    const context$ = intent(sources)
    const vtree$ = view(context$)

    return {
        DOM: vtree$
    }
}

function SpecsPanelWrapper(sources) {
    return isolate(SpecsPanel)(sources)
}

export default SpecsPanelWrapper
