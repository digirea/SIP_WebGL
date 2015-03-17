/*jslint devel:true*/

var MeshBuffer;

(function () {
	"use strict";
	/**
	 * Description
	 * @method mesh
	 */
	var mesh = function () {
		this.mesh      = null;
		this.line      = null;
		this.point     = null;
		this.name      = '';
	};

	/**
	 * Description
	 * @method Create
	 * @param {} m
	 */
	mesh.prototype.Create = function (m) {
		this.mode = m;
	};

	MeshObj = mesh;
}());



