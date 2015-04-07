/*jslint devel:true*/

var MeshObj;

(function () {
	"use strict";
	/**
	 * コンストラクタ
	 * @method mesh
	 */
	var mesh = function () {
		this.clear();
	};

	/**
	 * メンバのクリア
	 * @method setTrans
	 * @param {Number} x x
	 * @param {Number} y y 
	 * @param {Number} z z
	 */
	mesh.prototype.clear = function () {
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
		this.colinfo       = [];
		this.primtype      = 'mesh';
		this.grouptype     = 'meshgroup';
	}


	
	/**
	 * メンバのクリア
	 * @method setTrans
	 * @param {Number} x x
	 * @param {Number} y y 
	 * @param {Number} z z
	 */
	mesh.prototype.duplicateInfo = function (dest) {
		dest.name             = this.name            ;
		dest.type             = this.type            ;
		//dest.position         = this.position        ;
		dest.normal           = this.normal          ;
		dest.color            = this.color           ;
		dest.index            = this.index           ;
		dest.attrnames        = this.attrnames       ;
		dest.mode             = this.mode            ;
		//dest.vbo_position   = this.vbo_position    ;
		//dest.vbo_normal     = this.vbo_normal      ;
		//dest.vbo_color      = this.vbo_color       ;
		//dest.vbo_list       = this.vbo_list        ;
		dest.stride           = this.stride          ;
		dest.shader           = this.shader          ;
		dest.radius           = this.radius          ;
		dest.show             = this.show            ;
		//dest.boundmin         = this.boundmin        ;
		//dest.boundmax         = this.boundmax        ;
		dest.trans            = this.trans           ;
		dest.scale            = this.scale           ;
		dest.rotate           = this.rotate          ;
		dest.diffColor        = this.diffColor       ;
		//dest.pointposition    = this.pointposition   ;
		//dest.urllist          = this.urllist         ;
		//dest.colinfo          = this.colinfo         ;
		dest.primtype         = this.primtype        ;
		dest.grouptype        = this.grouptype       ;
	}
	
	
	
	
	
	
	
	
	/**
	 * 移動量の設定
	 * @method setTrans
	 * @param {Number} x x
	 * @param {Number} y y 
	 * @param {Number} z z
	 */
	mesh.prototype.setTrans = function (x, y, z) {
		this.trans[0] = x;
		this.trans[1] = y;
		this.trans[2] = z;
	}

	/**
	 * スケールの設定
	 * @method setScale
	 * @param {Number} x x
	 * @param {Number} y y 
	 * @param {Number} z z
	 */
	mesh.prototype.setScale = function (x, y, z) {
		this.scale[0] = x;
		this.scale[1] = y;
		this.scale[2] = z;
	}

	/**
	 * 回転量の設定
	 * @method setRotate
	 * @param {Number} x x
	 * @param {Number} y y 
	 * @param {Number} z z
	 */
	mesh.prototype.setRotate = function (x, y, z) {
		this.rotate[0] = x;
		this.rotate[1] = y;
		this.rotate[2] = z;
	}

	/**
	 * モードの設定
	 * @method setMode
	 * @param {String} m モード
	 */
	mesh.prototype.setMode = function (m) {
		this.mode = m;
	};

	/**
	 * シェーダの設定
	 * @method setShader
	 * @param {ShaderObj} s シェーダオブジェクト
	 */
	mesh.prototype.setShader = function (s) {
		console.log('Setup Shader', s);
		this.shader = s;
	};

	/**
	 * 拡散色の設定
	 * @method setDiffColor
	 * @param {Number} r 赤
	 * @param {Number} g 緑
	 * @param {Number} b 青
	 * @param {Number} a 透明度
	 */
	mesh.prototype.setDiffColor = function (r, g, b, a) {
		this.diffColor[0] = r;
		this.diffColor[1] = g;
		this.diffColor[2] = b;
		this.diffColor[3] = a;
	}

	MeshObj = mesh;
}());


