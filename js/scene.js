/*jslint devel:true*/
/*global Float32Array, ArrayBuffer, Int16Array, QtnIV, MatIV, WGLRender, Camera, ReqFile*/

(function (loadSTLB) {
	"use strict";

	var canvas      = null,
		gl          = null,
		render      = null,
		rAF         = null,
		stlmesh     = null,
		linemesh    = null,
		pointmesh   = null,
		camera      = null,
		qtn         = new QtnIV(),
		mtx         = new MatIV(),
		qt          = qtn.identity(qtn.create()),
		ModelMatrixXY = mtx.identity(mtx.create()),
		vertex_num  = 0,
		line_shader = null,
		mesh_shader = null,
		global_time = 0;

	function resetView() {
		qtn        = new QtnIV();
		qt         = qtn.identity(qtn.create());
		ModelMatrixXY = mtx.identity(mtx.create());
	}

	function reloadShader() {
		mesh_shader        = render.createShaderObj('vs_mesh', 'fs_mesh');
		line_shader        = render.createShaderObj('vs_line', 'fs_line');
	}

	function callbackResetView(e) {
		resetView();
		reloadShader();
	}

	function updateInfo(vnum, nnum) {
		var info = document.getElementById('Info'),
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
		/*
		linemesh    = render.createLineMesh(stlmesh, 8, 0.3);
		pointmesh   = render.createPointMesh(stlmesh, 1.0, 16, 16);  // GLdouble radius, GLint slices, GLint stacks
		*/
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
			attStride    = [],
			gridmesh     = null,
			gridsize     = 300.0,
			gridshift    = 10.0,
			gridcol      = 0.5,
			position     = [],
			color        = [],
			vMatrix      = mtx.identity(mtx.create()),
			pMatrix      = mtx.identity(mtx.create()),
			mMatrix      = mtx.identity(mtx.create()),
			tmpMatrix    = mtx.identity(mtx.create()),
			mvpMatrix    = mtx.identity(mtx.create()),
			qMatrix      = mtx.identity(mtx.create()),
			qMatrixY     = mtx.identity(mtx.create()),
			qMatrixX     = mtx.identity(mtx.create()),
			qMatrixXY    = mtx.identity(mtx.create()),
			prevX        = 0.0,
			prevY        = 0.0,
			time         = 0.0,
			i,
			cyl;

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
		
		cyl = render.createCyl(9);
		console.log(cyl);

		function updateFrame() {
			var cw            = canvas.width,
				ch            = canvas.height,
				wh            = 1 / Math.sqrt(cw * cw + ch * ch),
				x             = 0,
				y             = 0,
				sq            = 0,
				r             = 0,
				pointSize     = 7.0,
				cylMatrix     = mtx.identity(mtx.create()),
				attStrideMesh = [],
				uniLocation   = [],
				gridcolor     = [0.1, 0.1, 0.1, 1.0],
				camPos,
				camAt,
				tranRot,
				viewInfo;

			onResize();
			
			time += 0.016666666666;

			//calcCameraView
			viewInfo = camera.getInfo();
			camPos   = viewInfo.Pos;
			camAt    = viewInfo.At;
			tranRot  = viewInfo.Rotate;
			x        = tranRot[0] - prevX;
			y        = tranRot[1] - prevY;
			prevX    = tranRot[0];
			prevY    = tranRot[1];
			sq       = Math.sqrt(x * x + y * y);
			r        = sq * 2.0 * Math.PI * wh;
			if (sq !== 1) {
				sq = 1 / sq;
				x *= sq;
				y *= sq;
			}

			if (isNaN(x)) { x = 0; }
			if (isNaN(y)) { y = 0; }
			//console.log(x, y);

			qt = qtn.identity(qtn.create());
			qtn.rotate(r, [y, x, 0.0], qt);
			qtn.toMatIV(qt, qMatrixXY);
			
			mtx.multiply(qMatrixXY, ModelMatrixXY, ModelMatrixXY);

			mtx.lookAt(camPos, camAt, [0, 1, 0], vMatrix);
			mtx.multiply(vMatrix, ModelMatrixXY, vMatrix);
			
			mtx.perspective(60, canvas.width / canvas.height, 0.1, 1000, pMatrix);
			mtx.multiply(pMatrix, vMatrix, tmpMatrix);
			
			//Clear
			//render.clearColor(0.1, 0.1, 0.1, 1.0);
			render.clearColor(0.2, 0.2, 0.2, 1.0);
			//render.clearColor(0.0, 0.0, 0.0, 1.0);
			render.clearDepth(1.0);
			render.getContext().frontFace(render.getContext().CCW);

			//Grid Mesh
			if (gridmesh) {
				render.setupShader(gridmesh, line_shader);
				render.Blend(true);
				gridmesh.setMode('Lines');
				mtx.identity(mMatrix);
				mtx.scale(mMatrix, [1.0, 1.0, 1.0], mMatrix);
				mtx.multiply(tmpMatrix, mMatrix, mvpMatrix);
				uniLocation = render.getShaderUniformList(line_shader, ['mvpMatrix', 'color']);
				render.setUniform('Matrix4fv', uniLocation[0], mvpMatrix);
				render.setUniform('4fv',       uniLocation[1], gridcolor);
				render.drawMesh(gridmesh);
			}
			
			//STL Mesh
			if (stlmesh) {
				render.setupShader(stlmesh, mesh_shader);
				mtx.identity(mMatrix);
				mtx.scale(mMatrix, [1.0, 1.0, 1.0], mMatrix);
				mtx.multiply(tmpMatrix, mMatrix, mvpMatrix);
				uniLocation = render.getShaderUniformList(mesh_shader, ['mvpMatrix', 'vpMatrix']);
				render.setUniform('Matrix4fv', uniLocation[0], mvpMatrix);
				render.setUniform('Matrix4fv', uniLocation[1], tmpMatrix);
				render.Depth(true);
				render.drawMesh(stlmesh);
			}
			
			/*
			
			//Line(Cylinder)
			if(linemesh) {
				render.setupShader(linemesh, mesh_shader);
				mtx.identity(mMatrix);
				mtx.scale(mMatrix, [1.0, 1.0, 1.0], mMatrix);
				mtx.multiply(tmpMatrix, mMatrix, mvpMatrix);
				uniLocation = render.getShaderUniformList(mesh_shader, ['mvpMatrix', 'vpMatrix']);
				render.setUniform('Matrix4fv', uniLocation[0], mvpMatrix);
				render.setUniform('Matrix4fv', uniLocation[1], tmpMatrix);
				render.Depth(true);
				render.drawMesh(linemesh);
			}

			//Point(Sphere)
			if(pointmesh) {
				render.setupShader(pointmesh, mesh_shader);
				mtx.identity(mMatrix);
				mtx.scale(mMatrix, [1.0, 1.0, 1.0], mMatrix);
				mtx.multiply(tmpMatrix, mMatrix, mvpMatrix);
				uniLocation = render.getShaderUniformList(mesh_shader, ['mvpMatrix', 'vpMatrix']);
				render.setUniform('Matrix4fv', uniLocation[0], mvpMatrix);
				render.setUniform('Matrix4fv', uniLocation[1], tmpMatrix);
				render.Depth(true);
				render.drawMesh(pointmesh);
			}
			*/

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
