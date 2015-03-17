/*jslint devel:true*/
/*global Float32Array, ArrayBuffer, Int16Array, QtnIV, MatIV*/

var ShaderObj;

(function () {
	"use strict";
	/**
	 * Description
	 * @method shaderobj
	 */
	var shaderobj = function () {
		this.v_shader    = null;
		this.f_shader    = null;
		this.program     = null;
		this.attLocation = [];
	};
	ShaderObj = shaderobj;
}());

