module.exports = {
  configureWebpack: {
    devtool: "source-map",
  },
  devServer: {
    disableHostCheck: true,
  },
  publicPath:
    process.env.NODE_ENV === "production" ? "/number-bonds-vue-cli/" : "/",
};
