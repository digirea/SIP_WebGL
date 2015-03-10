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
		model_id       = 0,
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
		console.log(meshlist);
		var i;
		var k;
		for(i = 0; i < meshlist.length; i = i + 1) {
			console.log(meshlist[i].name, data);
			
			if(meshlist[i].name === data.name) {
				console.log(data);
				for(k = 0 ; k < data.input.length; k = k + 1) {
					if(data.input[k].name === 'trans')
					{
						meshlist[i].trans = data.input[k].value;
					}
					if(data.input[k].name === 'rotate')
					{
						meshlist[i].rotate = data.input[k].value;
					}
					if(data.input[k].name === 'scale')
					{
						meshlist[i].scale = data.input[k].value;
					}
					if(data.input[k].name === 'color')
					{
						meshlist[i].diffColor = data.input[k].value;
					}
					if(data.input[k].name === 'radius')
					{
						meshlist[i].radius = data.input[k].value;
					}
					
				}
			}
		}
	}

	function AddRootTree(data)
	{
		datatree.addData(data.name, data.name);
		window.grouptreeview.update(datatree.getRoot());
	}
	
	function updateMesh(data) {
		var point_p   = data.pos,
			point_n   = data.normal,
			stlmesh   = null,
			linemesh  = null,
			pointmesh = null,
			node      = {},
			length    = 0;

		console.log(data);
		stlmesh = render.createMeshObj(data);
		data.name = data.name + model_id;
		model_id++;
		stlmesh.name = data.name;
		stlmesh.setShader(mesh_shader);
		meshlist.push(stlmesh);
		datatree.createChild(data.name, 0, stlmesh);
		window.grouptreeview.update(datatree.getRoot());
		
		//linemesh  = render.createLineMesh(stlmesh, 8, 0.3);
		//pointmesh = render.createPointMesh(stlmesh, 1.0, 16, 16);  // GLdouble radius, GLint slices, GLint stacks
		//length = Distance(data.max, data.min);
		//window.ctrl.setMoveMult(length * 0.001, length * 0.001, 1.0, length * 0.001);
		//Lerp Start : todo on off
		
		camera.setupLerp(data.min, data.max);
	}

	function updateMeshText(name, pos) {
	  var mesh = {'position':pos},
	      linemesh,
	      pointmesh;
		linemesh = render.createLineMesh(mesh, 8, 0.5);
		linemesh.name = name + '_line';
		pointmesh = render.createPointMesh(mesh, 1.0, 16, 16);
		pointmesh.name = name + '_ball';
		
		linemesh.setShader(mesh_shader);
		pointmesh.setShader(mesh_shader);
		meshlist.push(linemesh);
		meshlist.push(pointmesh);
		datatree.createChild(linemesh.name, 0, linemesh);
		datatree.createChild(pointmesh.name, 0, pointmesh);
		window.grouptreeview.update(datatree.getRoot());
	  //console.log(linemesh);
		//camera.setupLerp(linemesh.boundmin, linemesh.boundmax);
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
	  var i;
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
			rootnode     = {},
			vpMatrix;

		//-------------------------------------------------------------------
		// resetShader
		//-------------------------------------------------------------------
		resetShader();
		
		//-------------------------------------------------------------------
		//CreateGrid
		//-------------------------------------------------------------------
		gridmesh = render.createGridMesh(1000, 100, 0.5);
		gridmesh.setMode('Lines');
		gridmesh.setShader(line_shader);
		meshlist.push(gridmesh);
		datatree.addData('root', ['ROOT']);
		datatree.createChild('Grid', 0, gridmesh);
		window.grouptreeview.update(datatree.getRoot());
		
		function updateFrame() {
			var cw            = canvas.width,
				ch            = canvas.height,
				wh            = 1 / Math.sqrt(cw * cw + ch * ch),
				uniLocation   = [],
				gridcolor     = [0.1, 0.1, 0.1, 1.0],
				result        = [],
				camZ          = 0;

			//onResize();
			global_time = time;
			camera.updateMatrix(wh);
			camZ = camera.getCamPosZ();
			if(camZ === 0) {
				vpMatrix = camera.getViewMatrix(60, canvas.width / canvas.height, 0.1, 2560);
			} else {
				console.log(camZ);
				vpMatrix = camera.getViewMatrix(60, canvas.width / canvas.height, camZ * 0.002, camZ * 4.0);
			}
			//render.clearColor(0.5, 0.5, 0.5, 1.0);
			render.clearColor(0.1, 0.1, 0.1, 1.0);
			//render.clearColor(0.2, 0.3, 0.5, 1.0);
			//render.clearColor(0.01, 0.03, 0.05, 1.0);
			//render.clearColor(1.0, 1.0, 1.0, 1.0);
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
	
	
	function addGroup() {
		var checklist = [],
				coldata   = [],
	      pos       = [],
				name      = 'Group',
	      col,
			  i,
			  j;
	  var hstable = document.getElementById('hstable');
	  var clonetable = hstable.getElementsByClassName('ht_clone_top');
	  var checkboxs = clonetable[0].getElementsByClassName('colcheckbox');
	  for(i = 0 ; i < checkboxs.length; i = i + 1) {
			var checkbox = document.getElementById('colcheckbox' + i);
			if(checkboxs[i].checked) {
				checklist.push(i);
			}
		}
		for(i = 0 ; i < checklist.length; i++) {
			coldata.push(window.hstable.getCol(checklist[i]));
		}
		
		console.log(coldata);
	  for(j = 0 ; j < coldata.length; j = j + 1) {
	    col = coldata[j];
	    for(i = 0 ; i < col.length - 1; i = i + 1) {
	    	pos[i * 3 + j] = parseFloat(col[i]);
	    }
	  }
		
		
		//Create Name
		for(i = 0 ; i < checklist.length; i++) {
			name = name + '_' + checklist[i];
		}
		
	  updateMeshText(name, pos);
	  
	}
	
	
	function init() {
	  var addgroup = document.getElementById('AddGroup'),
	     deletegroup = document.getElementById('DeleteGroup');
	  
	  
	  
	  
		canvas = document.getElementById('canvas');
		render = new WGLRender();
		camera = new Camera();
		render.init(canvas, window);
		camera.init();
		window.ctrl.init(document, callbackResetView);
		window.ctrl.setCamera(camera);
		document.getElementById('Open').addEventListener('change', loadSTL, false);
	  
	  addgroup.onclick = addGroup;
		
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
	window.scene.AddRootTree    = AddRootTree;
	

}(window.loadSTLB));
