/*jslint devel:true*/

var MeshObj;

(function () {
	"use strict";
	var mesh = function () {
		this.position      = null;
		this.normal        = null;
		this.color         = null;
		this.index         = null;
		this.attrnames     = [];
		this.mode          = 'Triangles';
		this.vbo_position  = null;
		this.vbo_normal    = null;
		this.vbo_color     = null;
		this.ibo           = null;
		this.vbo_list      = [];
		this.stride        = [];
		this.attlocation   = [];
		this.faces         = 0;
		this.divide        = 0;
		this.linenum       = 0;
		this.shader        = null;
	};

	mesh.prototype.setMode = function (m) {
		this.mode = m;
	};

	MeshObj = mesh;
}());


