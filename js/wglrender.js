/*jslint devel:true*/
/*global $, Float32Array, ArrayBuffer, Int16Array, QtnIV, MatIV, canvas, ShaderObj, MeshObj*/

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
		this.gl     = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
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

	render.prototype.Depth = function (enable) {
		if(enable == true) {
			this.gl.enable(this.gl.DEPTH_TEST);
		} else {
			this.gl.disable(this.gl.DEPTH_TEST);
		}
	}
	
	render.prototype.Blend = function (enable) {
		if(enable === true) {
			//this.gl.enable(this.gl.DEPTH_TEST);
			this.gl.depthFunc(this.gl.LEQUAL);
			//this.gl.disable(this.gl.BLEND);
			this.gl.enable(this.gl.BLEND);
			this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE);	
			//this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE);
			//this.gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		} else {
			this.gl.disable(this.gl.BLEND);
		}
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


	render.prototype.lineWidth = function (w) {
		this.gl.lineWidth(w);
	}
	
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
		case '4fv':
			this.gl.uniform4fv(location, data);
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
		case 'LineStrip':
			this.gl.drawArrays(this.gl.LINE_STRIP, index, primnum);
			break;
		case 'Triangles':
			this.gl.drawArrays(this.gl.TRIANGLES, index, primnum);
			break;
		case 'TriangleStrip':
			this.gl.drawArrays(this.gl.TRIANGLE_STRIP, index, primnum);
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
			mesh.vbo_position = this.createVBO(position);
			mesh.vbo_list.push(mesh.vbo_position);
			mesh.stride.push(3);
			mesh.attrnames.push('position');
		}

		if (normal) {
			console.log('CREATE : normal');
			mesh.normal = normal;
			mesh.vbo_normal = this.createVBO(normal);
			mesh.vbo_list.push(mesh.vbo_normal);
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
	
	//------------------------------------------------------------------------------
	// MESHOBJ
	//------------------------------------------------------------------------------
	render.prototype.createCyl = function (divide) {
		var mesh        = new MeshObj();
		var d  = 0,
		    dd = 360 / (divide),
		    buf = [];

		for(var i = 0; i <= divide; i = i + 1) {
			var x = Math.cos((3.1415926536 * d) / 180.0);
			var z = Math.sin((3.1415926536 * d) / 180.0);
			buf.push(x);
			buf.push(1.0);
			buf.push(z);
			
			buf.push(x);
			buf.push(-1.0);
			buf.push(z);
			
			d += dd;
		}

		mesh.position = buf;
		mesh.vbo_position = this.createVBO(mesh.position);
		mesh.vbo_list.push(mesh.vbo_position);
		mesh.stride.push(3);
		mesh.attrnames.push('position');
				
		return mesh;
	};

	//------------------------------------------------------------------------------
	// createLineMesh (Cylinder)
	//------------------------------------------------------------------------------
	render.prototype.createLineMesh = function (base, divide, radius) {
		var mesh,
			qtn = new QtnIV(),
			qt  = qtn.identity(qtn.create()),
			i,
			deg,
			x0  = 0,
			x1  = 0,
			x2  = 0,
			y0  = 0,
			y1  = 0,
			y2  = 0,
			z0  = 0,
			z1  = 0,
			z2  = 0,
			cx  = 0,
			cy  = 0,
			cz  = 0,
			dx,
			dy,
			dz,
			invlen,
			vertical,
			degdelta,
			temp,
			len,
			linenum        = 0,
			restrip        = 0,
			restrip_offset = 0,

			buf            = [],
			index          = [],
			inum           = 0,
			tangent        = [],
			normal         = [];

		if(divide <= 0 || radius <= 0) {
			console.log('Error divide or radius is less then 0\n');
			console.log(divide, radius);
			return null;
		}


		//Create degreee delta
		degdelta = 360.0 / divide;
		
		//tangent
		vertical = [0, 1, 0];
		tangent  = [0, 0, 0];
		
		qt = new QtnIV();

		//---------------------------------------------------------------------
		//create vertex
		//---------------------------------------------------------------------
		for(i = 0 ; i < base.position.length; i = i + 6) {
			//get vertex per line.
			x0 = base.position[i + 0];
			y0 = base.position[i + 1];
			z0 = base.position[i + 2];
			x1 = base.position[i + 3];
			y1 = base.position[i + 4];
			z1 = base.position[i + 5];

			//calc direction
			dx  = x1 - x0;
			dy  = y1 - y0;
			dz  = z1 - z0;
			len = Math.sqrt(dx * dx + dy * dy + dz * dz);
			if(len < 0.0001) {
				dx  = 0;
				dy  = 0;
				dz  = 0;
			} else {
				dx  = dx / len;
				dy  = dy / len;
				dz  = dz / len;
			}

			//cross
			tangent[0] = dy * vertical[2] - dz * vertical[1];
			tangent[1] = dz * vertical[0] - dx * vertical[2];
			tangent[2] = dx * vertical[1] - dy * vertical[0];

			//normalize
			invlen = 1.0 / Math.sqrt(tangent[0] * tangent[0] + tangent[1] * tangent[1] + tangent[2] * tangent[2]);
			tangent[0] *= invlen;
			tangent[1] *= invlen;
			tangent[2] *= invlen;

			//create triangle vertex
			for(deg = 0; deg <= 360; deg += degdelta) {
				temp = [];
				//degrees * Math.PI / 180;
				qtn.rotate(deg * Math.PI / 180.0, [dx, dy, dz], qt);
				qtn.toVecIII(tangent, qt, temp);
				
				//v0
				buf.push(radius * temp[0] + x0);
				buf.push(radius * temp[1] + y0);
				buf.push(radius * temp[2] + z0);
				
				//v1
				buf.push(radius * temp[0] + x1);
				buf.push(radius * temp[1] + y1);
				buf.push(radius * temp[2] + z1);
				
				invlen = 1.0 / Math.sqrt(temp[0] * temp[0] + temp[1] * temp[1] + temp[2] * temp[2]);
				temp[0] *= invlen;
				temp[1] *= invlen;
				temp[2] *= invlen;
				
				//normal0
				normal.push(temp[0]);
				normal.push(temp[1]);
				normal.push(temp[2]);

				//normal1
				normal.push(temp[0]);
				normal.push(temp[1]);
				normal.push(temp[2]);
			}
			linenum = linenum + 1;
		}

		//---------------------------------------------------------------------
		//create triangle index buffer per vertex
		//---------------------------------------------------------------------
		for(i = 0 ; i < buf.length / 3; i = i + 2) {
			index.push(restrip_offset + i + 0);
			index.push(restrip_offset + i + 1);
			index.push(restrip_offset + i + 2);
			index.push(restrip_offset + i + 1);
			index.push(restrip_offset + i + 3);
			index.push(restrip_offset + i + 2);
			restrip += 2;
			if(restrip >= (divide * 2)) {
				restrip_offset = restrip_offset + 2;
				restrip = 0;
			}
		}
		
		//---------------------------------------------------------------------
		// Create Mesh
		//---------------------------------------------------------------------
		mesh = new MeshObj();
		
		//reconstruct triangle and normal.
		for(i = 0 ; i < index.length; i = i + 1) {
			inum = index[i];
			mesh.position.push(buf[inum * 3 + 0]);
			mesh.position.push(buf[inum * 3 + 1]);
			mesh.position.push(buf[inum * 3 + 2]);
			mesh.normal.push(normal[inum * 3 + 0]);
			mesh.normal.push(normal[inum * 3 + 1]);
			mesh.normal.push(normal[inum * 3 + 2]);
		}
		//console.log(mesh.position.length, mesh.position);

		mesh.vbo_position  = this.createVBO(mesh.position);
		mesh.vbo_normal    = this.createVBO(mesh.normal);
		mesh.vbo_list.push(mesh.vbo_position);
		mesh.vbo_list.push(mesh.vbo_normal);
		mesh.attrnames.push('position');
		mesh.attrnames.push('normal');
		mesh.stride.push(3);
		mesh.stride.push(3);

		return mesh;
	};
	
	//------------------------------------------------------------------------------
	// createPointMesh
	//------------------------------------------------------------------------------
	render.prototype.createPointMesh = function (base, rad, slices, stacks) {
		var mesh,
			i,
			ii,
			tr,
			tx,
			ty,
			tz,
			rx,
			ry,
			rz,
			rr,
			r,
			x0,
			y0,
			z0,
			inum,
			pos = [],
			nor = [],
			idx = [];
		

		//---------------------------------------------------------------------
		// Create Base Mesh
		//---------------------------------------------------------------------
		console.log('START : Create Base Mesh');
		for(i = 0; i <= stacks; i++) {
			r =  Math.PI / stacks * i;
			ry = Math.cos(r);
			rr = Math.sin(r);
			for(ii = 0; ii <= slices; ii++){
				tr = Math.PI * 2 / slices * ii;
				tx = rr * rad * Math.cos(tr);
				ty = ry * rad;
				tz = rr * rad * Math.sin(tr);
				rx = rr * Math.cos(tr);
				rz = rr * Math.sin(tr);
				pos.push(tx, ty, tz);
				nor.push(rx, ry, rz);
			}
		}
		r = 0;
		for(i = 0; i < stacks; i++){
			for(ii = 0; ii < slices; ii++){
				r = (slices + 1) * i + ii;
				idx.push(r, r + 1, r + slices + 2);
				idx.push(r, r + slices + 2, r + slices + 1);
			}
		}
		console.log('END : Create Base Mesh');

		//---------------------------------------------------------------------
		// Create Mesh per Point
		//---------------------------------------------------------------------
		mesh = new MeshObj();

		//reconstruct mesh
		console.log('START : Create Mesh per Point');
		for(i = 0 ; i < base.position.length; i = i + 3) {
			//get vertex per line.
			x0 = base.position[i + 0];
			y0 = base.position[i + 1];
			z0 = base.position[i + 2];

			//reconstruct triangle and normal.
			for(ii = 0 ; ii < idx.length; ii = ii + 1) {
				inum = idx[ii];
				mesh.position.push(pos[inum * 3 + 0] + x0);
				mesh.position.push(pos[inum * 3 + 1] + y0);
				mesh.position.push(pos[inum * 3 + 2] + z0);
				mesh.normal.push(nor[inum * 3 + 0]);
				mesh.normal.push(nor[inum * 3 + 1]);
				mesh.normal.push(nor[inum * 3 + 2]);
			}
		}
		console.log('DONE : Create Mesh per Point');

		mesh.vbo_position  = this.createVBO(mesh.position);
		mesh.vbo_normal    = this.createVBO(mesh.normal);
		mesh.vbo_list.push(mesh.vbo_position);
		mesh.vbo_list.push(mesh.vbo_normal);
		mesh.attrnames.push('position');
		mesh.attrnames.push('normal');
		mesh.stride.push(3);
		mesh.stride.push(3);
		return mesh;
	}
    
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
