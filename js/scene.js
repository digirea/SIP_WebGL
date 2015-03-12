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
		model_id       = 0;
	
	function GetModelId()
	{
		var ret = model_id;
		model_id++;
		return ret;
	}

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
				camera.setupLerp(meshlist[i].boundmin, meshlist[i].boundmax, meshlist[i].trans);
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
			child,
			linemesh  = null,
			pointmesh = null,
			node      = {},
			length    = 0;

		console.log(data);
		stlmesh = render.createMeshObj(data);
		data.name = data.name + GetModelId();
		stlmesh.name = data.name;
		stlmesh.setShader(mesh_shader);
		meshlist.push(stlmesh);
		child = datatree.createChild(data.name, 0, stlmesh);
		window.grouptreeview.update(datatree.getRoot(), child);
		
		//linemesh  = render.createLineMesh(stlmesh, 8, 0.3);
		//pointmesh = render.createPointMesh(stlmesh, 1.0, 16, 16);  // GLdouble radius, GLint slices, GLint stacks
		//length = Distance(data.max, data.min);
		//window.ctrl.setMoveMult(length * 0.001, length * 0.001, 1.0, length * 0.001);
		//Lerp Start : todo on off
		
		camera.setupLerp(data.min, data.max);
	}

	
	function selectTreeNode(node) {
		console.log(node);
		camera.setupLerp(node.data.boundmin, node.data.boundmax, node.data.trans);
		
	}
	
	function updateMeshText(name, pos) {
	  var mesh = {'position':pos},
			bb,
			child,
			linemesh,
			pointmesh;
		linemesh  = render.createLineMesh(mesh, 8, 0.5);
		pointmesh = render.createPointMesh(mesh, 1.0, 16, 16);
		console.log(linemesh.boundmin, linemesh.boundmax);
		console.log(pointmesh.boundmin, pointmesh.boundmax);
		linemesh.name = name + '_line';
		pointmesh.name = name + '_ball';
		
		linemesh.setShader(mesh_shader);
		pointmesh.setShader(mesh_shader);
		meshlist.push(linemesh);
		meshlist.push(pointmesh);
		child = datatree.createChild(linemesh.name, 0, linemesh);
		datatree.createChild(pointmesh.name, 0, pointmesh);
		window.grouptreeview.update(datatree.getRoot(), child);
		
		camera.setupLerp(linemesh.boundmin, linemesh.boundmax); //line
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
	
	function resetTree()
	{
		var gridmesh     = null,
			rootnode     = {};
		gridmesh = render.createGridMesh(1000, 100, 0.5);
		gridmesh.setMode('Lines');
		gridmesh.setShader(line_shader);
		gridmesh.boundmin = Mul(gridmesh.boundmin, [0.5, 0.5, 0.5]);
		gridmesh.boundmax = Mul(gridmesh.boundmax, [0.5, 0.5, 0.5]);
		meshlist.push(gridmesh);
		datatree.addData('root', ['ROOT']);
		datatree.createChild('Grid', 0, gridmesh);
		window.grouptreeview.update(datatree.getRoot());
	}
	
	
	function resetAll()
	{
		resetShader();
		resetTree();
	}
	
	function GetViewProjMatrix()
	{
		var camZ     = 0,
			vpMatrix;
		camZ = camera.getCamPosZ();
		if(camZ === 0) {
			vpMatrix = camera.getViewMatrix(60, canvas.width / canvas.height, 0.1, 2560);
		} else {
			vpMatrix = camera.getViewMatrix(60, canvas.width / canvas.height, camZ * 0.002, camZ * 4.0);
		}
		return vpMatrix;
	}
	
	function IsHitMesh(o, d, triarray)
	{
		var i,
			ishit = false,
			pos;
		console.log('ray parameter :', o, d);

		for(i = 0 ; i < triarray.length; i = i + 9) {
			ishit = IntersectTriangle(
				o,
				d,
				[
					triarray[i + 0], triarray[i + 1], triarray[i + 2]
				],
				[
					triarray[i + 3], triarray[i + 4], triarray[i + 5]
				],
				[
					triarray[i + 6], triarray[i + 7], triarray[i + 8]
				]
			);
			if(ishit === false) {
				continue;
			}
			break;
		}
		/*
		for(i = 0 ; i < triarray.length; i = i + 3) {
			ishit = IntersectSphere(o, d, [triarray[i + 0], triarray[i + 1], triarray[i + 2] ], 1);
			if(ishit === false) {
				continue;
			}
			break;
		}
		*/
		
		return ishit;
	}
	
	
	function Pick(win_x, win_y)
	{
		var mtx      = new MatIV(),
			vpM      = mtx.identity(mtx.create()),
			vpMI     = mtx.identity(mtx.create()),
			mcheck   = mtx.identity(mtx.create()),
			nwinpos  = [win_x, canvas.height - win_y, 0.0],
			fwinpos  = [win_x, canvas.height - win_y, 1.0],
			viewport = [0, 0, canvas.width, canvas.height],
			ishit    = false,
			org      = [0, 0, 0],
			tar      = [0, 0, 0],
			dir      = [0, 0, 0],
			mindex   = 0,
			tidx     = 0,
			mesh     = 0,
			t        = 10000,
			testo    = [0, 0, 0],
			testd    = [0, 0, 0],
			linem    = [];
		
		
		
		vpM = GetViewProjMatrix();
		mtx.inverse(vpM, vpMI);
		UnProject(nwinpos, vpMI, viewport, org);
		UnProject(fwinpos, vpMI, viewport, tar);

		dir = Sub(tar, org);
		dir = Normalize(dir);
		
		//‘“–‚½‚èBŒã‚Å•ªŠ„‚·‚é
		for(mindex = 0 ; mindex < meshlist.length; mindex = mindex + 1) {
			mesh = meshlist[mindex];
			if(mesh.mode === 'Triangles') {
				ishit = IsHitMesh(org, dir, mesh.position);
				if(ishit === false) continue;
				break;
			}
		}
		
		
		if(ishit !== false) 
		{
			t = ishit.t;
		}
		
		//TEST----------------------------
		mesh = render.createMeshObj
		(
			{
				'pos' : [org[0], org[1], org[2], dir[0] * t, dir[1] * t, dir[2] * t],
				'color' : [1,0,0,1,1,0,0,1]
			}
		);
		mesh.setMode('Lines');
		mesh.setShader(line_shader);
		mesh.hp = 60;
		meshlist.push(mesh);
		//TEST----------------------------
		console.log(ishit);
	}
	
	
	function MouseClickFunc(evt)
	{
		//console.log(evt.clientX, evt.clientY);
		if(evt.button === 1) Pick(evt.clientX, evt.clientY);
	}
	

	function startGL() {
		console.log('startGL');
		onResize();
		resetAll();
		function updateFrame() {
			var cw            = canvas.width,
				ch            = canvas.height,
				wh            = 1 / Math.sqrt(cw * cw + ch * ch),
				uniLocation   = [],
				gridcolor     = [0.1, 0.1, 0.1, 1.0],
				result        = [],
				vpMatrix;

			camera.updateMatrix(wh);

			render.clearColor(0.1, 0.1, 0.1, 1.0);
			render.clearDepth(1.0);
			render.frontFace(true);
			render.Depth(true);
			render.Blend(true);
			vpMatrix = GetViewProjMatrix();
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
			name      = '',
			colnum,
			col,
			temp,
			i,
			j,
			hstable,
			clonetable,
			checkboxs,
			headernames;
		
		
		hstable = document.getElementById('hstable');
		clonetable = hstable.getElementsByClassName('ht_clone_top');
		if(clonetable.length <= 0)
		{
			console.log('Not found table. bailout.');
			return;
		}
		checkboxs   = clonetable[0].getElementsByClassName('colcheckbox');
		headernames = clonetable[0].getElementsByClassName('colnames');
		for(i = 0 ; i < checkboxs.length; i = i + 1) {
			var checkbox = document.getElementById('colcheckbox' + i);
			if(checkboxs[i].checked) {
				checklist.push(i);
				name += headernames[i].value;
			}
		}
		
		if(checklist.length <= 0) {
			console.log('not select col. bail out');
			return;
		}

		for(i = 0 ; i < checklist.length; i++) {
			coldata.push(window.hstable.getCol(checklist[i]));
		}
		
		console.log(coldata);
		colnum = coldata.length;
		if(colnum >= 3)
		{
			colnum = 3;
		}
		
		for(j = 0 ; j < colnum; j = j + 1) {
			col = coldata[j];
			for(i = 0 ; i < col.length - 1; i = i + 1) {
				pos[i * 3 + j] = parseFloat(col[i]);
			}
		}

		if(colnum == 2) {
			for(i = 0 ; i < col.length - 1; i = i + 1) {
				temp = pos[i * 3 + 1];
				pos[i * 3 + 1] = 0;
				pos[i * 3 + 2] = temp;
			}
		}

		if(colnum == 1) {
			for(i = 0 ; i < col.length - 1; i = i + 1) {
				pos[i * 3 + 1] = 0.0;
				pos[i * 3 + 2] = 0.0;
			}
		}
		
		//Create Name
		for(i = 0 ; i < checklist.length; i++) {
			name = name + '_' + checklist[i];
		}
		name += '_ID' + GetModelId();
		
		updateMeshText(name, pos);
	}
	
	
	function init() {
		var i,
			openstl     = document.getElementById('OpenSTL'),
			opencsv     = document.getElementById('OpenCSV'),
			addgroup    = document.getElementById('AddGroup'),
			deletegroup = document.getElementById('DeleteGroup');
		
		//init
		canvas = document.getElementById('canvas');
		
		//init render
		render = new WGLRender();
		
		//create camera 
		camera = new Camera();
		
		//initialize render
		render.init(canvas, window);
		camera.init();
		
		//initialize contorller
		window.ctrl.init(document, canvas, callbackResetView);
		window.ctrl.setCamera(camera);
		
		//
		document.getElementById('Open').addEventListener('change', loadSTL, false);

		openstl.onclick  = loadSTL;
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
	
	document.addEventListener("click" , MouseClickFunc);
	window.onload                  = init;
	window.onresize                = onResize;
	window.scene                   = scene;
	window.scene.updateDataTree    = updateDataTree;
	window.scene.AddRootTree       = AddRootTree;
	window.scene.selectTreeNode    = selectTreeNode;
	

}(window.loadSTLB));
