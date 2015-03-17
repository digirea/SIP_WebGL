/*jslint devel:true*/

(function () {
	"use strict";
	var datatree = {},
		root     = [],
		dataid   = 0;

	/**
	 * Description
	 * @method makeNode
	 * @param {} type
	 * @param {} name
	 * @param {} data
	 * @return node
	 */
	function makeNode(type, name, data) {
		var node =
		{
			'child' :[],
			'type'  :type,
			'name'  :name,
			'data'  :data,
			'trans' :[0, 0, 0],
			'scale' :[1, 1, 1],
			'rotate':[0, 0, 0],
			'color' :[1, 1, 1, 1],
			'radius':[1],
		};
		return node;
	}
	
	
	/**
	 * Description
	 * @method GetName
	 * @param {} base
	 * @return BinaryExpression
	 */
	function GetName(base) {
		var ret = dataid;
		dataid = dataid + 1;
		return  'ID' + ret + '_' + base;
	}

	/**
	 * Description
	 * @method createRoot
	 * @param {} type
	 * @param {} name
	 * @param {} data
	 * @return r
	 */
	function createRoot(type, name, data) {
		var r = makeNode(type, GetName(name), data);
		root.push(r);
		data.name = r.name;
		return r;
	}

	/**
	 * Description
	 * @method createChild
	 * @param {} type
	 * @param {} name
	 * @param {} data
	 * @return child
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
	 * Description
	 * @method delDataChild
	 * @param {} name
	 * @param {} node
	 */
	function delDataChild(name, node) {
		var i;
		var newchild = [];

		if(node.child && node.child.length > 0) {
			for(i = 0 ; i < node.child.length; i = i + 1) {
				if(name !== node.child[i].name) {
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
	 * Description
	 * @method delData
	 * @param {} name
	 * @return root
	 */
	function delData(name) {
		var i,
			newroot;
		if (root.length <= 0) return ;
		newroot = [];
		for (i = 0 ; i < root.length; i++) {
			window.scene.delMesh(name);
			console.log(root[i].name, name);
			delDataChild(name, root[i]);
			if(root[i].name !== name) {
				newroot.push(root[i]);
			}
		}
		root = newroot;
		window.hstable.resetData();
		return root;
	}

	/**
	 * Description
	 * @method findRoot
	 * @param {} name
	 * @return Literal
	 */
	function findRoot(name) {
		var i;
		if(root.length < 0) {
			console.log('root length is zero.');
			return null;
		}
		for(i = 0 ; i < root.length ; i++) {
			if(root[i].name == name) {
				return root[i];
			}
		}
		console.log('findRoot not found : ', name);
		return null;
	}

	/**
	 * Description
	 * @method addChild
	 * @param {} rootname
	 * @param {} child
	 */
	function addChild(rootname, child) {
		var node = findRoot(rootname);
		if(!node) return ;
		node.child.push(child);
		return ;
	}

	/**
	 * Description
	 * @method findTree
	 * @param {} name
	 * @param {} node
	 * @return CallExpression
	 */
	function findTree(name, node) {
		if(!node) return null;
		if(node.name === name) {
			return node;
		}
		return findTree(node.child);
	}

	/**
	 * Description
	 * @method getRoot
	 * @return root
	 */
	function getRoot() {
		return root;
	}

	/**
	 * Description
	 * @method getData
	 * @param {} name
	 * @return Literal
	 */
	function getData(name) {
		var i,
			n,
			selectnode;
		for(i = 0 ; i < root.length; i = i + 1) {
			selectnode = root[i];
			for(n = 0 ; n < selectnode.child.length; n = n + 1) {
				if(selectnode.child[n].name === name) {
					return selectnode.child[n];
				}
			}
		}
		return null;
	}

	window.datatree             = datatree;
	window.datatree.createRoot  = createRoot;
	window.datatree.findRoot    = findRoot;
	window.datatree.createChild = createChild;
	window.datatree.addChild    = addChild;
	window.datatree.getRoot     = getRoot;
	window.datatree.getData     = getData;
	window.datatree.delData     = delData;
}());


