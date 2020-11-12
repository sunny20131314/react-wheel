/**
 * 单链表
 * 目前forceUpdate仅支持 class 组件, this.state = {}; this.setState({name, number}), 这里也有点类型于hook中的state链表更新啦
 */

const { isFunction } = require('../src/react/utils');

// 链表中的节点
class Update {
  constructor(payload, nextUpload) {
    // 元素
    this.payload = payload;
    // 指针
    this.nextUpload = nextUpload;
  }
}

// 链表
class UpdateQueue {
  constructor() {
    // 原状态，或者说当前已生效的 state
    this.baseState = null;
    // 第一个更新
    this.firstUpdate = null;
    // 最后一个更新
    this.lastUpdate = null;
  }

  // 队列尾追加
  enqueueUpdate(update) {
    if (!this.firstUpdate) {
      this.firstUpdate = this.lastUpdate = update;
    } else {
      // 上一个节点指向当前节点
      this.lastUpdate.next = update;
      // 链表的最后一个节点指向当前节点
      this.lastUpdate = update;
    }
  }

  // 更新队列：note:目前仅 class 组件, this.state = {}; this.setState({name, number}), 这里也有点类型于hook中的state链表更新啦
  // 获取老链表，遍历该链表，进行更新
  forceUpdate() {
    let currentState = this.baseState || {};
    let currentUpdate = this.firstUpdate;

    // 队列全部执行一遍
    while (currentUpdate) {
      const { payload } = currentUpdate;
      let nextState = isFunction(payload) ? payload(currentState) : payload;
      currentState = { ...currentState, ...nextState };
      currentUpdate = currentUpdate.next;
    }

    // 完成更新后，清空队列
    this.firstUpdate = this.lastUpdate = null;
    this.baseState = currentState;

    console.log('组件, -> forceUpdate -> currentState', currentState);
    return currentState;
  }
}

let queue = new UpdateQueue();

queue.enqueueUpdate(new Update({ name: 'jack' }));
queue.enqueueUpdate(new Update({ number: 0 }));
queue.enqueueUpdate(new Update((state) => ({ number: state.number + 1 })));

queue.forceUpdate();
