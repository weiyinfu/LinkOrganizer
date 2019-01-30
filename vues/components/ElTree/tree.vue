<template>
  <div class="el-tree"
    :class="{
      'el-tree--highlight-current': highlightCurrent,
      'is-dragging': !!dragState.draggingNode,
      'is-drop-not-allow': !dragState.allowDrop,
      'is-drop-inner': dragState.dropType === 'inner'
    }"
    role="tree">
    <el-tree-node v-for="child in root.childNodes"
      :node="child"
      :props="props"
      :render-after-expand="renderAfterExpand"
      :key="getNodeKey(child)"
      :render-content="renderContent"
      :should-show="shouldShow"
      :show-expand-icon="showExpandIcon"
      v-if="shouldShow(child)">
    </el-tree-node>
    <!-- 如果树中没有结点，显示如下内容 -->
    <div class="el-tree__empty-block"
      v-if="!root.childNodes || root.childNodes.length === 0">
      <span class="el-tree__empty-text">{{ emptyText }}</span>
    </div>
    <!-- 每时每刻最多有一个东西正在拖动，使用DropIndicator -->
    <div v-show="dragState.showDropIndicator"
      class="el-tree__drop-indicator"
      ref="dropIndicator">
    </div>
  </div>
</template>

<script>
import TreeStore from './model/tree-store';
import { getNodeKey,findNearestComponent } from './model/util';
import ElTreeNode from './tree-node.vue';
import { t } from 'element-ui/src/locale';
import emitter from 'element-ui/src/mixins/emitter';
import { addClass,removeClass } from 'element-ui/src/utils/dom';

export default {
  name: 'ElTree',

  mixins: [emitter],

  components: {
    ElTreeNode
  },

  data() {
    return {
      store: null,
      root: null,
      currentNode: null,
      treeItems: null,
      //可以多选是树结构的一大特色
      checkboxItems: [],
      //拖动状态，整个ElementTree的重头戏就是拖动，代码量和复杂度都很大
      dragState: {
        showDropIndicator: false,
        draggingNode: null,
        dropNode: null,
        allowDrop: true
      }
    };
  },

  props: {
    data: {
      type: Array
    },
    emptyText: {
      type: String,
      default() {
        //t函数用于从locale中根据key提取字符串
        return t('el.tree.emptyText');
      }
    },
    renderAfterExpand: {
      type: Boolean,
      default: true
    },
    nodeKey: String,
    checkStrictly: Boolean,
    defaultExpandAll: Boolean,
    //单击展开结点
    expandOnClickNode: {
      type: Boolean,
      default: true
    },
    //单击选中结点
    checkOnClickNode: Boolean,
    //选中父结点时是否选中子结点
    checkDescendants: {
      type: Boolean,
      default: false
    },
    //展开子结点自动展开父元素
    autoExpandParent: {
      type: Boolean,
      default: true
    },
    //默认已经选中的结点
    defaultCheckedKeys: Array,
    //默认已经展开的结点
    defaultExpandedKeys: Array,
    //内容渲染函数
    renderContent: Function,
    //是否应该显示该结点
    shouldShow: {
      type: Function,
      default: () => true
    },
    //是否应该显示展开图标
    showExpandIcon: {
      type: Function,
      default: () => true,
    },
    //是否显示复选框
    showCheckbox: {
      type: Boolean,
      default: false
    },
    draggable: {
      type: Boolean,
      default: false
    },
    allowDrag: Function,
    allowDrop: Function,
    //如果自定义结点内容，props这个默认属性就不需要处理了
    props: {
      default() {
        return {
          children: 'children',
          label: 'label',
          icon: 'icon',
          disabled: 'disabled'
        };
      }
    },
    lazy: {
      type: Boolean,
      default: false
    },
    //高亮当前结点
    highlightCurrent: Boolean,
    load: Function,//当lazy为true时，懒加载数据
    //当可以过滤结点时，使用此函数检测结点是否显示
    filterNodeMethod: Function,
    //是否启用手风琴模式，每层下面只有一个结点展开
    accordion: Boolean,
    //默认缩进的像素
    indent: {
      type: Number,
      default: 18
    }
  },

  computed: {
    children: {
      set(value) {
        this.data = value;
      },
      get() {
        return this.data;
      }
    },

    treeItemArray() {
      return Array.prototype.slice.call(this.treeItems);
    }
  },

  watch: {
    defaultCheckedKeys(newVal) {
      this.store.defaultCheckedKeys = newVal;
      this.store.setDefaultCheckedKey(newVal);
    },

    defaultExpandedKeys(newVal) {
      this.store.defaultExpandedKeys = newVal;
      this.store.setDefaultExpandedKeys(newVal);
    },
    //检测数据变化
    data(newVal) {
      this.store.setData(newVal);
    },

    checkboxItems(val) {
      Array.prototype.forEach.call(val,(checkbox) => {
        checkbox.setAttribute('tabindex',-1);
      });
    },

    checkStrictly(newVal) {
      this.store.checkStrictly = newVal;
    }
  },

  methods: {
    filter(value) {
      if (!this.filterNodeMethod) throw new Error('[Tree] filterNodeMethod is required when filter');
      this.store.filter(value);
    },

    getNodeKey(node) {
      return getNodeKey(this.nodeKey,node.data);
    },

    getNodePath(data) {
      if (!this.nodeKey) throw new Error('[Tree] nodeKey is required in getNodePath');
      const node = this.store.getNode(data);
      if (!node) return [];
      const path = [node.data];
      let parent = node.parent;
      while (parent && parent !== this.root) {
        path.push(parent.data);
        parent = parent.parent;
      }
      return path.reverse();
    },

    getCheckedNodes(leafOnly) {
      return this.store.getCheckedNodes(leafOnly);
    },

    getCheckedKeys(leafOnly) {
      return this.store.getCheckedKeys(leafOnly);
    },

    getCurrentNode() {
      const currentNode = this.store.getCurrentNode();
      return currentNode ? currentNode.data : null;
    },

    getCurrentKey() {
      if (!this.nodeKey) throw new Error('[Tree] nodeKey is required in getCurrentKey');
      const currentNode = this.getCurrentNode();
      return currentNode ? currentNode[this.nodeKey] : null;
    },

    setCheckedNodes(nodes,leafOnly) {
      if (!this.nodeKey) throw new Error('[Tree] nodeKey is required in setCheckedNodes');
      this.store.setCheckedNodes(nodes,leafOnly);
    },

    setCheckedKeys(keys,leafOnly) {
      if (!this.nodeKey) throw new Error('[Tree] nodeKey is required in setCheckedKeys');
      this.store.setCheckedKeys(keys,leafOnly);
    },

    setChecked(data,checked,deep) {
      this.store.setChecked(data,checked,deep);
    },

    getHalfCheckedNodes() {
      return this.store.getHalfCheckedNodes();
    },

    getHalfCheckedKeys() {
      return this.store.getHalfCheckedKeys();
    },

    setCurrentNode(node) {
      if (!this.nodeKey) throw new Error('[Tree] nodeKey is required in setCurrentNode');
      this.store.setUserCurrentNode(node);
    },

    setCurrentKey(key) {
      if (!this.nodeKey) throw new Error('[Tree] nodeKey is required in setCurrentKey');
      this.store.setCurrentNodeKey(key);
    },

    getNode(data) {
      return this.store.getNode(data);
    },

    remove(data) {
      this.store.remove(data);
    },

    append(data,parentNode) {
      this.store.append(data,parentNode);
    },

    insertBefore(data,refNode) {
      this.store.insertBefore(data,refNode);
    },

    insertAfter(data,refNode) {
      this.store.insertAfter(data,refNode);
    },

    handleNodeExpand(nodeData,node,instance) {
      this.broadcast('ElTreeNode','tree-node-expand',node);
      this.$emit('node-expand',nodeData,node,instance);
    },

    updateKeyChildren(key,data) {
      if (!this.nodeKey) throw new Error('[Tree] nodeKey is required in updateKeyChild');
      this.store.updateChildren(key,data);
    },

    initTabIndex() {
      this.treeItems = this.$el.querySelectorAll('.is-focusable[role=treeitem]');
      this.checkboxItems = this.$el.querySelectorAll('input[type=checkbox]');
      const checkedItem = this.$el.querySelectorAll('.is-checked[role=treeitem]');
      if (checkedItem.length) {
        checkedItem[0].setAttribute('tabindex',0);
        return;
      }
      this.treeItems[0] && this.treeItems[0].setAttribute('tabindex',0);
    },

    handelKeydown(ev) {
      const currentItem = ev.target;
      if (currentItem.className.indexOf('el-tree-node') === -1) return;
      ev.preventDefault();
      const keyCode = ev.keyCode;
      this.treeItems = this.$el.querySelectorAll('.is-focusable[role=treeitem]');
      const currentIndex = this.treeItemArray.indexOf(currentItem);
      let nextIndex;
      if ([38,40].indexOf(keyCode) > -1) { // up、down
        if (keyCode === 38) { // up
          nextIndex = currentIndex !== 0 ? currentIndex - 1 : 0;
        } else {
          nextIndex = (currentIndex < this.treeItemArray.length - 1) ? currentIndex + 1 : 0;
        }
        this.treeItemArray[nextIndex].focus(); // 选中
      }
      if ([37,39].indexOf(keyCode) > -1) { // left、right 展开
        currentItem.click(); // 选中
      }
      const hasInput = currentItem.querySelector('[type="checkbox"]');
      if ([13,32].indexOf(keyCode) > -1 && hasInput) { // space enter选中checkbox
        hasInput.click();
      }
    },
    resetDragState() {
      this.dragState.showDropIndicator = false;
      this.dragState.draggingNode = null;
      this.dragState.dropNode = null;
      this.dragState.allowDrop = true;
    },
  },

  created() {
    this.isTree = true;

    this.store = new TreeStore({
      key: this.nodeKey,
      data: this.data,
      lazy: this.lazy,
      props: this.props,
      load: this.load,
      currentNodeKey: this.currentNodeKey,
      checkStrictly: this.checkStrictly,
      checkDescendants: this.checkDescendants,
      defaultCheckedKeys: this.defaultCheckedKeys,
      defaultExpandedKeys: this.defaultExpandedKeys,
      autoExpandParent: this.autoExpandParent,
      defaultExpandAll: this.defaultExpandAll,
      filterNodeMethod: this.filterNodeMethod
    });

    this.root = this.store.root;

    let dragState = this.dragState;
    this.$on('tree-node-drag-start',(event,treeNode) => {
      if (typeof this.allowDrag === 'function' && !this.allowDrag(treeNode.node)) {
        event.preventDefault();
        return false;
      }
      event.dataTransfer.effectAllowed = 'move';

      // wrap in try catch to address IE's error when first param is 'text/plain'
      try {
        // setData is required for draggable to work in FireFox
        // the content has to be '' so dragging a node out of the tree won't open a new tab in FireFox
        event.dataTransfer.setData('text/plain','');
      } catch (e) { }
      dragState.draggingNode = treeNode;
      this.$emit('node-drag-start',treeNode.node,event);
    });

    //使用dragOver函数更改拖拽状态
    this.$on('tree-node-drag-over',(event,treeNode) => {
      const dropNode = findNearestComponent(event.target,'ElTreeNode');
      const oldDropNode = dragState.dropNode;
      if (oldDropNode && oldDropNode !== dropNode) {
        removeClass(oldDropNode.$el,'is-drop-inner');
      }
      var draggingNode = dragState.draggingNode;
      if (!dropNode) return
      //伪造一个结点
      if (!draggingNode) {
        draggingNode = { node: null }
      }
      let dropPrev = true;
      let dropInner = true;
      let dropNext = true;
      let userAllowDropInner = true;
      if (typeof this.allowDrop === 'function') {
        dropPrev = this.allowDrop(draggingNode.node,dropNode.node,'prev',event);
        userAllowDropInner = dropInner = this.allowDrop(draggingNode.node,dropNode.node,'inner',event);
        dropNext = this.allowDrop(draggingNode.node,dropNode.node,'next',event);
      }
      event.dataTransfer.dropEffect = dropInner ? 'move' : 'none';
      if ((dropPrev || dropInner || dropNext) && oldDropNode !== dropNode) {
        if (oldDropNode) {
          this.$emit('node-drag-leave',draggingNode.node,oldDropNode.node,event);
        }
        this.$emit('node-drag-enter',draggingNode.node,dropNode.node,event);
      }

      if (dropPrev || dropInner || dropNext) {
        dragState.dropNode = dropNode;
        this.$emit("node-drop-node-change",dropNode.node)
      }
      //安全性检测，用户写的allowDrag和allowDrop依旧不够用
      if (draggingNode.node) {
        if (dropNode.node.nextSibling === draggingNode.node) {
          dropNext = false;
        }
        if (dropNode.node.previousSibling === draggingNode.node) {
          dropPrev = false;
        }
        if (dropNode.node.contains(draggingNode.node,false)) {
          dropInner = false;
        }
        if (draggingNode.node === dropNode.node || draggingNode.node.contains(dropNode.node)) {
          dropPrev = false;
          dropInner = false;
          dropNext = false;
        }
      }

      //以上先检测是否允许放置，下面根据鼠标位置实际判断是否允许放置
      const targetPosition = dropNode.$el.getBoundingClientRect();
      const treePosition = this.$el.getBoundingClientRect();

      let dropType;
      const prevPercent = dropPrev ? (dropInner ? 0.25 : (dropNext ? 0.45 : 1)) : -1;
      const nextPercent = dropNext ? (dropInner ? 0.75 : (dropPrev ? 0.55 : 0)) : 1;
      //设置indicator
      let indicatorTop = -9999;
      const distance = event.clientY - targetPosition.top;
      if (distance < targetPosition.height * prevPercent) {
        dropType = 'before';
      } else if (distance > targetPosition.height * nextPercent) {
        dropType = 'after';
      } else if (dropInner) {
        dropType = 'inner';
      } else {
        dropType = 'none';
      }
      this.$emit("node-drop-type-change",dropType)
      const dropIndicator = this.$refs.dropIndicator;
      if (dropType === 'before') {
        indicatorTop = targetPosition.top - treePosition.top;
      } else if (dropType === 'after') {
        indicatorTop = targetPosition.bottom - treePosition.top;
      }
      dropIndicator.style.top = indicatorTop + 'px';
      dropIndicator.style.left = (targetPosition.right - treePosition.left) + 'px';

      if (dropType === 'inner') {
        addClass(dropNode.$el,'is-drop-inner');
      } else {
        removeClass(dropNode.$el,'is-drop-inner');
      }
      dragState.showDropIndicator = dropType === 'before' || dropType === 'after';
      dragState.allowDrop = dragState.showDropIndicator || userAllowDropInner;
      dragState.dropType = dropType;
      this.$emit('node-drag-over',draggingNode.node,dropNode.node,event);
    });

    //数据改变需要在父控件中完成
    this.$on('tree-node-drag-end',(event) => {
      const { draggingNode,dropType,dropNode } = dragState;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      if (dropNode) {
        removeClass(dropNode.$el,'is-drop-inner');
        this.$emit('node-drag-end',draggingNode.node,dropNode.node,dropType,event);
        this.$emit('node-drop',draggingNode.node,dropNode.node,dropType,event);
      } else {
        this.$emit('node-drag-end',draggingNode.node,null,dropType,event);
      }
      this.resetDragState()
    });
  },

  mounted() {
    this.initTabIndex();
    this.$el.addEventListener('keydown',this.handelKeydown);
  },

  updated() {
    this.treeItems = this.$el.querySelectorAll('[role=treeitem]');
    this.checkboxItems = this.$el.querySelectorAll('input[type=checkbox]');
  }
};
</script>
