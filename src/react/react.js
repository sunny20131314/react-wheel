/**
 * react
 */

const { ELEMENT_TEXT } = require('./constants');
const { isObject } = require('./utils');
// 生成 virtual dom 结构

/**
 *
 * @param {*} type
 * @param {*} config props, key, ref, id, className
 * @param  {...any} children 处理成了数组
 */
function createElement(type, config, ...children) {
  delete config.__self;
  delete config.__source; // 这个元素是在
  return {
    type,
    props: {
      ...config,
      children: children.map((child) => {
        // note: 对文本类型的child做了兼容处理，方便后续比较
        // note: react 中源码并没有这么处理
        return isObject(child)
          ? child
          : { type: ELEMENT_TEXT, props: { text: child, children: [] } };
      }),
    },
  };
}

module.exports = {
  createElement,
};
