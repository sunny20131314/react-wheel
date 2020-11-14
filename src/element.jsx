// 需要处理的节点：A1 B1 C1 C2 B2
//  *  fiber: {child, sibling, return, type, key}
// import React from './react/react';
const React = require('./react/react');

// jsx 语法糖
// webpack 使用 babel 进行编译，
// React17以下需要引用react(使用其createElement)，才可以进行编译成js
// React17以上，bable 已原生支持使用
module.exports = {
  element: (
    <div id="A1" key="A1">
      A1
      <div id="B1" key="B1">
        B1
        <div id="C1" key="C1">
          C1
        </div>
        <div id="C2" key="C2">
          C2
        </div>
      </div>
      <div id="B2" key="B2">
        B2
      </div>
    </div>
  ),
  elementDeleted: (
    <div id="A1" key="A1">
      A1
      <div id="B1" key="B1">
        B1
        <div id="C1" key="C1">
          C1
        </div>
        <div id="C2" key="C2">
          C2
        </div>
      </div>
    </div>
  ),
  elementAdd: (
    <div id="A1" key="A1">
      A1
      <div id="B1" key="B1">
        B1
        <div id="C1" key="C1">
          C1
        </div>
        <div id="C2" key="C2">
          C2
        </div>
      </div>
      <div id="B2" key="B2">
        B2
      </div>
      <div id="B3" key="B3">
        B3 - add
      </div>
    </div>
  ),
  elementReplace: (
    <div id="A1" key="A1">
      A1
      <div id="B1" key="B1">
        B1
        <div id="C1" key="C1">
          C1
        </div>
        <div id="C2" key="C2">
          C2
        </div>
      </div>
      <p id="B4" key="B4">
        B4 - new p
      </p>
    </div>
  ),
  elementUpdate: (
    <div id="A1" key="A1">
      A1
      <div id="B1" key="B1">
        B1
        <div id="C1" key="C1">
          C1
        </div>
        <div id="C2" key="C2">
          C2
        </div>
      </div>
      <div id="B2" key="B2">
        B2 - update text
      </div>
    </div>
  ),
};
