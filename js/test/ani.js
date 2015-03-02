/*jslint devel:true */
/*global $, $ready, $animate, io, fs, URL, FileReader */


$ready(function () {
	"use strict";
	var GroupViewState = 0; //0:close, 1:expand
	//div    : GroupView
	//span   : GroupViewBlock
	//button : GroupViewButton
	$('GroupViewButton').addEventListener('click', function () {
		$('GroupView').style.overflow = "hidden";
		var Size0px   = "0px";
		var Size100px = "100px";
		var Size200px = "200px";
		var Size300px = "300px";
		var Size400px = "400px";
		var Size500px = "500px";
		$('GroupViewButton').style.width="100%";
		if(GroupViewState === 0) {
			$animate($('GroupViewButton'), {
				'top': {
					from: Size0px,
					to  : Size500px
				},
			}, 250, function () {
				$('GroupViewButton').value=">>";
				console.log("ブロック拡張成功");
				GroupViewState = 1;
			});
			$animate($('GroupView'), {
				'width': {
					from: Size0px,
					to  : Size500px,
				},
				'height': {
					from: Size0px,
					to  : Size500px,
				}
			}, 250, function () {
			});
		} else if(GroupViewState === 1)  {
			$animate($('GroupViewButton'), {
				'top': {
					from: Size500px,
					to  : Size0px,
				}
			}, 250, function () {
				GroupViewState = 0;
				$('GroupViewButton').value="<<";
				console.log("ブロック縮小成功");
			});
			$animate($('GroupView'), {
				'width': {
					from: Size500px,
					to  : Size0px,
				},
				'height': {
					from: Size500px,
					to  : Size0px,
				}
			}, 250, function () {
			});
		}
	});
});


(function () {
	"use strict";
	function init() {
		
	}
	window.addEventListener('load', init, false);
}());


