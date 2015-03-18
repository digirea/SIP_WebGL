(function(scene) {
	var grid = null,
			tbl,
			filename = '',
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
			for(var i = 0; i<tempArray.length;i++){
				csvArray[i] = tempArray[i].split(",");
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
	 * データの読み込み
	 * @method loadData
	 * @param {Object} data データ
	 */
	function loadData(data) {
		var header     = [];
		var headerhtml = '';
		var style = tbl.style;
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

		if(grid) {
			grid.loadData(data);

			for(i = 0; i < grid.countCols(); i++) {
				
				//todo createElement
				headerhtml = '';
				headerhtml += '<INPUT type="text" value="G' + i + '"class="colnames">';
				headerhtml += '<SELECT name="ATTR" class="colselectbox">';
				headerhtml += '<OPTION value="NONE">NONE</OPTION>';
				headerhtml += '<OPTION value="X">X</OPTION>';
				headerhtml += '<OPTION value="Y">Y</OPTION>';
				headerhtml += '<OPTION value="Z">Z</OPTION>';
				headerhtml += '<OPTION value="URL">URL</OPTION>';
				headerhtml += '</SELECT>';
				header.push(headerhtml);
			}

			grid.updateSettings({
				colHeaders: header
			});
			tbl.style = style;
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
	
})(window.scene);

