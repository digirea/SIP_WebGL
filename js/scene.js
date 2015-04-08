/*jslint devel:true*/
/*global Blob saveAs Float32Array, ArrayBuffer, Int16Array, QtnIV, MatIV,
WGLRender, Camera, ReqFile, datatree, Mul, IntersectSphere, UnProject, UnProjectWithLocal
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
		scene_fov      = 45.0,
		consolestate   = 0,
		nameLineGroup  = 'LineGroup',
		namePointGroup = 'PointGroup',
		nameLineSphereGroup  = 'LineSphereGroup',
		namePointSphereGroup  = 'PointSphereGroup',
		nameSTLData    = 'STLDATA';
	
	/**
	 * シェーダのリセット
	 * @method resetShader
	 */
	function resetShader() {
		mesh_shader        = render.createShaderObj('vs_mesh', 'fs_mesh');
		line_shader        = render.createShaderObj('vs_line', 'fs_line');
	}

	/**
	 * ビューがリセットされた場合に呼ばれるコールバック
	 * @method callbackResetView
	 * @param {Event} e イベント
	 */
	function callbackResetView(e) {
		resetShader();
	}

	/**
	 * 頂点数ポリゴン数の更新
	 * @method updateInfo
	 * @param {Number} vnum 頂点数
	 * @param {Number} pnum ポリゴン数
	 */
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

	/**
	 * メッシュの削除
	 * @method delMesh
	 * @param {String} name メッシュ名
	 */
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
				render.deleteMeshObj(meshlist[i]);
			}
		}
		console.log(newlist);
		meshlist = newlist;
	}

	/**
	 * メッシュデータプロパティの更新
	 * @method updateDataTree
	 * @param {Array} meshprop データプロパティ
	 * @param {Number} value 更新する値
	 */
	function updateMeshDataProp(meshprop, value) {
		var i;
		for (i = 0; i < meshprop.length; i = i + 1) {
			meshprop[i] = parseFloat(value[i]);
		}
	}
	
	/**
	 * データツリーの更新
	 * @method updateDataTree
	 * @param {Object} data データ
	 */
	function updateDataTree(data) {
		console.log(meshlist);
		var i,
			j,
			k;
		for (i = 0; i < meshlist.length; i = i + 1) {
			console.log(meshlist[i].name, data.name);
			if (meshlist[i].name === data.name) {
				console.log(data);
				for (k = 0; k < data.input.length; k = k + 1) {
					if (data.input[k].name === 'trans') {
						updateMeshDataProp(meshlist[i].trans, data.input[k].value);
					}

					if (data.input[k].name === 'rotate') {
						updateMeshDataProp(meshlist[i].rotate, data.input[k].value);
					}

					if (data.input[k].name === 'scale') {
						updateMeshDataProp(meshlist[i].scale, data.input[k].value);
					}

					if (data.input[k].name === 'color') {
						meshlist[i].diffColor = data.input[k].value;
					}

					if (data.input[k].name === 'radius') {
						meshlist[i].radius = parseFloat(data.input[k].value);
					}
				}
				camera.setupLerp(meshlist[i].boundmin, meshlist[i].boundmax, meshlist[i].trans, meshlist[i].scale, meshlist[i].rotate);
			}
		}
	}

	/// updateMesh  call back function for loadSTL
	/// @param data STL data, pos, normal...
	/**
	 * メッシュの更新
	 * @method updateMesh
	 * @param {Object} data 更新データ
	 */
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
		stlmesh.grouptype = nameSTLData;
		
		//add root
		node = datatree.createRoot('mesh', data.name, stlmesh);
		window.grouptreeview.update(datatree.getRoot(), node);
		window.scene.propertyTab(true);
		meshlist.push(node.data);

		camera.setupLerp(data.min, data.max);
	}

	/**
	 * ツリーノードの選択
	 * @method selectTreeNode
	 * @param {node} node ノード
	 * @param {Element} checkbox チェックボックス
	 */
	function selectTreeNode(node, checkbox) {
		if (checkbox) {
			node.data.show = checkbox.checked;
		}

		//update handsontable
		if (node.type === 'mesh') {
			if (node.data.boundmin) {
				camera.setupLerp(node.data.boundmin, node.data.boundmax, node.data.trans, node.data.scale, node.data.rotate);
			}
			//update handsontable
			if(node.data.parentdata) {
				window.hstable.loadData(node.data.parentdata, node.data.colinfo);
			}
		}
		
		//update handsontable
		if (node.type === 'text') {
			window.hstable.loadData(node.data);
		}
	}

	/**
	 * 球面座標に変換
	 * @method transformSphereCoord
	 * @param {Array} pos 座標配列
	 */
	function transformSphereCoord(pos) {
		var i = 0,
			r = 0,
			th = 0,
			phi = 0,
			x = 0,
			y = 0,
			z = 0,
			apos = [];

		for (i = 0; i < pos.length; i = i + 3) {
			x = pos[i + 0];
			y = pos[i + 1];
			z = pos[i + 2];
			r     = 350.0;
			th    =  (2 * Math.PI * y) / 360.0;
			phi   = -(2 * Math.PI * z) / 360.0;
			pos[i + 0] = (r * (Math.cos(th)  * Math.cos(phi)));
			pos[i + 2] = (r * (Math.sin(phi) * Math.cos(th)));
			pos[i + 1] = (r * (Math.sin(th)));
		}
		return apos;
	}
	
	
	/**
	 * メッシュテキスト情報の更新
	 * @method updateMeshText
	 * @param {String} name 名前
	 * @param {Array} pos 位置
	 * @param {String} type 種類
	 * @param {Array} urllist URLリスト
	 */
	function updateMeshText(name, pos, type, urllist, colinfo) {
		var mesh = {'position' : pos},
			bb,
			child,
			retmesh;

		if (type === nameLineGroup) {
			retmesh  = render.createLineMesh(mesh, 8, 1.0);
			retmesh.name = name + 'Line';
			retmesh.setShader(mesh_shader);
		}

		if (type === namePointGroup) {
			retmesh = render.createPointMesh(mesh, 1.0, 8, 4);
			retmesh.name = name + 'Point';
			retmesh.setShader(mesh_shader);
		}
		

		if (type === nameLineSphereGroup) {
			transformSphereCoord(mesh.position);
			retmesh  = render.createLineMesh(mesh, 8, 1.0);
			retmesh.name = name + 'SphereLine';
			retmesh.setShader(mesh_shader);
		}

		if (type === namePointSphereGroup) {
			transformSphereCoord(mesh.position);
			retmesh = render.createPointMesh(mesh, 1.0, 8, 4);
			retmesh.name = name + 'SpherePoint';
			retmesh.setShader(mesh_shader);
		}

		//ref hstable
		retmesh.parentdata = window.hstable.getSelectData();
		retmesh.urllist    = urllist;
		retmesh.colinfo    = colinfo;
		retmesh.grouptype  = type;

		return retmesh;
	}
  
  
	/**
	 * STLの読み込み
	 * @method loadSTL
	 * @param {Event} evt ファイルイベント
	 */
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

	/**
	 * リサイズ
	 * @method onResize
	 */
	function onResize() {
		var i,
			w;
		
		document.getElementById('OpenSTLFile').value = '';
		w = document.getElementById('consoleOutput').style.width = window.innerWidth + 'px';
		render.onResize();
	}
	
	/**
	 * ツリーのリセット
	 * @method resetTree
	 */
	function resetTree() {
		var gridmesh     = null,
			rootnode     = {};
		gridmesh = render.createGridMesh(1000, 100, 0.5);
		
		gridmesh.setMode('Lines');
		gridmesh.type = 'stl';
		gridmesh.grouptype = nameLineGroup;
		gridmesh.setShader(line_shader);
		gridmesh.boundmin = Mul(gridmesh.boundmin, [0.25, 0.25, 0.25]);
		gridmesh.boundmax = Mul(gridmesh.boundmax, [0.25, 0.25, 0.25]);
		gridmesh.radius = 1.5;
		meshlist.push(gridmesh);
		
		//update tree
		rootnode = datatree.createRoot('mesh', 'grid', gridmesh);
		window.grouptreeview.update(datatree.getRoot(), rootnode);
		gizmomesh = render.createGizmoMesh(0.15);
		gizmomesh.setShader(line_shader);
	}
	
	
	/**
	 * 全てのビューをリセット
	 * @method resetAll
	 */
	function resetAll() {
		resetShader();
		resetTree();
		
		camera.resetView();
	}
	
	/**
	 * サイドビュー変更関数を返す
	 * @method sideViewChange
	 * @param {Array} axis 軸
	 * @return Function サイドビュー変更関数
	 */
	function sideViewChange(axis) {
		return function (e) {
			camera.ViewSide(axis);
			selectTreeNode(datatree.getRoot()[0]);
		};
	}
	
	/**
	 * ビューモードの変更関数を返す
	 * @method sideViewChange
	 * @param {String} mode モード
	 * @return Function ビューモードの変更関数を返す
	 */
	function viewModeChange(mode) {
		return function (e) {
			camera.ViewMode(mode);
		};
	}
	
	/**
	 * ビュープロジェクションマトリックスの取得
	 * @method getViewProjMatrix
	 * @return vpMatrix ビュープロジェクションマトリックス
	 */
	function getViewProjMatrix() {
		var camZ     = 0,
			vpMatrix;
		camZ = camera.getCamPosZ();
		if (camZ === 0) {
			vpMatrix = camera.getViewProjMatrix(scene_fov, canvas.width / canvas.height, 0.1, 2560);
		} else {
			vpMatrix = camera.getViewProjMatrix(scene_fov, canvas.width / canvas.height, camZ * 0.02, camZ * 50.0);
		}
		return vpMatrix;
	}

	/**
	 * ビューマトリックスの取得
	 * @method getViewMatrix
	 * @return vMatrix ビューマトリックス
	 */
	function getViewMatrix() {
		var camZ     = 0,
			vpMatrix;
		camZ = camera.getCamPosZ();
		if (camZ === 0) {
			vpMatrix = camera.getViewMatrix();
		} else {
			vpMatrix = camera.getViewMatrix();
		}
		return vpMatrix;
	}

	/**
	 * メッシュにヒットしたか
	 * @method IsHitMesh
	 * @param {Array} o レイ基点ベクトル
	 * @param {Array} d レイ方向ベクトル
	 * @param {mesh} mesh メッシュ
	 * @return ObjectExpression
	 */
	function IsHitMesh(o, d, mesh) {
		var i,
			ishit = false,
			pos,
			triarray    = mesh.pointposition,
			tri         = [0,0,0,1],
			tritrans    = [0,0,0,1],
			t        = 9999999.0,
			index    = 0,
			localMatrix = render.getLocalMatrixFromMesh(mesh),
			hit      = false;

		for (i = 0; i < triarray.length; i = i + 3) {
			tri[0]  = triarray[i + 0];
			tri[1]  = triarray[i + 1];
			tri[2]  = triarray[i + 2];
			tri[3]  = 1.0;
			ishit = IntersectSphere(o, d, [tri[0], tri[1], tri[2]], mesh.radius);
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
	
	/**
	 * ポップアップの更新
	 * @method updatePopup
	 */
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
	
	/**
	 * ポップアップの作成
	 * @method createPopup
	 * @param {Number} win_x スクリーンx座標
	 * @param {Number} win_y スクリーンy座標
	 * @param {Object} data データ
	*/
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
	
	/**
	 * ポップアップを隠す
	 * @method hidePopup
	 */
	function hidePopup() {
		var popup = document.getElementById('pickup');
		if (popup) {
			popup.style.display = "none";
		}
	}
	
	/**
	 * レイをメッシュとして生成
	 * @method createRayMesh
	 * @param {Array} org レイ基点ベクトル
	 * @param {Array} dir レイ方向ベクトル
	 * @param {Number} t org + t * dir のt
	 */
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

	/**
	 * ピック
	 * @method Pick
	 * @param {Number} win_x スクリーンx座標
	 * @param {Number} win_y スクリーンy座標
	 */
	function Pick(win_x, win_y) {
		var mtx      = new MatIV(),
			vpM      = mtx.identity(mtx.create()),
			vpMI     = mtx.identity(mtx.create()),
			mcheck   = mtx.identity(mtx.create()),
			localMatrix   = mtx.identity(mtx.create()),
			localInvMatrix   = mtx.identity(mtx.create()),
			nwinpos  = [win_x, canvas.height - win_y, 0.0],
			fwinpos  = [win_x, canvas.height - win_y, 1.0],
			viewport = [0, 0,  canvas.width, canvas.height],
			ishit    = false,
			org      = [0, 0, 0],
			tar      = [0, 0, 0],
			dir      = [0, 0, 0],
			mindex   = 0,
			mesh     = 0,
			hitmesh  = -1,
			info     = {'hit' : false, 't' : 9999999, 'index' : -1},
			resultpos = [9999999, 9999999, 9999999];

		if (meshlist.length <= 0) { return; }

		//create ray
		vpM = getViewProjMatrix();
		mtx.inverse(vpM, vpMI);

		//traverse mesh
		for (mindex = 0; mindex < meshlist.length; mindex = mindex + 1) {
			mesh = meshlist[mindex];
			if (mesh.mode === 'Triangles' && mesh.show === true) {
				localMatrix = render.getLocalMatrixFromMesh(mesh);
				mtx.inverse(localMatrix, localInvMatrix);
				UnProjectWithLocal(nwinpos, vpMI, localInvMatrix, viewport, org);
				UnProjectWithLocal(fwinpos, vpMI, localInvMatrix, viewport, tar);
				dir = Normalize(Sub(tar, org));
				console.log('Ray parameter', org, dir);
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
	
	
	/**
	 * マウスクリック
	 * @method MouseClickFunc
	 * @param {Event} evt マウスイベント
	 */
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

	/**
	 * グループの追加
	 * @method addGroup
	 * @param {String} type グループタイプ
	 */
	function addGroup(type) {
		var colinfo   = [],
			colURL    = -1,
			colaxis   = [],
			coldata   = [],
			pos       = [],
			urllist   = [],
			vtemp     = [],
			name      = '',
			grouptype,
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
		
		console.log('Create add group ', type);
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
		for (i = 0; i < selectnames.length; i = i + 1)
		{
			console.log(selectnames[i].value);
			grouptype = headernames[i].value;
			if (selectnames[i].value === 'X') {
				colinfo.push({'name':grouptype, 'index' : i, 'attr' : 0});
			}
			if (selectnames[i].value === 'Y') {
				colinfo.push({'name':grouptype, 'index' : i, 'attr' : 1});
			}
			if (selectnames[i].value === 'Z') {
				colinfo.push({'name':grouptype, 'index' : i, 'attr' : 2});
			}
			
			if(colURL < 0) {
				if (selectnames[i].value === 'URL') {
					colinfo.push({'name':grouptype, 'index' : i, 'attr' : 3});
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
		return updateMeshText(name, pos, type, urllist, colinfo);
	}
	
	/**
	 * GroupTreeViewにmeshを追加
	 * @method addMeshToGroupTree
	 * @param {Mesh} mesh 追加するmesh
	 */
	function addMeshToGroupTree(mesh) {
		var child = datatree.createChild('mesh', mesh.name, mesh),
			selectnode = window.grouptreeview.getSelectNode();
		meshlist.push(mesh);
		datatree.addChild(selectnode.name, child);
		window.grouptreeview.update(datatree.getRoot(), child);
		window.scene.propertyTab(true);
	}

	/**
	 * ラインの追加
	 * @method addLine
	 * @param {Event} e マウスイベント
	 */
	function addLine(e) {
		var mesh = null;
		mesh = addGroup(nameLineGroup);
		addMeshToGroupTree(mesh);
	}
	
	/**
	 * ポイントの追加
	 * @method addPoint
	 * @param {Event} e マウスイベント
	 */
	function addPoint(e) {
		var mesh = null;
		mesh = addGroup(namePointGroup);
		addMeshToGroupTree(mesh);
	}
	
	/**
	 * 球面ラインの追加
	 * @method addLine
	 * @param {Event} e マウスイベント
	 */
	function addLineSphere(e) {
		var mesh = null;
		mesh = addGroup(nameLineSphereGroup);
		addMeshToGroupTree(mesh);
	}
	
	/**
	 * 球面ポイントの追加
	 * @method addPoint
	 * @param {Event} e マウスイベント
	 */
	function addPointSphere(e) {
		var mesh = null;
		mesh = addGroup(namePointSphereGroup);
		addMeshToGroupTree(mesh);
	}

	/**
	 * ギズモの描画
	 * @method drawGizmo
	 */
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

	/**
	 * フレームの更新
	 * @method updateFrame
	 */
	function updateFrame() {
		var cw            = canvas.width,
			ch            = canvas.height,
			wh            = 1 / Math.sqrt(cw * cw + ch * ch),
			uniLocation   = [],
			gridcolor     = [0.1, 0.1, 0.1, 1.0],
			result        = [],
			vpMatrix,
			vMatrix;
		camera.setupScreen([cw, ch]);
		camera.updateMatrix(wh);
		//updatePopup()
		render.clearColor(0.1, 0.1, 0.1, 1.0);
		render.clearDepth(1.0);
		render.frontFace(true);
		render.Depth(true);
		render.Blend(true);
		vpMatrix = getViewProjMatrix();
		vMatrix  = getViewMatrix();
		render.setViewProjection(vpMatrix);
		render.setView(vMatrix);
		render.setupEyeDir(camera.camPos, camera.camAt);
		render.drawMeshList(meshlist, result);
		updateInfo(result[0].VertexNum, result[0].PolygonNum);
		drawGizmo();
		render.swapBuffer()(updateFrame);
	}
	
	
	function saveScene(e) {
		var cw            = canvas.width,
			ch            = canvas.height,
			filename      = new Date(), //2015/4/7 17:04:08 : toLocaleString()
			text          = '',
			blob,
			ref           = null,
			tablename     = '',
			pgenname      = '',
			modelname     = '',
			mtx           = new MatIV(),
			vpMatrix      = getViewProjMatrix(),
			vpMatrixI     = mtx.identity(mtx.create()),
			RotateMatrixI = mtx.identity(mtx.create()),
			camposview    = [],
			camatview     = [],
			camupview     = [],
			camrotate     = [],
			l_PI          = 3.14159265358979,
			index,
			i;

		//precalc view projection matrix
		camposview[0] = camera.camPos[0];
		camposview[1] = camera.camPos[1];
		camposview[2] = camera.camPos[2];
		camposview[3] = 1.0;

		camatview[0] = camera.camAt[0];
		camatview[1] = camera.camAt[1];
		camatview[2] = camera.camAt[2];
		camatview[3] = 1.0;

		camupview[0] = camera.camUp[0];
		camupview[1] = camera.camUp[1];
		camupview[2] = camera.camUp[2];
		camupview[3] = 1.0;

		//Position
		mtx.inverse(vpMatrix, vpMatrixI);
		camposview = MultMatrixVec4(vpMatrixI, camposview);
		camposview[0] /= camposview[3];
		camposview[1] /= camposview[3];
		camposview[2] /= camposview[3];

		/*
		//AT
		camatview = MultMatrixVec4(vpMatrix, camatview);
		camatview[0] /= camatview[3];
		camatview[1] /= camatview[3];
		camatview[2] /= camatview[3];
		*/

		//UP
		mtx.inverse(camera.RotateMatrix, RotateMatrixI);
		camupview = MultMatrixVec4(RotateMatrixI, camupview);
		camupview[0] /= camupview[3];
		camupview[1] /= camupview[3];
		camupview[2] /= camupview[3];

		//setup filename
		filename = filename.toLocaleString();
		filename = filename.replace(/:/g, "");
		filename = filename.replace(/\//g, "");
		filename = filename.replace(/\s/g, "");
		filename += '.png';

		//setup scene table
		text += 'local scene = {}\n';

		//setup camera
		text += 'local cam = Camera()\n';
		text += 'cam:SetScreenSize(' + cw + ',' + ch + ')\n';
		text += 'cam:SetFilename("' + filename + '")\n';
		text += 'cam:LookAt(';
		text +=  camposview[0] + ', ';
		text +=  camposview[1] + ', ';
		text +=  camposview[2] + ', ';
		text +=  '\n';
		text +=  camatview[0] + ', ';
		text +=  camatview[1] + ', ';
		text +=  camatview[2] + ', ';
		text +=  '\n';
		text +=  camupview[0] + ', ';
		text +=  camupview[1] + ', ';
		text +=  camupview[2] + ', ';
		text +=  '\n';
		text +=  scene_fov + ')\n';

		text += 'table.insert(scene, cam)\n';

		//setup mesh
		for(index = 0; index < meshlist.length; index = index + 1) {
			ref = meshlist[index];
			if(ref.show !== true) {
				continue;
			}
			console.log("GROUP_TYPE === ", ref.grouptype);
			
			//Create Script table name 
			tablename = 'table_' + ref.name;
			modelname = 'model_' + ref.name;
			pgenname  = 'pgen_'  + ref.name;

			tablename = tablename.replace(/\./g, "");
			modelname = modelname.replace(/\./g, "");
			pgenname  = pgenname.replace(/\./g, "");

			//------------------------------------------------------------------------------
			//
			// STLDATA
			//
			//------------------------------------------------------------------------------
			if(ref.grouptype === nameSTLData) {
				text += '------------------------------------------------------\n';
				text += '-- STL \n';
				text += '------------------------------------------------------\n';
				text += 'local ' + tablename + ' = {\n';
				
				for(i = 0 ; i < ref.position.length; i = i + 3) {
					if ( ( i % 9 ) === 0) text += '\n';
					text += ref.position[i + 0] + ',';
					text += ref.position[i + 1] + ',';
					text += ref.position[i + 2] + ',';
				}
				//
				for(i = 0 ; i < ref.normal.length; i = i + 3) {
					if ( ( i % 9 ) === 0) text += '\n';
					text += ref.normal[i + 0] + ',';
					text += ref.normal[i + 1] + ',';
					text += ref.normal[i + 2] + ',';
				}

				text += '\n}\n\n';
				
				text += 'local ' + modelname + ' = PolygonModel()\n';
				text += 'local ' + pgenname + ' = PrimitiveGenerator()\n'

				//Create start
				text += modelname + ':Create(';
				text += pgenname + ':TriangleList(' + tablename + ', (#' + tablename + ') / 3)';
				text += ')\n';
				//Create End
			}

			//------------------------------------------------------------------------------
			//
			// POINT
			//
			//------------------------------------------------------------------------------
			if(ref.grouptype === namePointGroup || ref.grouptype === namePointSphereGroup) {
				text += '------------------------------------------------------\n';
				text += '-- PointList Primitive\n';
				text += '------------------------------------------------------\n';

				text += 'local ' + tablename + ' = {\n';
				
				//Create PointList Table
				for(i = 0 ; i < ref.pointposition.length; i = i + 3) {
					if ( ( i % 9 ) === 0) text += '\n';
					text += ref.pointposition[i + 0] + ',';
					text += ref.pointposition[i + 1] + ',';
					text += ref.pointposition[i + 2] + ',';
				}
				text += '\n}\n\n';
				
				text += 'local ' + modelname + ' = PointModel()\n';
				text += 'local ' + pgenname + ' = PrimitiveGenerator()\n'

				//Create start
				text += modelname + ':Create(';
				text += pgenname + ':PointList(' + tablename + ', (#' + tablename + ') / 3, ' +  ref.radius + ') '
				text += ')\n';
				//Create End
			}


			//------------------------------------------------------------------------------
			//
			// LINE
			//
			//------------------------------------------------------------------------------
			if(ref.grouptype === nameLineGroup || ref.grouptype === nameLineSphereGroup) {
				text += '------------------------------------------------------\n';
				text += '-- LineList Primitive\n';
				text += '------------------------------------------------------\n';
				text += 'local ' + tablename + ' = {\n';
				
				//Create LineList Table
				for(i = 0 ; i < ref.pointposition.length; i = i + 3) {
					if ( ( i % 9 ) === 0) text += '\n';
					text += ref.pointposition[i + 0] + ',';
					text += ref.pointposition[i + 1] + ',';
					text += ref.pointposition[i + 2] + ',';
				}
				text += '\n}\n\n';
				
				text += 'local ' + modelname + ' = LineModel()\n';
				text += 'local ' + pgenname + ' = PrimitiveGenerator()\n'

				//Create start
				text += modelname + ':Create(';
				text += pgenname + ':LineList(' + tablename + ', (#' + tablename + ') / 3, ' +  ref.radius + ') '
				text += ')\n';
				//Create End
			}

			//transform and push scene
			if(
				ref.grouptype === nameSTLData ||
				ref.grouptype === nameLineGroup ||
				ref.grouptype === nameLineSphereGroup ||
				ref.grouptype === namePointGroup ||
				ref.grouptype === namePointSphereGroup)
			{
				//scale
				text += modelname + ':SetScale(\n';
				text += ref.scale[0] + ', ' + ref.scale[1] + ', ' + ref.scale[2] + '\n';
				text += ')\n\n'

				//rotate
				text += modelname + ':SetRotate(\n';
				text += ref.rotate[0] + ', ' + ref.rotate[1] + ', ' + ref.rotate[2] + '\n';
				text += ')\n\n'

				//trans
				text += modelname + ':SetTranslate(\n';
				text += ref.trans[0] + ', ' + ref.trans[1] + ', ' + ref.trans[2] + '\n';
				text += ')\n\n'

				text += modelname + ":SetShader('normal.frag')\n";
				text += 'table.insert(scene, ' + modelname + ')\n';
			}
		}

		//RENDER
		text += 'render(scene)\n'

		console.log(text);
		blob = new Blob([text], {type: "text/plain;charset=utf-8"});
		saveAs(blob, "scene.scn");
	}

	/**
	 * OpenGLの開始
	 * @method startGL
	 */
	function startGL() {
		console.log('startGL');
		onResize();
		resetAll();
		updateFrame();
	}


	/**
	 * スイッチの開閉
	 * @method openSwitch
	 * @param {Event} e マウスイベント
	 */
	function openSwitch(e) {
		var openwindow = document.getElementById('OpenWindow');
		$toggle(openwindow, 100);
		window.scene.groupTab(false);
	}
	
	/**
	 * ViewDirectionボタンの開閉
	 * @method openViewDirection
	 * @param {Event} e マウスイベント
	 */
	function openViewDirection(e) {
		var viewdir = document.getElementById('ViewDirection');
		$toggle(viewdir, 100);
		window.scene.groupTab(false);
	}
	
	/**
	 * 表示タイプボタンの開閉
	 * @method openViewType
	 * @param {Event} e マウスイベント
	 */
	function openViewType(e) {
		var viewtype = document.getElementById('ViewType');
		$toggle(viewtype, 100);
		window.scene.groupTab(false);
	}
	
	/**
	 * コンソールの開閉
	 * @method consoleSwitch
	 * @param {Event} e マウスイベント
	 */
	function consoleSwitch(e) {
		var openwindow = document.getElementById('console');
		$toggle(openwindow, 100);
		
	}
	
	
	/**
	 * テキストの読み込み
	 * @method loadTXT
	 * @param {Event} e ファイルイベント
	 */
	function loadTXT(e) {
		window.hstable.openText(e);
		openSwitch();
		document.getElementById('OpenTextFile').innerHTML = '';
		
		if (consolestate === 0) {
			consolestate = 1;
			window.scene.consoleTab(true);
		}
	}
	
	
	/**
	 * コンソールの更新発生したら
	 * @method updateconsole
	 * @param {Object} change 更新メッセージ
	 */
	function updateconsole(table) {
		var i,
			node = null,
			oldmesh = null,
			mesh = null;

		for(i = 0 ; i < meshlist.length; i++) {
			if(meshlist[i].parentdata === table) {
				//replace datatree data
				node = datatree.findNodeData(meshlist[i]);
				if(node === null) {
					//console.log('ERROR 何も見つかりませんでした');
					continue;
				}

				oldmesh = meshlist[i];

				//reconstruct mesh data.
				window.hstable.loadData(node.data.parentdata, node.data.colinfo);
				mesh = addGroup(oldmesh.grouptype);
				oldmesh.duplicateInfo(mesh);
				meshlist[i] = mesh;
				window.hstable.loadData(node.data.parentdata);
				
				//replace node data
				node.data = meshlist[i];
				
				//delete old VBO etc.
				render.deleteMeshObj(oldmesh);
			}
		}
		
		
		if(mesh !== null) {
			camera.setupLerp(mesh.boundmin, mesh.boundmax, mesh.trans, mesh.scale, mesh.rotate);
		}
	}
	
	/**
	 * 初期化
	 * @method init
	 */
	function init() {
		var i,
			openswitch     = document.getElementById('OpenSwitch'),
			viewdirection  = document.getElementById('ViewDirectionSwitch'),
			viewtype       = document.getElementById('ViewTypeSwitch'),
			viewortho      = document.getElementById('viewOrtho'),
			viewpers       = document.getElementById('viewPers'),
			openstl        = document.getElementById('OpenSTL'),
			opencsv        = document.getElementById('OpenCSV'),
			addline        = document.getElementById('AddLine'),
			addpoint       = document.getElementById('AddPoint'),
			addpointsphere = document.getElementById('AddPointSphere'),
			addlinesphere  = document.getElementById('AddLineSphere'),
			pickup         = document.getElementById('pickup'),
			sideviewx      = document.getElementById('viewLeft'),
			sideviewy      = document.getElementById('viewTop'),
			sideviewz      = document.getElementById('viewFront'),
			sideviewx_     = document.getElementById('viewRight'),
			sideviewy_     = document.getElementById('viewBottom'),
			sideviewz_     = document.getElementById('viewBack'),
			
			deletegroup    = document.getElementById('DeleteGroup'),
			savebutton     = document.getElementById('SaveButton'),
		
			propertyTab,
			groupTab,
			consoleTab;

		//init canvas
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
		viewdirection.onclick = openViewDirection;
		viewtype.onclick = openViewType;
		addline.onclick  = addLine;
		addpoint.onclick = addPoint;
		addpointsphere.onclick = addPointSphere;
        addlinesphere.onclick  = addLineSphere;
		sideviewx.onclick = (sideViewChange)("x");
		sideviewy.onclick = (sideViewChange)("y");
		sideviewz.onclick = (sideViewChange)("z");
		sideviewx_.onclick = (sideViewChange)("x-");
		sideviewy_.onclick = (sideViewChange)("y-");
		sideviewz_.onclick = (sideViewChange)("z-");
		
		viewortho.onclick = (viewModeChange)("ortho");
		viewpers.onclick  = (viewModeChange)("pers");
		savebutton.onclick = saveScene;

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
		groupTab(false);

		consoleTab = window.animtab.create('bottom', {
			'bottomTab' : { min : '10px', max : '400' }
		}, {
			'consoleOutput' : { min : '0px', max : '400px' },
			'consoleTextBlockArea' :  { min : '0px', max : '365px' }
		}, 'DataView');
		consoleTab(false);

		window.scene.consoleTab        = consoleTab;
		window.scene.propertyTab       = propertyTab;
		//window.scene.groupTab          = groupTab;
		/* event hook */
		function hideMenu(visible) {
			var openwindow = document.getElementById('OpenWindow'),
				viewdir = document.getElementById('ViewDirection'),
				viewtype = document.getElementById('ViewType');
			$hide(openwindow);
			$hide(viewdir);
			$hide(viewtype);
		}
		document.getElementById('leftTab').addEventListener('click', function(ev) {
			hideMenu(false);
		});
		window.scene.groupTab = function (visible) {
			hideMenu(false);
			groupTab(visible);
		}

		setTimeout(startGL, 50);
	}
	
	window.onload                  = init;
	window.onresize                = onResize;
	window.scene                   = scene;
	window.scene.updateDataTree    = updateDataTree;
	window.scene.selectTreeNode    = selectTreeNode;
	window.scene.updateconsole     = updateconsole;
	window.scene.delMesh           = delMesh;
	window.scene.Pick              = Pick;
	
	window.scene.KickDog           = KickDog;
}(window.loadSTLB));

