const db = require("./DB")
function getLinkOfUser(userId, handler) {
  db.query("select id,create_time,update_time,name,user_id,type,extra from link where user_id=?", userId, handler)
}
function getLinkById(linkId, handler) {
  db.query("select * from link where id=?", linkId, handler)
}
function updateLink(link, linkId, handler) {
  link.update_time = new Date().getTime()
  db.query("update link set  ? where id=?", [link, linkId], handler)
}
function insertLink(link, handler) {
  link.create_time = new Date().getTime()
  db.query("insert into  link set ?", link, handler)
}
function deleteLink(linkId, handler) {
  db.query("delete from link where id=?", linkId, handler)
}

module.exports = {
  getLinkOfUser,
  updateLink,
  insertLink,
  deleteLink,
  getLinkById
} 
