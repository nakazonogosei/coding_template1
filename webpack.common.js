import webpack from "webpack";

module.exports = {
  entry: ["@babel/polyfill", "./src/js/index.js"],
  output: {
    path: `${__dirname}/dist/assets/js`,
    filename: "script.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env"]],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
    }),
  ],
};
