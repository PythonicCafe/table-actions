const plugins = [
  require("postcss-nesting"),
  require("postcss-import"),
  require("postcss-preset-env")({
    stage: 2,
    features: {
      "custom-media-queries": true,
    }
  }),
  require("autoprefixer"),
];

module.exports = {
  plugins: plugins
};
