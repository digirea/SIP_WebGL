/*jslint devel:true*/

(function () {
	"use strict";
	var datatree = {},
		root     = [],
		dataid   = 0;

	/**
	 *　ノードの作成
	 * @method makeNode
	 * @param {String} type　ノードタイプ.
	 * @param {String} name　ノード名.この名前がそのまま使われる.
	 * @param {data} data データ
	 * @return node 作成されたノード
	 */
	function makeNode(type, name, data) {
		var node = {
			'child' : [],
			'type'  : type,
			'name'  : name,
			'data'  : data,
			'trans' : [0, 0, 0],
			'scale' : [1, 1, 1],
			'rotate': [0, 0, 0],
			'color' : [1, 1, 1, 1],
			'radius': [1]
		};
		return node;
	}
	
	
	/**
	 * 入力名からノード名用の文字列を作成して返す.
	 * @method GetName
	 * @param {String} base 入力文字列
	 * @return BinaryExpression 作成されたノード名用文字列.
	 */
	function GetName(base) {
		var ret = dataid;
		dataid = dataid + 1;
		return 'ID' + ret + '_' + base;
	}

	/**
	 * ルートの作成
	 * @method createRoot
	 * @param {String} type ノードタイプ
	 * @param {String} name ノード名.実際にはこの名前にID等が付け加えられた名前のノードが作られる.
	 * @param {data} data データ
	 * @return r 作成されたノード.
	 */
	function createRoot(type, name, data) {
		var r = makeNode(type, GetName(name), data);
		root.push(r);
		data.name = r.name;
		return r;
	}

	/**
	 * 子ノードの作成.
	 * @method createChild
	 * @param {String} type ノードタイプ
	 * @param {String} name 作成するノード名
	 * @param {data} data データ.
	 * @return child 作成されたノード
	 */
	function createChild(type, name, data) {
		var parent,
			child,
			i;
		child = makeNode(type, GetName(name), data);
		data.name = child.name;
		return child;
	}
	
	/**
	 * 入力されたノード以下のノードから指定した名前のノードを削除.
	 * @method delDataChild
	 * @param {String} name 削除対象ノード名.
	 * @param {node} node 再帰用親ノードパラメータ
	 */
	function delDataChild(name, node) {
		var i,
			newchild = [];

		if (node.child && node.child.length > 0) {
			for (i = 0; i < node.child.length; i = i + 1) {
				if (name !== node.child[i].name) {
					newchild.push(node.child[i]);
				} else {
					console.log("DELETE CHILD ", name, node.child[i].name);
					window.scene.delMesh(node.child[i].name);
					console.log("DELETE MESH ", name, node.data.name);
				}
				delDataChild(name, node.child[i]);
			}
			node.child = newchild;
		}
	}

	/**
	 * 指定されたノードのメッシュをすべて削除
	 * @method delDataNodeMesh
	 * @param {node} node 削除対象のノード
	 */
	function delDataNodeMesh(node) {
		var i;
		for (i = 0; i < node.length; i = i + 1) {
			window.scene.delMesh(node[i].name);
		}
	}
	
	/**
	 * データの削除.
	 * @method delData
	 * @param {String} name 削除するデータのノード名.
	 * @return root 作成された新規ルートノードリスト.
	 */
	function delData(name) {
		var i,
			newroot;
		if (root.length <= 0) { return; }
		newroot = [];
		for (i = 0; i < root.length; i = i + 1) {
			window.scene.delMesh(name);
			console.log(root[i].name, name);
			delDataChild(name, root[i]);
			if (root[i].name !== name) {
				newroot.push(root[i]);
			} else if(root[i].type === 'text') {
				delDataNodeMesh(root[i].child);
			}
		}
		root = newroot;
		window.hstable.resetData();
		return root;
	}

	/**
	 * ルートノード直下のノードの検索
	 * @method findRoot
	 * @param {String} name ノード名
	 * @return Literal　nullまたは取得したノード.
	 */
	function findRoot(name) {
		var i;
		if (root.length < 0) {
			console.log('root length is zero.');
			return null;
		}
		for (i = 0; i < root.length; i = i + 1) {
			if (root[i].name === name) {
				return root[i];
			}
		}
		console.log('findRoot not found : ', name);
		return null;
	}

	/**
	 * 子ノードの追加
	 * @method addChild
	 * @param {String} rootname 追加先のルートノード名
	 * @param {node} child 追加するノード
	 */
	function addChild(rootname, child) {
		var node = findRoot(rootname);
		if (!node) { return; }
		node.child.push(child);
		return;
	}

	/**
	 * ルートノードを取得.
	 * @method getRoot
	 * @return root ルートノード
	 */
	function getRoot() {
		return root;
	}

	/**
	 * 指定した名前のデータの取得
	 * @method getData
	 * @param {String} name 取得するデータ名
	 * @return Literal nullまたは取得したデータ.
	 */
	function getData(name) {
		var i,
			n,
			selectnode;
		for (i = 0; i < root.length; i = i + 1) {
			selectnode = root[i];
			for (n = 0; n < selectnode.child.length; n = n + 1) {
				if (selectnode.child[n].name === name) {
					return selectnode.child[n];
				}
			}
		}
		return null;
	}
	
	
	/**
	 * 指定した名前のノードを検索する[サブ]
	 * @method findNode
	 * @param {String} name 検索するノード名
	 * @param {Node}   node 検索対象ノード
	 * @return Literal nullまたは取得したノード.
	 */
	function findNodeNameSub(name, node) {
		var i = 0,
			temp = null;
		if(node === null || node === undefined) {
			return null;
		}
		for (i = 0; i < node.length; i = i + 1) {
			if(node[i].name === name) {
				return node;
			}
			if(node[i].child && node[i].child.length > 0) {
				temp = findNodeNameSub(name, node[i].child);
				if(temp !== null) return temp;
			}
		}
		return null;
	}

	/**
	 * 指定した名前のノードを検索して返却する
	 * @method findNode
	 * @param {String} name 検索するノード名
	 * @return Literal nullまたは取得したノード.
	 */
	function findNodeName(name) {
		return findNodeNameSub(name, root);
	}
	
	/**
	 * 指定した名前のノードを検索する[サブ]
	 * @method findNode
	 * @param {Object} data 検索するノードデータ
	 * @param {Node}   node 検索対象ノード
	 * @return Literal nullまたは取得したノード.
	 */
	function findNodeDataSub(data, node) {
		var i = 0,
			temp = null;
		if(node === null || node === undefined) {
			return null;
		}
		for (i = 0; i < node.length; i = i + 1) {
			if(node[i].data === data) {
				return node[i];
			}
			if(node[i].child && node[i].child.length > 0) {
				temp = findNodeDataSub(data, node[i].child);
				if(temp !== null) return temp;
			}
		}
		return null;
	}

	/**
	 * 指定した名前のノードを検索して返却する
	 * @method findNode
	 * @param {Object} data 検索するノードデータ
	 * @return Literal nullまたは取得したノード.
	 */
	function findNodeData(data) {
		return findNodeDataSub(data, root);
	}
	
	

	window.datatree             = datatree;
	window.datatree.createRoot  = createRoot;
	window.datatree.findRoot    = findRoot;
	window.datatree.createChild = createChild;
	window.datatree.addChild    = addChild;
	window.datatree.getRoot     = getRoot;
	window.datatree.getData     = getData;
	window.datatree.delData     = delData;
	window.datatree.findNodeData    = findNodeData;
	window.datatree.findNodeName    = findNodeName;
}());


