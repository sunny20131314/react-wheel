/**
 * fiber: 调度阶段 & 提交阶段
 *
 */

const { requestIdleCallback } = require('./utils');
const {
  TAG_ROOT,
  TAG_TEXT,
  TAG_HOST,
  ELEMENT_TEXT,
  PLACEMENT,
  UPDATE,
  DELETION,
} = require('./constants');
const { setProps } = require('./utils');
const { isEqual } = require('lodash');

// RootFiber 的根节点, 正在渲染中的的root
let workInProgressRoot = null;
// 当前页面已渲染的 根节点: root
let currentRoot = null;

const deletions = [];

// 记录下一个执行单元
let nextUnitOfWork = null;
function scheduleRoot(rootFiber) {
  nextUnitOfWork = rootFiber;
  workInProgressRoot = rootFiber;
  requestIdleCallback(workLoop, { timeout: 1000 });
}

// 循环执行工作 nextUnitOfWork
function workLoop(deadline) {
  // 是否让出执行权
  let shouldYield = false;
  // 每次取一个任务执行
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performaUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1 || !deadline.didTimeout;
  }

  if (nextUnitOfWork) {
    requestIdleCallback(workLoop, { timeout: 1000 });
  } else {
    console.log(
      'workLoop -> nextUnitOfWork, render阶段结束啦, 将要渲染的workInProgressRoot:',
      workInProgressRoot
    );
    // 渲染dom
    commitRoot();
  }
}

// 开始了提交阶段, 从根节点开始
function commitRoot() {
  deletions.map(commitWork);

  let currentFiber = workInProgressRoot.firstEffect;

  while (currentFiber) {
    commitWork(currentFiber);
    currentFiber = currentFiber.nextEffect;
  }

  deletions.length = 0;
  if (workInProgressRoot) {
    // why: 为何会存在这种情况
    workInProgressRoot.lastEffect = null;
    workInProgressRoot.firstEffect = null;
  } else {
    console.warn('commitRoot -> workInProgressRoot', workInProgressRoot);
  }
  currentRoot = workInProgressRoot;
  workInProgressRoot = null;
}

// 无真实节点则创建，有真实节点则挂载到节点上~
function commitWork(currentFiber) {
  if (!currentFiber) {
    return;
  }

  const { return: returnFiber, effectTag } = currentFiber;
  const returnDom = returnFiber?.stateNode;

  // console.log('commitWork -> currentFiber', currentFiber, currentFiber?.props?.text || '');

  // 把当前节点内容挂载到父节点上
  if (effectTag === PLACEMENT) {
    returnDom.appendChild(currentFiber.stateNode);
  } else if (effectTag === UPDATE) {
    updateDom(currentFiber.stateNode, currentFiber.alternate.props, currentFiber.props);
  } else if (effectTag === DELETION) {
    returnDom.removeChild(currentFiber.stateNode);
  }

  // 清除当前节点的 effectTag
  currentFiber.effectTag = null;
}

// 需要处理的节点：A1 B1 C1 C2
// 执行当个任务，有开始和结束阶段，并且返回下一个要处理的节点（按照遍历规则）
function performaUnitOfWork(fiber) {
  beginWork(fiber);

  // 有儿子的情况下，先返回儿子 ---> 优先处理儿子~
  if (fiber.child) {
    return fiber.child;
  }

  // 没有儿子的情况下（无儿子，或者儿子已处理完毕），先处理弟弟，否则返回父节点
  // note: 存在当前节点，3辈独生子的情况
  // 目的： 找到下一个处理的节点
  while (fiber) {
    completeWork(fiber);
    if (fiber.sibling) {
      return fiber.sibling;
    }
    // 找到父节点，并让父节点完成
    fiber = fiber.return;
  }
}

/**
 * 开始收下线的钱
 * 1. 创建真实 DOM 元素
 * 2. 创建 or 更新子fiber，获得更改（增、删、改）
 * @param {object} currentFiber
 */
function beginWork(currentFiber) {
  // A1 B1 C1 C2 B2
  // console.log('beginWork -> currentFiber', currentFiber, currentFiber?.props?.text || '');
  const { tag } = currentFiber;
  if (tag === TAG_ROOT) {
    updateHostRoot(currentFiber);
  } else if (tag === TAG_HOST) {
    // 创建节点
    updateHost(currentFiber);
  } else if (tag === TAG_TEXT) {
    updateHostText(currentFiber);
  }
}

function updateHostText(currentFiber) {
  if (!currentFiber.stateNode) {
    currentFiber.stateNode = createDom(currentFiber);
  }
}

// 1. 先处理自己，如果为原生节点，则创建真实dom
// 2. 创建子fiber
function updateHost(currentFiber) {
  const { stateNode } = currentFiber;
  if (!stateNode) {
    currentFiber.stateNode = createDom(currentFiber);
  }
  const newChildren = currentFiber.props.children;
  reconcileChildren(currentFiber, newChildren);
}

// 创建DOM
function createDom(currentFiber) {
  const { tag, type, props } = currentFiber;
  // note: 创建文本节点，然后在commit阶段挂载到父节点上
  if (tag === TAG_TEXT) {
    return document.createTextNode(props.text);
  }
  // span div
  if (tag === TAG_HOST) {
    const stateNode = document.createElement(type);
    // note: 直接在这里设置刚创建的 dom相关 props
    // 1. 此时节点还未挂载到 document 上
    updateDom(stateNode, {}, props);
    return stateNode;
  }
}

function updateDom(stateNode, oldProps, newProps) {
  setProps(stateNode, oldProps, newProps);
}

// 更新根节点
function updateHostRoot(currentFiber) {
  // 上一次渲染的 alternate
  currentFiber.alternate = currentRoot;
  let newChildren = currentFiber.props.children;
  reconcileChildren(currentFiber, newChildren);
}

// 创建子fiber 及其链表, 如果非初始化，则复用上一次的~
// note: 对每个子节点的更改（增、删、改）有所掌握
function reconcileChildren(currentFiber, newChildren) {
  // 新子节点的索引
  let newChildrenIndex = 0;
  // 记录上一个新的子fiber
  let prevSibling;

  const alternate = currentFiber?.alternate;
  let alternateChild = alternate?.child || null; // 取出虚拟节点
  while (newChildrenIndex < newChildren.length) {
    let newChild = newChildren[newChildrenIndex]; // 取出虚拟节点
    // note: 可放置在初次渲染
    let tag;
    if (newChild.type === ELEMENT_TEXT) {
      tag = TAG_TEXT; // 文本节点
    } else if (typeof newChild.type === 'string') {
      tag = TAG_HOST; // 原生节点
    }

    let newFiber;
    // 初次渲染 or 新增节点
    if (!alternateChild) {
      newFiber = {
        tag,
        type: newChild.type,
        props: newChild.props,
        alternate: null,
        stateNode: null, // 因为还没有创建真实dom节点
        return: currentFiber,
        effectTag: PLACEMENT, // 副作用标识，why: render阶段会收集副作用
        // 只放置出钱节点（有更新的）的fiber, 未出钱不收集
        // 与完成顺序一致，在完成时填充 why:
        nextEffect: null, //单链表
      };
    } else if (newChild.type === alternateChild?.type) {
      // 非初次渲染：说明是同一类型， 同一节点
      newFiber = {
        tag,
        type: newChild.type,
        props: newChild.props,
        alternate: alternateChild,
        stateNode: alternateChild.stateNode, // 已创建真实dom节点
        return: currentFiber,
        effectTag: isEqual(newChild.props, alternateChild.props) ? null : UPDATE,
        nextEffect: null, //单链表
      };
    } else {
      // 非初次渲染：且非同一节点
      deletions.push({ ...alternateChild, effectTag: DELETION });

      // 新增新节点
      newFiber = {
        tag,
        type: newChild.type,
        props: newChild.props,
        alternate: null,
        stateNode: null,
        return: currentFiber,
        effectTag: PLACEMENT,
        nextEffect: null,
      };
    }

    // 函数式
    // class 组件

    // 建立联系, why: update 还没有用上哦~ 这里不涉及？
    if (prevSibling) {
      prevSibling.sibling = newFiber;
    } else {
      currentFiber.child = newFiber;
    }
    prevSibling = newFiber;

    alternateChild = alternateChild?.sibling;
    newChildrenIndex++;
  }

  // 删除之前渲染的节点
  while (alternateChild) {
    deletions.push({ ...alternateChild, effectTag: DELETION });
    alternateChild = alternateChild?.sibling;
  }
}

/**
 * 完成阶段收集有副作用的fiber, 然后组成effect list
 *   下线的钱收完啦， 返回effect链表
 * 每个fiber有两个属性：
 *   firstEffect （大儿子）
 *   lastEffect （小儿子）
 *   中间fiber使用 nextEffect 连接
 * @param {object} currentFiber
 */
function completeWork(currentFiber) {
  // C1 C2 B1 B2 A1
  let returnFiber = currentFiber?.return;

  if (returnFiber) {
    // 把自己的大儿子挂载到父节点上
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = currentFiber.firstEffect;
    }

    // 把自己的小儿子挂载到父节点上
    if (currentFiber.lastEffect) {
      // note: 给父节点挂载自己的第一个子节点，相当于把以下内容都挂载到了父节点~
      // 第一个子节点 -> 下一个子节点 -> ... -> 最后一个子节点
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber.firstEffect;
      }
      // 更新父节点的最后一个节点
      returnFiber.lastEffect = currentFiber.lastEffect;
    }
    // if (!returnFiber.lastEffect) {
    //   returnFiber.lastEffect = currentFiber.lastEffect;
    // }

    // 把自己挂载到父节点上
    const effectTag = currentFiber.effectTag;
    if (effectTag) {
      if (returnFiber.lastEffect) {
        returnFiber.lastEffect.nextEffect = currentFiber;
      } else {
        // 没有最后节点：第一次挂载副作用
        returnFiber.firstEffect = currentFiber;
      }
      returnFiber.lastEffect = currentFiber;
    }
  }
}

module.exports = {
  scheduleRoot,
};
