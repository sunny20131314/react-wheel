/**
 * 优先处理顺序： 儿子 > 弟弟 > 叔叔
 * 该为简易版本，相关看 src/scheduler.js
 *  fiber: {child, sibling, return, type, key}
 *
 */
const { element: rootFiber } = require('./element');

// 记录下一个执行单元
let nextUnitOfWork = null;

function workLoop() {
  // 每次取一个任务执行
  while (nextUnitOfWork) {
    nextUnitOfWork = performaUnitOfWork(nextUnitOfWork);
  }

  if (!nextUnitOfWork) {
    console.log('workLoop -> nextUnitOfWork, 执行阶段结束啦');
  }
}

// 需要处理的节点：A1 B1 C1 C2
// 执行当个任务，有开始和结束阶段，并且返回下一个要处理的节点（按照遍历规则啦）
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
    fiber = fiber.return;
  }
}

// A1 B1 C1 C2 B2
function beginWork(fiber) {
  console.log('beginWork -> fiber', fiber);
}

// C1 C2 B1 B2 A1
function completeWork(fiber) {
  console.log('completeWork -> fiber', fiber);
}

module.exports = {
  performaUnitOfWork,
  // test
  test() {
    nextUnitOfWork = rootFiber;
    workLoop(rootFiber);
  },
};
