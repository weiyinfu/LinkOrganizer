/*chrome 书签加载器
把html形式的书签列表解析为JSON
*/
const cheerio = require("cheerio")
const fs = require("fs")

function trim(node) {
  //去掉开头的单子结点
  if (node.children && node.children.length == 1) {
    var son = node.children[0]
    if (son.children) {
      return trim(son)
    } else {
      return node
    }
  } else {
    return node
  }
}
/////////////////////////
function json2bookmark(node) {
  node = trim(node) //去掉多余结点
  function handle(node) {
    if (!node.children) {
      //如果是叶子节点
      return `<DT><A HREF="${node.url}">${node.label}</A>\n`
    }
    var s = node.children.map(son => handle(son)).join("")
    return `<DT><H3>${node.label}</H3>\n<DL>\n${s}\n</DL>\n`
  }
  var s = node.children.map(handle).join("\n")
  return `<DL>\n${s}\n</DL>`
}
/////////////////////////
//转换格式
function transformFormat(a) {
  var tr = { label: "root", children: [] }
  for (var i of a) {
    var nodePath = i.path.split("/").reverse() //结点的路径
    var now = tr //当前节点
    //把结点i插入到树中
    for (var j of nodePath) {
      var next = null
      for (var k of now.children) {
        if (k.label == j) {
          next = k
          break
        }
      }
      if (next == null) {
        next = { label: j, children: [] }
        now.children.push(next)
      }
      now = next
    }
    now.children.push({ label: i.label, url: i.href })
  }
  return tr
}
function bookmark2json(filename) {
  if (!fs.existsSync(filename)) {
    throw new Error("`${filename}不存在`")
  }
  var $ = cheerio.load(fs.readFileSync(filename))
  var links = $("a")
  var data = []
  for (var i = 0; i < links.length; i++) {
    var now = links.eq(i)
    var parentPath = []
    var parent = now.parent()
    //获取当前结点的全部父节点，用于定位当前结点的位置
    while (true) {
      var firstChild = parent.children().eq(0)
      if (firstChild.get(0).tagName.startsWith("h")) {
        parentPath.push(firstChild.text())
      }
      parent = parent.parent()
      if (parent.get(0).tagName == "html") {
        break
      }
    }
    data.push({
      path: parentPath.join("/"),
      href: now.attr("href"),
      icon: now.attr("icon"),
      label: now.text()
    })
  }
  data = transformFormat(data)
  data = trim(data)
  return data
}

module.exports = {
  json2bookmark,
  bookmark2json
}
