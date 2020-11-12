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
  // UPDATE,
  // DELETION,
} = require('./constants');
const { setProps } = require('./utils');

// RootFiber 的根节点, 正在渲染中的的root
let workInProgressRoot = null;
// 当前页面已渲染的 根节点: root
// let currentRoot = null;

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
    console.log('workLoop -> nextUnitOfWork, 执行阶段结束啦');
    // 渲染dom
    commitRoot();
  }
}

// 开始了提交阶段, 从根节点开始
function commitRoot() {
  let currentFiber = workInProgressRoot.firstEffect;

  while (currentFiber) {
    commitWork(currentFiber);
    currentFiber = currentFiber.nextEffect;
  }

  workInProgressRoot.firstEffect = workInProgressRoot.lastEffect = null;
  currentFiber = workInProgressRoot;
  workInProgressRoot = null;
}

// 无真实节点则创建，有真实节点则挂载到节点上~
function commitWork(currentFiber) {
  if (!currentFiber) {
    return;
  }

  const { return: returnFiber, effectTag } = currentFiber;
  // todo: children 的 stateNode 还不存在，children在哪里渲染...
  console.log('commitWork -> currentFiber', currentFiber, currentFiber.props.text || '');
  const returnDom = returnFiber.stateNode;

  // 把当前节点内容挂载到父节点上
  if (effectTag === PLACEMENT) {
    returnDom.appendChild(currentFiber.stateNode);
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
  console.log('beginWork -> currentFiber', currentFiber, currentFiber.props.text || '');
  const { tag } = currentFiber;
  if (tag === TAG_ROOT) {
    updateHostRoot(currentFiber);
  } else if (tag === TAG_HOST) {
    // TODO: 创建节点~
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
    // note: 直接在这里更新dom props? why: 不是commit阶段？？？
    updateDom(stateNode, {}, props);
    return stateNode;
  }
}

function updateDom(stateNode, oldProps, newProps) {
  setProps(stateNode, oldProps, newProps);
}

// 更新根节点
function updateHostRoot(currentFiber) {
  let newChildren = currentFiber.props.children;
  reconcileChildren(currentFiber, newChildren);
}

// 创建子fiber 及其链表
// note: 对每个子节点的更改（增、删、改）有所掌握
function reconcileChildren(currentFiber, newChildren) {
  // 新子节点的索引
  let newChildrenIndex = 0;
  // 记录上一个新的子fiber
  let prevSibling;

  while (newChildrenIndex < newChildren.length) {
    let newChild = newChildren[newChildrenIndex]; // 取出虚拟节点
    const { type } = newChild;
    let tag;
    if (type === ELEMENT_TEXT) {
      tag = TAG_TEXT; // 文本节点
    } else if (typeof type === 'string') {
      tag = TAG_HOST; // 原生节点
    }
    // 函数式
    // class 组件

    let newFiber = {
      tag,
      type,
      props: newChild.props,
      stateNode: null, // 因为还没有创建真实dom节点
      return: currentFiber,
      effectTag: PLACEMENT, // 副作用标识，why: render阶段会收集副作用
      // 只放置出钱节点（有更新的）的fiber, 未出钱不收集
      // 与完成顺序一致，在完成时填充 why:
      nextEffect: null, //单链表
    };

    // 建立联系, why: update 还没有用上哦~ 这里不涉及？
    if (prevSibling) {
      prevSibling.sibling = newFiber;
    } else {
      currentFiber.child = newFiber;
    }
    prevSibling = newFiber;

    newChildrenIndex++;
  }
}

/**
 * 完成阶段收集有副作用的fiber, 然后组成effect list
 *   下线的钱收完啦， 返回effect链表
 * 每个fiber有两个属性：
 *   firstEffect （大儿子）
 *   lastEffect （小儿子）
 *   中间fiber使用 nextEffect 连接
 * @param {object} fiber
 */
function completeWork(currentFiber) {
  console.log('completeWork -> currentFiber', currentFiber);
  // C1 C2 B1 B2 A1
  let returnFiber = currentFiber.return;

  if (returnFiber) {
    // 把自己的大儿子、小儿子挂载到父节点上
    if (!returnFiber.firstEffect) {
      returnFiber.firstEffect = currentFiber.firstEffect;
    }

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
        // 没有最后节点：一定是大儿子
        returnFiber.firstEffect = currentFiber;
      }
      returnFiber.lastEffect = currentFiber;
    }
  }
}

module.exports = {
  scheduleRoot,
};
