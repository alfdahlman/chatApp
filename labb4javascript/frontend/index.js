
var React = require('react');
var ReactDOM = require('react-dom');
var ChatApp = require('./chat-app-component.jsx');

ReactDOM.render(
    React.createElement(ChatApp),
    document.getElementById('app')
);
