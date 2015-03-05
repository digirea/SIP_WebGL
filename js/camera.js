/*jslint devel:true*/

var Camera;

(function () {
	"use strict";
	var camera = function () {
		this.mtx             = new MatIV();
		this.camPos          = [];
		this.camAt           = [];
		this.camUp           = [];
		this.camRot          = [];
		this.DiffMatrix      = this.mtx.identity(this.mtx.create());
		this.prevDiffMatrix  = this.mtx.identity(this.mtx.create());
		this.resetCamPos     = [0, 100, -1000];
		this.resetCamAt      = [0, 0, 0];
		this.resetCamUp      = [0, 1, 0];
		this.resetCamRot     = [0, 0, 0];
		
		this.camPosStart     = [];
		this.camAtStart      = [];
		this.camRotStart     = [];
		
		this.camPosEnd       = [];
		this.camAtEnd        = [];
		this.camRotEnd       = [0,0,0];
		
		this.lerpState       = false;
		this.lerpTime        = 0;
		this.lerpTimeDelta   = 0;
		this.lerpX           = 0;
		this.lerpY           = 0;
		this.lerpZ           = 0;
		
	};

	camera.prototype.getDiffMatrix = function () {
		return this.DiffMatrix;
	}
	
	
	camera.prototype.resetView = function () {
		this.camPos   = this.resetCamPos ;
		this.camAt    = this.resetCamAt  ;
		this.camUp    = this.resetCamUp  ;
		this.camRot   = this.resetCamRot;
	};

	camera.prototype.getInfo = function () {
		return {
			"Pos"   : this.camPos,
			"At"    : this.camAt,
			"Up"    : this.camUp,
			"Rotate": this.camRot
		};
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
		return this.camPos;
	};

	camera.prototype.addRotate = function (x, y, z) {
		this.camRot[0] += x;
		this.camRot[1] += y;
		this.camRot[2] += z;
		return this.camRot;
	};

	camera.prototype.startLerpCamera = function (x, y, z) {
		this.camRot[0] += x;
		this.camRot[1] += y;
		this.camRot[2] += z;
		return this.camRot;
	};

	camera.prototype.setupLerp = function (min, max) {
		this.camPosStart    = this.camPos;
		this.camAtStart     = this.camAt;
		this.camRotStart    = this.camRot;
		this.camPosEnd      = [(max[0] + min[0]) / 4, (max[1] + min[1]) / 2, (max[2] + min[2]) / 2];
		this.camAtEnd       = [(max[0] + min[0]) / 2, (max[1] + min[1]) / 2, (max[2] + min[2]) / 2];
		this.camPosEnd[2]   = this.camPosEnd[2] - max[2];

		console.log('NAMA', max[0], min[0], max[1], min[1], max[2],  min[2]);
		console.log('SUB', max[0] + min[0], max[1] + min[1], max[2] + min[2]);
		
		console.log(this.camPosEnd[0], this.camPosEnd[1], this.camPosEnd[2]);
		console.log(this.camAtEnd[0], this.camAtEnd[1], this.camAtEnd[2]);
		this.lerpTime       = 0;
		this.lerpTimeDelta  = 1.0 / 60.0;
		this.prevDiffMatrix = this.DiffMatrix;
		this.lerpState      = true;
	}
	
	camera.prototype.update = function (dMatrix) {
		if(this.lerpState === false) {
			this.DiffMatrix = dMatrix;
			return ;
		}
		
		this.camPos[0]      = CosInter(this.camPosStart[0], this.camPosEnd[0], this.lerpTime);
		this.camPos[1]      = CosInter(this.camPosStart[1], this.camPosEnd[1], this.lerpTime);
		this.camPos[2]      = CosInter(this.camPosStart[2], this.camPosEnd[2], this.lerpTime);
		
		this.camAt[0]       = CosInter(this.camAtStart[0], this.camAtEnd[0], this.lerpTime);
		this.camAt[1]       = CosInter(this.camAtStart[1], this.camAtEnd[1], this.lerpTime);
		this.camAt[2]       = CosInter(this.camAtStart[2], this.camAtEnd[2], this.lerpTime);
		
		this.camRot[0]      = CosInter(this.camRotStart[0], 0.0, this.lerpTime);
		this.camRot[1]      = CosInter(this.camRotStart[1], 0.0, this.lerpTime);
		this.camRot[2]      = CosInter(this.camRotStart[2], 0.0, this.lerpTime);
		
		this.DiffMatrix[0]  = CosInter(this.prevDiffMatrix[0] , 1.0, this.lerpTime);
		this.DiffMatrix[1]  = CosInter(this.prevDiffMatrix[1] , 0.0, this.lerpTime);
		this.DiffMatrix[2]  = CosInter(this.prevDiffMatrix[2] , 0.0, this.lerpTime);
		this.DiffMatrix[3]  = CosInter(this.prevDiffMatrix[3] , 0.0, this.lerpTime);
		
		this.DiffMatrix[4]  = CosInter(this.prevDiffMatrix[4] , 0.0, this.lerpTime);
		this.DiffMatrix[5]  = CosInter(this.prevDiffMatrix[5] , 1.0, this.lerpTime);
		this.DiffMatrix[6]  = CosInter(this.prevDiffMatrix[6] , 0.0, this.lerpTime);
		this.DiffMatrix[7]  = CosInter(this.prevDiffMatrix[7] , 0.0, this.lerpTime);
		
		this.DiffMatrix[8]  = CosInter(this.prevDiffMatrix[8] , 0.0, this.lerpTime);
		this.DiffMatrix[9]  = CosInter(this.prevDiffMatrix[9] , 0.0, this.lerpTime);
		this.DiffMatrix[10] = CosInter(this.prevDiffMatrix[10], 1.0, this.lerpTime);
		this.DiffMatrix[11] = CosInter(this.prevDiffMatrix[11], 0.0, this.lerpTime);
		
		this.DiffMatrix[12] = CosInter(this.prevDiffMatrix[12], 0.0, this.lerpTime);
		this.DiffMatrix[13] = CosInter(this.prevDiffMatrix[13], 0.0, this.lerpTime);
		this.DiffMatrix[14] = CosInter(this.prevDiffMatrix[14], 0.0, this.lerpTime);
		this.DiffMatrix[15] = CosInter(this.prevDiffMatrix[15], 1.0, this.lerpTime);
		
		
		this.lerpTime = this.lerpTime + this.lerpTimeDelta
		if(this.lerpTime >= 0.5) {
			this.lerpTime = 0.0;
			this.lerpState = false;
		}
	}

	camera.prototype.init = function () {
		this.resetView();
	};
	
	Camera = camera;
}());
