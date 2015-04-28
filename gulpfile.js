var gulp = require('gulp'),
    minifyHtml = require('gulp-minify-html'),
    templateCache = require('gulp-angular-templatecache');

gulp.task('templates-bootstrap2', function () {
    gulp.src('template/bootstrap2/**/*.html')
        .pipe(minifyHtml())
        .pipe(templateCache('customer.address-tpls-bootstrap2.js', {standalone: true, module: 'customer.address.templates'}))
        .pipe(gulp.dest('src/main/js'));
});

gulp.task('templates-bootstrap3', function () {
    gulp.src('template/bootstrap3/**/*.html')
        .pipe(minifyHtml())
        .pipe(templateCache('customer.address-tpls-bootstrap3.js', {standalone: true, module: 'customer.address.templates'}))
        .pipe(gulp.dest('src/main/js'));
});

gulp.task('default', ['templates-bootstrap2', 'templates-bootstrap3']);