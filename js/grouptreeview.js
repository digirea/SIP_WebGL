/*jslint devel:true*/
/*global jQuery */

(function (datatree, propertylistview) {
	"use strict";
	var grouptreeview = {},
		selectnode    = null,
		treeRootElem  = document.getElementById('tree');

	/**
	 * プロパティ値の取得
	 * @method getPropertyValues
	 * @param {node} node 対象ノード
	 * @return values 取得した値
	 */
	function getPropertyValues(node) {
		var values = [],
			trans  = {},
			rotate = {},
			scale  = {},
			radius = {},
			color  = {},
			show   = {};
		if (node.type === 'text') { return null; }
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
	 * 選択ノード実行メソッド
	 * @method doSelectNode
	 * @param {node} node 対象ノード
	 */
	function doSelectNode(node) {
		if (node.type === 'text') {
			selectnode = node;
			console.log('selectnode:', selectnode);
		}
		scene.selectTreeNode(node);
	}
	
	/**
	 * 指定ノードにフォーカスする
	 * @method focusProperty
	 * @param {node} node 対象ノード
	 */
	function focusProperty(node) {
		var canonical_name = node.name.replace(/ID[0-9]*_/, "");
		
		doSelectNode(node);
		propertylistview.showProperty({
			//name  : canonical_name,
			name : node.name,
			input : getPropertyValues(node)
		});
	}
	
	
	/**
	 * クリック時に呼ばれるメソッド
	 * @method clickfunc
	 * @param {node} node 対象ノード
	 * @return FunctionExpression
	 */
	function clickfunc(node) {
		return function (e) {
			var canonical_name = node.name.replace(/ID[0-9]*_/, "");
			e.preventDefault();
			doSelectNode(node);
			propertylistview.showProperty({
				//name : canonical_name,
				name : node.name,
				input : getPropertyValues(node)
			});
		};
	}

	/**
	 * チェックボックス変更時に呼ばれるメソッド
	 * @method checkboxfunc
	 * @param {node} node ノード
	 * @param {box} box ボックス
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
	}
	

	/**
	 * 削除ボタン実行メソッド
	 * @method delbuttonfunc
	 * @param {node} node 対象ノード
	 * @return FunctionExpression
	 */
	function delbuttonfunc(node) {
		return function (e) {
			var temproot = datatree.getRoot(),
				root;
			if (node.name === temproot[0].name) {
				return;
			}
			console.log("------NODE:", node);
			console.log("------NAME:", node.name);
			root = window.datatree.delData(node.name);
			window.grouptreeview.update(root, null);
			propertylistview.clearProperty();
		};
	}
	

	/**
	 * グループツリーの作成
	 * @method createTree
	 * @param {Element} elem ツリーエレメント
	 * @param {node} root ルートノード
	 */
	function createTree(elem, root) {
		var node,
			temproot = datatree.getRoot(),
			i,
			li,
			ul,
			ele,
			box,
			canonical_name,
			link;

		for (i = 0; i < root.length; i = i + 1) {
			node = root[i];
			li = document.createElement("li");
			li.id = node.name;
			link = document.createElement("a");
			link.href = "#" + node.name;
			link.onclick = (clickfunc(node));
			canonical_name = node.name.replace(/ID[0-9]*_/, "");
			link.innerHTML = canonical_name;
			li.appendChild(link);
			elem.appendChild(li);

			if (node.type === 'mesh') {
				ele = document.createElement("input");
				ele.type  = "checkbox";
				ele.name  = "name";
				ele.value = "value";
				ele.className = "groupcheckbox";
				if (node.data) {
					if (node.data.show === true) {
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
	 * ノードのダンプ出力
	 * @method dump
	 * @param {node} root 対象ノードのルート
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
	 * 選択されたノードの取得
	 * @method getSelectNode
	 * @return selectnode 選択されているノード
	 */
	function getSelectNode() {
		console.log('getSelectNode : ', selectnode);
		return selectnode;
	}
	
	/**
	 * ツリービューの初期化
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
	
	/**
	 * ツリービューの更新
	 * @method update
	 * @param {node} node 対象ノード
	 * @param {node} child 再帰用パラメータ 通常nullで良い.
	 */
	function update(node, child) {
		var elem;
		console.log("UPDATE", node);
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

		if (child) {
			focusProperty(child);
		}
		init();
		if (document.getElementById('expand_all')) {
			document.getElementById('expand_all').click();
		}
	}
	
	init();
	window.grouptreeview = grouptreeview;
	window.grouptreeview.update = update;
	window.grouptreeview.getSelectNode = getSelectNode;
	
}(window.datatree, window.propertylistview));


