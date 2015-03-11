(function() {
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

  function handleReadText(evt) {
    var files = evt.target.files;
    var reader = new FileReader();
    reader.onloadend = (function(e) {
      var csvArray = csv2Array(e.target.result);
      var style = tbl.style;
      var i;
      var header = [];
      if(grid == null) {
        grid = new Handsontable(tbl, {
          rowHeaders   : true,
          colHeaders   : true,
          fillHandle   : false,
          onChange: function(change, source) {
            //console.log('チェンジされました', change, source);
            if(source === 'loadData') return;
          }
        });
      }
      grid.loadData(csvArray);
      //console.log('COLS :: ', grid.countCols());
      for(i = 0; i < grid.countCols(); i++) {
        //header.push("<input type='checkbox' id='colcheckbox" + i + "' class='columns' checked='false'>");
        header.push("<INPUT type='text' value='Group " + i + "' class='colnames' ><input type='checkbox' id='colcheckbox" + i + "' class='colcheckbox'>");
      }
      grid.updateSettings({
        colHeaders: header
      });
      //console.log(csvArray);
      tbl.style = style;
      tbl.style.overflow = scroll;
      tbl.style.zIndex = "5";
      scene.AddRootTree({'name':filename});
      filename = '';
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
  
})();

