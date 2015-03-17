/*jslint devel:true*/

var MeshObj;

(function () {
	"use strict";
	/**
	 * Description
	 * @method mesh
	 */
	var mesh = function () {
		this.name          = 'undef';
		this.type          = 'data';
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
		this.shader        = null;
		this.radius        = 1;
		this.show          = true;
		this.boundmin      = [0,0,0];
		this.boundmax      = [0,0,0];
		this.trans         = [0,0,0];
		this.scale         = [1,1,1];
		this.rotate        = [0,0,0];
		this.diffColor     = [1,1,1,1];
		
		
		//for raytrace
		this.pointposition = [];
		
		//for info
		this.urllist       = [];
	};

	/**
	 * Description
	 * @method setTrans
	 * @param {} x
	 * @param {} y
	 * @param {} z
	 */
	mesh.prototype.setTrans = function (x, y, z) {
		this.trans[0] = x;
		this.trans[1] = y;
		this.trans[2] = z;
	}

	/**
	 * Description
	 * @method setScale
	 * @param {} x
	 * @param {} y
	 * @param {} z
	 */
	mesh.prototype.setScale = function (x, y, z) {
		this.scale[0] = x;
		this.scale[1] = y;
		this.scale[2] = z;
	}

	/**
	 * Description
	 * @method setRotate
	 * @param {} x
	 * @param {} y
	 * @param {} z
	 */
	mesh.prototype.setRotate = function (x, y, z) {
		this.rotate[0] = x;
		this.rotate[1] = y;
		this.rotate[2] = z;
	}

	/**
	 * Description
	 * @method setMode
	 * @param {} m
	 */
	mesh.prototype.setMode = function (m) {
		this.mode = m;
	};

	/**
	 * Description
	 * @method setShader
	 * @param {} s
	 */
	mesh.prototype.setShader = function (s) {
		console.log('Setup Shader', s);
		this.shader = s;
	};

	/**
	 * Description
	 * @method setDiffColor
	 * @param {} r
	 * @param {} g
	 * @param {} b
	 * @param {} a
	 */
	mesh.prototype.setDiffColor = function (r, g, b, a) {
		this.diffColor[0] = r;
		this.diffColor[1] = g;
		this.diffColor[2] = b;
		this.diffColor[3] = a;
	}

	MeshObj = mesh;
}());


