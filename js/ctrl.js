/*jslint devel:true*/
/*global Float32Array, ArrayBuffer, Int16Array, QtnIV, MatIV*/

(function () {
	"use strict";
	var camera      = null,
		ctrl        = {},
		prevEvent   = null,
		keycallback = null,
		multX       = 0.5,
		multY       = 0.5,
		multrotate  = 0.5,
		multWheel   = 0.1,
		mouseState  = {"Left": false, "Center": false, "Right": false };
	
	function resetMouseState() {
		mouseState  = {"Left": false, "Center": false, "Right": false };
	}
	
	function setMoveMult(x, y, r, w)
	{
		multX       = x;
		multY       = y;
		multrotate  = r;
		multWheel   = w;
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
		var movementX  = 0,
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
			//return;
		}

		if (mouseState.Left) {
			camera.addRotate(-movementX * multrotate, movementY * multrotate, 0);
		}

		if (mouseState.Center) {
			camera.addPos(0, 0, -movementY * multY );
			camera.addAt(0,  0, -movementY * multY );
		}

		if (mouseState.Right) {
			//camera.addPos(0, 0, -movementY * mult);
			//camera.addAt(0, 0, -movementY * mult);
			camera.addPos(movementX * multX, 0, 0);
			camera.addPos(0, movementY * multY, 0);
			camera.addAt(movementX * multX, 0, 0);
			camera.addAt(0,  movementY * multY, 0);
		}
		
		prevEvent = e;
	}

	function mouseWheel(e) {
		var info;
		if (camera) {
			if (e.wheelDelta) {
				camera.addPos(0, 0, e.wheelDelta * multWheel);
			} else {
				camera.addPos(0, 0, -e.detail    * multWheel * 40.0);
			}
			if(camera.camPos[2] >= 0.0) {
				camera.camPos[2] = -0.05;
			}
		}
		e.preventDefault();
		return false;
	}

	function keyEvent(e) {
		//F5
		if (e.keyCode === 116) {
			resetView();
			e.preventDefault();
		}
		keycallback(e);
	}

	function init(document, keycb) {
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
	window.ctrl.setMoveMult = setMoveMult;
	window.ctrl.setCamera   = setCamera;
	window.ctrl.resetView   = resetView;
	window.ctrl.getViewInfo = getViewInfo;
}());

