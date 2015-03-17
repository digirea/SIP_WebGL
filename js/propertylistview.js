/*jslint devel:true*/
/*global */

(function (scene) {
	"use strict";
	var propertylist = {},
		currentData = null,
		changedValueFuncs = [];
	
	/**
	 * アイテムノードの作成
	 * @method makeItemNode
	 * @param {String} name アイテム名
	 * @param {String} text テキスト
	 * @param {Boolean} top trueの場合はトッププロパティを追加します
	 * @return itemNode
	 */
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
	
	/**
	 * テキストアイテムノードの作成
	 * @method makeItemTextNode
	 * @param {String} name アイテム名
	 * @param {String} text テキスト
	 * @param {node} node 入力ノード
	 * @param {String} type テキストノードタイプ(空の場合は"text"になります)
	 * @return itemNode
	 */
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
		
		/**
		 * テキスト値変更
		 * @method valChange
		 * @param {Element} data 変更されたテキストノードエレメント
		 * @param {String} txt 変更後のテキスト
		 * @return FunctionExpression
		 */
		function valChange(data, txt) {
			return function (e) {
				console.log(data);
				data.value = txt.value;
				window.scene.updateDataTree(currentData);
				/*
				changedValueFuncs.push(function () {

				});
				*/
			};
		}
		
		textNode.addEventListener('change', valChange(node, textNode));
		return itemNode;
	}
	
	/**
	 * 配列アイテムの数ノードの作成
	 * @method makeItemArrayNumNode
	 * @param {String} name ノード名
	 * @param {String} text テキスト
	 * @param {node} node 入力ノード
	 * @return itemNode 作成したノード
	 */
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
					window.scene.updateDataTree(currentData);
				}
			};
		}(node, textNode)));
		return itemNode;
	}
	
	/**
	 * ベクタアイテムノードの作成
	 * @method makeItemVecNode
	 * @param {String} name ノード名
	 * @param {Array} vals 値リスト
	 * @param {node} node 入力ノード
	 * @param {Number} n ベクタの要素数
	 * @return itemNode 作成したノード
	 */
	function makeItemVecNode(name, vals, node, n) {
		var itemNode = document.createElement('div'),
			nameNode = document.createElement('div'),
			valNode,
			i;
		
		itemNode.classList.add('nodePropertyRow');
		nameNode.innerHTML = '[' + name + ']';
		nameNode.classList.add('nodePropertyName');
		itemNode.appendChild(nameNode);

		/**
		 * ベクタアイテムノードの値変更
		 * @method valChange
		 * @param {Element} data 変更されたノードエレメント
		 * @param {String} txt 変更後のテキスト
		 * @param {Number} i ベクタのインデックス
		 * @return FunctionExpression
		 */
		function valChange(data, txt, i) {
			return function (e) {
				console.log(data, i, txt.value);
				data.value[i] = txt.value;
				window.scene.updateDataTree(currentData);
				/*
				changedValueFuncs.push(function () {

				});
				*/
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
	
	/**
	function doApply(data) {
		var i,
			func;
		//console.log("Apply:", changedValueFuncs);
		for (i = 0; i < changedValueFuncs.length; i = i + 1) {
			func = changedValueFuncs[i];
			func();
		}
		if (currentData) {
			window.scene.updateDataTree(currentData);
		}
		changedValueFuncs = [];
	}
	 */
	
	
	/**
	function doDelete(data) {
		console.log(currentData)
	}
	 */
	
	/**
	 * プロパティの表示のクリア
	 * @method showProperty
	 */
	function clearProperty(data) {
		var to = document.getElementById("property");
		to.innerHTML = ''; // clear
	}

	/**
	 * プロパティの表示.
	 * @method showProperty
	 * @param {Data} data 表示データ
	 */
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
		
		currentData = data;
		changedValueFuncs = []; // clear
		to.innerHTML = ''; // clear
		to.appendChild(makeItemNode('Property Name', 'Value', true));
		to.appendChild(makeItemNode('name', data.name));
		//to.appendChild(makeItemNode('funcname', data.funcname));
		
		to.appendChild(prop);
		
		if (!data.input) {
			return;
		}
		
		/**
		 * 配列アイテムの追加
		 * @method addArrayItem
		 * @param {node} inode 入力ノード
		 * @param {Number} n 入力数
		 * @return itemNode 作成されたノード
		 */
		function addArrayItem(inode, n) {
			var itemNode;
			if (inode.type === 'string') {
				itemNode = makeItemTextNode('', inode.array[n], inode);
			} else if (inode.type === 'vec4') {
				itemNode = makeItemVecNode('', inode.array[n], inode, 4);
			} else if (inode.type === 'vec3') {
				itemNode = makeItemVecNode('', inode.array[n], inode, 3);
			} else if (inode.type === 'vec2') {
				itemNode = makeItemVecNode('', inode.array[n], inode, 2);
			} else if (inode.type === 'float') {
				itemNode = makeItemVecNode('', inode.array[n], inode, 1);
			} else {
				itemNode = makeItemNode('', '(Object)');
			}
			return itemNode;
		}
		/**
		 * アイテムの追加
		 * @method addItems
		 * @param {node} inode 入力ノード
		 * @return itemNode 作成されたノード
		 */
		function addItems(inode) {
			var itemNode;
			if (inode.type === 'string') {
				itemNode = makeItemTextNode(inode.name, inode.value, inode);
			} else if (inode.type === 'vec4') {
				itemNode = makeItemVecNode(inode.name, inode.value, inode, 4);
			} else if (inode.type === 'vec3') {
				itemNode = makeItemVecNode(inode.name, inode.value, inode, 3);
			} else if (inode.type === 'vec2') {
				itemNode = makeItemVecNode(inode.name, inode.value, inode, 2);
			} else if (inode.type === 'float') {
				itemNode = makeItemVecNode(inode.name, inode.value, inode, 1);
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
	
	/**
	 * プロパティリストビューの初期化
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
	window.propertylistview = propertylist;
	window.propertylistview.showProperty  = showProperty;
	window.propertylistview.clearProperty = clearProperty;

}(window.scene));
