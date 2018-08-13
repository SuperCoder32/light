var clear = true,
    updateDelay = 10, //ms
    fullScreen = true;

function isMobile() {
	return 'ontouchstart' in window || navigator.maxTouchPoints;
}

requestAnimationFrame = (function(callback) {
	return requestAnimationFrame || webkitRequestAnimationFrame || mozRequestAnimationFrame || oRequestAnimationFrame || msRequestAnimationFrame || function(callback) {
		setTimeout(callback, 1000 / 60);
	};
})();

canvas = document.querySelector('canvas');
context = canvas.getContext('2d');

if (fullScreen) {
    canvas.width = window.outerWidth;
    canvas.height = window.outerHeight;
}

if (isMobile()) {
	canvas.addEventListener('touchstart', function (ev) {
		var touchobj = ev.changedTouches[0];
		mouseX = parseInt(touchobj.pageX - canvas.offsetLeft);
		mouseY = parseInt(touchobj.pageY - canvas.offsetTop);
		mousedown();
	});
	canvas.addEventListener('touchend', function (ev) {
		var touchobj = ev.changedTouches[0];
		mouseX = parseInt(touchobj.pageX - canvas.offsetLeft);
		mouseY = parseInt(touchobj.pageY - canvas.offsetTop);
		mouseup();
	});
	canvas.addEventListener('touchmove', function (ev) {
		var touchobj = ev.changedTouches[0];
		mouseX = parseInt(touchobj.pageX - canvas.offsetLeft);
		mouseY = parseInt(touchobj.pageY - canvas.offsetTop);
		mousemove();
	});
} else {
	canvas.addEventListener('keydown', function(ev) {
		ev.stopPropagation();
		keydown(ev.key, ev.keyCode);
	});
	canvas.addEventListener('keyup', function(ev) {
		ev.stopPropagation();
		keyup(ev.key, ev.keyCode);
	});
	canvas.addEventListener('mousemove', function(ev) {
		ev.stopPropagation();
		mouseX = ev.pageX - canvas.offsetLeft;
		mouseY = ev.pageY - canvas.offsetTop;
		mousemove();
	});
	canvas.addEventListener('mousedown', function(ev) {
		ev.stopPropagation();
		mousedown();
	});
	canvas.addEventListener('mouseup', function(ev) {
		ev.stopPropagation();
		mouseup();
	});
}

function update() {}; function draw() {};
function keydown() {}; function keyup() {};
function mousedown() {}; function mouseup() {}; function mousemove() {};

function init() {
    mouseX = 0;
    mouseY = 0;

    if (clear) {
        function calldraw() {
            context.clearRect(0, 0, canvas.width, canvas.height);
			draw();
            requestAnimationFrame(calldraw);
		}
    } else {
        function calldraw() {
            draw();
            requestAnimationFrame(calldraw);
        }
    }

    function callupdate() {
        update();
        setTimeout(callupdate, updateDelay);
    }

    callupdate();
    calldraw();
}
