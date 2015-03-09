/*jslint devel:true*/
/*global Float32Array, ArrayBuffer, Int16Array, QtnIV, MatIV, WGLRender, Camera, ReqFile*/

(function (loadSTLB) {
	"use strict";
	var canvas         = null,
		gl             = null,
		render         = null,
		rAF            = null,
		meshlist       = [],
		camera         = null,
		line_shader    = null,
		mesh_shader    = null,
	    scene          = {},
		global_time    = 0;

	function resetShader() {
		mesh_shader        = render.createShaderObj('vs_mesh', 'fs_mesh');
		line_shader        = render.createShaderObj('vs_line', 'fs_line');
	}

	function callbackResetView(e) {
		resetShader();
	}

	function updateInfo(vnum, pnum) {
		var info = document.getElementById('DataInfo'),
			html = '';
		info.style.color = 'black';
		info.style.left  = '20px';
		info.style.top   = (canvas.height - 100) + 'px';
		html += 'VertexNum :' + vnum + '<br>';
		html += 'PolygonNum:' + pnum + '<br>';
		info.innerHTML = html;
	}

	function updateDataTree(data)
	{
		
	}
	
	
	function updateMesh(data) {
		var point_p   = data.pos,
			point_n   = data.normal,
			stlmesh   = null,
			linemesh  = null,
			pointmesh = null,
			length    = 0;

		console.log(data);
		stlmesh = render.createMeshObj(data);
		stlmesh.setShader(mesh_shader);
		meshlist.push(stlmesh);
		//linemesh  = render.createLineMesh(stlmesh, 8, 0.3);
		//pointmesh = render.createPointMesh(stlmesh, 1.0, 16, 16);  // GLdouble radius, GLint slices, GLint stacks
		//length = Distance(data.max, data.min);
		//window.ctrl.setMoveMult(length * 0.001, length * 0.001, 1.0, length * 0.001);
		//Lerp Start : todo on off
		camera.setupLerp(data.min, data.max);
	}

	function loadSTL(evt) {
		if (evt === '') {
			return;
		}
		loadSTLB.openBinary(evt, function (data) {
			updateMesh(data);
			document.getElementById('Open').value = ''; // clear filename
		});
	}

	function onResize() {
		document.getElementById('Open').value = ''; // clear filename
		
		var w = document.getElementById('consoleOutput').style.width = window.innerWidth + 'px';
		
		render.onResize();
	}

	function startGL() {
		console.log('startGL');
		onResize();
		var gridmesh     = null,
			prevX        = 0.0,
			prevY        = 0.0,
			time         = 0.0,
			vpMatrix;

		//-------------------------------------------------------------------
		// resetShader
		//-------------------------------------------------------------------
		resetShader();
		
		//-------------------------------------------------------------------
		//CreateGrid
		//-------------------------------------------------------------------
		gridmesh = render.createGridMesh(1000, 100, 0.1);
		gridmesh.setMode('Lines');
		gridmesh.setShader(line_shader);
		meshlist.push(gridmesh);
		
		function updateFrame() {
			var cw            = canvas.width,
				ch            = canvas.height,
				wh            = 1 / Math.sqrt(cw * cw + ch * ch),
				uniLocation   = [],
				gridcolor     = [0.1, 0.1, 0.1, 1.0],
			    result        = [];

			//onResize();
			global_time = time;
			camera.updateMatrix(wh);
			vpMatrix = camera.getViewMatrix(60, canvas.width / canvas.height, 0.1, 10000.0);
			//render.clearColor(0.1, 0.1, 0.1, 1.0);
			//render.clearColor(0.2, 0.3, 0.5, 1.0);
			//render.clearColor(0.01, 0.03, 0.05, 1.0);
			render.clearColor(1.0, 1.0, 1.0, 1.0);
			render.clearDepth(1.0);
			render.frontFace(true);
			render.Depth(true);
			render.Blend(true);
			render.setViewProjection(vpMatrix);
			render.drawMeshList(meshlist, result);
			
			updateInfo(result[0].VertexNum, result[0].PolygonNum);
			
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
		document.getElementById('Open').addEventListener('change', loadSTL, false);
		
		// Create Tab
		var consoleTab = window.animtab.create('bottom', {
			'bottomTab' : { min : '10px', max : '400' }
		}, {
			'consoleOutput' : { min : '0px', max : '400px' }
		}, 'console');

		var propertyTab = window.animtab.create('right', {
			'rightTab' : { min : '0px', max : 'auto' }
		}, {
			'menuTab' : { min : '0px', max : '300px' }
		}, 'Property');

		var groups = window.animtab.create('left', {
			'leftTab' : { min : '0px', max : 'auto' }
		}, {
			'groupTab' : { min : '0px', max : '280px' }
		}, 'Groups');
		
		
		setTimeout(startGL, 250);
		
	}

	window.onload               = init;
	window.onresize             = onResize;
	window.scene                = scene;
	window.scene.updateDataTree = updateDataTree;
	

}(window.loadSTLB));
