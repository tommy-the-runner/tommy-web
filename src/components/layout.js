import serialize from 'serialize-javascript'
import {html, head, title, body, div, script, hJSX} from '@cycle/dom'

module.exports = function wrapVTreeWithHTMLBoilerplate({canonicalUrl, vtree, context, config, clientBundle}) {
  const baseTitle = 'Tommy the Runner'
  const extraTitle = ` - ${context.title}`
  const titleText = `${baseTitle}${extraTitle}`

  const jsBundle = `/assets/${clientBundle['js/bundle.js']}`
  const cssBundle = `/assets/${clientBundle['css/styles.css']}`

  return (
      <html lang="en">
      <head>
        <link href="/assets/css/reset.css" rel="stylesheet" type="text/css" />
        <link href={cssBundle} rel="stylesheet" type="text/css" />
        <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,700' rel='stylesheet' type='text/css' />
        <link href={ config.base_url + '/assets/images/tommy-ico.png' } rel="icon" />
        <meta charset="UTF-8" />
        <title>{titleText}</title>
        <meta name="description" content="Exercise your testing skills with a coding challenge." />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={titleText} />
        <meta name="twitter:description" content="Exercise your testing skills with a coding challenge." />
        <meta name="twitter:creator" content="@ertrzyiks" />
        <meta name="twitter:image" content={ config.base_url + '/assets/images/tommy-image.png' } />

        <meta property="og:title" content={titleText} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={ canonicalUrl } />
        <meta property="og:image" content={ config.base_url + '/assets/images/tommy-image-fb.png' } />
        <meta property="og:image:width" content="2680" />
        <meta property="og:image:height" content="1395" />
        <meta property="og:description" content="Exercise your testing skills with a coding challenge." />
        <script src='/assets/js/modernizr.js'></script>
      </head>
      <body>
        <div className="app-container">
          {vtree}
        </div>

        <script>window.appContext = {serialize(context)}</script>
        <script>window.appConfig = {serialize(config)}</script>
        <script src={jsBundle}></script>

      </body>
      </html>
    )
}
