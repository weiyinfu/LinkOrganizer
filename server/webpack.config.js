const VueLoaderPlugin = require("vue-loader/lib/plugin")
const path = require("path")
const fs = require("fs")
const conf = require("./conf/config")
const handlebars = require("handlebars")
const chalk = require("chalk")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const CompressionWebpackPlugin = require("compression-webpack-plugin")

const distPath = path.join(__dirname, "../dist")
const development = conf.mode == "development"
const production = conf.mode == "production"
function webpackConfigFilter(webpackConfig) {
  function realValue(x) {
    if (x.condition == undefined) return x
    if (x.condition) return x.ifTrue
    else return x.ifFalse
  }
  function filtArray(a) {
    return a.map(realValue).filter(x => x != null && x != undefined)
  }
  function filtObject(o) {
    for (var i in o) {
      if (o[i] instanceof Array) {
        o[i] = filtArray(o[i])
      } else if (o[i].condition != undefined) {
        o[i] = realValue(o[i])
      } else if (typeof o[i] == "object") {
        o[i] = filtObject(o[i])
      }
    }
    return o
  }
  return filtObject(webpackConfig)
}
const webpackConfig = {
  mode: conf.mode,
  entry: {
    main: [
      path.join(__dirname, "../vues/main.js"),
      {
        condition: development,
        ifTrue: "element-ui/lib/theme-chalk/index.css"
      }
    ]
  },
  output: {
    path: distPath,
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
        test: /\.less$/,
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
    extensions: [".js", ".vue", ".json"],
    alias: {
      vue: "vue/dist/vue.js"
    }
  },
  node: {
    fs: "empty"
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyWebpackPlugin([{ from: path.join(__dirname, "../public"), to: distPath }]),
    {
      condition: production,
      ifTrue: new CompressionWebpackPlugin({
        test: new RegExp("\\.(" + ["js", "css"].join("|") + ")$"),
        // asset: "[path].gz[hash]",
        algorithm: "gzip",
        threshold: 10240,
        minRatio: 0.8
      })
    }
  ],
  devServer: {
    contentBase: distPath
  },
  externals: {
    condition: production,
    ifTrue: {
      vue: "Vue",
      "element-ui": "ELEMENT",
      "vue-router": "VueRouter"
    },
    ifFalse: {}
  }
}
//手动编译index.html
function generateIndex(distPath) {
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath)
  }
  const template = handlebars.compile(fs.readFileSync(path.join(__dirname, "index.html")).toString("utf8"))
  const s = template({ production: webpackConfig.mode == "production" })
  fs.writeFileSync(path.join(distPath, "index.html"), s)
  console.log(chalk.green("generate index.html succssfully"))
}
generateIndex(path.join(__dirname, distPath))
module.exports = webpackConfigFilter(webpackConfig)
