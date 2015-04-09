/*jslint devel:true*/
/*global $, Float32Array, ArrayBuffer, Int16Array, QtnIV, MatIV, canvas, ShaderObj, MeshObj*/

var WGLRender;

(function () {
	"use strict";
	/**
	 * コンストラクタ
	 * @method render
	 */
	var render = function () {
		this.gl     = null;
		this.window = null;
		this.canvas = null;
		this.rAF    = null;
		this.mtx    = new MatIV();
		this.eyeDir = [0, 0, 0, 1];
		this.vMat   = this.mtx.identity(this.mtx.create());
		this.vpMat  = this.mtx.identity(this.mtx.create());
	};

	/**
	 * ビュープロジェクション行列の設定
	 * @method setViewProjection
	 * @param {Matrix} m ビュープロジェクション行列
	 */
	render.prototype.setViewProjection = function (m) {
		this.vpMat = m;
	};

	/**
	 * ビュー行列設定
	 * @method setViewProjection
	 * @param {Matrix} m ビュー行列
	 */
	render.prototype.setView = function (m) {
		this.vMat = m;
	};
	

	/**
	 * 初期化
	 * @method init
	 * @param {Object} canvas キャンバスオブジェクト
	 * @param {Object} window ウィンドウオブジェクト
	 */
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

	/**
	 * リサイズコールバック
	 * @method onResize
	 */
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

	/**
	 * 画面クリア
	 * @method clearColor
	 * @param {Number} r 赤
	 * @param {Number} g 緑
	 * @param {Number} b 青
	 * @param {Number} a アルファ
	 */
	render.prototype.clearColor = function (r, g, b, a) {
		this.gl.clearColor(r, g, b, a);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
	};

	/**
	 * 深度のクリア
	 * @method clearDepth
	 * @param {Number} d 深度値
	 */
	render.prototype.clearDepth = function (d) {
		this.gl.clearDepth(d);
		this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
	};

	/**
	 * glコンテキストの取得
	 * @method getContext
	 * @return gl glコンテキスト
	 */
	render.prototype.getContext = function () {
		return this.gl;
	};
	
	/**
	 * glフラッシュ
	 * @method Flush
	 */
	render.prototype.Flush = function () {
		this.gl.flush();
	};
	
	/**
	 * glスワップバッファ
	 * @method swapBuffer
	 * @return RequestAnimationFrame リクエストアニメーションフレームファンクション
	 */
	render.prototype.swapBuffer = function () {
		return this.rAF;
	};

	/**
	 * デプステストの有効無効の設定
	 * @method Depth
	 * @param {Boolean} enable trueなら有効.falseなら無効.
	 */
	render.prototype.Depth = function (enable) {
		if (enable === true) {
			this.gl.enable(this.gl.DEPTH_TEST);
		} else {
			this.gl.disable(this.gl.DEPTH_TEST);
		}
	};
	
	/**
	 * BlendFuncの設定
	 * @method Blend
	 * @param {Boolean} enable trueなら有効.falseなら無効.
	 */
	render.prototype.Blend = function (enable) {
		if (enable === true) {
			this.gl.depthFunc(this.gl.LEQUAL);
			this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE, this.gl.ONE);
			this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
			this.gl.enable(this.gl.BLEND);
		} else {
			this.gl.disable(this.gl.BLEND);
		}
	};

	/**
	 * シェーダの作成
	 * @method createShader
	 * @param {String} type 作成するシェーダのタイプ
	 * @param {String} text シェーダ文字列
	 */
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

	/**
	 * IDによりシェーダを作成する.
	 * @method createShaderById
	 * @param {String} id 対象エレメントのID
	 * @return shader シェーダオブジェクト
	 */
	render.prototype.createShaderById = function (id) {
		var ele = document.getElementById(id);
		if (!ele) {
			return;
		}
		return this.createShader(ele.type, ele.text);
	};

	/**
	 * シェーダプログラムの作成
	 * @method createProgram
	 * @param {Object} vs 頂点シェーダオブジェクト
	 * @param {Object} fs フラグメントシェーダオブジェクト
	 * @return program シェーダプログラムオブジェクト
	 */
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

	/**
	 * 頂点バッファオブジェクトの作成.
	 * @method createVBO
	 * @param {Array} data 頂点配列データ
	 * @return vbo VBO
	 */
	render.prototype.createVBO = function (data) {
		var vbo = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
		this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
		return vbo;
	};

	/**
	 * インデックスバッファオブジェクトの作成
	 * @method createIBO
	 * @param {Array} data インデックス配列データ
	 * @return ibo
	 */
	render.prototype.createIBO = function (data) {
		var ibo = this.gl.createBuffer();
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
		this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);
		this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
		return ibo;
	};

	/**
	 * アトリビュートの設定
	 * @method setAttribute
	 * @param {Object} vbo 頂点バッファオブジェクト
	 * @param {Array} attL 頂点属性のインデックスのリスト
	 * @param {Array} attS 頂点属性の要素数のリスト
	 */
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

	/**
	 * AttribuetLocationリストの取得
	 * @method getAttribList
	 * @param {Object} prg シェーダプログラムオブジェクト
	 * @param {Array} namearray IDリスト
	 * @return location AttribuetLocationリスト
	 */
	render.prototype.getAttribList = function (prg, namearray) {
		var i,
			location = [];
		for (i = 0; i < namearray.length; i = i + 1) {
			location[i] = this.gl.getAttribLocation(prg, namearray[i]);
		}
		return location;
	};


	/**
	 * ライン幅の設定
	 * @method lineWidth
	 * @param {Number} w ライン幅
	 */
	render.prototype.lineWidth = function (w) {
		this.gl.lineWidth(w);
	};
	
	/**
	 * UnicormLocationのリストを取得
	 * @method getUniformList
	 * @param {Object} prg シェーダプログラムオブジェクト
	 * @param {Array} namearray IDリスト
	 * @return location UnicormLocationのリスト
	 */
	render.prototype.getUniformList = function (prg, namearray) {
		var i,
			location = [];
		for (i = 0; i < namearray.length; i = i + 1) {
			location[i] = this.gl.getUniformLocation(prg, namearray[i]);
		}
		return location;
	};

	/**
	 * Uniform値の設定
	 * @method setUniform
	 * @param {String} type Uniformタイプ
	 * @param {Number} location Uniform Location
	 * @param {Object} data データ
	 */
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

	/**
	 * 描画.
	 * @method drawArrays
	 * @param {String} type 描画タイプ
	 * @param {Number} index インデックス
	 * @param {Number} primnum プリミティブ数
	 */
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
	/**
	 * シェーダオブジェクトの作成
	 * @method createShaderObj
	 * @param {String} vs 頂点シェーダID
	 * @param {String} fs フラグメントシェーダID
	 * @return ShaderObj シェーダオブジェクト
	 */
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

	/**
	 * Uniformリストの取得
	 * @method getShaderUniformList
	 * @param {ShaderObj} shader シェーダオブジェクト
	 * @param {Array} namearray Unifrom ID リスト
	 * @return CallExpression
	 */
	render.prototype.getShaderUniformList = function (shader, namearray) {
		return this.getUniformList(shader.program, namearray);
	};

	/**
	 * シェーダのセットアップ
	 * @method setupShader
	 * @param {Object} mesh メッシュ
	 * @param {ShaderObj} shader シェーダオブジェクト
	 */
	render.prototype.setupShader = function (mesh, shader) {
		this.gl.useProgram(shader.program);
		mesh.attlocation = this.getAttribList(shader.program, mesh.attrnames);
	};

	/**
	 * 前面の設定
	 * @method frontFace
	 * @param {Boolean} isccw trueなら反時計回りが表.falseなら時計回り.
	 */
	render.prototype.frontFace = function (isccw) {
		this.gl.frontFace(this.gl.CCW);
	};
	
	//------------------------------------------------------------------------------
	// getMeshBoundingBox
	//------------------------------------------------------------------------------
	/**
	 * メッシュのBBoxを取得.
	 * @method getMeshBoundingBox
	 * @param {Object} mesh メッシュ
	 * @param {Vector} bmin BBox最小値
	 * @param {Vector} bmax BBox最大値
	 * @return ObjectExpression
	 */
	render.prototype.getMeshBoundingBox = function (mesh, bmin, bmax) {
		var i,
			isnan = false,
			dummy_const = 1000;

		for (i = 0; i < mesh.position.length; i = i + 3) {
			if (mesh.position[i + 0] !== mesh.position[i + 0]) {
				console.log("NAN:", i);
				isnan = true;
			}
			if (mesh.position[i + 1] !== mesh.position[i + 1]) {
				console.log("NAN:", i);
				isnan = true;
			}
			if (mesh.position[i + 2] !== mesh.position[i + 2]) {
				console.log("NAN:", i);
				isnan = true;
			}

			if (isnan === true) {
				break;
			}
			
			GetMinMax(bmin, bmax, [mesh.position[i + 0], mesh.position[i + 1], mesh.position[i + 2]]);
		}

		if (isnan === true) {
			bmin[0] = -dummy_const;
			bmin[1] = -dummy_const;
			bmin[2] = -dummy_const;
			bmax[0] = dummy_const;
			bmax[1] = dummy_const;
			bmax[2] = dummy_const;
		}

		console.log('BB:', bmin, bmax);
		return {'min' : bmin, 'max' : bmax};
	};

	//------------------------------------------------------------------------------
	// setupMeshBoundingBox
	//------------------------------------------------------------------------------
	/**
	 * メッシュBBoxのセットアップ
	 * @method setupMeshBoundingBox
	 * @param {Object} mesh メッシュ
	 * @return ret BBox
	 */
	render.prototype.setupMeshBoundingBox = function (mesh) {
		var i,
			maxValue       = 9999999,
			bmin           = [maxValue, maxValue, maxValue],
			bmax           = [-maxValue, -maxValue, -maxValue],
			ret;
		
		
		//calc bb
		ret = this.getMeshBoundingBox(mesh, bmin, bmax);
		mesh.boundmin = bmin;
		mesh.boundmax = bmax;
		
		console.log(mesh);
		return ret;
	};
	
	//------------------------------------------------------------------------------
	// MESHOBJ
	//------------------------------------------------------------------------------
	/**
	 * メッシュオブジェクトの作成
	 * @method createMeshObj
	 * @param {Object} data メッシュデータ
	 * @return mesh メッシュオブジェクト
	 */
	render.prototype.createMeshObj = function (data) {
		var mesh        = new MeshObj();
		if (data.pos) {
			console.log('CREATE : position');
			mesh.position     = data.pos;
			mesh.vbo_position = this.createVBO(mesh.position);
			mesh.vbo_list.push(mesh.vbo_position);
			mesh.stride.push(3);
			mesh.attrnames.push('position');
		}

		if (data.normal) {
			console.log('CREATE : normal');
			mesh.normal     = data.normal;
			mesh.vbo_normal = this.createVBO(mesh.normal);
			mesh.vbo_list.push(mesh.vbo_normal);
			mesh.stride.push(3);
			mesh.attrnames.push('normal');
		}

		if (data.color) {
			console.log('CREATE : color');
			mesh.color   = data.color;
			mesh.vbo_col = this.createVBO(mesh.color);
			mesh.vbo_list.push(mesh.vbo_col);
			mesh.stride.push(4);
			mesh.attrnames.push('color');
		}
		
		if (data.min) {
			mesh.boundmin = data.min;
			console.log(mesh.boundmin);
		}
		
		if (data.max) {
			mesh.boundmax = data.max;
			console.log(mesh.boundmax);
		}
		
		if (!data.min || !data.max) {
			console.log('WARNING : undef min max calc BB');
			this.setupMeshBoundingBox(mesh);
			console.log('WARNING : DONEmin max calc BB');
		}
		
		return mesh;
	};

	/**
	 * メッシュオブジェクトの削除
	 * @method createMeshObj
	 * @param {Object} data メッシュデータ
	 * @return mesh 空のメッシュオブジェクト
	 */
	render.prototype.deleteMeshObj = function (mesh) {
		var i;
		for (i = 0 ; i < mesh.vbo_list.length; i = i + 1) {
			this.gl.deleteBuffer(mesh.vbo_list[i]);
		}
		console.log('Delete Mesh : ', mesh);
		mesh.clear();
		mesh        = new MeshObj();
		return mesh;
	};

	//------------------------------------------------------------------------------
	// createLineMesh (Cylinder)
	//------------------------------------------------------------------------------
	/**
	 * ラインメッシュの作成
	 * @method createLineMesh
	 * @param {Array} base 基準点リスト
	 * @param {Number} divide 分割数
	 * @param {Number} radius 半径
	 * @return mesh メッシュオブジェクト
	 */
	render.prototype.createLineMesh = function (base, divide, radius) {
		var qtn = new QtnIV(),
			qt  = qtn.identity(qtn.create()),
			i   = 0,
			di  = 0,
			deg = 0,
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
			pointmax = 0,
			dx  = 0,
			dy  = 0,
			dz  = 0,
			len = 0,
			invlen = 0,
			vertical,
			degdelta,
			temp,
			restrip        = 0,
			restrip_offset = 0,
			buf            = [],
			pos            = [],
			index          = [],
			inum           = 0,
			tangent        = [],
			normal         = [],
			reconstnoremal = [],
			primvertex     = divide * 2,
			number,
			mesh;

		if (divide <= 0 || radius <= 0) {
			console.log('Error divide or radius is less then 0\n');
			console.log(divide, radius);
			return null;
		}

		number = Math.floor(base.position.length / 6);

		//Create degreee delta
		degdelta = 360.0 / divide;
		
		//tangent
		vertical = [0, 1, 0];
		tangent  = [0, 0, 0];
		
		qt = new QtnIV();

		//---------------------------------------------------------------------
		//create vertex
		//---------------------------------------------------------------------
		pointmax = base.position.length;
		pointmax = pointmax - (pointmax % 6)
		for (i = 0; i < pointmax; i = i + 6) {
			//get vertex per line.
			x0 = base.position[i];
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
			if (len < 0.0001) {
				dx  = 0;
				dy  = 0;
				dz  = 0;
			} else {
				dx  = dx / len;
				dy  = dy / len;
				dz  = dz / len;
			}

			tangent = Cross([dx, dy, dz], vertical);
			tangent = Normalize(tangent);

			deg = 0;
			for (di = 0; di < divide ; di = di + 1) {
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
				normal.push(temp[0], temp[1], temp[2]);

				//normal1
				normal.push(temp[0], temp[1], temp[2]);
				deg += degdelta;
			}
		}

		//---------------------------------------------------------------------
		//create triangle index buffer per vertex
		//---------------------------------------------------------------------
		for (i = 0; i < number ; i = i + 1) {
			restrip_offset = i * primvertex;
			for (di = 0; di < primvertex; di = di + 1) {
				if( (di & 1) === 0) {
					index.push(
						restrip_offset + ((di + 0) % primvertex),
						restrip_offset + ((di + 1) % primvertex),
						restrip_offset + ((di + 2) % primvertex));
				} else {
					index.push(
						restrip_offset + ((di + 0) % primvertex),
						restrip_offset + ((di + 2) % primvertex),
						restrip_offset + ((di + 1) % primvertex));
				}
			}
		}
		
		//reconstruct triangle and normal.
		for (i = 0; i < index.length; i = i + 1) {
			inum = index[i];
			pos.push(buf[inum * 3], buf[inum * 3 + 1], buf[inum * 3 + 2]);
			reconstnoremal.push(normal[inum * 3],  normal[inum * 3 + 1], normal[inum * 3 + 2]);
		}
		mesh = this.createMeshObj({'pos' : pos, 'normal' : reconstnoremal});
		mesh.pointposition = base.position;
		return mesh;
	};
	
	
	//------------------------------------------------------------------------------
	// createGridMesh
	//------------------------------------------------------------------------------
	/**
	 * Description
	 * @method createGridMesh
	 * @param {Number} gridsize グリッドサイズ
	 * @param {Number} gridshift グリッド間隔
	 * @param {Number} gridcol グリッド色
	 * @return mesh メッシュオブジェクト
	 */
	render.prototype.createGridMesh = function (gridsize, gridshift, gridcol) {
		var i,
			position     = [],
			color        = [],
			mesh;

		for (i = -gridsize; i <= gridsize; i += gridshift) {
			position.push(gridsize, 0, i);
			position.push(-gridsize, 0, i);
			position.push(i, 0, gridsize);
			position.push(i, 0, -gridsize);
			color.push(gridcol, gridcol, gridcol, 1.0);
			color.push(gridcol, gridcol, gridcol, 1.0);
			color.push(gridcol, gridcol, gridcol, 1.0);
			color.push(gridcol, gridcol, gridcol, 1.0);
		}
		mesh = this.createMeshObj({'pos' : position, 'color' : color});
		mesh.pointposition = position;
		return mesh;
	};
	
	
	//------------------------------------------------------------------------------
	// createGridMesh
	//------------------------------------------------------------------------------
	/**
	 * 軸を示すギズモメッシュの作成
	 * @method createGizmoMesh
	 * @param {Number} size サイズ
	 * @return mesh メッシュオブジェクト
	 */
	render.prototype.createGizmoMesh = function (size) {
		var i,
			l = size,
			position     = [],
			color        = [],
			mesh;

		//X
		position.push(0, 0.001, 0);
		position.push(l, 0, 0);
		color.push(1, 0, 0, 1);
		color.push(1, 0, 0, 1);

		//Y
		position.push(0, 0.001, 0);
		position.push(0, -l, 0);
		color.push(0, 1, 0, 1);
		color.push(0, 1, 0, 1);
		
		//Z
		position.push(0, 0.001, 0);
		position.push(0, 0, l);
		color.push(0, 0, 1, 1);
		color.push(0, 0, 1, 1);

		mesh = this.createMeshObj({'pos' : position, 'color' : color});
		mesh.setMode('Lines');
		return mesh;
	};
	
	
	
	//------------------------------------------------------------------------------
	// createPointMesh
	//------------------------------------------------------------------------------
	/**
	 * ポイントメッシュの作成
	 * @method createPointMesh
	 * @param {Array} base 頂点リスト
	 * @param {Number} rad 半径
	 * @param {Number} slices スライス数
	 * @param {Number} stacks スタック数
	 * @return mesh メッシュオブジェクト
	 */
	render.prototype.createPointMesh = function (base, rad, slices, stacks) {
		var i,
			ii,
			px,
			py,
			pz,
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
			pos            = [],
			nor            = [],
			idx            = [],
			position       = [],
			positionarray  = [],
			positionconcat = [],
			normal         = [],
			normalarray    = [],
			normalconcat   = [],
			mesh;

		//---------------------------------------------------------------------
		// Create Base Mesh
		//---------------------------------------------------------------------
		for (i = 0; i <= stacks; i = i + 1) {
			r =  Math.PI / stacks * i;
			ry = Math.cos(r);
			rr = Math.sin(r);
			for (ii = 0; ii <= slices; ii = ii + 1) {
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
		for (i = 0; i < stacks; i = i + 1) {
			for (ii = 0; ii < slices; ii = ii + 1) {
				r = (slices + 1) * i + ii;
				idx.push(r, r + 1, r + slices + 2);
				idx.push(r, r + slices + 2, r + slices + 1);
			}
		}

		//---------------------------------------------------------------------
		// Create Mesh per Point
		//---------------------------------------------------------------------
		//reconstruct mesh
		console.log('START reconstruct mesh');
		for (i = 0; i < base.position.length; i = i + 3) {
			//get vertex per line.
			x0 = base.position[i];
			y0 = base.position[i + 1];
			z0 = base.position[i + 2];

			//reconstruct triangle and normal.
			for (ii = 0; ii < idx.length; ii = ii + 1) {
				inum = idx[ii];
				px = pos[inum * 3 + 0] + x0;
				py = pos[inum * 3 + 1] + y0;
				pz = pos[inum * 3 + 2] + z0;
				if (px !== px) { px = 0; }
				if (py !== py) { py = 0; }
				if (pz !== pz) { pz = 0; }
				
				position.push(px, py, pz);
				normal.push(nor[inum * 3], nor[inum * 3 + 1], nor[inum * 3 + 2]);
			}
		}
		mesh = this.createMeshObj({'pos' : position, 'normal' : normal});
		mesh.radius = rad;
		mesh.pointposition = base.position;
		mesh.primtype = 'point';
		
		return mesh;
	};
    
	
	render.prototype.getLocalMatrixFromMesh = function (mesh) {
		var lMatrix     = this.mtx.identity(this.mtx.create()),
			tMatrix     = this.mtx.identity(this.mtx.create()),
			sMatrix     = this.mtx.identity(this.mtx.create()),
			rMatrixX    = this.mtx.identity(this.mtx.create()),
			rMatrixY    = this.mtx.identity(this.mtx.create()),
			rMatrixZ    = this.mtx.identity(this.mtx.create()),
			rMatrix     = this.mtx.identity(this.mtx.create());

		//create translate matrix
		this.mtx.translate(tMatrix,  mesh.trans, tMatrix);

		//create scalling matrix
		this.mtx.scale(sMatrix,      mesh.scale, sMatrix);

		//create rotate matrix
		this.mtx.rotate(rMatrixX,    (Math.PI * mesh.rotate[0]) / 180.0, [1, 0, 0], rMatrixX);
		this.mtx.rotate(rMatrixY,    (Math.PI * mesh.rotate[1]) / 180.0, [0, 1, 0], rMatrixY);
		this.mtx.rotate(rMatrixZ,    (Math.PI * mesh.rotate[2]) / 180.0, [0, 0, 1], rMatrixZ);
		this.mtx.multiply(rMatrixX,  rMatrix, rMatrix);
		this.mtx.multiply(rMatrixY,  rMatrix, rMatrix);
		this.mtx.multiply(rMatrixZ,  rMatrix, rMatrix);

		//scale rotate transform
		this.mtx.multiply(sMatrix,  lMatrix, lMatrix);
		this.mtx.multiply(rMatrix,  lMatrix, lMatrix);
		this.mtx.multiply(tMatrix,  lMatrix, lMatrix);
		
		return lMatrix;
	}
	
	render.prototype.setupEyeDir = function (pos, at) {
		this.eyeDir = Normalize(Sub(pos, at));
	}
	
	//---------------------------------------------------------------------
	// DrawMesh
	//---------------------------------------------------------------------
	/**
	 * メッシュ描画
	 * @method drawMesh
	 * @param {Object} mesh 描画するメッシュ
	 */
	render.prototype.drawMesh = function (mesh) {
		var primnum     = 0,
			wMatrix     = this.getLocalMatrixFromMesh(mesh),
			lMatrix     = this.mtx.identity(this.mtx.create()),
			program     = mesh.shader.program,
			shader      = mesh.shader,
			uniformname = ['mvpMatrix', 'vMatrix', 'vpMatrix', 'wMatrix', 'eyeDir', 'uColor', 'Radius'],
			attLocation = [],
			ed          = [this.eyeDir[0], this.eyeDir[1], this.eyeDir[2], 0],
			uniLocation = [];

		//create trasnfrom matrix
		this.mtx.multiply(this.vpMat, wMatrix, lMatrix);

		//setup shader parameter
		this.gl.useProgram(program);
		uniLocation = this.getShaderUniformList(shader, uniformname);
		attLocation = this.getAttribList(program, mesh.attrnames);
		if (uniLocation[0] !== null) { this.setUniform('Matrix4fv', uniLocation[0], lMatrix); }
		if (uniLocation[1] !== null) { this.setUniform('Matrix4fv', uniLocation[1], this.vMat); }
		if (uniLocation[2] !== null) { this.setUniform('Matrix4fv', uniLocation[2], this.vpMat); }
		if (uniLocation[3] !== null) { this.setUniform('Matrix4fv', uniLocation[3], wMatrix); }
		if (uniLocation[4] !== null) { this.setUniform('4fv',       uniLocation[4], ed); }
		if (uniLocation[5] !== null) { this.setUniform('4fv',       uniLocation[5], mesh.diffColor); }
		if (uniLocation[6] !== null) { this.setUniform('1f',        uniLocation[6], mesh.radius); }
		this.setAttribute(mesh.vbo_list, attLocation, mesh.stride);
		if (mesh.mode === 'Points') {
			primnum = mesh.position.length / 3;
		} else {
			primnum = mesh.position.length / 3;
		}
		this.drawArrays(mesh.mode, 0, primnum);
		this.gl.useProgram(null);
	};
	
	//---------------------------------------------------------------------
	// DrawMeshList
	//---------------------------------------------------------------------
	/**
	 * Description
	 * @method drawMeshList
	 * @param {Array} meshlist メッシュリスト
	 * @param {Array} result 描画した頂点数、ポリゴン数がpushされる
	 */
	render.prototype.drawMeshList = function (meshlist, result) {
		var primnum    = 0,
			VertexNum  = 0,
			PolygonNum = 0,
			i          = 0,
			ref        = meshlist;
		for (i = 0; i < ref.length; i = i + 1) {
			if (ref[i].show == true) {
				this.drawMesh(ref[i]);
				VertexNum += ref[i].position.length / 3;
			}
		}
		PolygonNum = VertexNum / 3;
		result.push({'VertexNum' : VertexNum, 'PolygonNum' : PolygonNum});
	};

	WGLRender = render;
}());

