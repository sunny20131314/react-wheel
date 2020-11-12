/**
 * fiber 之前的调度
 */

const { root } = require('./element');

function work(vdom) {
  doWork(vdom);
  vdom.children.forEach((child) => {
    work(child);
  });
}

function doWork(vdom) {
  console.log('doWork -> vdom.key', vdom.key);
}

// test
work(root);
