let serialize = require('serialize-javascript');
let { html, head, title, body, div, script, makeHTMLDriver, hJSX } = require('@cycle/dom');

module.exports = function wrapVTreeWithHTMLBoilerplate(vtree, context, config, clientBundle) {

    return (
      <html lang="en">
      <head>
        <link href="/assets/reset.css" rel="stylesheet" type="text/css" />
        <link href="/assets/styles.css" rel="stylesheet" type="text/css" />
        <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,700' rel='stylesheet' type='text/css' />
        <link href={ config.base_url + "/assets/images/tommy-ico.png" } rel="icon" />
        <meta charset="UTF-8" />
        <title>Tommy the Runner</title>
        <meta name="description" content="Exercise your testing skills with a coding challenge." />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Tommy the runner" />
        <meta name="twitter:description" content="Exercise your testing skills with a coding challenge." />
        <meta name="twitter:creator" content="@ertrzyiks" />
        <meta name="twitter:image" content={ config.base_url + "/assets/images/tommy-image.png" } />

        <meta property="og:title" content="Tommy the Runner" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={ config.base_url + "/" } />
        <meta property="og:image" content={ config.base_url + "/assets/images/tommy-image.png" } />
        <meta property="og:description" content="Exercise your testing skills with a coding challenge." />
      </head>
      <body>

      <header className="top clearfix">
        <img className="logo" src="/assets/images/tommy-logo.png" alt="Tommy the Runner"/>
        <h2 className="title">Sum two digits</h2>
      </header>

      <div className="app-container">
        {vtree}
      </div>
      <script>window.appContext = {serialize(context)}</script>
      <script>window.appConfig = {serialize(config)}</script>
      <script>{clientBundle}</script>

      <div className="footer clearfix">
        <div id="terminal">
          <span>{ '>_ I\'m the terminal' }</span>
        </div>
        <div className="copyright">
          <span>Copyright @ 2016</span>
        </div>
      </div>

      </body>
      </html>
    )
  }
