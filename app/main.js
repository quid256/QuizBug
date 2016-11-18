import React from 'react';
import ReactDOM from 'react-dom';
import {App} from './app';

function init() {

	ReactDOM.render(<App />, document.getElementById("appContainer"));
}


if (document.readyState !== "complete") {
	window.addEventListener("load", init);
} else {
	init();
}
