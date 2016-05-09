var gulp = require('gulp');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');
var typescript = require('gulp-tsc');
var rimraf = require('gulp-rimraf');

gulp.task('clean', function(){
  return gulp.src(['dist'])
    .pipe(rimraf())
});

gulp.task('join-libraries', ['clean'], function() {
  return gulp.src([
			'./src/interfaces.ts',
			'./src/XCupeInputFileElement.ts',
			'./src/XCupeInputTextElement.ts',
			'./src/XCupeCanvasElement.ts',
			'./src/XCupe.ts',
			'./src/XCupeController.ts',
			'./src/XCupeGallery.ts',
			'./src/XCupeGalleryController.ts',
			'./src/registerElement.ts',
		])
    .pipe(concat('temp_joined.ts'))
    .pipe(gulp.dest('./src/'));
});

gulp.task('compile', ['join-libraries'], function(){
  return gulp.src(['src/temp_joined.ts'])
    .pipe(typescript({ out: 'x-cupe.js', emitError: false }))
    .pipe(gulp.dest('dist/'))
});

gulp.task('copy-html', ['compile'], function(){
  return gulp.src(['src/*.html'])
    .pipe(gulp.dest('dist/'))
});

gulp.task('remove-temp', ['copy-html'], function(){
  return gulp.src(['src/temp_*.*'])
    .pipe(rimraf())
});

gulp.task('watch', ['remove-temp'], function(){
	gulp.watch( ['src/**/*.*', '!src/**/temp_*.*'], function(){
		gulp.start('remove-temp');
	});
})

gulp.task('default', ['watch'], function( callback ) {
	callback()
});