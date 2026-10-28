const { src, dest, watch, series, parallel } = require('gulp');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();
const del = require('del');

const paths = {
    html: {
        entry: 'src/app/index.html',
        watch: ['src/app/index.html', 'src/app/components/**/*.html'],
    },
    scss: { src: 'src/app/scss/main.scss', watch: 'src/app/scss/**/*.scss' },
    js: { src: 'src/app/js/**/*.js' },
    imgs: { src: 'src/app/imgs/**/*.{jpg,jpeg,png,gif,svg,webp}' },
    bootstrap: {
        css: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
        js: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    },
    dist: 'dist',
};

function clean() {
    return del([paths.dist]);
}

function html() {
    return src(paths.html.entry)
        .pipe(fileInclude({ prefix: '@@', basepath: '@file' }))
        .pipe(dest(paths.dist))
        .pipe(browserSync.stream());
}

// ЛР3: єдиний мінімізований файл index.min.css
function styles() {
    return src(paths.scss.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(cssnano())
        .pipe(rename({ basename: 'index', suffix: '.min' }))
        .pipe(dest(`${paths.dist}/css`))
        .pipe(browserSync.stream());
}

function scripts() {
    return src(paths.js.src)
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest(`${paths.dist}/js`))
        .pipe(browserSync.stream());
}

function images() {
    return src(paths.imgs.src)
        .pipe(imagemin())
        .pipe(dest(`${paths.dist}/imgs`));
}

// ЛР2: копіювання Bootstrap
function bootstrapCss() {
    return src(paths.bootstrap.css).pipe(dest(`${paths.dist}/css`));
}

function bootstrapJs() {
    return src(paths.bootstrap.js).pipe(dest(`${paths.dist}/js`));
}

function serve(done) {
    browserSync.init({
        server: { baseDir: paths.dist },
        notify: false,
        open: true,
    });
    done();
}

function watcher() {
    watch(paths.html.watch, html);
    watch(paths.scss.watch, styles);
    watch(paths.js.src, scripts);
    watch(paths.imgs.src, images).on('change', browserSync.reload);
}

const build = series(
    clean,
    parallel(html, styles, scripts, images, bootstrapCss, bootstrapJs)
);

exports.clean = clean;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.bootstrapCss = bootstrapCss;
exports.bootstrapJs = bootstrapJs;
exports.build = build;
exports.watch = series(build, serve, watcher);
exports.default = series(build, serve, watcher);