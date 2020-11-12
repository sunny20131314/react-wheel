// 拿到的dom结构及其属性
const root = {
  key: 'A1',
  children: [
    {
      key: 'B1',
      children: [
        { key: 'C1', children: [] },
        { key: 'C2', children: [] },
      ],
    },
    {
      key: 'B2',
      children: [],
    },
  ],
};

// fiber 链表数据结构
// 需要处理的节点：A1 B1 C1 C2 B2
//  *  fiber: {child, sibling, return, type, key}
// 创建节点
const A1 = { key: 'A1' };
const B1 = { key: 'B1', return: A1 };
const C1 = { key: 'C1', return: B1 };
const C2 = { key: 'C2', return: B1 };
const B2 = { key: 'B2', return: A1 };
// 关系
A1.child = B1;
B1.child = C1;
B1.sibling = B2;
C1.sibling = C2;

console.log('element', A1);

module.exports = {
  root,
  element: A1,
};
