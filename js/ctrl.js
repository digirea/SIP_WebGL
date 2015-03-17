/*jslint devel:true*/
/*global Float32Array, ArrayBuffer, Int16Array, QtnIV, MatIV*/

(function () {
	"use strict";
	var camera      = [],
		ctrl        = {},
		prevEvent   = null,
		keycallback = null,
		multX       = 0.5,
		multY       = 0.5,
		multrotate  = 0.5,
		multWheel   = 0.1,
		multWheelCoef = 1.0,
		mouseState  = {"Left": false, "Center": false, "Right": false };
	
	/**
	 * Description
	 * @method resetMouseState
	 */
	function resetMouseState() {
		mouseState  = {"Left": false, "Center": false, "Right": false };
	}
	
	/**
	 * Description
	 * @method setMoveMult
	 * @param {} x
	 * @param {} y
	 * @param {} r
	 * @param {} w
	 */
	function setMoveMult(x, y, r, w)
	{
		multX       = x;
		multY       = y;
		multrotate  = r;
		multWheel   = w;
	}

	/**
	 * Description
	 * @method setCamera
	 * @param {} cam
	 */
	function setCamera(cam) {
		camera.push(cam);
	}

	/**
	 * Description
	 * @method resetView
	 */
	function resetView() {
		var i;
		if (camera.length <= 0) {
			return;
		}
		for (i = 0 ; i < camera.length; i++) {
			camera[i].resetView();
		}
	}

	/**
	 * Description
	 * @method mouseOut
	 * @param {} e
	 */
	function mouseOut(e) {
		resetMouseState();
	}

	/**
	 * Description
	 * @method mouseDown
	 * @param {} e
	 */
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

	/**
	 * Description
	 * @method mouseUp
	 * @param {} e
	 */
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

	/**
	 * Description
	 * @method mouseMove
	 * @param {} e
	 */
	function mouseMove(e) {
		var i,
			movementX  = 0,
			movementY  = 0;

		if (prevEvent) {
			movementX = e.clientX - prevEvent.clientX;
			movementY = e.clientY - prevEvent.clientY;
		}
		if (camera.length <= 0) {
			return;
		}
		
		
		for (i = 0 ; i < camera.length; i++) {
			if (mouseState.Right && mouseState.Left) {
			}

			if (mouseState.Left) {
				var rot = camera[i].addRotate(-movementX * multrotate, movementY * multrotate, 0);
				//console.log( rot[1] / 3.141592 );
			}

			if (mouseState.Center) {
				camera[i].addPos(0, 0, -movementY * multY );
				//camera[i].addAt(0,  0, -movementY * multY );
			}

			if (mouseState.Right) {
				//camera[i].addPos(0, 0, -movementY * mult);
				//camera[i].addAt(0, 0, -movementY * mult);
				camera[i].addPos(movementX * multX, 0, 0);
				camera[i].addPos(0, movementY * multY, 0);
				camera[i].addAt(movementX * multX, 0, 0);
				camera[i].addAt(0,  movementY * multY, 0);
			}
		}
		
		prevEvent = e;
	}

	/**
	 * Description
	 * @method mouseWheel
	 * @param {} e
	 * @return Literal
	 */
	function mouseWheel(e) {
		var i,
			info,
			delta  = 0,
			rate   = multWheelCoef * multWheel;

		if (camera.length <= 0) {
			return;
		}

		for (i = 0 ; i < camera.length; i++) {
			if (e.wheelDelta) {
				delta = e.wheelDelta * rate * 1.0;
			}
			if( e.detail) {
				delta = -e.detail    * rate * 40.0
				
			}
			camera[i].addPos(0, 0, delta);
			if(camera[i].camPos[2] >= 0.0) {
				camera[i].camPos[2] = -0.05;
				return;
			}
			
			//update coef
			/*
			if(delta < 0) {
				multWheelCoef *= (1.0 + 0.02);
			}
			if(delta > 0) {
				multWheelCoef *= (1.0 - 0.02);
			}
			*/
		}
		e.preventDefault();
		return false;
	}

	/**
	 * Description
	 * @method keyEvent
	 * @param {} e
	 */
	function keyEvent(e) {
		//F5
		if (e.keyCode === 116) {
			resetView();
			e.preventDefault();
		}
		keycallback(e);
	}

	/**
	 * Description
	 * @method init
	 * @param {} document
	 * @param {} canvas
	 * @param {} keycb
	 */
	function init(document, canvas, keycb) {
		/**
		 * Description
		 * @method mouseUpFunc
		 * @param {} evt
		 */
		var mouseUpFunc = function (evt) {
			resetMouseState();
			window.removeEventListener('mousemove', mouseMove, false);
			window.removeEventListener('mouseup', mouseUpFunc, true);
		};
		//document.addEventListener('mouseout',  mouseOut, true);
		//document.addEventListener('mousemove', mouseMove, true);
		//document.addEventListener('mouseup',   mouseUp, true);
		//document.addEventListener('mousedown', mouseDown, true);
		//document.addEventListener('contextmenu', function (e) {
		
		//canvas.addEventListener('mouseout',  mouseOut, true);
		canvas.addEventListener('mousemove', mouseMove, true);
		canvas.addEventListener('mouseup',   mouseUp, true);
		canvas.addEventListener('mousedown', function (evt) {
			mouseDown(evt);
			window.addEventListener('mousemove', mouseMove, false);
			window.addEventListener('mouseup', mouseUpFunc, true);
		}, true);
		canvas.addEventListener('contextmenu', function (e) {
			if (e.button === 2) {
				e.preventDefault();
				return false;
			}
		}, false);
		canvas.addEventListener('mousewheel',     mouseWheel);
		canvas.addEventListener('DOMMouseScroll', mouseWheel);
		canvas.addEventListener("keydown", keyEvent, false);
		keycallback = keycb;
		resetView();
	}

	window.ctrl             = ctrl;
	window.ctrl.init        = init;
	window.ctrl.setMoveMult = setMoveMult;
	window.ctrl.setCamera   = setCamera;
	window.ctrl.resetView   = resetView;
}());

