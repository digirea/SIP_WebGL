/*jslint devel:true*/

var MeshObj;

(function () {
	"use strict";
	var mesh = function () {
		this.position      = [];
		this.normal        = [];
		this.color         = [];
		this.index         = [];
		this.attrnames     = [];
		this.mode          = 'Triangles';
		this.vbo_position  = null;
		this.vbo_normal    = null;
		this.vbo_color     = null;
		this.vbo_list      = [];
		this.stride        = [];
		this.attlocation   = [];
		this.shader        = null;
		this.BoundMin      = [0,0,0];
		this.BoundMax      = [0,0,0];
	};

	mesh.prototype.setMode = function (m) {
		this.mode = m;
	};

	MeshObj = mesh;
}());


