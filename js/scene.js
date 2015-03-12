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
			//console.log(meshlist[i].name, data);
			
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
						meshlist[i].radius = parseFloat(data.input[k].value);
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

	/// updateMesh  call back function for loadSTL
	/// @param data STL data, pos, normal...
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
		camera.setupLerp(data.min, data.max);
	}

	
	function selectTreeNode(node, checkbox) {
		if(checkbox) {
			node.data.show = checkbox.checked;
		} else {
			console.log(node.data.boundmin, node.data.boundmax);
			camera.setupLerp(node.data.boundmin, node.data.boundmax, node.data.trans);
		}
	}
	
	function updateMeshText(name, pos) {
	  var mesh = {'position':pos},
			bb,
			child,
			linemesh,
			pointmesh;
		linemesh  = render.createLineMesh(mesh, 8, 0.5);
		pointmesh = render.createPointMesh(mesh, 1.0, 8, 4);
		console.log(linemesh.boundmin, linemesh.boundmax);
		console.log(pointmesh.boundmin, pointmesh.boundmax);
		linemesh.name = name + '_LINE';
		pointmesh.name = name + '_SPHERE';
		
		linemesh.setShader(mesh_shader);
		pointmesh.setShader(mesh_shader);
		meshlist.push(linemesh);
		meshlist.push(pointmesh);
		child = datatree.createChild(linemesh.name, 0, linemesh);
		datatree.createChild(pointmesh.name, 0, pointmesh);
		window.grouptreeview.update(datatree.getRoot(), child);
		camera.setupLerp(linemesh.boundmin, linemesh.boundmax);
	}
  
  
	function loadSTL(evt) {
		if (evt === '') {
			return;
		}
		loadSTLB.openBinary(evt, function (data) {
			updateMesh(data);
			document.getElementById('Open').value = '';
		});
	}

	function onResize() {
	  var i;
		document.getElementById('Open').value = '';
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
			vpMatrix = camera.getViewMatrix(90, canvas.width / canvas.height, 0.1, 2560);
		} else {
			vpMatrix = camera.getViewMatrix(90, canvas.width / canvas.height, camZ * 0.002, camZ * 4.0);
		}
		return vpMatrix;
	}
	
	function IsHitMesh(o, d, mesh)
	{
		var i,
			ishit = false,
			pos,
			triarray = mesh.pointposition,
			radius   = mesh.radius,
			t        = 9999999.0,
			index    = 0,
			hit      = false;
		//console.log('ray parameter :', o, d);

		/*
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
		*/
		for(i = 0 ; i < triarray.length; i = i + 3) {
			ishit = IntersectSphere(o, d, [triarray[i + 0], triarray[i + 1], triarray[i + 2] ], radius);
			if(ishit === false) {
				continue;
			}
			hit = true;
			if(t > ishit.t) {
				t = ishit.t;
				index = i;
			}
		}
		
		return {'hit':hit, 't':t, 'index':index};
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
			hitmesh  = -1,
			info     = {'hit':false,'t':9999999, 'index':-1},
			testo    = [0, 0, 0],
			testd    = [0, 0, 0],
			resultpos= [9999999, 9999999, 9999999],
			linem    = [];
		
		
		
		vpM = GetViewProjMatrix();
		mtx.inverse(vpM, vpMI);
		UnProject(nwinpos, vpMI, viewport, org);
		UnProject(fwinpos, vpMI, viewport, tar);

		dir = Sub(tar, org);
		dir = Normalize(dir);
		
		//ëçìñÇΩÇËÅBå„Ç≈ï™äÑÇ∑ÇÈ
		if(meshlist.length <= 0) return;
		for(mindex = 0 ; mindex < meshlist.length; mindex = mindex + 1) {
			mesh = meshlist[mindex];
			if(mesh.mode === 'Triangles') {
				ishit = IsHitMesh(org, dir, mesh);
				if(ishit === false) continue;
				if(ishit.t < info.t) {
					info = ishit;
					hitmesh = mindex;
				}
			}
		}
		if(hitmesh >= 0) {
			console.log('PROC HIT MESH', hitmesh, info.index);
			resultpos[0] = meshlist[hitmesh].position[info.index + 0];
			resultpos[1] = meshlist[hitmesh].position[info.index + 1];
			resultpos[2] = meshlist[hitmesh].position[info.index + 2];
		} else {
			console.log('ATATORAN');
		}
		
		if(hitmesh >= 0) {
			//RAY TEST----------------------------
			mesh = render.createMeshObj
			(
				{
					'pos' : [
					org[0],
					org[1],
					org[2],
					org[0] + dir[0] * ishit.t,
					org[1] + dir[1] * ishit.t,
					org[2] + dir[2] * ishit.t],
					'color' : [1,0,0,1,1,0,0,1]
				}
			);
			mesh.setMode('Lines');
			mesh.setShader(line_shader);
			meshlist.push(mesh);
			//TEST----------------------------
			
			mesh = meshlist[hitmesh];
			info.position = [];
			info.position.push(
				mesh.pointposition[info.index + 0],
				mesh.pointposition[info.index + 1],
				mesh.pointposition[info.index + 2]);
			info.index /= 3;
			console.log(resultpos, info);
			/*
			{
				var popup = document.createElement('div');
				//popup.style.position = 'fixed';
				popup.style.position = 'absolute';
				popup.style.left   = win_x + 'px';
				popup.style.top    = win_y + 'px';
				popup.style.right  = '100px';
				popup.style.bottom = '100px';
				popup.style.color = "blue"
				popup.style.zIndex = '10';
				popup.innerHTML = info.position;
				canvas.appendChild(popup);
			}
			*/
		}
	}
	
	
	function MouseClickFunc(evt)
	{
		//console.log(evt.clientX, evt.clientY);
		if(evt.button === 1) Pick(evt.clientX, evt.clientY);
	}
	

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

	function startGL() {
		console.log('startGL');
		onResize();
		resetAll();

		updateFrame();
	}
	
	function KickDogFrame() {
		//document.getElementById('progress').innerHTML = "updata
	}

	function KickDog()
	{
		render.swapBuffer()(KickDogFrame);
	}

	function addGroup() {
		var colinfo   = [],
			colaxis   = [],
			coldata   = [],
			pos       = [],
			vtemp     = [],
			name      = '',
			colnum,
			col,
			coltemp,
			temp,
			i,
			j,
			attr,
			hstable,
			clonetable,
			selectnames,
			headernames;
		
		
		hstable = document.getElementById('hstable');
		clonetable = hstable.getElementsByClassName('ht_clone_top');
		if(clonetable.length <= 0)
		{
			console.log('Not found table. bailout.');
			return;
		}
		
		//check hstable header
		headernames = clonetable[0].getElementsByClassName('colnames');
		selectnames = clonetable[0].getElementsByClassName('colselectbox');
		//console.log(selectnames);
		for(i = 0 ; i < selectnames.length; i = i + 1) {
			
			console.log(selectnames[i].value);
			if(selectnames[i].value === 'X') {
				colinfo.push({'index':i, 'attr':0});
			}
			if(selectnames[i].value === 'Y') {
				colinfo.push({'index':i, 'attr':1});
			}
			if(selectnames[i].value === 'Z') {
				colinfo.push({'index':i, 'attr':2});
			}
		}
		
		/*
		for(i = 0 ; i < checkboxs.length; i = i + 1) {
			var checkbox = document.getElementById('colcheckbox' + i);
			if(selectnames[i].) {
				checklist.push(i);
				name += headernames[i].value + '_';
			}
		}
		*/
		console.log(colinfo);
		
		if(colinfo.length <= 0) {
			console.log('not select col. bail out');
			return;
		}

		for(i = 0 ; i < colinfo.length; i = i + 1) {
			attr    = colinfo[i].attr;
			col     = window.hstable.getCol(colinfo[i].index);
			if(attr === 0 || attr === 1 || attr === 2) {
				for(j = 0 ; j < col.length - 1; j = j + 1) {
					pos[j * 3 + attr] = parseFloat(col[j]);
				}
				continue;
			}
		}
		for(j = 0 ; j < pos.length; j = j + 1) {
			if(pos[j] === undefined) {
				pos[j] = 0;
			}
		}
		console.log(pos);

		//Create Name
		name += 'ID' + GetModelId();
		console.log(pos);
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
	window.scene.KickDog           = KickDog;
	

}(window.loadSTLB));
