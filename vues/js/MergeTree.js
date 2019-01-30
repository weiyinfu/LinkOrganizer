/*
合并树有两种模式：
模式一：removeLack
如果sourceTree中没有项目x，则删除targetTree中的项目x；
如果sourceTree中有项目x，则以targetTree为准；
模式二：merge
sourceTree中没有的项目x，也不从targetTree中删除，只进行合并
*/

//解析树中的全部URL
function parseUrls(tree) {
  var a = []
  if (tree.children) {
    for (var child of tree.children) {
      a = a.concat(parseUrls(child))
    }
  } else {
    a.push(tree.url)
  }
  return a
}
//向targetTree中插入sourceTree，只有当url在shouldInsert中出现时才执行插入
function insert(targetTree, sourceTree, shouldInsert) {
  var folderMap = {}
  for (var i of targetTree.children) {
    if (i.children) {
      folderMap[i.label] = i
    }
  }
  for (var child of sourceTree.children) {
    if (child.children) {
      var folderName = child.label
      if (folderMap[folderName]) {
        insert(folderMap[folderName], child, shouldInsert)
      } else {
        var newFolder = { label: child.label, children: [] }
        targetTree.children.push(newFolder)
        if (child.children.length > 0) {
          insert(newFolder, child, shouldInsert)
        }
      }
    } else {
      if (shouldInsert.has(child.url)) {
        targetTree.children.push(child)
      }
    }
  }
}
//去掉空白文件夹
function removeEmptyFolder(node) {
  var children = []
  for (var i of node.children) {
    if (i.children) {
      if (i.children.length == 0) {
        continue
      } else {
        removeEmptyFolder(i)
      }
    }
    children.push(i)
  }
  node.children = children
  return node
}
function mergeTree(targetTree, sourceTree, mode) {
  var targetUrls = parseUrls(targetTree)
  var sourceUrls = parseUrls(sourceTree)
  var targetUrlSet = new Set(targetUrls)
  var sourceUrlSet = new Set(sourceUrls)
  var sourceOnlyHave = new Set(sourceUrls.filter(x => !targetUrlSet.has(x)))
  var commonUrls = new Set()
  for (var i of sourceUrls) {
    if (targetUrlSet.has(i)) {
      commonUrls.add(i)
    }
  }
  for (var i of targetUrls) {
    if (sourceUrlSet.has(i)) {
      commonUrls.add(i)
    }
  }

  if (mode == "merge") {
    insert(targetTree, sourceTree, sourceOnlyHave)
    targetTree = removeEmptyFolder(targetTree)
    return targetTree
  } else if ((mode = "removeLack")) {
    var tr = { label: "root", children: [] }
    insert(tr, targetTree, commonUrls)
    insert(tr, sourceTree, sourceOnlyHave)
    tr = removeEmptyFolder(tr)
    return tr
  }
}
module.exports = mergeTree
if (require.main == module) {
  var one = {
    label: "root",
    children: [{ label: "java", children: [{ label: "one", url: "one" }] }, { label: "two", url: "two" },{label:"six",url:"six"}]
  }
  var two = {
    label: "未归类",
    children: [ { label: "five", url: "five" }]
  }
  var t = mergeTree(one, two, "removeLack")
  console.log(t)
}
