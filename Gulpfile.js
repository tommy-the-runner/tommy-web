const gulp = require('gulp')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')

gulp.task('default', ['sass'])

gulp.task('sass', function () {
    return gulp.src('./src/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('./build/css'));
})

gulp.task('watch',function() {
    gulp.watch('./src/scss/**/*.scss', ['sass'])
})
