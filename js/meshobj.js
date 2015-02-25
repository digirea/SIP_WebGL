/*jslint devel:true*/

var MeshObj;

(function () {
	"use strict";
	var mesh = function () {
		this.position      = null;
		this.normal        = null;
		this.color         = null;
		this.attrnames     = [];
		this.mode          = 'Triangles';
		this.vbo_position  = null;
		this.vbo_normal    = null;
		this.vbo_color     = null;
		this.vbo_list      = [];
		this.stride        = [];
		this.attlocation   = [];
		this.shader        = null;
	};

	mesh.prototype.setMode = function (m) {
		this.mode = m;
	};

	MeshObj = mesh;
}());


