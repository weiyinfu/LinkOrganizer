/**
 * 自定义简易日志工具
 * Node程序运行时，控制台下无法看到输出是哪一行代码打印出来的，这不仅难以追踪问题，也造成想删除打印信息时不知道在哪里打印的这种困境。
 * Node天然不支持获取行号的功能，只能通过抛出异常的方式来定位代码位置。
 */
var chalk = require("chalk")
const stringify = require("json-stringify-safe")

function getContext() {
  try {
    throw new Error("")
  } catch (err) {
    const stackArr = err.stack.split("\n")
    var s = stackArr[4]
    a = /\s+at\s+(.+)\s+\(((.+):(\d+):(\d+))\)/.exec(s)
    if (!a) return null
    return { funcName: a[1], filepath: a[3], line: a[4], col: a[5] }
  }
}
//日志的级别和颜色、权重
var levels = {
  trace: {
    color: "blue",
    weight: 100
  },
  debug: {
    color: "cyan",
    weight: 200
  },
  info: {
    color: "green",
    weight: 300
  },
  error: {
    color: "red",
    weight: 400
  },
  fatal: {
    color: "magenta",
    wight: 500
  }
}
class Logger {
  constructor() {
    this.level = levels.debug
    this.name = ""
  }
  go(level, ...args) {
    var weight = level.weight
    if (weight < this.level.weight) return
    var ctx = getContext()
    var s = args
      .map(x => {
        if (x == null) return ""
        if (typeof x == "object") {
          if (x.stack) {
            return x.stack
          }
          return stringify(x)
        } else {
          return x
        }
      })
      .join(" ")
    var name = this.name ? `[${this.name}]` : ""
    var contextString = ""
    if (ctx) contextString = `${ctx.filepath}:${ctx.line} (${ctx.funcName})`
    console.log(chalk[level.color](`${name} ${contextString} ${s}`))
  }
  debug(...args) {
    this.go(levels.debug, ...args)
  }
  info(...args) {
    this.go(levels.info, ...args)
  }
  warn(...args) {
    this.go(levels.warn, ...args)
  }
  error(...args) {
    this.go(levels.error, ...args)
  }
  fatal(...args) {
    this.go(levels.fatal, ...args)
  }
}

function getLogger() {
  return new Logger()
}
module.exports = { getLogger, levels }
if (require.main == module) {
  var logger = getLogger("haha")
  logger.debug("ok")
}
