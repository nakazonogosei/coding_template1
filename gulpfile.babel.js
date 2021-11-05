import { src, dest, watch, parallel, series, lastRun } from "gulp";
import webpackStream from "webpack-stream";
import webpack from "webpack";
import webpackConfigDev from "./webpack.dev";
import webpackConfigProd from "./webpack.prod";
import gulpLoadPlugins from "gulp-load-plugins";

const plugins = gulpLoadPlugins({
  DEBUG: false,
  pattern: [
    "gulp-*",
    "*",
    "@*/gulp{-,.}*",
    "del",
    "imagemin-mozjpeg",
    "imagemin-pngquant",
  ],
  replaceString: /^gulp(-|\.)/,
  rename: {
    "imagemin-mozjpeg": "mozjpeg",
    "imagemin-pngquant": "pngquant",
  },
});

const paths = {
  ejs: {
    src: ["./src/ejs/**/*.ejs", "!./src/ejs/**/_*.ejs"],
    dest: "./dist",
  },
  css: {
    src: "./src/scss/**/*.{css,scss,sass}",
    dest: "./dist/assets/css",
  },
  js: {
    src: "./src/js/**/*.js",
    dest: "./dist/assets/js",
  },
  image: {
    src: "./src/images/**/*.{jpg,jpeg,png,svg,gif,ico}",
    dest: "./dist/assets/images",
  },
};

const imageOptions = [
  plugins.pngquant({ quality: [0.7, 0.85] }),
  plugins.mozjpeg({ quality: 85 }),
  plugins.imagemin.gifsicle(),
  plugins.imagemin.jpegtran(),
  plugins.imagemin.optipng(),
  plugins.imagemin.svgo({ removeViewBox: false }),
];

export const ejs = () => {
  return src(paths.ejs.src)
    .pipe(
      plugins.plumber({
        errorHandler: function (err) {
          console.log(err.message);
          this.emit("end");
        },
      })
    )
    .pipe(plugins.ejs())
    .pipe(plugins.rename({ extname: ".html" }))
    .pipe(dest(paths.ejs.dest))
    .pipe(plugins.connect.reload());
};

export const sass = () => {
  const mode = process.env.NODE_ENV === "development" ? true : false;
  return src(paths.css.src, { sourcemaps: mode }) // devのみ.mapを出力する
    .pipe(plugins.sassGlob())
    .pipe(
      plugins.plumber({
        errorHandler: function (err) {
          console.log(err.messageFormatted);
          this.emit("end");
        },
      })
    )
    .pipe(plugins.sass({ outputStyle: "expanded" }))
    .pipe(plugins.autoprefixer())
    .pipe(dest(paths.css.dest, { sourcemaps: "." }))
    .pipe(plugins.connect.reload());
};

export const js = () => {
  const mode =
    process.env.NODE_ENV === "development"
      ? webpackConfigDev
      : webpackConfigProd;
  return src(paths.js.src)
    .pipe(webpackStream(mode, webpack))
    .on("error", function handleError() {
      this.emit("end");
    })
    .pipe(dest(paths.js.dest))
    .pipe(plugins.connect.reload());
};

export const image = () => {
  const mode = process.env.NODE_ENV === "development" ? false : true;
  return src(paths.image.src, { since: lastRun(image) })
    .pipe(plugins.if(mode, plugins.imagemin(imageOptions)))
    .pipe(dest(paths.image.dest))
    .pipe(plugins.connect.reload());
};


export const server = (callback) => {
  plugins.connect.server({
    name: "localhost",
    root: "./dist/",
    port: 8080,
    livereload: true,
  });
  callback();
};

export const clean = () => {
  return plugins.del("./dist/**/*");
};

export const watchFiles = (callback) => {
  watch(paths.ejs.src[0]).on("change", ejs);
  watch(paths.css.src).on("change", sass);
  watch(paths.js.src).on("change", js);
  watch(paths.image.src).on("change", image);
  callback();
};

export const dev = series(
  clean,
  parallel(ejs, sass, js, image),
  server,
  watchFiles
);
export const prod = series(
  clean,
  parallel(ejs, sass, js, image)
);

export default dev;
