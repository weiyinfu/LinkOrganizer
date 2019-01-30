/**用户信息处理 */
const db = require("./DB")

function updateUser(user, who, handler) {
  db.query("update user set ? where ?", [user, who], handler)
}
function getUser(user, handler) {
  db.query("select * from user where ?", user, handler)
}
function getAllUser(handler) {
  db.query("select id,name,avatar_url from user", [], handler)
}
function insertUser(user, handler) {
  db.query("insert into user set ?", user, handler)
}
function deleteUser(user, handler) {
  db.query("delete from user where ?", user, handler)
}
module.exports = {
  updateUser,
  getUser,
  insertUser,
  deleteUser,
  getAllUser
}
