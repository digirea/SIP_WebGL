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


