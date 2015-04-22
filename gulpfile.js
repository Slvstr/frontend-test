var gulp = require('gulp');
var stylus = require('gulp-stylus');

gulp.task('stylus', function() {
  return gulp.src('./*.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./'));
});


gulp.task('default', ['stylus']);