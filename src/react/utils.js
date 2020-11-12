const { EVENT_REG } = require('./constants');

function isEqual(value1, value2) {
  return value1 === value2;
}

function timeRemaining() {
  return 1;
}
// mock: 在node中兼容使用~
function requestIdleCallback(callback, params) {
  callback({ timeRemaining, didTimeout: true });
}

// 设置属性
function setProps(dom, key, value) {
  if (EVENT_REG.test(key)) {
    dom[key.toLowerCase()] = value;
  } else if (key === 'style') {
    // 样式
    if (value) {
      for (const styleName in value) {
        // todo: 存在样式被删除的情况...
        dom.removeAttribute('style');
        if (Object.prototype.hasOwnProperty.call(value, styleName)) {
          dom.style[styleName] = value[styleName];
        }
      }
    }
  } else {
    dom.setAttribute(key, value);
  }
}
// 删除属性
function removeProps(dom, key) {
  if (EVENT_REG.test(key)) {
    // 移除事件：简单粗暴的给重新赋值一个空的事件函数
    dom[key.toLowerCase()] = () => {};
  } else {
    dom.removeAttribute(key);
  }
}

function setAllProps(dom, oldProps, newProps) {
  let newKeys = Object.keys(newProps);

  // 需要删除的节点
  for (let oldKey in oldProps) {
    if (Object.prototype.hasOwnProperty.call(oldProps, oldKey)) {
      if (!newKeys.includes(oldKey)) {
        // 删除
        removeProps(dom, oldKey);
      }
    }
  }

  // 新增 & 修改
  for (let newKey in newProps) {
    if (newKey !== 'children' && !isEqual(oldProps.newKey, newProps.newKey)) {
      setProps(dom, newKey, newProps.newKey);
    }
  }
}

module.exports = {
  isFunction(fn) {
    return typeof fn === 'function';
  },
  isObject(fn) {
    return typeof fn === 'object';
  },
  toArray(obj) {
    return typeof obj === 'array' ? obj : [obj];
  },

  requestIdleCallback,
  isEqual,
  setProps: setAllProps,
};
