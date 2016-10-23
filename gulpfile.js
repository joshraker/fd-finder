var gulp = require('gulp');
var tsc = require('gulp-tsc');
var sass = require('gulp-sass');
var notify = require('gulp-notify');
var minify = require('gulp-minify');
var htmlReplace = require('gulp-html-replace');
var replace = require('gulp-replace');

var config = {
    srcPath: 'src/',
    distPath: 'dist/',
    tscPath: '',
    tscSelector: '**/*.ts',
    tscSrcOptions: {
        module: 'amd'
    },
    tscDistOptions: {
        module: 'amd',
        out: 'js/app.js'
    },
    tscMinifyOptions: {
        ext: {
            src: '-debug.js',
            min: '.js'
        },
        noSource: true
    },
    sassPath: 'css/',
    sassSelector: '**/*.scss',
    sassFile: 'style.scss',
    sassSrcOptions: {},
    sassDistOptions: {
        outputStyle: 'compressed'
    },
    vendorPath: 'vendor/',
    removeRegex: /^.*(remove:line|remove:start(.|\n)*remove:end).*$\n?/gm
};

config.copySrc = config.srcPath + '{*.*,templates/**/*.*}';
config.vendorSrc = config.srcPath + config.vendorPath + '**/*.*';
config.vendorDist = config.distPath + config.vendorPath;
config.tscSrc = config.srcPath + config.tscPath;
config.tscDist = config.distPath + config.tscPath;
config.sassSrc = config.srcPath + config.sassPath;
config.sassDist = config.distPath + config.sassPath;

var displayError = notify.onError(function(err) {
    return "Error: " + err.message;
});

gulp.task('tsc', function() {
    return gulp.src([config.tscSrc + config.tscSelector])
    .pipe(tsc(config.tscSrcOptions)
        .on('error', displayError))
    .pipe(gulp.dest(config.tscSrc));
});

gulp.task('tsc:build', function() {
    return gulp.src([config.tscSrc + config.tscSelector])
    .pipe(replace(config.removeRegex, '')
        .on('error', displayError))
    .pipe(tsc(config.tscDistOptions)
        .on('error', displayError))
    .pipe(minify(config.tscMinifyOptions)
        .on('error', displayError))
    .pipe(gulp.dest(config.tscDist));
});

gulp.task('tsc:watch', ['tsc'], function() {
    gulp.watch(config.tscSrc + config.tscSelector, ['tsc']);
});

gulp.task('sass', function() {
    return gulp.src(config.sassSrc + config.sassFile)
    .pipe(sass(config.sassSrcOptions)
        .on('error', displayError))
    .pipe(gulp.dest(config.sassSrc));
});

gulp.task('sass:build', function() {
    return gulp.src(config.sassSrc + config.sassFile)
    .pipe(replace(config.removeRegex, '')
        .on('error', displayError))
    .pipe(sass(config.sassDistOptions)
        .on('error', displayError))
    .pipe(replace())
    .pipe(gulp.dest(config.sassDist));
});

gulp.task('sass:watch', ['sass'], function() {
    gulp.watch(config.sassSrc + config.sassSelector, ['sass']);
});

gulp.task('copy:src', function() {
    return gulp.src(config.copySrc)
    .pipe(replace(config.removeRegex, '')
        .on('error', displayError))
    .pipe(gulp.dest(config.distPath));
});

gulp.task('copy:vendor', function() {
    return gulp.src(config.vendorSrc)
    .pipe(gulp.dest(config.vendorDist));
});

gulp.task('copy', ['copy:src', 'copy:vendor']);

gulp.task('compile', ['tsc', 'sass']);

gulp.task('build', ['tsc:build', 'sass:build', 'copy']);

gulp.task('watch', ['tsc:watch', 'sass:watch']);

gulp.task('default', ['compile']);