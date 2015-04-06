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
	
	
	function selectOptionSelected(options, select) {
		var oindex;
		for(oindex = 0; oindex < options.length; oindex = oindex + 1) {
			options[oindex].removeAttribute('selected');
		}
		options[select].setAttribute('selected', 'true');
		
	}
	
	function updateSelectHeader(index, html, colinfo) {
		var div    = document.createElement('div'),
			innode = null,
			node   = null,
			i,
			options,
			oindex;
		div.innerHTML = html;
		if(colinfo)
		{
			node   = div.getElementsByClassName('colselectbox');
			innode = div.getElementsByClassName('colnames');
			options = node[0].options;
			selectOptionSelected(options, options.length - 1);
			for(i = 0 ; i < colinfo.length; i = i + 1) {
				if(colinfo[i].index === index) {
					selectOptionSelected(options, colinfo[i].attr);
				}
			}
		}
		return div.innerHTML;
	}

	/**
	 * データの読み込み
	 * @method loadData
	 * @param {Object} data データ
	 */
	function loadData(data, colinfo) {
		var header     = [],
			headerhtml = '',
			div        = null,
			select     = null,
			child      = null,
			i          = 0,
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
					window.scene.updateconsole(change);
				}
			});
		}
		
		selectdata = data;

		if(grid) {
			grid.loadData(data);
			
			for(i = 0; i < grid.countCols(); i++) {
				headerhtml = '';
				headerhtml += '<INPUT  type="text" value="G' + i + '"class="colnames">\n';
				headerhtml += '<SELECT name="ATTR" class="colselectbox">\n';
				headerhtml += '<OPTION value="X">X</OPTION>\n';
				headerhtml += '<OPTION value="Y">Y</OPTION>\n';
				headerhtml += '<OPTION value="Z">Z</OPTION>\n';
				headerhtml += '<OPTION value="URL">URL</OPTION>\n';
				headerhtml += '<OPTION value="NONE" selected=true >NONE</OPTION>\n';
				headerhtml += '</SELECT>';
				if(colinfo) {
					header.push(updateSelectHeader(i, headerhtml, colinfo));
				} else {
					header.push(headerhtml);
				}
			}

			grid.updateSettings({
				colHeaders: header
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
			var csvArray = csv2Array(e.target.result);
			var i;
			var headerhtml = '';
			var header = [];
			updateGridData(csvArray);
			filename = '';
			document.getElementById('OpenTextFile').value = ''; // clear filename
		});
		filename = files[0].name;
		reader.readAsText(files[0], "UTF-8");
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
	window.hstable.loadData  = loadData;
	window.hstable.resetData = resetData;
	window.hstable.getCol    = getCol;
	window.hstable.getSelectData    = getSelectData;
	
	
})(window.scene);

