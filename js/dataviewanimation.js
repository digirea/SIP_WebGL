/*jslint devel:true */
/*global $, $ready, $animate, io, fs, URL, FileReader */

var buttonMargin         = 16;
var SizeDataHeightOffset = 900;
var DataViewState        = 0; //0:close, 1:expand
var timeOfLerp           = 350;

$ready(function () {
	"use strict";
	//----------------------------------------------------------------
	//div    : DataView
	//span   : DataViewBlock
	//button : DataViewButton
	//----------------------------------------------------------------
	$('DataViewButton').addEventListener('click', function () {
		//$('DataView').style.overflow = "hidden";

		var SizeWidth            = window.innerWidth,
			SizeHeight           = window.innerHeight,
			SizeHeightButton     = window.innerHeight - buttonMargin,

			//暫定
			SizeDataHeightSize   = SizeHeight - SizeDataHeightOffset,
			timeOfLerp           = 350;


		//----------------------------------------------------------
		//
		// Close
		//
		//----------------------------------------------------------
		if (DataViewState === 0) {
			//------------------------------------------------------
			//Button
			//------------------------------------------------------
			$animate($('DataViewButton'), {
				'top': {
					from: SizeHeightButton     + "px",
					to  : SizeDataHeightOffset + "px"
				}
			}, timeOfLerp, function () {
				$('DataViewButton').value = "A";
				console.log("ブロック拡張成功");
				DataViewState = 1;
			});

			//------------------------------------------------------
			//View
			//------------------------------------------------------
			$animate($('DataView'), {
				'top': {
					from : SizeHeightButton     + "px",
					to   : SizeDataHeightOffset + "px"
				},
				'height' : {
					from : "0px",
					to   : SizeDataHeightSize   + "px"
				}
			}, timeOfLerp, function () {
			});
		} else if (DataViewState === 1) {
			//------------------------------------------------------
			//Button
			//------------------------------------------------------
			$animate($('DataViewButton'), {
				'top': {
					from: SizeDataHeightOffset + "px",
					to  : SizeHeightButton     + "px"
				}
			}, timeOfLerp, function () {
				DataViewState = 0;
				$('DataViewButton').value = "V";
				console.log("ブロック縮小成功");
			});
			
			//------------------------------------------------------
			//View
			//------------------------------------------------------
			$animate($('DataView'), {
				'top': {
					from : SizeDataHeightOffset + "px",
					to   : SizeHeightButton     + "px"
				},
				'height' : {
					from : SizeDataHeightSize   + "px",
					to   : "0px"
				}
			}, timeOfLerp, function () {
			});
		}
	});
});


(function () {
	"use strict";
	function resize() {
		var SizeWidth            = window.innerWidth,
			SizeHeight           = window.innerHeight,
			SizeHeightButton     = window.innerHeight - buttonMargin,
			SizeDataHeightSize   = SizeHeight - SizeDataHeightOffset,
			eButton = $('DataViewButton'),
			eView   = $('DataView');
		eButton.style.width      = SizeWidth  + "px";
		eView.style.width        = SizeWidth  + "px";
		eView.style.bottom       = SizeHeight + "px";
		
		if (DataViewState === 1) {
			eButton.style.top    = SizeDataHeightOffset + "px";
			eView.style.top      = SizeDataHeightOffset + "px";
			eView.style.height   = SizeDataHeightSize   + "px";
		} else {
			eButton.style.top    = SizeHeightButton     + "px";
			eView.style.top      = SizeHeightButton     + "px";
			eView.style.height   = "0px";
		}
	}

	function init() {
		resize();
		
		$('DataViewButton').onmousedrag = function (e) {
			console.log('aA');
		};
	}
	

	window.addEventListener('load',   init, false);
	window.addEventListener('resize', resize, false);
}());


