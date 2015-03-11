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
			color  = {};
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
	
	function createTree(elem, root) {
		var node,
			i,
			li,
			ul,
			link;

		
		for (i = 0; i < root.length; i = i + 1) {
			node = root[i];
			li = document.createElement("li");
			li.id = node.name;
			link = document.createElement("a");
			link.href = "#" + node.name;
			link.onclick = (clickfunc(node));
			link.innerHTML = node.name;
			elem.appendChild(li);
			li.appendChild(link);
			
			if (node.child && node.child.length > 0) {
				ul = document.createElement("ul");
				li.appendChild(ul);
				createTree(ul, node.child);
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

		console.log(child);
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


