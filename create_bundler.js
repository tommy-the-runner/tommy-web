const browserify = require('browserify')

module.exports = function createBundler({watch, uglify} = {watch: false, uglify: false}) {

  let b = browserify({
    cache: {},
    packageCache: {},
    plugin: watch ? [require('watchify')] : []
  })

  b = b.transform('babelify')
  b = b.transform('brfs')

  if (uglify) {
    b = b.transform({
        global: true,
        mangle: {
          except: ['require']
        }
      },
      'uglifyify'
    )
  }



  return b.add('./src/client.js')
}
