var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var runSequence = require('run-sequence');
var base64      = require('gulp-base64');
var inline      = require('gulp-inline');
var imagemin    = require('gulp-imagemin');
var cssmin      = require('gulp-cssmin');
var cachebust    = require('gulp-cache-bust');
var modernizr = require('gulp-modernizr');

var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    console.log('Running build jekyll');
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

gulp.task('modernizr', function() {
  gulp.src('./js/*.js')
    .pipe(modernizr({
            tests: ['textshadow', 'csstransforms', 'csstransforms3d', 'cssanimations'],
            options: ['setClasses']
        }))
    .pipe(gulp.dest("_site/js/"))
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src(['_scss/main.scss', '_scss/macalester-today.scss', '_scss/slick.scss'])
        .pipe(sass({
            includePaths: require('node-neat').with('scss')
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(base64( {
            extensions: ['svg']
            }))
        .pipe(cssmin())
        .pipe(gulp.dest('_site/css'))
        .pipe(browserSync.reload({stream:true}))
});


gulp.task('imagemin', function () {
    return gulp.src(['_site/**/*.jpg', '_site/**/*.png', '_site/**/*.svg'])
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('_site'))
});

gulp.task('inline', function () {
    return gulp.src('_site/**/*.html')
        .pipe(inline({
            'base': '_site/'
        }))
        .pipe(gulp.dest('_site'))
});

gulp.task('cachebust', function () {
    return gulp.src('_site/**/*.html')
        .pipe(cachebust())
        .pipe(gulp.dest('_site'))
});
/**
 * Run all tasks needed for a build in defined order
 */
gulp.task('build-all', function(callback) {
    console.log('Running builde');
  runSequence('jekyll-build', 'sass', 'modernizr', 'imagemin');
});

gulp.task('package', function(callback) {
  runSequence('jekyll-build', 'sass', 'imagemin', 'modernizr', 'cachebust', callback);
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch(['_scss/*.scss', '*.html', 'work/**/*', '_layouts/**/*', '_posts/**/*', '_config.yml', 'assets/**/*', '_includes/**/*', '_projects/**/*', 'js/*.js'], function() { console.log("need to run build here"); runSequence('jekyll-build', 'sass', 'modernizr');});
});

var rsync = require('rsyncwrapper').rsync;


gulp.task('deploy', ['package'], function() {
  rsync({
    ssh: true,
    src: './_site/',
    dest: 'ec2-user@ec2-54-173-181-10.compute-1.amazonaws.com:/var/www/zachbajaber.com/public_html/',
    recursive: true,
    syncDest: true,
    args: ['--verbose', '-e "ssh -i /Users/zachariab/.ssh/AWS-11.pem"']
  }, function(error, stdout, stderr, cmd) {
      console.log(cmd, stdout);
  });
});


/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['build-all', 'browser-sync', 'watch']);
