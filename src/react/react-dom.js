/**
 * dom 渲染
 */

const { TAG_ROOT } = require('./constants');
const { scheduleRoot } = require('./scheduler');

// 把一个元素渲染到一个容器组件
function render(element, container) {
  let rootFiber = {
    // 标识元素类型
    tag: TAG_ROOT,
    stateNode: container, // 真实dom元素
    // 要渲染的元素
    props: { children: [element] },
  };

  scheduleRoot(rootFiber);
}
module.exports = {
  render,
};
