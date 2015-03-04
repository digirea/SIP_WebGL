/*jslint devel:true*/

var MeshBuffer;

(function () {
	"use strict";
	var mesh = function () {
		this.mesh      = null;
		this.line      = null;
		this.point     = null;
		this.name      = '';
	};

	mesh.prototype.Create = function (m) {
		this.mode = m;
	};

	MeshObj = mesh;
}());



