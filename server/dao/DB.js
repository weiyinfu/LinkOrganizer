var mysql = require("mysql")
var genericPool = require("generic-pool")
var conf = require("../conf/config")
var log = require("../lib/log")

var logger = log.getLogger()
const jsonFieldList = ["extra"]
const connectionFactory = genericPool.createPool(
  {
    create() {
      logger.info("create connection")
      return mysql.createConnection({
        host: conf.mysql.host,
        port: conf.mysql.port,
        database: conf.mysql.database,
        user: conf.mysql.user,
        password: conf.mysql.password,
        charset: "utf8mb4",
        debug: false //conf.mode == "development"
      })
    },
    destroy(conn) {
      logger.info("destroying connection")
      conn.end(err => {
        logger.error(err)
      })
    },
    validate(conn) {
      logger.info("validating connection ")
      return new Promise((resolve, reject) => {
        conn.ping(err => {
          try {
            if (err) resolve(false)
            else resolve(true)
          } catch (e) {
            reject(e)
          }
        })
      })
    }
  },
  {
    max: 5,
    min: 1,
    testOnBorrow: true
  }
)
function query(sql, args, handler) {
  stringifyJsonField(args)
  connectionFactory.acquire().then(conn => {
    conn.query(sql, args, (err, res, fields) => {
      expandExtra(err, res)
      handler(err, res)
      connectionFactory.release(conn)
    })
  })
}
function stringifyJsonField(args) {
  if (!args) return
  if (!(args instanceof Array)) args = [args]
  for (var i of args) {
    if (typeof i == "object") {
      for (var jsonField of jsonFieldList) {
        if (i[jsonField] && typeof i[jsonField] == "object") {
          try {
            i[jsonField] = JSON.stringify(i[jsonField])
          } catch (e) {
            logger.error(e)
            logger.error(i[jsonField])
          }
        }
      }
    }
  }
}
//将json字段展开
function expandExtra(err, res) {
  if (res && res.length) {
    for (var i of res) {
      if (typeof i != "object") {
        break
      }
      i["why"] = "baga"
      for (var jsonField of jsonFieldList) {
        if (i[jsonField]) {
          try {
            var obj = JSON.parse(i[jsonField])
            i[jsonField] = obj
          } catch (e) {
            logger.error(e)
            logger.error(i[jsonField])
          }
        }
      }
    }
  }
}
module.exports = { query }
