let Rx = require('rx')

let {div, header, footer, button, p, hJSX} = require('@cycle/dom')
import isolate from '@cycle/isolate';

function intent({ exercise }) {
    return exercise
}

function view(apiResponse$) {
    return apiResponse$.map(json => {
        var specsCodeRaw = json.specsCode || ''

        var specCode = specsCodeRaw.replace('require(\'subject\')', '/* your code here */')

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
    const exercise$ = intent(sources)
    const vtree$ = view(exercise$)

    return {
        DOM: vtree$
    }
}

function SpecsPanelWrapper(sources) {
    return isolate(SpecsPanel)(sources)
}

export default SpecsPanelWrapper