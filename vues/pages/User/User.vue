<template>
  <el-container>
    <el-header>
      <router-link :to="userHome()"
        id="logo">
        <span id="title">
          <span class="fa fa-link"></span>&nbsp;链接管理器</span>
      </router-link>
      <div>
        <!-- 下拉菜单 -->
        <el-dropdown style="padding-right:20px;"
          @command="handleHeaderDropDownCommand"
          trigger="click">
          <el-button type="primary">
            <i class="fa fa-bars fa-2x"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="createFolder">
              <i class="fa fa-sort-alpha-asc"></i>&nbsp;添加文件夹</el-dropdown-item>
            <el-dropdown-item command="about">
              <i class="fa fa-sort-alpha-asc"></i>&nbsp;关于</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>
    <el-main>
      <div class="page">
        <div v-if="folderList.length>0">
          <card-list :cardList="folderList"
            :col-count=3>
            <el-card slot-scope="{data}"
              style="margin:10px;padding-bottom:25px;">

              <span class="title"
                :title="data.name">
                <router-link :to="{ name:'link.page',params:{ username:userInfo.name,linkId:data.id}}"
                  style="text-decoration:none;"
                  v-html="betterSpan(data.name)"></router-link>
              </span>
              <br>
              <img src="cnblog.png"
                v-if="data.type=='cnblog'"
                class="card-img" />
              <img src="github.png"
                v-if="data.type=='github'"
                class="card-img" />
              <div style="float:right;">
                <span class="span-key">创建时间</span>
                <span class="span-value">{{time2string(data.create_time)}}</span><br>
                <span class="span-key">修改时间</span>
                <span class="span-value">{{time2string(data.update_time)}}</span><br>
                <span class="span-key">账号</span>
                <span class="span-value">{{data.extra.account}}</span><br>
              </div>
              <div class="card-bottom">
                <el-dropdown :hide-on-click="false"
                  style="float:right;"
                  @command="handleFolderDropdownCommand(data,...arguments)">
                  <span class="el-dropdown-link">
                    操作
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="update">更新</el-dropdown-item>
                    <el-dropdown-item command="editContent">编辑内容</el-dropdown-item>
                    <el-dropdown-item command="delete">删除</el-dropdown-item>
                    <el-dropdown-item command="editMeta">重命名</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </el-card>
          </card-list>
        </div>
        <div v-else>
          You have nothing
        </div>
      </div>
      <div class="right-page">
        <div v-for="(v,k) in userInfo"
          :key="k">
          <template v-if="v">
            <span class="span-key">{{k}}</span>
            <span class="span-value">{{v}}</span>
          </template>
        </div>
      </div>
      <!-- 关于对话框 -->
      <el-dialog title="链接管理器"
        :visible.sync="aboutDialog.visible"
        center
        id="aboutDialog">
        <a href="https://github.com/weiyinfu/linkorganizer"><img width="149"
            height="149"
            src="forkme.png"
            alt="Fork me on GitHub"
            data-recalc-dims="1"
            style="position:absolute;"></a>
        <img src="wx-pay.png"
          style="max-width:350px;max-height:350px;" />
      </el-dialog>

      <!-- 新建文件夹 -->
      <el-dialog title="新建"
        :visible.sync="createFolderDialog.visible"
        center>

        <el-form ref="createFolderForm"
          :model="createFolderDialog"
          :rules="createFolderDialogRules"
          label-width="120px">
          <el-form-item label="文件夹类型"
            prop="folderType">
            <el-radio v-model="createFolderDialog.folderType"
              label="cnblog"
              border>博客园</el-radio>
            <el-radio v-model="createFolderDialog.folderType"
              label="github"
              border>Github</el-radio>
          </el-form-item>

          <el-form-item :label="createFolderDialogAttrs.accountLabel"
            v-if="createFolderDialogAttrs.accountFormItemVisible"
            prop="account">
            <el-input v-model="createFolderDialog.account"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary"
              @click="handleCreateFolder">立即创建</el-button>
            <el-button @click="createFolderDialog.visible=false;$refs.createFolderForm.resetFields();">取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>

      <!-- 编辑文件夹 -->
      <el-dialog title="编辑"
        :visible.sync="editFolderDialog.visible"
        center>

        <el-form ref="editFolderForm"
          :model="editFolderDialog"
          :rules="editFolderDialogRules"
          label-width="120px">
          <el-form-item label="文件夹名称">
            <el-input v-model="editFolderDialog.name"> </el-input>
          </el-form-item>
          <el-form-item label="文件夹类型">
            <el-radio v-model="editFolderDialog.folderType"
              label="cnblog"
              border>博客园</el-radio>
            <el-radio v-model="editFolderDialog.folderType"
              label="github"
              border>Github</el-radio>
          </el-form-item>
          <el-form-item :label="editFolderDialogAttrs.accountLabel"
            v-if="editFolderDialogAttrs.accountFormItemVisible">
            <el-input v-model="editFolderDialog.account"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary">更新</el-button>
            <el-button>取消</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>
    </el-main>
  </el-container>
</template>
<script src="./User.js"></script>
<style lang="less"  module src="./User.less"></style>
