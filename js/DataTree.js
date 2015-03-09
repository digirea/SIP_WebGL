/*jslint devel:true*/

(function () {
	"use strict";
	var datatree = {};
	var root  = [];

	function addData(name, data) { //{'0':data, '1':data, '2':data, ....} //dataは列の適当な数字だったりURLだったりします
		var dataleaf = {'name':name, 'data':data, 'child':[]};
		root.push(dataleaf);
	};

	//nameは適当な名前(仮)index = rootのindex,   select->0, 3, 4など列の数字が入る
	function createChild(name, index, select) {
		var selectnode,
			child,
			i;
		if(!root[index]) return;
		selectnode = root[index];
		child =
		{
			'name'  :name,
			'index' :index,
			'data'  :[],
			'trans' :[0, 0, 0],
			'scale' :[1, 1, 1],
			'rotate':[0, 0, 0],
			'color' :[1, 1, 1, 1],
		};
		for(i = 0; i < select.length; i = i + 1) {
			child.data.push(selectnode.data[[select[i]]]);
		}
		selectnode.child.push(child);
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
			console.log('SELECT', selectnode);
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
	
	
}());


