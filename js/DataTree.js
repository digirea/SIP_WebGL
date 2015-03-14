/*jslint devel:true*/

(function () {
	"use strict";
	var datatree = {};
	var root  = [];

	function makeNode(name, data) {
		var node =
		{
			'child':[],
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
	
	
	function addRoot(name, data) {
		var r = {'name':name, 'data':data, 'child':[]};
		root = r;
	};
	
	
	function delData(name) {
		
	}

	function findTree(name, node) {
		if(!node) return null;
		if(node.name === name) {
			return node;
		}
		return findTree(node.child);
	}

	function createChild(parentname, name, data) {
		var parent,
			child,
			i;

		if(root.length < 0) return null;

		parent = findTree(parentname, root);
		if(parent == null) return null;
		child = makeNode(name, data);
		parent.child.push(child);
		return child;
	};

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
	window.datatree.addRoot     = addRoot;
	window.datatree.createChild = createChild;
	window.datatree.getRoot     = getRoot;
	window.datatree.getData     = getData;
}());


