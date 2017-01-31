var gulp = require('gulp');

var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");


gulp.task('typescript', function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest(''));
});

gulp.task('copy-html', function(){
  return gulp.src(['src/*.html'])
    .pipe(gulp.dest('dist/'))
});

gulp.task('watch', ['typescript', 'copy-html'], function(){
	gulp.watch( ['src/**/*.ts'], function(){
		gulp.start('typescript');
	});

	gulp.watch( ['src/**/*.html'], function(){
		gulp.start('copy-html');
	});
})

gulp.task('default', ['watch'], function( callback ) {
	callback()
});