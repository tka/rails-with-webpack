require('../stylesheets/app.scss');

var React = require('react');
var ReactDOM = require('react-dom');

var HelloBox = React.createClass({
  render: function() {
    return (
      <div className="">
        Hello webpack! from app/assets/javascripts/app.js
      </div>
    );
  }
});

ReactDOM.render(
  <HelloBox />,
  document.getElementById('hello-webpack')
);
