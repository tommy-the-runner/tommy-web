import browserify from 'browserify'

module.exports = function () {
  const bundleStream = browserify()
    .transform('babelify')
    .transform('brfs')
    .transform({
        global: true,
        mangle: {
          except: ['require']
        }
      },
      'uglifyify')
    .add('./src/client.js')
    .bundle()

  return bundleStream
}
