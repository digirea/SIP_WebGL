/*jslint devel:true*/
/*global Float32Array, ArrayBuffer, Int16Array, QtnIV, MatIV*/

(function () {
	"use strict";
	var camera      = null,
		ctrl        = {},
		prevEvent   = null,
		keycallback = null,
		mouseState  = {"Left": false, "Center": false, "Right": false };
		
		
	function resetMouseState() {
		mouseState  = {"Left": false, "Center": false, "Right": false };
	}

	function setCamera(cam) {
		camera = cam;
	}

	function resetView() {
		if (!camera) {
			return;
		}
		camera.resetView();
	}

	function getViewInfo() {
		if (!camera) {
			return;
		}
		camera.getInfo();
	}
	
	
	function mouseOut(e) {
		resetMouseState();
	}

	function mouseDown(e) {
		if (e.button === 0) {
			mouseState.Left = true;
		}
		if (e.button === 2) {
			mouseState.Right = true;
		}
		if (e.button === 1) {
			mouseState.Center = true;
			e.preventDefault();
		}
	}

	function mouseUp(e) {
		if (e.button === 0) {
			mouseState.Left = false;
		}
		if (e.button === 2) {
			mouseState.Right = false;
		}
		if (e.button === 1) {
			mouseState.Center = false;
			e.preventDefault();
		}
	}

	function mouseMove(e) {
		var mult       = 2.5,
			multrotate = 0.5,
			movementX  = 0,
			movementY  = 0;

		if (prevEvent) {
			movementX = e.clientX - prevEvent.clientX;
			movementY = e.clientY - prevEvent.clientY;
		}
		if (!camera) {
			return;
		}

		if (mouseState.Right && mouseState.Left) {
			//camera.addRotate(-movementX * multrotate, movementY * multrotate, 0);
			return;
		}

		if (mouseState.Left) {
			camera.addRotate(-movementX * multrotate, movementY * multrotate, 0);
		}

		if (mouseState.Center) {
			camera.addPos(0, 0, -movementY * mult);
			camera.addAt(0, 0, -movementY * mult);
		}

		if (mouseState.Right) {
			//camera.addPos(0, 0, -movementY * mult);
			//camera.addAt(0, 0, -movementY * mult);
			camera.addPos(movementX * mult, 0, 0);
			camera.addAt(movementX * mult, 0, 0);
			camera.addPos(0, movementY * mult, 0);
			camera.addAt(0,  movementY * mult, 0);
		}
		
		prevEvent = e;
	}

	function mouseWheel(e) {
		//console.log(e);
		
		if (camera) {
			//http://hakuhin.jp/js/mouse.html#MOUSE_02
			if (e.wheelDelta) {
				camera.addPos(0, 0, e.wheelDelta * 0.5);
			} else {
				camera.addPos(0, 0, -e.detail * 0.5 * 40.0);
			}
		}
		e.preventDefault();
		return false;
	}

	function keyEvent(e) {
		//F5
		if (e.keyCode === 116) {
			resetView();
			console.log('resetView');
			e.preventDefault();
		}
		keycallback(e);
	}

	function init(document, keycb) {
		/*
		var mousewheelevent = null;
		if (document.hasOwnProperty('onwheel')) {
			mousewheelevent = 'wheel';
		} else if (document.hasOwnProperty('onmousewheel')) {
			mousewheelevent = 'mousewheel';
		} else {
			mousewheelevent = 'DOMMouseScroll';
		}
		*/
		document.addEventListener('mouseout',  mouseOut, true);
		document.addEventListener('mousemove', mouseMove, true);
		document.addEventListener('mouseup',   mouseUp, true);
		document.addEventListener('mousedown', mouseDown, true);
		document.addEventListener('contextmenu', function (e) {
			if (e.button === 2) {
				e.preventDefault();
				return false;
			}
		}, false);
		document.addEventListener('mousewheel',     mouseWheel);
		document.addEventListener('DOMMouseScroll', mouseWheel);
		document.addEventListener("keydown", keyEvent, false);
		keycallback = keycb;
		resetView();
	}

	window.ctrl             = ctrl;
	window.ctrl.init        = init;
	window.ctrl.setCamera   = setCamera;
	window.ctrl.resetView   = resetView;
	window.ctrl.getViewInfo = getViewInfo;
}());

