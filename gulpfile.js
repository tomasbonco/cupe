var gulp = require('gulp');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');
var typescript = require('gulp-tsc');
var rimraf = require('gulp-rimraf');

gulp.task('join-libraries', function() {
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

gulp.task('compile', function(){
  return gulp.src(['src/temp_joined.ts'])
    .pipe(typescript({ out: 'x-cupe.js', emitError: false }))
    .pipe(gulp.dest('dist/'))
});

gulp.task('copy-html', function(){
  return gulp.src(['src/*.html'])
    .pipe(gulp.dest('dist/'))
});

gulp.task('clean', function(){
  return gulp.src(['dist'])
    .pipe(rimraf())
});

gulp.task('remove_temp', function(){
  return gulp.src(['src/temp_*.*'])
    .pipe(rimraf())
});

gulp.task('default', function( callback ) {
  return runSequence(
    'clean', 'join-libraries', 'compile', 'copy-html', 'remove_temp', 'watch',
    callback
  );
});

gulp.task('watch', function(){
	gulp.watch( 'src/**/*.*', ['clean', 'join-libraries', 'compile', 'copy-html', 'remove_temp' ]);
})