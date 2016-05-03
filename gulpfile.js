var gulp = require('gulp'),
    less = require('gulp-less'),
    gutil = require('gulp-util'),
    rename = require('gulp-rename');

function handleError(err) {
    gutil.log(err.toString());
    this.emit('end');
}

gulp.task('app-less', function () {
    return gulp.src('./public/styles/styles.less')
        .pipe(less().on('error', handleError))
        .pipe(rename('./'))
        .pipe(gulp.dest('./public/styles/styles.css'));
});

gulp.task('default', ['app-less']);
