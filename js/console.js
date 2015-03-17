(function(scene) {
	var grid = null,
			tbl,
			filename = '',
			hstable = {};

	//http://www.hp-stylelink.com/news/2014/08/20140826.php
	/**
	 * Description
	 * @method csv2Array
	 * @param {} csvData
	 * @return csvArray
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
	 * Description
	 * @method countCols
	 * @return Literal
	 */
	function countCols() {
		if(grid) {
			return grid.countCols();
		}
		return 0;
	}
	
	/**
	 * Description
	 * @method getCol
	 * @param {} index
	 * @return Literal
	 */
	function getCol(index) {
		if(grid) {
			return grid.getDataAtCol(index);
		}
		return null;
	}
	
	/**
	 * Description
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
	 * Description
	 * @method loadData
	 * @param {} data
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
				/**
				 * Description
				 * @method onChange
				 * @param {} change
				 * @param {} source
				 */
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
	 * Description
	 * @method updateGridData
	 * @param {} data
	 */
	function updateGridData(data) {
		var rootnode   = {};
		loadData(data);
		rootnode = datatree.createRoot('text', filename, data);
		window.grouptreeview.update(datatree.getRoot(), rootnode);
	}

	/**
	 * Description
	 * @method openText
	 * @param {} evt
	 */
	function openText(evt) {
		var files = evt.target.files;
		var reader = new FileReader();
		if (evt === '') {
			return;
		}
		/**
		 * Description
		 * @method onloadend
		 * @param {} e
		 */
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
	 * Description
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

