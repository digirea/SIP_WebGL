/*jslint devel:true*/
/*global */

(function (scene) {
	"use strict";
	var propertylist = {},
		currentData = null,
		changedValueFuncs = [];
	
	function makeItemNode(name, text, top) {
		var itemNode = document.createElement('div'),
			nameNode = document.createElement('div'),
			textNode = document.createElement('div');

		itemNode.classList.add('nodePropertyRow');
		nameNode.innerHTML = name;
		textNode.innerHTML = text;
		nameNode.classList.add('nodePropertyName');
		textNode.classList.add('nodePropertyConst');
		if (top) {
			nameNode.classList.add('nodePropertyTop');
			textNode.classList.add('nodePropertyTop');
		}
		itemNode.appendChild(nameNode);
		itemNode.appendChild(textNode);
		return itemNode;
	}
	
	function makeItemTextNode(name, text, node, type) {
		var itemNode = document.createElement('div'),
			nameNode = document.createElement('div'),
			textNode = document.createElement('input');
		if (type) {
			textNode.setAttribute('type', type);
		} else {
			textNode.setAttribute('type', 'text');
		}
		itemNode.classList.add('nodePropertyRow');
		nameNode.innerHTML = '[' + name + ']';
		textNode.value = text;
		nameNode.classList.add('nodePropertyName');
		textNode.classList.add('nodePropertyText');
		itemNode.appendChild(nameNode);
		itemNode.appendChild(textNode);
		
		function valChange(data, txt) {
			return function (e) {
				data.value = parseFloat(txt.value);
				scene.updateDataTree(currentData);
				//changedValueFuncs.push(function () {
				//	data.value = parseFloat(txt.value);
				//});
			};
		}
		
		textNode.addEventListener('change', valChange(node, textNode));
		return itemNode;
	}
	
	function makeItemArrayNumNode(name, text, node) {
		var itemNode = document.createElement('div'),
			nameNode = document.createElement('div'),
			textNode = document.createElement('input');
		
		textNode.setAttribute('type', 'number');
		itemNode.classList.add('nodePropertyRow');
		nameNode.innerHTML = '[' + name + ']';
		textNode.value = text;
		nameNode.classList.add('nodePropertyName');
		textNode.classList.add('nodePropertyValue');
		itemNode.appendChild(nameNode);
		itemNode.appendChild(textNode);
		
		textNode.addEventListener('blur', (function (data, txt) {
			return function (e) {
				// resize array
				var l = parseInt(txt.value, 10),
					i;
				if (!isNaN(l) && l > 0) {
					data.array.length = l;
					for (i = 0; i < l; i = i + 1) {
						if (data.array[i] === undefined) {
							data.array[i] = {};
							data.array[i].name = data.name + i;
							data.array[i].type = data.type;
						}
					}
					//updateNode();
				}
				scene.updateDataTree(currentData);
			};
		}(node, textNode)));
		return itemNode;
	}
	
	function makeItemVecNode(name, vals, node, n) {
		var itemNode = document.createElement('div'),
			nameNode = document.createElement('div'),
			valNode,
			i;
		
		itemNode.classList.add('nodePropertyRow');
		nameNode.innerHTML = '[' + name + ']';
		nameNode.classList.add('nodePropertyName');
		itemNode.appendChild(nameNode);

		function valChange(data, txt, i) {
			return function (e) {
				data.value[i] = parseFloat(txt.value);
				scene.updateDataTree(currentData);
				
				//changedValueFuncs.push(function () {
				//});
			};
		}
		
		for (i = 0; i < n; i = i + 1) {
			valNode = document.createElement('input');
			valNode.setAttribute('type', 'text');
			valNode.value = vals[i];
			valNode.classList.add('nodePropertyValue');
			itemNode.appendChild(valNode);
			valNode.addEventListener('change', valChange(node, valNode, i));
		}
		return itemNode;
	}
	
	function doApply(data) {
		var i,
			func;
		//console.log("Apply:", changedValueFuncs);
		for (i = 0; i < changedValueFuncs.length; i = i + 1) {
			func = changedValueFuncs[i];
			func();
		}
		if (currentData) {
			scene.updateDataTree(currentData);
		}
		changedValueFuncs = [];
	}
	
	
	function doDelete(data) {
		console.log(currentData)
	}
	

	// data - name, varname, 
	function showProperty(data) {
		//console.log(data);
		var to = document.getElementById("property"),
			html = '',
			i,
			k,
			cameradata,
			desc = ['Pos', 'At', 'UP'],
			pxyz = ['X', 'Y', 'Z'],
			index = 0,
			ele,
			prop = document.createElement('div'),
			itemNode,
			inode,
			alphavalue  = document.getElementById('AlphaValue'),
			applyButton  = document.getElementById('ApplyProperty'),
			deleteButton = document.getElementById('DeleteProperty');
		
		if (data.name !== 'root') {
			applyButton.style.display  = "block";
			deleteButton.style.display = "block";
			//alphavalue.style.display   = "block";
			applyButton.onclick        = doApply;
			deleteButton.onclick       = doDelete;
		} else {
			applyButton.style.display  = "none";
			deleteButton.style.display = "none";
			//alphavalue.style.display   = "none";
			applyButton.onclick        = null;
			deleteButton.onclick       = null;
		}
		
		currentData = data;
		changedValueFuncs = []; // clear
		to.innerHTML = ''; // clear
		to.appendChild(makeItemNode('Property Name', 'Value', true));
		to.appendChild(makeItemNode('name', data.name));
		to.appendChild(makeItemNode('varname', data.varname));
		//to.appendChild(makeItemNode('funcname', data.funcname));
		
		to.appendChild(prop);
		
		if (!data.input) {
			return;
		}
		
		function addArrayItem(inode, n) {
			var itemNode;
			if (inode.type === 'string' || inode.type === 'float') {
				itemNode = makeItemTextNode('', inode.array[n], inode);
			} else if (inode.type === 'vec4') {
				itemNode = makeItemVecNode('', inode.array[n], inode, 4);
			} else if (inode.type === 'vec3') {
				itemNode = makeItemVecNode('', inode.array[n], inode, 3);
			} else if (inode.type === 'vec2') {
				itemNode = makeItemVecNode('', inode.array[n], inode, 2);
			} else {
				itemNode = makeItemNode('', '(Object)');
			}
			return itemNode;
		}
		function addItems(inode) {
			var itemNode;
			if (inode.type === 'string' || inode.type === 'float') {
				itemNode = makeItemTextNode(inode.name, inode.value, inode);
			} else if (inode.type === 'vec4') {
				itemNode = makeItemVecNode(inode.name, inode.value, inode, 4);
			} else if (inode.type === 'vec3') {
				itemNode = makeItemVecNode(inode.name, inode.value, inode, 3);
			} else if (inode.type === 'vec2') {
				itemNode = makeItemVecNode(inode.name, inode.value, inode, 2);
			} else {
				itemNode = makeItemNode(inode.name, '(Object)');
			}
			return itemNode;
		}
		
		for (i = 0; i < data.input.length; i = i + 1) {
			if (data.input.hasOwnProperty(i)) {
				inode = data.input[i];
				if (Array.isArray(inode.array)) {
					itemNode = makeItemArrayNumNode(inode.name, inode.array.length, inode);
					to.appendChild(itemNode);
					for (k = 0; k < inode.array.length; k = k + 1) {
						to.appendChild(addItems(inode.array[k]));
					}
				} else {
					to.appendChild(addItems(inode));
				}
			}
		}
	}
	
	/*
	function init() {
		(function ($) {
			$(function () {
				$("#tree").treeview({
					collapsed: true,
					animated: "fast",
					control: "#sidetreecontrol",
					persist: "location"
				});
			});
		}(jQuery));
	}
	init();
	*/

	window.propertylistview = propertylist;
	window.propertylistview.showProperty = showProperty;

}(window.scene));
