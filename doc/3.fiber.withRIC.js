/**
 * 优先处理顺序： 儿子 > 弟弟 > 叔叔
 *  fiber: {child, sibling, return, type, key}
 *
 */
const { element: rootFiber } = require('./element');
const { performaUnitOfWork } = require('./3.fiber');
const { requestIdleCallback } = require('./src/react/utils');

// 记录下一个执行单元
let nextUnitOfWork = null;

function workLoop(deadline) {
  // 每次取一个任务执行
  while (nextUnitOfWork && (deadline.timeRemaining() > 0 || deadline.didTimeout)) {
    nextUnitOfWork = performaUnitOfWork(nextUnitOfWork);
  }

  if (!nextUnitOfWork) {
    console.log('workLoop -> nextUnitOfWork, 执行阶段结束啦');
  } else {
    requestIdleCallback(workLoop, { timeout: 1000 });
  }
}

// test
nextUnitOfWork = rootFiber;
// 目前只有chrome浏览器支持哦
requestIdleCallback(workLoop, { timeout: 1000 });
