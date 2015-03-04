/*jslint devel:true*/

var Camera;

(function () {
	"use strict";
	var camera = function () {
		this.camPos      = [];
		this.camAt       = [];
		this.camUp       = [];
		this.tranRot     = [];
	};

	camera.prototype.resetView = function () {
		this.camPos   = [0, 10, -100];
		this.camAt    = [0, 0, 0];
		this.camUp    = [0, 1, 0];
		this.tranRot  = [0, 0, 0];
	};

	camera.prototype.getInfo = function () {
		return {
			"Pos"   : this.camPos,
			"At"    : this.camAt,
			"Up"    : this.camUp,
			"Rotate": this.tranRot
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
		this.tranRot[0] += x;
		this.tranRot[1] += y;
		this.tranRot[2] += z;
		return this.tranRot;
	};

	camera.prototype.init = function () {
		this.resetView();
	};
	
	Camera = camera;
}());
