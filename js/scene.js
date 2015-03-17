/*jslint devel:true*/
/*global Float32Array, ArrayBuffer, Int16Array, QtnIV, MatIV,
WGLRender, Camera, ReqFile, datatree, Mul, IntersectSphere, UnProject,
Normalize, Sub */

(function (loadSTLB) {
	"use strict";
	var canvas         = null,
		gl             = null,
		render         = null,
		rAF            = null,
		meshlist       = [],
		camera         = null,
		gizmomesh      = null,
		line_shader    = null,
		mesh_shader    = null,
		scene          = {},
		model_id       = 0,
		openstate      = 0,
		consolestate   = 0;
	
	function resetShader() {
		mesh_shader        = render.createShaderObj('vs_mesh', 'fs_mesh');
		line_shader        = render.createShaderObj('vs_line', 'fs_line');
	}

	function callbackResetView(e) {
		resetShader();
	}

	function updateInfo(vnum, pnum) {
		var vnumElem = document.getElementById('vertexNum'),
			pnumElem = document.getElementById('polygonNum');
		
		if (parseInt(vnumElem.innerHTML, 10) !== vnum) {
			vnumElem.innerHTML = vnum;
		}
		if (parseInt(pnumElem.innerHTML, 10) !== pnum) {
			pnumElem.innerHTML = pnum;
		}
	}

	function delMesh(name) {
		var i,
			newlist;
		
		if (meshlist.length <= 0) { return; }
		
		newlist = [];
		for (i = 0; i < meshlist.length; i = i + 1) {
			if (meshlist[i].name !== name) {
				newlist.push(meshlist[i]);
			} else {
				console.log('DELETE MESH : ', meshlist[i].name);
			}
		}
		console.log(newlist);
		meshlist = newlist;
	}

	function updateDataTree(data) {
		console.log(meshlist);
		var i,
			k;
		for (i = 0; i < meshlist.length; i = i + 1) {
			console.log(meshlist[i].name, data.name);
			if (meshlist[i].name === data.name) {
				console.log(data);
				for (k = 0; k < data.input.length; k = k + 1) {
					if (data.input[k].name === 'trans') {
						meshlist[i].trans = data.input[k].value;
					}
					if (data.input[k].name === 'rotate') {
						meshlist[i].rotate = data.input[k].value;
					}

					if (data.input[k].name === 'scale') {
						meshlist[i].scale = data.input[k].value;
					}

					if (data.input[k].name === 'color') {
						meshlist[i].diffColor = data.input[k].value;
					}

					if (data.input[k].name === 'radius') {
						meshlist[i].radius = parseFloat(data.input[k].value);
					}
				}
				camera.setupLerp(meshlist[i].boundmin, meshlist[i].boundmax, meshlist[i].trans, meshlist[i].scale);
			}
		}
	}

	/// updateMesh  call back function for loadSTL
	/// @param data STL data, pos, normal...
	function updateMesh(data) {
		var point_p   = data.pos,
			point_n   = data.normal,
			stlmesh   = null,
			linemesh  = null,
			pointmesh = null,
			node      = {},
			length    = 0;
		console.log(data);
		stlmesh      = render.createMeshObj(data);
		//data.name    = data.name;
		stlmesh.name = data.name;
		stlmesh.setShader(mesh_shader);
		
		//type is stl
		stlmesh.type = 'stl';
		
		//add root
		node = datatree.createRoot('mesh', data.name, stlmesh);
		window.grouptreeview.update(datatree.getRoot(), node);
		window.scene.propertyTab(true);
		meshlist.push(node.data);

		camera.setupLerp(data.min, data.max);
	}

	function selectTreeNode(node, checkbox) {
		if (checkbox) {
			node.data.show = checkbox.checked;
		} else {
			console.log(node);
			if (node.data.boundmin) {
				camera.setupLerp(node.data.boundmin, node.data.boundmax, node.data.trans, node.data.scale);
			}
		}
		
		//update handsontable
		if (node.type === 'text') {
			window.hstable.loadData(node.data);
		}
	}

	function updateMeshText(name, pos, type, urllist) {
		var mesh = {'position' : pos},
			bb,
			child,
			retmesh,
			selectnode = window.grouptreeview.getSelectNode();

		if (type === 'Line') {
			retmesh  = render.createLineMesh(mesh, 8, 0.5);
			retmesh.name = name + 'LINE';
			retmesh.setShader(mesh_shader);
		}

		if (type === 'Point') {
			retmesh = render.createPointMesh(mesh, 1.0, 8, 4);
			retmesh.name = name + 'SPHERE';
			retmesh.setShader(mesh_shader);
		}
		retmesh.urllist = urllist;

		child = datatree.createChild('mesh', retmesh.name, retmesh);
		datatree.addChild(selectnode.name, child);

		window.grouptreeview.update(datatree.getRoot(), child);
		window.scene.propertyTab(true);
		meshlist.push(child.data);

		//datatree.addData(retmesh.name, retmesh);
		//camera.setupLerp(retmesh.boundmin, retmesh.boundmax);
	}
  
  
	function loadSTL(evt) {
		if (evt === '') {
			return;
		}
		loadSTLB.openBinary(evt, function (data) {
			updateMesh(data);
			document.getElementById('OpenSTLFile').value = '';
			openSwitch();
		});
	}

	function onResize() {
		var i,
			w;
		
		document.getElementById('OpenSTLFile').value = '';
		w = document.getElementById('consoleOutput').style.width = window.innerWidth + 'px';
		render.onResize();
	}
	
	function resetTree() {
		var gridmesh     = null,
			rootnode     = {};
		gridmesh = render.createGridMesh(1000, 100, 0.5);
		
		gridmesh.setMode('Lines');
		gridmesh.type = 'stl';
		gridmesh.setShader(line_shader);
		gridmesh.boundmin = Mul(gridmesh.boundmin, [0.25, 0.25, 0.25]);
		gridmesh.boundmax = Mul(gridmesh.boundmax, [0.25, 0.25, 0.25]);
		meshlist.push(gridmesh);
		
		//update tree
		rootnode = datatree.createRoot('mesh', 'grid', gridmesh);
		window.grouptreeview.update(datatree.getRoot(), rootnode);
		/*
		gridmesh= render.createGizmoMesh(1000);
		gridmesh.setShader(line_shader);
		meshlist.push(gridmesh);
		*/
		gizmomesh = render.createGizmoMesh(0.15);
		gizmomesh.setShader(line_shader);
	}
	
	
	function resetAll() {
		resetShader();
		resetTree();
		
		camera.resetView();
	}
	
	function sideViewChange(axis) {
		return function (e) {
			camera.ViewSide(axis);
			selectTreeNode(datatree.getRoot()[0]);
		};
	}
	
	function getViewProjMatrix() {
		var camZ     = 0,
			vpMatrix;
		camZ = camera.getCamPosZ();
		if (camZ === 0) {
			vpMatrix = camera.getViewMatrix(90, canvas.width / canvas.height, 0.1, 2560);
		} else {
			vpMatrix = camera.getViewMatrix(90, canvas.width / canvas.height, camZ * 0.002, camZ * 10.0);
		}
		return vpMatrix;
	}
	
	function IsHitMesh(o, d, mesh) {
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
		for (i = 0 ; i < triarray.length; i = i + 9) {
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
			if (ishit === false) {
				continue;
			}
			break;
		}
		*/
		for (i = 0; i < triarray.length; i = i + 3) {
			ishit = IntersectSphere(o, d, [triarray[i + 0], triarray[i + 1], triarray[i + 2] ], radius);
			if (ishit === false) {
				continue;
			}
			hit = true;
			if (t > ishit.t) {
				t = ishit.t;
				index = i;
			}
		}
		
		return {'hit' : hit, 't' : t, 'index' : index};
	}
	
	function updatePopup() {
		var vpM   = getViewProjMatrix(),
			vpMI  = getViewProjMatrix(),
			ppos  = [0, 0, 0, 0],
			mtx   = new MatIV(),
			popup = document.getElementById('pickup'),
			viewport = [0, 0,  canvas.width, canvas.height],
			org   = [];
		
		if (popup.style.display === 'block') {
			ppos = [parseInt(popup.style.left, 10), canvas.height - parseInt(popup.style.top, 10), 0.0, 1.0];
			mtx.inverse(vpM, vpMI);
			UnProject(
				[parseInt(popup.style.left, 10), canvas.height - parseInt(popup.style.top, 10), 0.0],
				vpMI,
				viewport,
				ppos
			);
			console.log(ppos);
			popup.style.left = ppos[0] + 'px';
			popup.style.top  = ppos[1] + 'px';
			
		}
	}
	
	function createPopup(win_x, win_y, data) {
		var popup = document.getElementById('pickup'),
			url;
		popup.style.position = 'absolute';
		popup.style.left     = win_x + 'px';
		popup.style.top      = win_y + 'px';
		popup.style.display  = 'block';
		popup.innerHTML      = "<i>index</i>:" + data.index + "<br>";
		popup.innerHTML     += data.position + "<br>";

		if (data.URL) {
			url = document.createElement('a');
			url.title     = data.URL.title;
			url.href      = data.URL.href;
			url.target    = '_blank';
			url.innerHTML = data.URL.title;
			popup.appendChild(url);
		}
	}
	
	function hidePopup() {
		var popup = document.getElementById('pickup');
		if (popup) {
			popup.style.display = "none";
		}
	}
	
	function createRayMesh(org, dir, t) {
		var mesh = render.createMeshObj(
			{
				'pos' : [
					org[0],
					org[1],
					org[2],
					org[0] + dir[0] * t,
					org[1] + dir[1] * t,
					org[2] + dir[2] * t
				],
				'color' : [1, 0, 0, 1, 1, 0, 0, 1]
			}
		);
		mesh.setMode('Lines');
		mesh.setShader(line_shader);
		meshlist.push(mesh);
	}

	function Pick(win_x, win_y) {
		var mtx      = new MatIV(),
			vpM      = mtx.identity(mtx.create()),
			vpMI     = mtx.identity(mtx.create()),
			mcheck   = mtx.identity(mtx.create()),
			nwinpos  = [win_x, canvas.height - win_y, 0.0],
			fwinpos  = [win_x, canvas.height - win_y, 1.0],
			viewport = [0, 0,  canvas.width, canvas.height],
			ishit    = false,
			org      = [0, 0, 0],
			tar      = [0, 0, 0],
			dir      = [0, 0, 0],
			mindex   = 0,
			tidx     = 0,
			mesh     = 0,
			hitmesh  = -1,
			info     = {'hit' : false, 't' : 9999999, 'index' : -1},
			testo    = [0, 0, 0],
			testd    = [0, 0, 0],
			resultpos = [9999999, 9999999, 9999999],
			linem    = [];

		if (meshlist.length <= 0) { return; }

		//create ray
		vpM = getViewProjMatrix();
		mtx.inverse(vpM, vpMI);
		UnProject(nwinpos, vpMI, viewport, org);
		UnProject(fwinpos, vpMI, viewport, tar);
		dir = Normalize(Sub(tar, org));
		
		//traverse mesh
		for (mindex = 0; mindex < meshlist.length; mindex = mindex + 1) {
			mesh = meshlist[mindex];
			if (mesh.mode === 'Triangles' && mesh.show === true) {
				ishit = IsHitMesh(org, dir, mesh);
				if (ishit === false) { continue; }
				if (ishit.t < info.t) {
					info = ishit;
					hitmesh = mindex;
				}
			}
		}
		
		if (hitmesh < 0) {
			console.log('RAY MISS');
			return;
		}
		
		resultpos[0] = meshlist[hitmesh].position[info.index + 0];
		resultpos[1] = meshlist[hitmesh].position[info.index + 1];
		resultpos[2] = meshlist[hitmesh].position[info.index + 2];

		mesh = meshlist[hitmesh];
		info.position = [];
		info.position.push(
			mesh.pointposition[info.index + 0],
			mesh.pointposition[info.index + 1],
			mesh.pointposition[info.index + 2]
		);
		info.index /= 3;
		console.log(resultpos, info);
		
		if (mesh.urllist.length > 0) {
			info.URL = {};
			info.URL.title = mesh.urllist[info.index];
			info.URL.href  = mesh.urllist[info.index];
		}

		
		createPopup(win_x, win_y, info);
	}
	
	
	function MouseClickFunc(evt) {
		//console.log(evt.clientX, evt.clientY);
		if (evt.button === 1) {
			Pick(evt.clientX, evt.clientY);
		}
	}
	

	function KickDogFrame() {
		//document.getElementById('progress').innerHTML = "updata
	}

	function KickDog() {
		render.swapBuffer()(KickDogFrame);
	}

	function addGroup(type) {
		var colinfo   = [],
			colURL    = -1,
			colaxis   = [],
			coldata   = [],
			pos       = [],
			urllist   = [],
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
		if (clonetable.length <= 0) {
			console.log('Not found table. bailout.');
			return;
		}

		//check hstable header
		headernames = clonetable[0].getElementsByClassName('colnames');
		selectnames = clonetable[0].getElementsByClassName('colselectbox');
		
		
		//Create Select Info
		for (i = 0; i < selectnames.length; i = i + 1) {
			
			console.log(selectnames[i].value);
			if (selectnames[i].value === 'X') {
				colinfo.push({'index' : i, 'attr' : 0});
			}
			if (selectnames[i].value === 'Y') {
				colinfo.push({'index' : i, 'attr' : 1});
			}
			if (selectnames[i].value === 'Z') {
				colinfo.push({'index' : i, 'attr' : 2});
			}
			
			if(colURL < 0) {
				if (selectnames[i].value === 'URL') {
					colURL = i;
				}
			}
		}
		
		//Create Name
		for (i = 0; i < colinfo.length; i = i + 1) {
			name += headernames[colinfo[i].index].value + '_';
		}
		
		if (colinfo.length <= 0) {
			console.log('not select col. bail out');
			return;
		}

		for (i = 0; i < colinfo.length; i = i + 1) {
			attr    = colinfo[i].attr;
			col     = window.hstable.getCol(colinfo[i].index);
			if (attr === 0 || attr === 1 || attr === 2) {
				for (j = 0; j < col.length - 1; j = j + 1) {
					pos[j * 3 + attr] = parseFloat(col[j]);
				}
				continue;
			}
		}

		if(colURL >= 0) {
			col = window.hstable.getCol(colURL);
			for (j = 0; j < col.length - 1; j = j + 1) {
				urllist.push(col[j]);
			}
		}

		for (j = 0; j < pos.length; j = j + 1) {
			if (pos[j] === undefined) {
				pos[j] = 0;
			}
		}

		for (j = 0; j < urllist.length; j = j + 1) {
			if (urllist[j] === undefined) {
				urllist[j] = 'NULL';
			}
		}

		//Create Name
		updateMeshText(name, pos, type, urllist);
	}
	
	
	function addLine(e) {
		addGroup('Line');
	}
	
	function addPoint(e) {
		addGroup('Point');
	}
	
	function drawGizmo() {
		var mtx      = new MatIV(),
			mRotate  = camera.RotateMatrix,
			mLook    = mtx.identity(mtx.create()),
			mProj    = mtx.identity(mtx.create()),
			vpM      = mtx.identity(mtx.create()),
			aspect   = canvas.width / canvas.height;
		mtx.lookAt([0, 0, 1], [0, 0, 0], [0, 1, 0], mLook);
		mtx.ortho(-1 * aspect, aspect, -1, 1, 0.1, 100, mProj);
		mtx.multiply(mProj, mLook, vpM);
		mtx.multiply(vpM, mRotate, vpM);

		//transform gizmo
		vpM[12] =  0.85;
		vpM[13] =  0.85;

		render.setViewProjection(vpM);
		render.drawMesh(gizmomesh);
	}

	function updateFrame() {
		var cw            = canvas.width,
			ch            = canvas.height,
			wh            = 1 / Math.sqrt(cw * cw + ch * ch),
			uniLocation   = [],
			gridcolor     = [0.1, 0.1, 0.1, 1.0],
			result        = [],
			vpMatrix;
		camera.setupScreen([cw, ch]);
		camera.updateMatrix(wh);
		//updatePopup()
		render.clearColor(0.1, 0.1, 0.1, 1.0);
		render.clearDepth(1.0);
		render.frontFace(true);
		render.Depth(true);
		render.Blend(true);
		vpMatrix = getViewProjMatrix();
		render.setViewProjection(vpMatrix);
		render.drawMeshList(meshlist, result);
		updateInfo(result[0].VertexNum, result[0].PolygonNum);
		drawGizmo();
		render.swapBuffer()(updateFrame);
	}

	function startGL() {
		console.log('startGL');
		onResize();
		resetAll();
		updateFrame();
	}

	function openSwitch(e) {
		var openwindow = document.getElementById('OpenWindow');
		$toggle(openwindow, 100);
		if (openstate === 0) {
			window.scene.groupTab(false);
			openstate = 1;
		} else {
			window.scene.groupTab(true);
			openstate = 0;
		}
	}
	
	
	function consoleSwitch(e) {
		var openwindow = document.getElementById('console');
		$toggle(openwindow, 100);
		
	}
	
	
	function loadTXT(e) {
		window.hstable.openText(e);
		openSwitch();
		document.getElementById('OpenTextFile').innerHTML = '';
		
		if (consolestate === 0) {
			consolestate = 1;
			window.scene.consoleTab(true);
		}
	}
	
	
	function updateconsole(change) {
		
	}
	
	function init() {
		var i,
			openswitch  = document.getElementById('OpenSwitch'),
			openstl     = document.getElementById('OpenSTL'),
			opencsv     = document.getElementById('OpenCSV'),
			addline     = document.getElementById('AddLine'),
			addpoint    = document.getElementById('AddPoint'),
			pickup      = document.getElementById('pickup'),
			sideviewx   = document.getElementById('viewLeft'),
			sideviewy   = document.getElementById('viewTop'),
			sideviewz   = document.getElementById('viewFront'),
			sideviewx_   = document.getElementById('viewRight'),
			sideviewy_   = document.getElementById('viewBottom'),
			sideviewz_   = document.getElementById('viewBack'),
			
			deletegroup = document.getElementById('DeleteGroup'),
			propertyTab,
			groupTab,
			consoleTab;

		canvas = document.getElementById('canvas');

		//init render
		render   = new WGLRender();
		
		//create camera 
		camera   = new Camera();
		
		//initialize render
		render.init(canvas, window);
		camera.init();
		
		//initialize contorller
		window.ctrl.init(document, canvas, callbackResetView);
		window.ctrl.setCamera(camera);
		
		canvas.addEventListener('mousedown', hidePopup, true);
		
		document.getElementById('OpenSTLFile').addEventListener('change',  loadSTL, false);
		document.getElementById('OpenTextFile').addEventListener('change', loadTXT, false);
		
		openswitch.onclick = openSwitch;
		addline.onclick  = addLine;
		addpoint.onclick = addPoint;

		sideviewx.onclick = (sideViewChange)("x");
		sideviewy.onclick = (sideViewChange)("y");
		sideviewz.onclick = (sideViewChange)("z");
		sideviewx_.onclick = (sideViewChange)("x-");
		sideviewy_.onclick = (sideViewChange)("y-");
		sideviewz_.onclick = (sideViewChange)("z-");
		
		// Create Tab
		propertyTab = window.animtab.create('right', {
			'rightTab' : { min : '0px', max : 'auto' }
		}, {
			'menuTab' : { min : '0px', max : '400px' }
		}, 'Property');
		propertyTab(false);

		groupTab = window.animtab.create('left', {
			'leftTab' : { min : '0px', max : 'auto' }
		}, {
			'groupTab' : { min : '0px', max : '280px' }
		}, 'Groups');

		consoleTab = window.animtab.create('bottom', {
			'bottomTab' : { min : '10px', max : '400' }
		}, {
			'consoleOutput' : { min : '0px', max : '400px' }
		}, 'console');
		consoleTab(false);

		window.scene.consoleTab        = consoleTab;
		window.scene.propertyTab       = propertyTab;
		window.scene.groupTab          = groupTab;
		setTimeout(startGL, 50);
	}
	
	document.addEventListener("click", MouseClickFunc);
	window.onload                  = init;
	window.onresize                = onResize;
	window.scene                   = scene;
	window.scene.updateDataTree    = updateDataTree;
	window.scene.selectTreeNode    = selectTreeNode;
	window.scene.updateconsole     = updateconsole;
	window.scene.delMesh           = delMesh;
	window.scene.delData           = delData; //datatree.delData ?
	
	window.scene.KickDog           = KickDog;
}(window.loadSTLB));

