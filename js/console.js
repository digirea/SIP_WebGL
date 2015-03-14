(function(updateconsole) {
	var grid = null,
			tbl,
			filename = '',
			hstable = {};

	//http://www.hp-stylelink.com/news/2014/08/20140826.php
	function csv2Array(csvData) {
			var tempArray = csvData.split("\n");
			var csvArray = new Array();
			for(var i = 0; i<tempArray.length;i++){
				csvArray[i] = tempArray[i].split(",");
			}
			return csvArray;
	}
	
	function countCols() {
		if(grid) {
			return grid.countCols();
		}
		return 0;
	}
	
	function getCol(index) {
		if(grid) {
			return grid.getDataAtCol(index);
		}
		return null;
	}

	function updateGridData(data) {
		var headerhtml = '';
		var header = [];
		var style = tbl.style;
		if(grid == null) {
			grid = new Handsontable(tbl, {
				rowHeaders   : true,
				colHeaders   : true,
				fillHandle   : false,
				onChange: function(change, source) {
					console.log('チェンジされました', change, source);
					if(source === 'loadData') return;
					updateconsole(change);
				}
			});
		}

		grid.loadData(data);

		for(i = 0; i < grid.countCols(); i++) {
			
			//todo createElement
			headerhtml = '';
			headerhtml += '<INPUT type="text" value="Group ' + i + '"class="colnames">';
			headerhtml += '<SELECT name="ATTR" class="colselectbox">';
			headerhtml += '<OPTION value="NONE">NONE</OPTION>';
			headerhtml += '<OPTION value="X">X</OPTION>';
			headerhtml += '<OPTION value="Y">Y</OPTION>';
			headerhtml += '<OPTION value="Z">Z</OPTION>';
			headerhtml += '<OPTION value="COLOR">COLOR</OPTION>';
			headerhtml += '<OPTION value="INDEX">INDEX</OPTION>';
			headerhtml += '<OPTION value="URL">URL</OPTION>';
			headerhtml += '</SELECT>';
			header.push(headerhtml);
		}

		grid.updateSettings({
			colHeaders: header
		});
		tbl.style = style;
		tbl.style.overflow = scroll;
		tbl.style.zIndex = "5";
		scene.AddRootTree({'name':filename});
	}

	function handleReadText(evt) {
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
			document.getElementById('OpenText').value = ''; // clear filename
		});
		filename = files[0].name;
		reader.readAsText(files[0], "UTF-8");
	}

	function init() {
		tbl = document.getElementById('hstable');
		document.getElementById('OpenText').addEventListener('change', handleReadText, false);
	}

	window.addEventListener('load', init, false);
	window.hstable           = hstable;
	window.hstable.countCols = countCols;
	window.hstable.getCol    = getCol;
	
})(window.scene.updateconsole);

