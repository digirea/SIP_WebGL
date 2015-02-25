/*jslint devel:true*/
/*global Float32Array, ArrayBuffer, Int16Array, QtnIV, MatIV, canvas, ShaderObj, MeshObj*/

var WGLRender;

(function () {
	"use strict";
	var render = function () {
		this.gl     = null;
		this.window = null;
		this.canvas = null;
		this.rAF    = null;
	};

	render.prototype.init = function (canvas, window) {
		this.gl     = canvas.getContext('webgl')      || canvas.getContext('experimental-webgl');
		this.rAF    = window.requestAnimationFrame;
		if (!this.rAF) {
			this.rAF = window.mozRequestAnimationFrame;
		}
		if (!this.rAF) {
			this.rAF = window.webkitRequestAnimationFrame;
		}

		this.canvas = canvas;
		this.window = window;
	};

	render.prototype.onResize = function () {
		var w = window.innerWidth,
			h = window.innerHeight;
		if (canvas) {
			canvas.width  = w;
			canvas.height = h;
		}
		if (this.gl) {
			this.gl.viewport(0, 0, canvas.width, canvas.height);
		}
	};

	render.prototype.clearColor = function (r, g, b, a) {
		this.gl.clearColor(r, g, b, a);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
	};

	render.prototype.clearDepth = function (d) {
		this.gl.clearDepth(d);
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
	};

	render.prototype.getContext = function () {
		return this.gl;
	};
	
	render.prototype.Flush = function () {
		this.gl.flush();
	};
	
	render.prototype.swapBuffer = function () {
		return this.rAF;
	};

	render.prototype.setBlend = function (mode) {
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);
		this.gl.disable(this.gl.BLEND);
		//this.gl.enable(this.gl.BLEND);
		//this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE);	
		//this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE);
	};
	
	render.prototype.createShader = function (type, text) {
		var shader,
			shader_type;
		switch (type) {
		case 'x-shader/x-vertex':
			shader_type = this.gl.VERTEX_SHADER;
			shader = this.gl.createShader(this.gl.VERTEX_SHADER);
			break;
		case 'x-shader/x-fragment':
			shader_type = this.gl.FRAGMENT_SHADER;
			shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
			break;
		default:
			return;
		}
		this.gl.shaderSource(shader, text);
		this.gl.compileShader(shader);
		if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
			return shader;
		} else {
			alert(this.gl.getShaderInfoLog(shader));
		}
	};

	render.prototype.createShaderById = function (id) {
		var ele = document.getElementById(id);
		//console.log(id, ele.type, ele.text);
		if (!ele) {
			return;
		}
		return this.createShader(ele.type, ele.text);
	};

	render.prototype.createProgram = function (vs, fs) {
		var program = this.gl.createProgram();
		this.gl.attachShader(program, vs);
		this.gl.attachShader(program, fs);
		this.gl.linkProgram(program);
		if (this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
			this.gl.useProgram(program);
			return program;
		} else {
			alert(this.gl.getProgramInfoLog(program));
		}
	};

	render.prototype.createVBO = function (data) {
		var vbo = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
		return vbo;
	};

	render.prototype.createIBO = function (data) {
		var ibo = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
		return ibo;
	};

	render.prototype.setAttribute = function (vbo, attL, attS) {
		var i;
		for (i = 0; i < vbo.length; i = i + 1) {
			if (attL[i] >= 0) {
				this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo[i]);
				this.gl.enableVertexAttribArray(attL[i]);
				this.gl.vertexAttribPointer(attL[i], attS[i], this.gl.FLOAT, false, 0, 0);
			}
		}
	};

	render.prototype.getAttribList = function (prg, namearray) {
		var i,
			location = [];
		for (i = 0; i < namearray.length; i = i + 1) {
			location[i] = this.gl.getAttribLocation(prg, namearray[i]);
		}
		return location;
	};

	render.prototype.getUniformList = function (prg, namearray) {
		var i,
			location = [];
		for (i = 0; i < namearray.length; i = i + 1) {
			location[i] = this.gl.getUniformLocation(prg, namearray[i]);
		}
		return location;
	};

	render.prototype.setUniform = function (type, location, data) {
		switch (type) {
		case 'Matrix4fv':
			this.gl.uniformMatrix4fv(location, this.gl.FALSE, data);
			break;
		case '1f':
			this.gl.uniform1f(location, data);
			break;
		case '1i':
			this.gl.uniform1i(location, data);
			break;
		default:
			console.log('ERROR : render.prototype.setUniform');
			break;
		}
	};

	render.prototype.drawArrays = function (type, index, primnum) {
		switch (type) {
		case 'Lines':
			this.gl.drawArrays(this.gl.LINES, index, primnum);
			break;
		case 'Triangles':
			this.gl.drawArrays(this.gl.TRIANGLES, index, primnum);
			break;
		case 'Points':
			this.gl.drawArrays(this.gl.POINTS, index, primnum);
			break;
		default:
			console.log('Unknown type.');
			break;
		}
	};

	//------------------------------------------------------------------------------
	// SHADEROBJ
	//------------------------------------------------------------------------------
	render.prototype.createShaderObj = function (vs, fs) {
		var shaderobj = new ShaderObj();
		shaderobj.v_shader = this.createShaderById(vs);
		shaderobj.f_shader = this.createShaderById(fs);
		shaderobj.program  = this.createProgram(shaderobj.v_shader, shaderobj.f_shader);
		if (!shaderobj.v_shader || !shaderobj.f_shader || !shaderobj.program) {
			alert('Failed createShaderObj');
		} else {
			console.log('DONE : createShaderObj');
		}
		return shaderobj;
	};

	render.prototype.getShaderUniformList = function (shader, namearray) {
		return this.getUniformList(shader.program, namearray);
	};

	render.prototype.setupShader = function (mesh, shader) {
		this.gl.useProgram(shader.program);
		mesh.attlocation = this.getAttribList(shader.program, mesh.attrnames);
	};

	//------------------------------------------------------------------------------
	// MESHOBJ
	//------------------------------------------------------------------------------
	render.prototype.createMeshObj = function (position, normal, color) {
		var mesh        = new MeshObj();
		if (position) {
			console.log('CREATE : position');
			mesh.position = position;
			mesh.vbo_pos = this.createVBO(position);
			mesh.vbo_list.push(mesh.vbo_pos);
			mesh.stride.push(3);
			mesh.attrnames.push('position');
		}

		if (normal) {
			console.log('CREATE : normal');
			mesh.normal = normal;
			mesh.vbo_nor = this.createVBO(normal);
			mesh.vbo_list.push(mesh.vbo_nor);
			mesh.stride.push(3);
			mesh.attrnames.push('normal');
		}

		if (color) {
			console.log('CREATE : color');
			mesh.color   = color;
			mesh.vbo_col = this.createVBO(color);
			mesh.vbo_list.push(mesh.vbo_col);
			mesh.stride.push(4);
			mesh.attrnames.push('color');
		}
		return mesh;
	};

	render.prototype.drawMesh = function (mesh) {
		var primnum = 0;
		if (mesh.shader) {
			this.setShader(mesh, mesh.shader);
		}
		this.setAttribute(mesh.vbo_list, mesh.attlocation, mesh.stride);
		if (mesh.mode === 'Points') {
			primnum = mesh.position.length / 3;
		} else {
			primnum = mesh.position.length / 3;
		}
		this.drawArrays(mesh.mode, 0, primnum);
		this.gl.useProgram(null);
	};
	
	
	WGLRender = render;
}());
