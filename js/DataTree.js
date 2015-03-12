/*jslint devel:true*/

(function () {
	"use strict";
	var datatree = {};
	var root  = [];

	function addData(name, data) {
		var dataleaf = {'name':name, 'data':data, 'child':[]};
		root.push(dataleaf);
	};

	function createChild(name, index, data) {
		var selectnode,
			child,
			i;
		if(!root[index]) return;
		selectnode = root[index];
		child =
		{
			'name'  :name,
			'index' :index,
			'data'  :data,
			'trans' :[0, 0, 0],
			'scale' :[1, 1, 1],
			'rotate':[0, 0, 0],
			'color' :[1, 1, 1, 1],
			'radius':[1],
		};
		selectnode.child.push(child);
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
	window.datatree.addData     = addData;
	window.datatree.createChild = createChild;
	window.datatree.getRoot     = getRoot;
	window.datatree.getData     = getData;
	
	//test data
	/*
	addData('test1',
		{
			'0':[1,2,3,4,5,63,7,8,9],
			'1':[2,3,-4,-5,63,7,-8,-9],
			'2':[22,3,-4,-5,63,7,-82,-9],
			'3':[-4,3,-4,-5,63,7,-8,-9],
			'4':[6,3,-4,-5,63,7,-8,-9]
		});
	
	addData('test2',
		{
			'0':[-4,3,-4,-5,63,7,-8,-9],
			'1':[1,2,3,4,5,63,7,8,9],
			'2':[22,3,-4,-5,63,7,-8,-9],
			'3':[2,32,-4,-5,63,7,-8,-9]
		});

	createChild('child1', 0, [0, 1, 2]);
	createChild('child2', 0, [0, 2]);
	console.log(getRoot());
	console.log('GET', getData('child1'));
	console.log('GET', getData('child2'));
	console.log('GET', getData('childs2')); //null
	*/
	
	
}());


