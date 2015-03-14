/*jslint devel:true*/

(function () {
	"use strict";
	var datatree = {};
	var root  = [];

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

	function createRoot(type, name, data) {
		var r = makeNode(type, name, data);
		root.push(r);
		return r;
	};

	function createChild(type, name, data) {
		var parent,
			child,
			i;
		child = makeNode(type, name, data);
		console.log('Create Child : ', child);
		return child;
	};

	function delData(name) {
		
	}

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

	function addChild(rootname, child) {
		var node = findRoot(rootname);
		if(!node) return ;
		node.child.push(child);
		return ;
	}

	function findTree(name, node) {
		if(!node) return null;
		if(node.name === name) {
			return node;
		}
		return findTree(node.child);
	}

	function getRoot() {
		return root;
	}

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
}());


