(function() {
  var grid;

  //http://www.hp-stylelink.com/news/2014/08/20140826.php
  function csv2Array(csvData) {
      var tempArray = csvData.split("\n");
      var csvArray = new Array();
      for(var i = 0; i<tempArray.length;i++){
        csvArray[i] = tempArray[i].split(",");
      }
      return csvArray;
  }

  function handleReadText(evt) {
    var files = evt.target.files;
    var reader = new FileReader();
    reader.onloadend = (function(e) {
      var csvArray = csv2Array(e.target.result);
      var tbl   = document.getElementById('hstable');
      var style = tbl.style;

      grid = new Handsontable(tbl, {
        rowHeaders   : true,
        colHeaders   : true,
        fillHandle   : false,
        maxRows      : 10,
        minSpareRows : 1, 
        colHeaders: function (col) {
          var txt = "Data : " + col + "<input type='checkbox' name='columns' class='columns'>";
          return txt;
        },
      });
      grid.loadData(csvArray);
      tbl.style = style;
      tbl.style.overflow = scroll;
      tbl.style.zIndex = "5";
    });
    reader.readAsText(files[0], "UTF-8");
  }

  function init() {
    document.getElementById('OpenText').addEventListener('change', handleReadText, false);
  }
  
  window.addEventListener('load', init, false);

})();

