/*jslint devel:true*/
/*global jQuery */

(function (datatree, propertylistview) {
	"use strict";
	var grouptreeview = {},
		treeRootElem = document.getElementById('tree');

	function getPropertyValues(node) {
		var values = [],
			trans  = {},
			rotate = {},
			scale  = {},
			radius = {},
			color  = {},
			show   = {};
		if (node.trans) {
			trans.name = "trans";
			trans.type = "vec3";
			trans.value = node.trans;
			values.push(trans);
		}
		if (node.rotate) {
			rotate.name = "rotate";
			rotate.type = "vec3";
			rotate.value = node.rotate;
			values.push(rotate);
		}
		if (node.scale) {
			scale.name = "scale";
			scale.type = "vec3";
			scale.value = node.scale;
			values.push(scale);
		}
		if (node.color) {
			color.name = "color";
			color.type = "vec4";
			color.value = node.color;
			values.push(color);
		}
		if (node.radius) {
			radius.name = "radius";
			radius.type = "float";
			radius.value = node.radius;
			values.push(radius);
		}
		return values;
	}
	
	function focusProperty(node) {
		propertylistview.showProperty({
			name : node.name,
			varname : node.name,
			input : getPropertyValues(node)
		});
	}
	
	
	function clickfunc(node) {
		return function (e) {
			e.preventDefault();
			propertylistview.showProperty({
				name : node.name,
				varname : node.name,
				input : getPropertyValues(node)
			});
			scene.selectTreeNode(node);
		};
	};
	function checkboxfunc(node, box) {
		return function (e) {
			//e.preventDefault();
			/*
			propertylistview.showProperty({
				name : node.name,
				varname : node.name,
				input : getPropertyValues(node)
			});
			*/
			//console.log(box.checked);
			scene.selectTreeNode(node, box);
		};
	};
	function createTree(elem, root, ismakecheckbox) {
		var node,
			i,
			li,
			ul,
			box,
			link;

		
		for (i = 0; i < root.length; i = i + 1) {
			node = root[i];
			li = document.createElement("li");
			li.id = node.name;
			link = document.createElement("a");
			link.href = "#" + node.name;
			link.onclick = (clickfunc(node));
			link.innerHTML = node.name;
			li.appendChild(link);
			elem.appendChild(li);

			//create mask checkbox
			if(ismakecheckbox === true) {
				box = document.createElement("input");
				box.type = "checkbox";
				box.name = "name";
				box.value = "value";
				box.id = "id";
				box.setAttribute('checked', 'checked');
				box.onclick = (checkboxfunc(node, box));

				li.appendChild(box);
			}

			if (node.child && node.child.length > 0) {
				ul = document.createElement("ul");
				li.appendChild(ul);
				createTree(ul, node.child, true);
			}
		}
	}
	
	function dump(root) {
		var node,
			i;

		for (i = 0; i < root.length; i = i + 1) {
			node = root[i];
			console.log("node:", node);
			if (node.child) {
				dump(node.child);
			}
		}
	}
	
	function update(node, child) {
		var elem;
		if (!node) { return; }
		if (node.child && node.child.length > 0) {
			elem = document.getElementById(node.name);
			elem.innerHTML = "";
			createTree(document.getElementById(node.name), node);
		} else if (node.length > 0) {
			elem = treeRootElem;
			elem.innerHTML = "";
			createTree(treeRootElem, node);
		}

		if(child)
		{
			focusProperty(child);
		}
	}
	
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
	window.grouptreeview = grouptreeview;
	window.grouptreeview.update = update;
	
}(window.datatree, window.propertylistview));


