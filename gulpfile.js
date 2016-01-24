'use strict';

var gulp = require('gulp');

var inline = require('gulp-inline');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');

var htmlmin = require('gulp-htmlmin');

var del = require('del');



gulp.task('optimize-stack', function() {
	gulp.src('src/index.html')
	.pipe(inline({
		js: uglify,
		css:minifyCss,
		disabledTypes: ['svg','img'],
		ignore: ['js/lib/knockout-3.4.0.js', 'src/css/lib', 'js/analytics.js']
	}))
	.pipe(htmlmin({
		collapseWhitespace: true,
	}))
	.pipe(gulp.dest('dist'));
})

gulp.task('inline', function() {
	gulp.src('src/index.html')
	.pipe(inline({
		js: uglify,
		css:minifyCss,
		disabledTypes: ['svg','img'],
		ignore: ['src/js/lib/knockout-3.4.0.js', 'src/css/lib']
	}))
	.pipe(gulp.dest('dist'))
})

gulp.task('minify-html', function() {
	gulp.src('src/index.html')
	.pipe(htmlmin({
		collapseWhitespace: true,
		removeComments: true
	}))
	.pipe(gulp.dest('dist'));
})