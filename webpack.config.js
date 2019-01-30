const VueLoaderPlugin = require("vue-loader/lib/plugin")
const path = require("path")
const conf = require("./server/conf/config")

module.exports = {
  mode: conf.mode,
  entry: {
    main: path.join(__dirname, "./vues/main.js")
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js"
  }, 
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: "vue-loader"
      },
      {
        test: /\.css$/,
        use: ["vue-style-loader", "css-loader"]
      },
      {
        test: /\.less/,
        use: ["vue-style-loader", "css-loader", "less-loader"]
      },
      {
        test: /\.(png|jpg|gif|svg|ttf|woff)$/,
        loader: "url-loader",
        options: {
          name: "[name].[ext]?[hash]",
          limit: 8192
        }
      }
    ]
  },
  resolve: {
    alias: {
      vue: "vue/dist/vue.js"
    }
  },

  node: {
    fs: "empty"
  },
  plugins: [new VueLoaderPlugin()]
}
