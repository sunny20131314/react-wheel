const { element } = require('./element');
console.log('element', element);

const ReactDom = require('./react/react-dom');
ReactDom.render(element, document.getElementById('root'));
