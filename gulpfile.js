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
    dist: 'dist',
};

// Очищення dist (папка створюється автоматично при запуску)
function clean() {
    return del([paths.dist]);
}

// 1. HTML + file include (header, sidebar, footer ...)
function html() {
    return src(paths.html.entry)
        .pipe(fileInclude({ prefix: '@@', basepath: '@file' }))
        .pipe(dest(paths.dist))
        .pipe(browserSync.stream());
}

// 2. SCSS -> CSS + мініфікація
function styles() {
    return src(paths.scss.src)
        .pipe(sass().on('error', sass.logError))
        .pipe(cssnano())
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest(`${paths.dist}/css`))
        .pipe(browserSync.stream());
}

// 3. JavaScript: об'єднання + мініфікація
function scripts() {
    return src(paths.js.src)
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest(`${paths.dist}/js`))
        .pipe(browserSync.stream());
}

// 4. Оптимізація зображень
function images() {
    return src(paths.imgs.src)
        .pipe(imagemin())
        .pipe(dest(`${paths.dist}/imgs`));
}

// 5. BrowserSync
function serve(done) {
    browserSync.init({
        server: { baseDir: paths.dist },
        notify: false,
        open: true,
    });
    done();
}

// 6. Watcher
function watcher() {
    watch(paths.html.watch, html);
    watch(paths.scss.watch, styles);
    watch(paths.js.src, scripts);
    watch(paths.imgs.src, images).on('change', browserSync.reload);
}

const build = series(clean, parallel(html, styles, scripts, images));

exports.clean = clean;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.watch = series(build, serve, watcher);
exports.build = build;
exports.default = series(build, serve, watcher);