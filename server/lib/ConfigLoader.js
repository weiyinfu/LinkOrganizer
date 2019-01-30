/**加载配置，避免把配置信息推送到Github */
const fs = require("fs")
const crypto = require("crypto")
const path = require("path")
const log4j = require("./log")
const logger = log4j.getLogger()

/**由config.json加密生成config-encoded.json */
function doEncode(folder) {
  const privateKey = process.env["PRIVATEKEY"]
  if (!privateKey) return //如果不存在privateKey，那就不必加密了
  var config = JSON.parse(fs.readFileSync(path.join(folder, "config.json")).toString("utf8"))
  for (var i in config) {
    if (typeof config[i] == "string") {
      var encoder = crypto.createCipher("des", privateKey)
      config[i] = encoder.update(config[i], "utf8", "hex") + encoder.final("hex")
    }
  }
  fs.writeFileSync(path.join(folder, "config-encoded.json"), JSON.stringify(config))
  logger.info("加密成功，请查看config-encoded.json")
}
/**由config-encoded.json解密生成config.json */
function doDecode(folder) {
  const privateKey = process.env["PRIVATEKEY"]
  if (!privateKey) throw new Error("把config-encoded.json复制到config.json中手动配置；或者添加PRIVATEKEY环境变量进行解密")
  var config = JSON.parse(fs.readFileSync(path.join(folder, "config-encoded.json")).toString("utf8"))
  for (var i in config) {
    if (typeof config[i] == "string") {
      var decoder = crypto.createDecipher("des", privateKey)
      config[i] = decoder.update(config[i], "hex", "utf8") + decoder.final("utf8")
    }
  }
  fs.writeFileSync(path.join(folder, "config.json"), JSON.stringify(config))
  logger.info("解密成功，请查看config.json")
}
/** 解析config.json和config-encoded.json，让两者互相生成 */
function parseData(folder) {
  var configPath = path.join(folder, "config.json")
  var configEncodePath = path.join(folder, "config-encoded.json")
  if (fs.existsSync(configPath)) {
    if (!fs.existsSync(configEncodePath) || fs.statSync(configEncodePath).mtime < fs.statSync(configPath).mtime) {
      doEncode(folder)
    }
    return JSON.parse(fs.readFileSync(configPath).toString("utf8"))
  } else {
    doDecode(folder)
    return parseData(folder) //重新解析
  }
}
module.exports = parseData
