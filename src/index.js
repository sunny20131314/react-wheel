const React = require('./react/react');
const { element, elementAdd, elementDeleted, elementReplace, elementUpdate } = require('./element');

const elementMap = {
  element: {
    text: '最初元素',
    element,
    index: 0,
  },
  elementAdd: {
    text: '元素新增',
    element: elementAdd,
  },
  elementDeleted: {
    text: '元素删除',
    element: elementDeleted,
  },
  elementReplace: {
    text: '元素替换',
    element: elementReplace,
  },
  elementUpdate: {
    text: '元素更新',
    element: elementUpdate,
  },
};

// const elementList = Object.keys(elementMap).map((key) => ({ ...elementMap[key], key }));

// 保留当前渲染的元素
let renderElement = element;
const getRoot = () => {
  return (
    <div>
      {renderElement}
      {/* {elementList.map((elem) => (
        <button id={elem.key} id={elem.key}>
          {elem.text}
        </button>
      ))} */}
      <button id="element">最初元素</button>
      <button id="elementAdd">元素新增</button>
      <button id="elementDeleted">元素删除</button>
      <button id="elementReplace">元素替换</button>
      <button id="elementUpdate">元素属性更新</button>
    </div>
  );
};

// 监听button点击
window.addEventListener('click', (event) => {
  console.log('event', event);
  const target = event?.target;
  const elementRenderInfo = elementMap[target?.id || 'element'];
  elementRenderInfo && (renderElement = elementRenderInfo.element);
  render();
});

const ReactDom = require('./react/react-dom');
function render() {
  ReactDom.render(getRoot(), document.getElementById('root'));
}

render();
