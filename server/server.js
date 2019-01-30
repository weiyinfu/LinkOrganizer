/*
 * 服务端的主程序
 * */
var express = require("express")
var webpack = require("webpack")
var path = require("path")
var http = require("http")
var ws = require("ws")
var compression = require("compression")
var helmet = require("helmet")
var cookieParser = require("cookie-parser")
var morgan = require("morgan")
var rfs = require("rotating-file-stream")
var cookieSession = require("cookie-session")
var bodyParser = require("body-parser")
var webpackConfig = require("../webpack.config")
var wsHandler = require("./handler/WsHandler")
var httpHandler = require("./handler/HttpHandler")
var config = require("./conf/config")
const logger = require("./lib/log").getLogger()

//定义好express app
app = express()
//如果是开发模式，那么启用webpack自动更新，否则就当没有webpack

if (webpackConfig.mode == "development") {
  /**如果不在这里添加webpack-dev中间件，就需要使用webpack --watch命令监控文件变化 */
  var webpackDevMiddleware = require("webpack-dev-middleware")
  var compiler = webpack(webpackConfig)
  app.use(webpackDevMiddleware(compiler))
} else {
  //若为生产模式，启用压缩
  app.use(compression())
  //生产环境必须带上头盔
  app.use(helmet())
  //生产环境打印访问日志
  app.use(
    morgan("combined", {
      stream: rfs(path.join(config.logPath, "access.log"), {
        size: "10M",
        interval: "7d",
        compress: "gzip"
      })
    })
  )
}

//***********设置中间件********** */
//设置bodyparser
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing
//启用cookie-parser
app.use(cookieParser())
//启用cookie-session
app.use(
  cookieSession({
    name: "session",
    secret: config.cookieSessionSecret,
    maxAge: 24 * 60 * 60 * 1000 * 365
  })
)

//设置静态资源
app.use(express.static(path.join(__dirname, "../dist")))
app.use(express.static(path.join(__dirname, "../public")))

//请求处理
app.use(httpHandler) //注册一系列URL到函数的映射

//定义websocket处理函数
const myWs = new ws.Server({ noServer: true }) //默认websocket也会创建一个服务器，现在不创建了，只用这个websocket来处理事件
myWs.on("connection", wsHandler) //ws处理器

//定义server
var server = http.createServer(app)
process.on("uncaughtException", function(err) {
  logger.error("An uncaught error occurred!")
  logger.error(err)
})
//处理websocket事件
server.on("upgrade", function upgrade(request, socket, head) {
  logger.info(`upgrade ${request.url}`)
  myWs.handleUpgrade(request, socket, head, function done(conn) {
    myWs.emit("connection", conn, request) //可以定义多个wsServer，调用server的emit函数就能够把消息发送过去
  })
})
server.listen(config.port, function() {
  logger.info(`http://localhost:${config.port}`)
  console.log("http://localhost:" + config.port)
})
