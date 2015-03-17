/*jslint devel:true*/
/*global QtnIV, MatIV, Negative, Distance, CosInter */

var Camera;
var test_time = 0;
(function () {
	"use strict";
	var camera = function () {
		this.qtn               = new QtnIV();
		this.mtx               = new MatIV();
		this.mode              = 'proj';
		this.camPos            = [0, 0, 0];
		this.camPosStart       = [0, 0, 0];
		this.camPosEnd         = [0, 0, 0];
		this.camAt             = [0, 0, 0];
		this.camAtStart        = [0, 0, 0];
		this.camUp             = [0, 0, 0];
		this.camRot            = [0, 0, 0];
		this.camRotPrev        = [0, 0, 0];
		this.camWorldPos       = [0, 0, 0];
		this.camWorldPosStart  = [0, 0, 0];
		this.camWorldPosEnd    = [0, 0, 0];
		this.RotateMatrix      = this.mtx.identity(this.mtx.create());
		this.RotateMatrixStart = this.mtx.identity(this.mtx.create());
		this.camRotStart       = [0, 0, 0];
		this.camRotEnd         = [0, 0, 0];
		this.screen            = [0, 0];
		this.lerpState         = false;
		this.lerpTime          = 0;
		this.lerpTimeDelta     = 0;
	};

	camera.prototype.setupScreen = function (s) {
		this.screen = s;
	};

	camera.prototype.resetView = function () {
		console.log('View Matrix RESET');
		this.qtn               = new QtnIV();
		this.camPos            = [0, 0, -256];
		this.camAt             = [0, 0, 0];
		this.camAtStart        = [0, 0, 0];
		this.camUp             = [0, 1, 0];
		this.camRot            = [0, 0, 0];
		this.camRotPrev        = [0, 0, 0];
		this.camWorldPosStart  = [0, 0, 0];
		this.camWorldPosEnd    = [0, 0, 0];
		this.camWorldPos       = [0, 0, 0];
		this.lerpTime          = 0;
		this.RotateMatrix      = this.mtx.identity(this.mtx.create());
	};

	camera.prototype.ViewSide = function (type) {
		var z = 1000;//this.getCamPosZ();
		this.resetView();
		
		if (type === 'x') {
			this.camPos[0] = z;
			this.camPos[1] = 0;
			this.camPos[2] = 0;

			this.mtx.rotate(this.RotateMatrix, (Math.PI * -90.0) / 180.0, [0, 1, 0], this.RotateMatrix);
		}
		if (type === 'y') {
			this.camPos[0] = 0;
			this.camPos[1] = z;
			this.camPos[2] = 0;
			this.mtx.rotate(this.RotateMatrix, (Math.PI * -90.0) / 180.0, [1, 0, 0], this.RotateMatrix);
		}
		if (type === 'z') {
			this.camPos[0] = 0;
			this.camPos[1] = 0;
			this.camPos[2] = -z;
		}
		if (type === 'x-') {
			this.camPos[0] = -z;
			this.camPos[1] = 0;
			this.camPos[2] = 0;
			this.mtx.rotate(this.RotateMatrix, (Math.PI * 90.0) / 180.0, [0, 1, 0], this.RotateMatrix);
		}
		if (type === 'y-') {
			this.camPos[0] = 0;
			this.camPos[1] = -z;
			this.camPos[2] = 0;
			this.mtx.rotate(this.RotateMatrix, (Math.PI * 90.0) / 180.0, [1, 0, 0], this.RotateMatrix);
		}
		if (type === 'z-') {
			this.camPos[0] = 0;
			this.camPos[1] = 0;
			this.camPos[2] = z;
			this.mtx.rotate(this.RotateMatrix, (Math.PI * 180.0) / 180.0, [0, 1, 0], this.RotateMatrix);
		}

	};
	camera.prototype.pos = function (x, y, z) {
		this.camPos   = [x, y, z];
		return this.camPos;
	};
	
	camera.prototype.at = function (x, y, z) {
		this.camAt   = [x, y, z];
		return this.camAt;
	};
	
	camera.prototype.up = function (x, y, z) {
		this.camUp   = [x, y, z];
		return this.camUp;
	};

	camera.prototype.addPos = function (x, y, z) {
		this.camPos[0] += x;
		this.camPos[1] += y;
		this.camPos[2] += z;
		return this.camPos;
	};

	camera.prototype.addAt = function (x, y, z) {
		this.camAt[0] += x;
		this.camAt[1] += y;
		this.camAt[2] += z;
		return this.camAt;
	};

	camera.prototype.addRotate = function (x, y, z) {
		this.camRot[0] += x;
		this.camRot[1] += y;
		this.camRot[2] += z;
		return this.camRot;
	};

	camera.prototype.setupLerp = function (min, max, trans, scale) {
		var len = 0,
			i,
			temp,
			maxscale = 1;

		this.camWorldPosStart   = this.camWorldPos;
		this.camWorldPosEnd     = [(max[0] + min[0]) / 2, (max[1] + min[1]) / 2, (max[2] + min[2]) / 2];

		console.log('setupLerp : ', min, max, trans, scale);
		if (trans) {
			this.camWorldPosEnd[0] += parseFloat(trans[0]);
			this.camWorldPosEnd[1] += parseFloat(trans[1]);
			this.camWorldPosEnd[2] += parseFloat(trans[2]);
		}
		
		if (scale) {
			for(i = 0 ; i < scale.length; i++) {
				temp = parseFloat(scale[i]);
				if(maxscale < temp) {
					maxscale = temp;
				}
			}
		}
		console.log('maxscale : ', maxscale);
		
		this.camWorldPosEnd     = Negative(this.camWorldPosEnd);

		this.camPosStart[0]     = this.camPos[0];
		this.camPosStart[1]     = this.camPos[1];
		this.camPosStart[2]     = this.camPos[2];
		
		this.camAtStart[0]      = this.camAt[0];
		this.camAtStart[1]      = this.camAt[1];
		this.camAtStart[2]      = this.camAt[2];
		
		this.camPosEnd[0]       = 0;
		this.camPosEnd[1]       = 0;
		this.camPosEnd[2]       = 0;
		
		this.camPosEnd[2]       = -Distance(max, min) * maxscale;
		
		this.lerpTime           = 0;
		this.lerpTimeDelta      = 1.0 / 30.0;
		this.lerpState          = true;
	};

	camera.prototype.getCamPosZ = function () {
		return Math.abs(this.camPos[2]);
	};

	camera.prototype.getViewMatrix = function (fov, aspect, near, far) {
		var mtx      = new MatIV(),
			tMatrix  = mtx.identity(mtx.create()),
			vpMatrix = mtx.identity(mtx.create()),
			vMatrix  = mtx.identity(mtx.create()),
			pMatrix  = mtx.identity(mtx.create());
		mtx.lookAt(this.camPos, this.camAt, [0, 1, 0], vMatrix);
		mtx.perspective(fov, aspect, near, far, pMatrix);
		//mtx.ortho(-screen[0] screen[0], -screen[1], screen[1], near, far, pMatrix);
		//mtx.ortho(-1, 1, -1, 1, near, far, pMatrix);
		
		mtx.multiply(pMatrix, vMatrix, vpMatrix);
		
		mtx.translate(tMatrix, this.camWorldPos,  tMatrix);
		mtx.multiply(vpMatrix, this.RotateMatrix, vpMatrix);
		mtx.multiply(vpMatrix, tMatrix,           vpMatrix);
		return vpMatrix;
	};

	camera.prototype.getViewRotateMatrix = function (fov, aspect, near, far) {
		var mtx      = new MatIV(),
			tMatrix  = mtx.identity(mtx.create()),
			vpMatrix = mtx.identity(mtx.create()),
			vMatrix  = mtx.identity(mtx.create()),
			pMatrix  = mtx.identity(mtx.create());
		mtx.lookAt(this.camPos, this.camAt, [0, 1, 0], vMatrix);
		mtx.perspective(fov, aspect, near, far, pMatrix);
		mtx.multiply(pMatrix, vMatrix, vpMatrix);
		mtx.multiply(vpMatrix, this.RotateMatrix, vpMatrix);
		return vpMatrix;
	};

	camera.prototype.getAtDistance = function () {
		return Distance(Sub(this.camAtStart, this.camPosStart));
	};
	
	camera.prototype.LeapCamera = function () {
		this.lerpTime = this.lerpTime + this.lerpTimeDelta;
		if (this.lerpTime >= 1.0) {
			this.lerpTime = 1.0;
			this.lerpState = false;
		}
		this.camWorldPos[0]   = CosInter(this.camWorldPosStart[0], this.camWorldPosEnd[0], this.lerpTime);
		this.camWorldPos[1]   = CosInter(this.camWorldPosStart[1], this.camWorldPosEnd[1], this.lerpTime);
		this.camWorldPos[2]   = CosInter(this.camWorldPosStart[2], this.camWorldPosEnd[2], this.lerpTime);
		this.camPos[0]        = CosInter(this.camPosStart[0],      this.camPosEnd[0], this.lerpTime);
		this.camPos[1]        = CosInter(this.camPosStart[1],      this.camPosEnd[1], this.lerpTime);
		this.camPos[2]        = CosInter(this.camPosStart[2],      this.camPosEnd[2], this.lerpTime);
		this.camAt[0]         = CosInter(this.camAtStart[0],       0, this.lerpTime);
		this.camAt[1]         = CosInter(this.camAtStart[1],       0, this.lerpTime);
		this.camAt[2]         = CosInter(this.camAtStart[2],       0, this.lerpTime);
		if (this.lerpTime >= 1.0) {
			this.lerpTime = 0.0;
		}
	};

	camera.prototype.getEyeDirection = function () {
		return Normalize(Sub(this.camPos, this.camAt));
		
	}

	camera.prototype.updateRotateMatrix = function (r, y, x) {
		var qt = this.qtn.identity(this.qtn.create()),
			qMatrixXY = this.mtx.identity(this.mtx.create());
		this.qtn.rotate(r, [y, x, 0.0], qt);
		this.qtn.toMatIV(qt, qMatrixXY);
		this.mtx.multiply(qMatrixXY, this.RotateMatrix, this.RotateMatrix);
		this.camRotPrev[0] = this.camRot[0];
		this.camRotPrev[1] = this.camRot[1];
		this.camRotPrev[2] = this.camRot[2];
	};
	
	camera.prototype.updateMatrix = function (wh) {
		if (this.lerpState === false) {
			var x        = this.camRot[0] - this.camRotPrev[0],
				y        = this.camRot[1] - this.camRotPrev[1],
				sq       = Math.sqrt(x * x + y * y),
				r        = sq * 2.0 * Math.PI * wh;
			if (sq !== 1) {
				sq = 1 / sq;
				x *= sq;
				y *= sq;
			}
			if (isNaN(x)) { x = 0; }
			if (isNaN(y)) { y = 0; }
			this.updateRotateMatrix(r, y, x);

			return;
		}
		this.LeapCamera();

	};

	camera.prototype.init = function () {
		this.resetView();
	};
	
	Camera = camera;
}());
