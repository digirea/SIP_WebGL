/*jslint devel:true*/
/*global Float32Array, ArrayBuffer, Int16Array, QtnIV, MatIV, WGLRender, Camera, ReqFile*/

(function (loadSTLB) {
	"use strict";

	var canvas      = null,
		gl          = null,
		render      = null,
		rAF         = null,
		stlmesh     = null,
		camera      = null,
		qtn         = new QtnIV(),
		qt          = qtn.identity(qtn.create()),
		vertex_num  = 0,
		line_shader = null,
		mesh_shader = null;

	function resetView() {
		qtn        = new QtnIV();
		qt         = qtn.identity(qtn.create());
	}

	function reloadShader() {
		mesh_shader   = render.createShaderObj('vs_mesh', 'fs_mesh');
		line_shader   = render.createShaderObj('vs_line', 'fs_line');
	}

	function callbackResetView(e) {
		resetView();
		reloadShader();
	}

	function updateInfo(vnum, nnum) {
		var info = document.getElementById('info'),
			html = '';
		info.style.color = 'white';
		html += 'VertexNum:' + vnum + '<br>';
		html += 'NormalNum:' + nnum + '<br>';
		info.innerHTML = html;
	}

	function updateMesh(data) {
		var point_p = data.pos,
			point_n = data.normal;
		stlmesh     = render.createMeshObj(point_p, point_n, null);
		updateInfo(point_p.length / 3 / 3, point_n.length / 3 / 3);
	}

	function loadSTL(evt) {
		loadSTLB.openBinary(evt, function (data) {
			updateMesh(data);
		});
	}

	function onResize() {
		render.onResize();
	}

	function startGL() {
		onResize();
		var attLocation = [],
			attStride   = [],
			gridmesh    = null,
			gridsize    = 300.0,
			gridshift   = 10.0,
			gridcol     = 0.5,
			position    = [],
			color       = [],
			mtx         = new MatIV(),
			vMatrix     = mtx.identity(mtx.create()),
			pMatrix     = mtx.identity(mtx.create()),
			mMatrix     = mtx.identity(mtx.create()),
			tmpMatrix   = mtx.identity(mtx.create()),
			mvpMatrix   = mtx.identity(mtx.create()),
			qMatrix     = mtx.identity(mtx.create()),
			i;

		//-------------------------------------------------------------------
		//CreateGrid
		//-------------------------------------------------------------------
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
		gridmesh = render.createMeshObj(position, null, color);
		reloadShader();

		function updateFrame() {
			var qMatrix       = mtx.identity(mtx.create()),
				cw            = canvas.width,
				ch            = canvas.height,
				wh            = 1 / Math.sqrt(cw * cw + ch * ch),
				x             = 0,
				y             = 0,
				sq            = 0,
				r             = 0,
				pointSize     = 5.0,
				attStrideMesh = [],
				uniLocation   = [],
				camPos,
				camAt,
				tranRot,
				viewInfo;

			onResize();

			//calcCameraView
			viewInfo = camera.getInfo();
			camPos   = viewInfo.Pos;
			camAt    = viewInfo.At;
			tranRot  = viewInfo.Rotate;
			x        = tranRot[0];
			y        = tranRot[1];
			sq       = Math.sqrt(x * x + y * y);
			r        = sq * 2.0 * Math.PI * wh;
			if (sq !== 1) {
				sq = 1 / sq;
				x *= sq;
				y *= sq;
			}

			qtn.rotate(r, [y, x, 0.0], qt);
			qtn.toMatIV(qt, qMatrix);

			mtx.lookAt(camPos, camAt, [0, 1, 0], vMatrix);
			mtx.multiply(vMatrix, qMatrix, vMatrix);
			mtx.perspective(45, canvas.width / canvas.height, 0.1, 1000, pMatrix);
			mtx.multiply(pMatrix, vMatrix, tmpMatrix);
			
			render.clearColor(0.2, 0.2, 0.2, 1.0);
			render.clearDepth(1.0);
			render.getContext().frontFace(render.getContext().CCW);
			render.setBlend();

			if (gridmesh) {
				render.setupShader(gridmesh, line_shader);
				gridmesh.setMode('Lines');
				mtx.identity(mMatrix);
				mtx.scale(mMatrix, [1.0, 1.0, 1.0], mMatrix);
				mtx.multiply(tmpMatrix, mMatrix, mvpMatrix);
				uniLocation = render.getShaderUniformList(line_shader, ['mvpMatrix', 'pointSize']);
				render.setUniform('Matrix4fv', uniLocation[0], mvpMatrix);
				render.setUniform('1f',        uniLocation[1], pointSize);
				render.drawMesh(gridmesh);
			}

			if (stlmesh) {
				render.setupShader(stlmesh, mesh_shader);
				stlmesh.setMode('Triangles');
				//stlmesh.setMode('Points');
				mtx.identity(mMatrix);
				mtx.scale(mMatrix, [1.0, 1.0, 1.0], mMatrix);
				mtx.multiply(tmpMatrix, mMatrix, mvpMatrix);
				uniLocation = render.getShaderUniformList(mesh_shader, ['mvpMatrix', 'pointSize']);
				render.setUniform('Matrix4fv', uniLocation[0], mvpMatrix);
				render.setUniform('1f',        uniLocation[1], pointSize);
				render.drawMesh(stlmesh);
			}
			render.swapBuffer()(updateFrame);
		}
		updateFrame();
	}
	
	function init() {
		canvas = document.getElementById('canvas');
		render = new WGLRender();
		camera = new Camera();
		render.init(canvas, window);
		camera.init();
		window.ctrl.init(document, callbackResetView);
		window.ctrl.setCamera(camera);
		document.getElementById('openfile').addEventListener('change', loadSTL, false);
		startGL();
	}

	window.onload   = init;
	window.onresize = onResize;

}(window.loadSTLB));
