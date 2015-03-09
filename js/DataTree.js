/*jslint devel:true*/

(function () {
	"use strict";
	var datatree = function () {
		this.root  = [];
	};

	function addData(name, data) { //{'0':data, '1':data, '2':data, ....} //dataは列の適当な数字だったりURLだったりします
		var dataleaf = {'name':name, 'data':data, 'child':[]};
		this.root.push(dataleaf);
	};

	//nameは適当な名前(仮)index = rootのindex,   select->0, 3, 4など列の数字が入る
	function createChild(name, index, select) {
		var selectnode,
			child;
			i;
		if(!this.root[index]) return;
		selectnode = this.root[index];
		child = {
			'name':name,
			'index':index,
			'data':[],
			'trans':[0, 0, 0],
			'scale':[1, 1, 1],
			'rotate':[0, 0, 0],
			'color':[1, 1, 1, 1],
		};
		for(i = 0; i < select.length; i = i + 1) {
			child.data.push(selectnode[select[i]]);
		}
		selectnode.child.push(child);
	};

	function getRoot() {
		return this.root;
	}

	function getData(name) {
		var i,
			n,
			selectnode;
		for(i = 0 ; i < this.root.length; i = i + 1) {
			selectnode = this.root[index];
			for(n = 0 ; n < selectnode.child.length; n = n + 1) {
				if(selectnode.child.name === name) {
					return selectnode.child;
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
}());


