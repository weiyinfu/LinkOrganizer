/**
 * 访问控制
 * 必须登录
 *
 * 权限管理就是：验证器到URL列表的映射
 * 验证器需要前端验证器和后端验证器两种验证器
 */

module.exports = {
  githubLogin: { url: "/api/githubLogin", preprocessor: [] },
  getLink: { url: "/api/getLink", preprocessor: [] },
  getLinkOfUser: { url: "/api/getLinkOfUser", preprocessor: [] },
  updateLink: { url: "/api/updateLink", preprocessor: ["login"] },
  addLink: { url: "/api/addLink", preprocessor: ["login"] },
  deleteLink: { url: "/api/deleteLink", preprocessor: ["login"] },
  userList: { url: "/api/userList", preprocessor: [] },
  getUserByName: { url: "/api/getUserByName", preprocessor: [] },
  startCrawl: { url: "/api/startCrawl", preprocessor: ["login"] },
  storeState: { url: "/api/storeState", preprocessor: ["manager"] },
}
