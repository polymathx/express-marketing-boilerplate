import $ from 'jquery';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import LazyLoad from './lib/lazyload.min.js';

/** LAZY LOAD */
var lazyLoadInstance = new LazyLoad({
    elements_selector: ".lazy"
});

/** BREAKPOINTS **/
var _breakpoint_lg = 992;
var _breakpoint_md = 768;
var _breakpoint_sm = 576;
var currentMode;
var prevMode;

/** SCREEN EVENTS */
function screenEvent(size, oldsize) {
	var changed = size !== oldsize;
	if((currentMode == "tablet" || currentMode == "mobile") && changed) {

	}
	if(currentMode == "desktop" && changed) {

	}
}

function getWidth() {
	return Math.max(
		document.body.scrollWidth,
		document.documentElement.scrollWidth,
		document.body.offsetWidth,
		document.documentElement.offsetWidth,
		document.documentElement.clientWidth
	);
}

function setSize() {
	if(getWidth() <= _breakpoint_sm) {
		prevMode = currentMode;
		currentMode = "mobile";
	} else if(getWidth() <= _breakpoint_lg) {
		prevMode = currentMode;
		currentMode = "tablet";
	} else {
		prevMode = currentMode;
		currentMode = "desktop";
	}
}

setSize();
screenEvent(currentMode, prevMode);

setInterval(function() {
	setSize();
	screenEvent(currentMode, prevMode);
}, 1000);

$(document).ready(function() {
	//Dom Ready Stuff Here
});