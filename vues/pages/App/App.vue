<template>
  <div id="container">
    <div id="header">
      <router-link :to="userHome()"
        id="logo">
        <span id="title">
          <span class="fa fa-link"></span>&nbsp;链接管理器</span>
      </router-link>
      <div>
        <!-- 顶部搜索框 -->
        <el-input ref="searchBox"
          size="large"
          placeholder="输入关键字进行过滤"
          v-model="filterText"
          prefix-icon="fa fa-search"
          @keyup.esc.native.stop="escapeOnSearchBox">
        </el-input>
        <!-- 下拉菜单 -->
        <el-dropdown style="padding-right:20px;"
          @command="handleHeaderDropDownCommand"
          trigger="click">
          <el-button type="primary">
            <i class="fa fa-bars fa-2x"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="newFolder"
              v-if="allowEdit">
              <i class="fa fa-folder-o"></i>&nbsp; 新建文件夹
            </el-dropdown-item>
            <el-dropdown-item command="sortByName"
              v-if="allowEdit">
              <i class="fa fa-sort-alpha-asc"></i>&nbsp;按名称排序</el-dropdown-item>
            <el-dropdown-item command="exportDataAsBookmark"
              divided>
              <i class="fa fa-archive"></i>&nbsp;导出为Chrome书签</el-dropdown-item>
            <el-dropdown-item command="exportDataAsJson">
              <i class="fa fa-code"></i>&nbsp;导出为JSON</el-dropdown-item>
            <el-dropdown-item command="save"
              v-if="allowEdit">
              <i class="fa fa-save"></i>&nbsp;保存</el-dropdown-item>

          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <div id="main">
      <div id="left">
        <!-- 左侧文件夹树形控件 -->
        <el-tree default-expand-all
          check-on-click-node
          highlight-current
          render-after-expand
          ref="tree"
          node-key="id"
          :expand-on-click-node="false"
          :data="leftTreeData"
          :should-show="shouldShow"
          :props="defaultNodeProps"
          v-on="treeEvents"
          v-bind="treeAttrs"
          @node-keyup="handleNodeKeyUp">
          <node-content slot-scope="data"
            :node="data.node"></node-content>
        </el-tree>
      </div>
      <!-- 拖动条 -->
      <draggable-splitter direction="vertical"></draggable-splitter>
      <div id="right">
        <div id="right-header">
          <!-- 顶部面包屑导航 -->
          <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item v-for="node in nowPath"
              :key="node.key"
              @click.native="enterNode(node)">{{node.label}}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div id="right-main">
          <!-- 右侧文件夹内容，使用一个只包含一层结点的树来表示 -->
          <div id="page">
            <el-tree highlight-current
              render-after-expand
              node-key="id"
              ref="rightTree"
              :expand-on-click-node="false"
              :data="rightTreeData"
              :show-expand-icon="hideExpandIcon"
              :props="defaultNodeProps"
              v-on="treeEvents"
              v-bind="treeAttrs"
              @node-dblclick="enterNode"
              @node-keyup="handleNodeKeyUp">
              <node-content slot-scope="data"
                :node="data.node"></node-content>
            </el-tree>
          </div>
        </div>
      </div>
    </div>
    <!-- 新建文件夹对话框 -->
    <el-dialog title="文件夹名称"
      :visible.sync="createFolderDialogVisible">
      <el-input v-model="folderName"
        autocomplete="off"
        ref="createFolderDialogInput"
        @keyup.enter.stop.prevent.native="handleCreateFolderEvent"></el-input>
      <div slot="footer"
        class="dialog-footer">
        <el-button @click="createFolderDialogVisible = false;folderName=''">取 消</el-button>
        <el-button type="primary"
          @click="handleCreateFolderEvent">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script src="./App.js"> </script>
<style lang="less" src="./App.less" module></style>
