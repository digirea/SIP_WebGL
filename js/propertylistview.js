/*jslint devel:true*/
/*global */

(function () {
	"use strict";
	var propertylist = {};
	
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
		
		textNode.addEventListener('keyup', (function (data, txt) {
			return function (e) {
				data.value = txt.value;
			};
		}(node, textNode)));
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
				data.value[i] = txt.value;
			};
		}
		for (i = 0; i < n; i = i + 1) {
			valNode = document.createElement('input');
			valNode.setAttribute('type', 'text');
			valNode.value = vals[i];
			valNode.classList.add('nodePropertyValue');
			itemNode.appendChild(valNode);
			valNode.addEventListener('keyup', valChange(node, valNode, i));
		}
		return itemNode;
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
			inode;
		
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
	
	window.propertylistview = propertylist;
	window.propertylistview.showProperty = showProperty;
}());
