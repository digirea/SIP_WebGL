(function(scene) {
	var grid = null,
			tbl,
			filename = '',
			selectdata = null,
			hstable = {};

	//http://www.hp-stylelink.com/news/2014/08/20140826.php
	/**
	 * csv文字列をArrayにして返す
	 * @method csv2Array
	 * @param {String} csvData csv
	 * @return csvArray Array
	 */
	function csv2Array(csvData) {
			var tempArray = csvData.split("\n");
			var csvArray = new Array();
			var ii;
			for(var i = 0; i<tempArray.length;i++){
				csvArray[i] = tempArray[i].split(",");
				
				//check double double 
				for(ii = 0; ii < csvArray[i].length; ii = ii + 1) {
					if( csvArray[i][ii][0] === '"') {
						csvArray[i][ii] = csvArray[i][ii].slice(1, -1);
					}
				}
			}
			return csvArray;
	}
	
	/**
	 * 列数を返す
	 * @method countCols
	 * @return Number 列数
	 */
	function countCols() {
		if(grid) {
			return grid.countCols();
		}
		return 0;
	}
	
	/**
	 * 指定したインデックスの列を取得
	 * @method getCol
	 * @param {Array} index インデックス
	 * @return Array 列データ
	 */
	function getCol(index) {
		if(grid) {
			return grid.getDataAtCol(index);
		}
		return null;
	}
	
	/**
	 * 表のリセット
	 * @method resetData
	 */
	function resetData() {
		if(grid) {
			delete grid;
		}
		grid = null;
		if(tbl) {
			tbl.innerHTML = '';
		}
	}

	/**
	 * 選択されているtableのデータ参照を返却する
	 * @method getSelectData
	 * @return Array データ。無ければnullを返却する
	 */
	function getSelectData() {
		return selectdata;
	}
	
	function updateSelectHeader(index, select, colinfo) {
		var i,
			options;
		if (select && colinfo) {
			options = select.options;
			for(i = 0 ; i < colinfo.length; i = i + 1) {
				if(colinfo[i].index === index) {
					options[colinfo[i].attr].selected = true;
				}
			}
		}
	}

	/**
	 * データの読み込み
	 * @method loadData
	 * @param {Object} data データ
	 */
	function loadData(data, colinfo) {
		var header     = [],
			headerinput,
			headerselect,
			optionStrs = ["X", "Y", "Z", "URL", "NONE"],
			optionStr = "",
			headeroption,
			div        = null,
			select     = null,
			child      = null,
			i          = 0,
			k          = 0,
			style = tbl.style;
		resetData();
		if(grid == null) {
			grid = new Handsontable(tbl, {
				rowHeaders   : true,
				colHeaders   : true,
				fillHandle   : false,
				
				onChange: function(change, source) {
					console.log('チェンジされました', change, source);
					if(grid) {
						grid.render();
					}
					if(source === 'loadData') return;
					window.scene.updateconsole(selectdata);
				}
			});
		}
		
		selectdata = data;

		if(grid) {
			grid.loadData(data);
			
			grid.updateSettings({
				colHeaders: true,
				
  				afterGetColHeader: function (col, TH) {
					if (col < 0) { return; }
					headerinput = document.createElement("input");
					headerinput.type = 'text';
					headerinput.value = "G" + col
					headerinput.className = "colnames";
					headerinput.id = "colname_" + col;

					headerselect = document.createElement("select");
					headerselect.name = "ATTR";
					headerselect.className = "colselectbox colselectbox_" + col;

					for (i = 0; i < optionStrs.length; i = i + 1) {
						optionStr = optionStrs[i];
						headeroption = document.createElement("option");
						headeroption.value = optionStr;
						headeroption.innerHTML = optionStr;
						if (optionStr === "NONE") {
							headeroption.selected = true;
						}
						headeroption.onmousedown = function (event) {
							for (i = 0; i < optionStrs.length; i = i + 1) {
								headerselect.options[i].selected = false;
							}
							headeroption.selected = true;
							event.preventDefault();
							event.stopImmediatePropagation();
						};
						headerselect.appendChild(headeroption);
					}
					TH.firstChild.firstChild.innerHTML = "";
					TH.firstChild.firstChild.appendChild(headerinput);
					TH.firstChild.firstChild.appendChild(headerselect);
					if (colinfo) {
						updateSelectHeader(col, headerselect, colinfo);
					}
				}
			});
			
			tbl.style          = style;
			tbl.style.overflow = scroll;
		}
	}

	/**
	 * データの更新
	 * @method updateGridData
	 * @param {Object} data データ
	 */
	function updateGridData(data) {
		var rootnode   = {};
		loadData(data);
		rootnode = datatree.createRoot('text', filename, data);
		window.grouptreeview.update(datatree.getRoot(), rootnode);
	}
	
	
	/**
	 * CSV形式のファイルをhstableに導入する
	 * @method addGridData
	 * @param {csvtext} csvtext CSVTEXT
	 */
	function addGridData(csvtext) {
		var csvArray = csv2Array(csvtext);
		updateGridData(csvArray);
	}

	/**
	 * テキストを開く
	 * @method openText
	 * @param {Event} evt ファイルイベント
	 */
	function openText(evt) {
		var files = evt.target.files;
		var reader = new FileReader();
		if (evt === '') {
			return;
		}
		
		reader.onloadend = (function(e) {
			addGridData(e.target.result);
			filename = '';
			document.getElementById('OpenTextFile').value = ''; // clear filename
		});
		if (files[0]) {
			if (files[0].hasOwnProperty("name")) {
				filename = files[0].name;
			}
			reader.readAsText(files[0], "UTF-8");
		}
	}

	/**
	 * 初期化
	 * @method init
	 */
	function init() {
		tbl = document.getElementById('hstable');
	}

	window.addEventListener('load', init, false);
	window.hstable           = hstable;
	window.hstable.countCols = countCols;
	window.hstable.openText  = openText;
	window.hstable.addGridData  = addGridData;
	window.hstable.loadData  = loadData;
	window.hstable.resetData = resetData;
	window.hstable.getCol    = getCol;
	window.hstable.getSelectData    = getSelectData;
	
	
})(window.scene);

