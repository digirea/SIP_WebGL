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
		if(GroupViewState === 0) {
			$animate($('GroupView'), {
				'width': {
					from: Size0px,
					to  : Size100px
				},
				'height': {
					from: Size0px,
					to  : Size100px
				}
			}, 250, function () {
			});
			$animate($('GroupViewBlock'), {
				'width': {
					from: Size0px,
					to  : Size100px
				},
				'height': {
					from: Size0px,
					to  : Size100px
				}
			}, 250, function () {
			});
			$animate($('GroupViewButton'), {
				'top': {
					from: Size0px,
					to  : Size100px
				}
			}, 250, function () {
				$('GroupViewButton').value=">>";
				console.log("ブロック拡張成功");
				GroupViewState = 1;
			});
		} else if(GroupViewState === 1)  {
			$animate($('GroupView'), {
				'width': {
					from: Size100px,
					to  : Size0px
				},
				'height': {
					from: Size100px,
					to  : Size0px
				}
			}, 250, function () {
			});
			$animate($('GroupViewBlock'), {
				'width': {
					from: Size100px,
					to  : Size0px,
				},
				'height': {
					from: Size100px,
					to  : Size0px,
				}
			}, 250, function () {
			});
			$animate($('GroupViewButton'), {
				'top': {
					from: Size100px,
					to  : Size0px,
				}
			}, 250, function () {
				GroupViewState = 0;
				$('GroupViewButton').value="<<";
				console.log("ブロック縮小成功");
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


