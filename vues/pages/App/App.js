import DraggableSplitter from "../../components/DraggableSplitter2.vue"
import NodeContent from "../../components/NodeContent.vue"
import ElTreeNode from "../../components/ElTree/tree-node.vue"
import ElTree from "../../components/ElTree/tree.vue"
import util from "../../js/util"
const access = require("../../Access")
const BookmarkJsonConverter = require("../../js/BookmarkJson")
export default {
  components: { NodeContent, DraggableSplitter, ElTree, ElTreeNode },
  data() {
    return {
      treeRoot: null,
      mounted: false, //是否已经完成挂载
      filterText: "", //使用文本过滤结点
      maxNodeId: 1, //最大的nodeId，当添加新结点时，直接自动加1
      createFolderDialogVisible: false, //创建文件夹对话框的可见性
      folderName: "", //创建文件夹对话框中文件名v-model
      //一切事件传入参数都有两个，node和$event
      treeNodeEventList: ["keyup", "dblclick"],
      allowEdit: true, //是否允许结点拖拽
      linkData: null, //整个树的元信息
      dragState: {
        //拖动状态
        draggingNode: null,
        dropType: null
      },
      //结点的默认属性
      defaultNodeProps: {
        label: "label"
      }
    }
  },
  mounted() {
    //向后台请求数据
    this.get(access.getLink.url, { params: { linkId: this.$route.params.linkId } })
      .then(resp => {
        if (resp.data.content) {
          var root = JSON.parse(resp.data.content)
          this.maxNodeId = util.addKey(root)
          this.treeRoot = root
          this.mounted = true
        }
        this.linkData = { ...resp.data }
        delete this.linkData["content"]
      })
      .catch(err => {
        console.log(err)
      })
  },
  computed: {
    currentNode() {
      if (!this.mounted) return null
      else return this.$refs.tree.store.currentNode
    },
    leftTreeData() {
      if (!this.mounted) return []
      this.$nextTick(() => {
        this.$refs.tree.setCurrentKey(this.treeRoot.id)
      })
      return [this.treeRoot]
    },
    rightTreeData() {
      if (this.currentNode) {
        return this.currentNode.data.children.filter(x => this.filterNode(this.filterText.trim(), x))
      } else {
        return []
      }
    },
    nowPath() {
      //根据右侧选中的文件夹更新面包屑
      if (this.currentNode == null) return []
      var now = this.currentNode
      var parentList = []
      while (now && now.data && now.data.children) {
        parentList.push(now)
        now = now.parent
      }
      return parentList.reverse()
    },
    treeAttrs() {
      var ans = {}
      if (this.allowEdit) {
        Object.assign(ans, {
          draggable: true,
          "allow-drag": this.allowDrag,
          "allow-drop": this.allowDrop
        })
      }
      return ans
    },
    treeEvents() {
      var ans = {}
      if (this.allowEdit) {
        Object.assign(ans, {
          "node-drag-start": this.dragStart,
          "node-drag-over": this.dragOver,
          "node-drag-enter": this.dragEnter,
          "node-drag-leave": this.dragLeave,
          "node-drag-end": this.dragEnd,
          "node-drop": this.nodeDrop,
          "node-drop-type-change": this.nodeDropTypeChange,
          "node-drop-node-change": this.nodeDropNodeChange
        })
      }
      return ans
    }
  },
  methods: {
    //搜索栏escape事件
    escapeOnSearchBox() {
      this.filterText = ""
      this.$refs.searchBox.blur()
    },
    //根据关键词过滤结点
    filterNode(keyword, data) {
      if (!keyword) return true
      keyword = keyword.toLowerCase()
      var s = data.label.toLowerCase()
      if (data.url) s += data.url
      return s.indexOf(keyword) !== -1
    },
    //是否应该显示结点，左侧文件夹栏只显示文件夹
    shouldShow: node => node.data && !!node.data.children,
    //是否隐藏结点展开图标
    hideExpandIcon: node => false,

    //按名称排序
    sortByName() {
      this.currentNode.data.children.sort((a, b) => {
        if (a.children && b.children) {
          if (a.label > b.label) return -1
          else if (a.label < b.label) return 1
          else return 0
        } else if (a.children && !b.children) {
          return -1
        } else if (!a.children && b.children) {
          return 1
        } else if (!a.children && !b.children) {
          if (a.url > b.url) return -1
          else if (a.url < b.url) return 1
          else return 0
        }
      })
      this.$nextTick(() => {
        this.updateNode(this.currentNode)
        this.updateNode(this.$refs.rightTree.root)
      })
    },
    updateNode(node) {
      node.setData(node.data)
      node.updateChildren()
    },
    //进入结点，如果是文件夹，则选中；如果是文件，则跳转
    enterNode(node, vm, $event) {
      if (node.data.children) {
        this.$refs.tree.setCurrentKey(node.key)
      } else {
        window.open(node.data.url)
      }
    },
    //header中下拉菜单命令
    handleHeaderDropDownCommand(cmd) {
      if (cmd == "newFolder") {
        this.createFolderDialogVisible = true
        this.$nextTick(() => {
          this.$refs.createFolderDialogInput.focus()
        })
      } else if (cmd == "sortByName") {
        this.sortByName()
      } else if (cmd == "exportDataAsBookmark") {
        var exportData = BookmarkJsonConverter.json2bookmark(this.treeRoot)
        util.downLoad(exportData, "bookmark.html")
      } else if (cmd == "exportDataAsJson") {
        var exportData = JSON.stringify(this.treeRoot)
        util.downLoad(exportData, "cnblog.json")
      } else if (cmd == "save") {
        this.saveData()
      } else {
        this.$message(`unkown cmd ${cmd}`)
      }
    },
    //保存数据
    saveData() {
      this.post(access.updateLink.url, {
        id: this.linkData.id,
        content: JSON.stringify(this.treeRoot)
      })
        .then(resp => {
          console.log(resp)
        })
        .catch(err => {
          console.log(err)
        })
    },
    //创建文件夹
    handleCreateFolderEvent() {
      var folderName = this.folderName.trim()
      if (!folderName) return
      for (var i of this.currentNode.childNodes) {
        if (i.label == this.folderName) {
          this.$message(`${this.folderName}已经存在了`)
          return
        }
      }
      this.currentNode.data.children.push({ label: folderName, id: ++this.maxNodeId, children: [] })
      this.updateNode(this.currentNode)
      //后处理：关闭对话框，清空对话框里的内容
      this.createFolderDialogVisible = false
      this.$message(`文件夹“${this.folderName}”创建成功`)
      this.folderName = ""
    },
    //根据key删除node
    removeNodeByKey(nodeKey) {
      var node = this.$refs.tree.getNode(nodeKey)
      var children = node.parent.data.children
      var i = 0
      while (children[i].id != node.key) i++
      if (i < children.length) children.splice(i, 1)
    },
    //处理节点上的键盘事件
    handleNodeKeyUp(node, vm, event) {
      if (event.key == "Delete") {
        this.handleRemoveNodeEvent(node, vm, event)
      } else if (event.key == "Enter") {
        this.enterNode(node, vm, event)
      } else {
        console.log(event)
      }
    },
    //处理移除结点事件
    handleRemoveNodeEvent(node, vm, $event) {
      if (node.data.children && node.data.children.length > 0) {
        this.$message(`文件夹“${node.label}”不为空不能删除`)
      } else {
        var parentKey = node.parent.key //如果删除的是文件夹，并且文件夹正在右面进行展示，那么使用被删除文件夹的父文件夹来替代
        this.removeNodeByKey(node.key)
        this.$message(`删除“${node.label}”`)
        if (node.key == this.$refs.tree.getCurrentKey()) {
          this.$refs.tree.setCurrentKey(parentKey)
        }
      }
    },
    //拖拽系列
    //是否允许拖动结点，除了根节点以外，其它结点都可以拖动
    allowDrag(draggingNode, event) {
      if (draggingNode.key == this.treeRoot.id) {
        return false
      }
      return true
    },
    //是否允许放下
    allowDrop(draggingNode, dropNode, type, event) {
      draggingNode = this.dragState.draggingNode
      if (!draggingNode) return false
      if (type == "after" && dropNode.nextSibling === draggingNode) {
        return false
      }
      if (type == "before" && dropNode.previousSibling === draggingNode) {
        return false
      }
      if (type == "inner" && dropNode.contains(draggingNode, false)) {
        return false
      }
      if (dropNode.data.children) {
        //如果是文件夹
        if (dropNode.data.id == this.treeRoot.id && type != "inner") {
          //根节点不能前插和后插
          return false
        }
      } else if (type == "inner") {
        //如果是叶子结点，不能放入
        return false
      }
      return true
    },

    //结点拖拽
    dragOver(draggingNode, dropNode, event) {},
    nodeDrop(draggingNode, dropNode, dropType, event) {
      dropType = this.dragState.dropType
      dropNode = this.dragState.dropNode
      if (!dropType || dropType == "none" || !this.dragState.draggingNode) return
      var srcNode = this.dragState.draggingNode
      this.dragState.dropType = null
      this.dragState.draggingNode = null
      //如果把祖先结点拖动到子节点上，这是不允许的
      var parent = dropNode
      while (parent) {
        if (parent.key == srcNode.key) {
          this.$message("你是不是傻")
          return
        }
        parent = parent.parent
      }
      if (dropNode.data && dropNode.data.children) {
        this.removeNodeByKey(srcNode.key)
        dropNode.data.children.push(srcNode.data)
        this.$nextTick(() => {
          this.updateNode(this.$refs.tree.getNode(dropNode.key))
          this.updateNode(this.$refs.rightTree.root)
        })
      }
    },
    dragEnter(draggingNode, dropNode, event) {},
    dragLeave(draggingNode, dropNode, event) {},
    //所有结点都可以拖拽，除了根节点
    dragStart(draggingNode, event) {
      this.dragState.draggingNode = draggingNode
    },
    dragEnd(draggingNode, dropNode, postion, event) {
      this.$refs.tree.resetDragState()
      this.$refs.rightTree.resetDragState()
    },
    nodeDropTypeChange(dropType) {
      this.dragState.dropType = dropType
    },
    nodeDropNodeChange(dropNode) {
      this.dragState.dropNode = this.$refs.tree.getNode(dropNode.key)
    }
  }
}
