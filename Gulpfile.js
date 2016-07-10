const gulp = require('gulp')
const plugins = require('gulp-load-plugins')()
const source = require('vinyl-source-stream')
const del = require('del')
const createBundler = require('./create_bundler')

const {rev, uglifycss, autoprefixer, sass} = plugins
const gutil = plugins.util

gulp.task('default', ['build'])
gulp.task('build', ['sass', 'browserify'])

gulp.task('browserify', function () {
  return createBundler({uglify: true})
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./build/js/'))
})

gulp.task('watch',['revision:clear'], function () {
  gulp.watch('./src/scss/**/*.scss', ['sass'])

  const b = createBundler({watch: true})

  function bundle() {
    b.bundle()
      .pipe(source('bundle.js'))
      .pipe(gulp.dest('./build/js/'))
  }

  bundle()
  b.on('update', bundle)
  b.on('log', gutil.log)
})

gulp.task('sass', function () {
    return gulp.src('./src/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(uglifycss({
          "maxLineLen": 80
        }))
        .pipe(gulp.dest('./build/css'))
})

gulp.task('revision:clear', function () {
  return del([
    'rev-manifest.json'
  ])
})

gulp.task('revision', function () {
  return gulp.src(['build/css/*.css', 'build/js/*.js'], {base: 'assets'})
    .pipe(gulp.dest('build'))
    .pipe(rev())
    .pipe(gulp.dest('build'))
    .pipe(rev.manifest({
      base: 'build',
      merge: true
    }))
    .pipe(gulp.dest('build'));
})
