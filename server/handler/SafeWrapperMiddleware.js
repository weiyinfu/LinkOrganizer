const log = require("../lib/log")
const domain = require("domain")
const logger = log.getLogger()

function errorHandler(error, req, resp) {
  logger.error("handle request error path: ", req.path, "session: ", req.session)
  logger.error(error)
  resp.status(500).end("internal error")
}

function safeWrap(req, resp, next) {
  try {
    const dom = domain.create()
    dom.on("error", e => errorHandler(e, req, resp))
    dom.run(next)
  } catch (e) {
    errorHandler(e, req, resp)
  }
}
module.exports = safeWrap
