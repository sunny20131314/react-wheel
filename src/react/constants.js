module.exports = {
  // 文本元素
  ELEMENT_TEXT: Symbol.for('ELEMENT_TEXT'),
  // why: 这些标识的区别及作用
  // 根节点
  TAG_ROOT: Symbol.for('TAG_ROOT'),
  // 真实DOM节点（原生节点）
  TAG_HOST: Symbol.for('TAG_HOST'),
  // 文本节点
  TAG_TEXT: Symbol.for('TAG_TEXT'),

  // 插入节点
  PLACEMENT: Symbol.for('PLACEMENT'),
  // 更新节点
  UPDATE: Symbol.for('UPDATE'),
  // 删除节点
  DELETION: Symbol.for('DELETION'),

  EVENT_REG: /^on./gi,
};
