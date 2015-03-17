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
		moveX       = 0,
		moveY       = 0,
		mouseState  = {"Left": false, "Center": false, "Right": false };
	
	/**
	 * マウスステートのリセット
	 * @method resetMouseState
	 */
	function resetMouseState() {
		mouseState  = {"Left": false, "Center": false, "Right": false };
	}
	
	/**
	 * カメラ可動時に使用される積算値の設定
	 * @method setMoveMult
	 * @param {Number} x x積算値
	 * @param {Number} y y積算値
	 * @param {Number} r 回転積算値
	 * @param {Number} w ホイール積算値
	 */
	function setMoveMult(x, y, r, w)
	{
		multX       = x;
		multY       = y;
		multrotate  = r;
		multWheel   = w;
	}

	/**
	 * カメラの設定
	 * @method setCamera
	 * @param {Camera} cam カメラ
	 */
	function setCamera(cam) {
		camera.push(cam);
	}

	/**
	 * ビューのリセット
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
	 * マウスアウトコールバック
	 * @method mouseOut
	 * @param {Event} e マウスイベント
	 */
	function mouseOut(e) {
		resetMouseState();
	}

	/**
	 * マウスダウンコールバック
	 * @method mouseDown
	 * @param {Event} e マウスイベント
	 */
	function mouseDown(e) {
		if (e.button === 0) {
			mouseState.Left = true;
			moveX = 0;
			moveY = 0;
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
	 * マウスアップコールバック
	 * @method mouseUp
	 * @param {Event} e マウスイベント
	 */
	function mouseUp(e) {
		if (e.button === 0) {
			mouseState.Left = false;
			console.log(moveX, moveY);
			
			//pick
			if(moveX < 5 && moveY < 5) {
				window.scene.Pick(e.clientX, e.clientY);
			}
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
	 * マウスムーブコールバック
	 * @method mouseMove
	 * @param {Event} e マウスイベント
	 */
	function mouseMove(e) {
		var i,
			movementX  = 0,
			movementY  = 0;

		if (prevEvent) {
			movementX = e.clientX - prevEvent.clientX;
			movementY = e.clientY - prevEvent.clientY;
			moveX += Math.abs(movementX);
			moveY += Math.abs(movementY);
		}
		if (camera.length <= 0) {
			return;
		}
		
		
		for (i = 0 ; i < camera.length; i++) {
			if (mouseState.Right && mouseState.Left) {
			}

			if (mouseState.Left) {
				var rot = camera[i].addRotate(-movementX * multrotate, movementY * multrotate, 0);
			}

			if (mouseState.Center) {
				camera[i].addPos(0, 0, -movementY * multY );
				if (camera[i].camPos[2] >= 0.0) {
					camera[i].camPos[2] = -0.05;
					return;
				}
			}

			if (mouseState.Right) {
				camera[i].addPos(movementX * multX, 0, 0);
				camera[i].addPos(0, movementY * multY, 0);
				camera[i].addAt(movementX * multX, 0, 0);
				camera[i].addAt(0,  movementY * multY, 0);
			}
		}
		
		prevEvent = e;
	}

	/**
	 * マウスホイールコールバック
	 * @method mouseWheel
	 * @param {Event} e マウスイベント
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
			if ( e.detail) {
				delta = -e.detail    * rate * 40.0
				
			}
			camera[i].addPos(0, 0, delta);
			if (camera[i].camPos[2] >= 0.0) {
				camera[i].camPos[2] = -0.05;
				return;
			}
		}
		e.preventDefault();
		return false;
	}

	/**
	 * キーイベント
	 * @method keyEvent
	 * @param {Event} e キーイベント
	 */
	function keyEvent(e) {
		//F5
		if (e.keyCode === 116) {
			resetView();
			//e.preventDefault();
		}
		keycallback(e);
	}

	/**
	 * 初期化
	 * @method init
	 * @param {Object} document ドキュメントオブジェクト
	 * @param {Object} canvas キャンバスオブジェクト
	 * @param {Function} keycb キーボードコールバック
	 */
	function init(document, canvas, keycb) {
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
		window.addEventListener('contextmenu', function (e) {
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

