const access = require("../../Access")
import CardList from "../../components/CartList.vue"
const util = require("../../js/util")
export default {
  components: { CardList },
  data() {
    return {
      //关于对话框
      aboutDialog: {
        visible: false
      },
      //创建文件夹对话框
      createFolderDialog: {
        visible: false,
        folderType: "cnblog",
        name: "",
        account: ""
      },
      //创建文件夹对话框校验规则
      createFolderDialogRules: {
        folderType: [{ required: true, message: "请输入文件夹类型", trigger: "blur" }],
        account: [{ required: true, message: "请输入账号", trigger: "blur" }],
        name: [{ required: true, message: "请输入文件名", trigger: "blur" }]
      },
      //编辑对话框
      editFolderDialog: {
        visible: false,
        folderType: "cnblog",
        name: "",
        account: ""
      },
      //编辑对话框校验规则
      editFolderDialogRules: {},
      //当前的文件夹列表
      folderList: [],
      colCount: 4, //卡片的列数
      userInfo: {
        //当前用户的信息，不一定是自己
        name: "",
        company: "",
        blog: "",
        location: "",
        email: "",
        bio: "",
        public_repos: 0,
        public_gists: 0,
        followers: 0,
        following: 0
      }
    }
  },
  computed: {
    //创建文件夹对话框的计算属性
    createFolderDialogAttrs() {
      var folderTypesNeedAccount = new Set(["cnblog", "github"])
      var accountFormItemVisible = folderTypesNeedAccount.has(this.createFolderDialog.folderType)
      var folderTypeStr = this.folderType2String(this.createFolderDialog.folderType)
      var accountLabel = ""
      if (accountFormItemVisible) {
        accountLabel = folderTypeStr + "用户名"
      }
      return {
        accountLabel,
        accountFormItemVisible
      }
    },
    //编辑文件夹对话框的属性
    editFolderDialogAttrs() {
      var accountLabel = "",
        accountFormItemVisible = false
      return { accountLabel, accountFormItemVisible }
    }
  },
  mounted() {
    this.requestFolder()
    this.get(access.getUserByName.url, {
      params: { username: this.$route.params.username }
    })
      .then(resp => {
        var userInfo = resp.data.extra.githubInfo
        console.log(resp.data)
        for (var i in this.userInfo) {
          if (userInfo[i]) this.userInfo[i] = userInfo[i]
        }
      })
      .catch(err => {
        console.log(err)
      })
  },
  methods: {
    folderType2String(folderType) {
      var ma = {
        cnblog: "博客园",
        github: "Github"
      }
      return ma[folderType]
    },
    //获取用户的全部文件夹
    requestFolder() {
      this.get(access.getLinkOfUser.url, {
        params: {
          username: this.$route.params.username
        }
      })
        .then(resp => {
          this.folderList = resp.data
        })
        .catch(err => {
          console.log(err)
        })
    },
    handleCreateFolder() {
      var folderName = this.createFolderDialog.name
      if (!folderName) {
        folderName = this.createFolderDialog.account + "的" + this.folderType2String(this.createFolderDialog.folderType)
      }
      this.post(access.addLink.url, {
        name: folderName,
        type: this.createFolderDialog.folderType,
        account: this.createFolderDialog.account
      })
        .then(resp => {
          this.requestFolder()
          this.createFolderDialog.visible = false
          this.$refs.createFolderForm.resetFields()
          this.$message(`创建“${folderName}”成功`)
        })
        .catch(err => {
          this.$message(`创建“${folderName}”失败`)
          console.log(err)
        })
    },
    handleDeleteLink(link) {
      this.get(access.deleteLink.url, {
        params: { linkId: link.id }
      })
        .then(resp => {
          if (resp.data == "ok") {
            this.$message(`删除${link.name}成功`)
            this.requestFolder()
          } else {
            this.$message(`删除${link.name}失败`)
          }
        })
        .catch(err => {
          console.log(err)
        })
    },
    handleUpdateLink(link) {
      this.get(access.startCrawl.url, { params: { linkId: link.id } })
        .then(resp => {
          var linkId = parseInt(resp.data)
          if (!linkId) {
            this.$message(resp.data)
          } else {
            this.$router.push({ name: "crawl.page", linkId })
          }
        })
        .catch(e => {
          console.log(e)
          if (e.response && e.response.data) {
            this.$message(e.response.data)
          }
        })
    },
    //处理文件夹下拉菜单命令
    handleFolderDropdownCommand(link, command) {
      if (command == "delete") {
        this.handleDeleteLink(link)
      } else if (command == "editContent") {
        this.$router.push(`/${this.userInfo.name}/link/${link.id}`)
      } else if (command == "editMeta") {
        this.$message("这个不能点")
      } else if (command == "update") {
        this.handleUpdateLink(link)
      } else {
        this.$message("not implement " + command + " yet")
      }
    },
    //顶部下拉菜单命令处理
    handleHeaderDropDownCommand(cmd) {
      if (cmd == "about") {
        this.aboutDialog.visible = true
      } else if (cmd == "createFolder") {
        this.createFolderDialog.visible = true
      } else {
        console.log(cmd + " not handled")
      }
    },
    time2string: util.time2string
  }
}
