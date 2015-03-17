/*jslint devel:true*/
/*global jQuery */

(function (datatree, propertylistview) {
	"use strict";
	var grouptreeview = {},
		selectnode    = null,
		treeRootElem  = document.getElementById('tree');

	/**
	 * Description
	 * @method getPropertyValues
	 * @param {} node
	 * @return values
	 */
	function getPropertyValues(node) {
		var values = [],
			trans  = {},
			rotate = {},
			scale  = {},
			radius = {},
			color  = {},
			show   = {};
		if(node.type === 'text') return null;
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
		if (node.data.type === 'data') {
			if (node.radius) {
				radius.name = "radius";
				radius.type = "float";
				radius.value = node.radius;
				values.push(radius);
			}
		}
		return values;
	}
	
	
	/**
	 * Description
	 * @method doSelectNode
	 * @param {} node
	 */
	function doSelectNode(node) {
		if(node.type === 'text') {
			selectnode = node;
			console.log('selectnode:', selectnode);
		}
		scene.selectTreeNode(node);
	}
	
	/**
	 * Description
	 * @method focusProperty
	 * @param {} node
	 */
	function focusProperty(node) {
		doSelectNode(node);
		propertylistview.showProperty({
			name : node.name,
			input : getPropertyValues(node)
		});
	}
	
	
	/**
	 * Description
	 * @method clickfunc
	 * @param {} node
	 * @return FunctionExpression
	 */
	function clickfunc(node) {
		return function (e) {
			e.preventDefault();
			doSelectNode(node);
			propertylistview.showProperty({
				name : node.name,
				input : getPropertyValues(node)
			});
		};
	};

	/**
	 * Description
	 * @method checkboxfunc
	 * @param {} node
	 * @param {} box
	 * @return FunctionExpression
	 */
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
	

	/**
	 * Description
	 * @method delbuttonfunc
	 * @param {} node
	 * @return FunctionExpression
	 */
	function delbuttonfunc(node) {
		return function (e) {
			var temproot = datatree.getRoot();
			var root;
			if(node.name === temproot[0].name)
			{
				return;
			}
			console.log("------NODE:", node);
			console.log("------NAME:", node.name);
			root = window.datatree.delData(node.name);
			window.grouptreeview.update(root, null);
		};
	};
	

	/**
	 * Description
	 * @method createTree
	 * @param {} elem
	 * @param {} root
	 * @param {} makebox
	 */
	function createTree(elem, root, makebox) {
		var node,
			temproot = datatree.getRoot(),
			i,
			li,
			ul,
			ele,
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

			if(node.type === 'mesh') {
				ele = document.createElement("input");
				ele.type  = "checkbox";
				ele.name  = "name";
				ele.value = "value";
				ele.class = "groupcheckbox";
				if (node.data) {
					if (node.data.show == true) {
						ele.setAttribute('checked', 'checked');
					}
				}
				ele.onclick = (checkboxfunc(node, ele));
				li.appendChild(ele);
				box = ele;
			}

			if (temproot[0].name !== node.name) {
				ele = document.createElement("input");
				ele.type  = "button";
				ele.setAttribute("class", "groupdel");
				ele.onclick = (delbuttonfunc(node));
				li.appendChild(ele);
			}

			if (node.child && node.child.length > 0) {
				ul = document.createElement("ul");
				li.appendChild(ul);
				createTree(ul, node.child);
			}
		}
	}
	
	/**
	 * Description
	 * @method dump
	 * @param {} root
	 */
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
	
	/**
	 * Description
	 * @method update
	 * @param {} node
	 * @param {} child
	 */
	function update(node, child) {
		var elem;
		console.log(node);
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
	
	/**
	 * Description
	 * @method getSelectNode
	 * @return selectnode
	 */
	function getSelectNode()
	{
		console.log('getSelectNode : ', selectnode);
		return selectnode;
	}
	
	/**
	 * Description
	 * @method init
	 */
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
	window.grouptreeview.getSelectNode = getSelectNode;
	
}(window.datatree, window.propertylistview));


