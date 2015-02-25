/*jslint devel:true*/
/*global XMLHttpRequest*/

var ReqFile;

(function () {
	"use strict";
	var reqfile = function () {
	};

	reqfile.prototype.getURL = function (url) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4 && xhr.status === 200) {
				console.log(xhr.responseText);
				this.text = xhr.responseText;
			}
		};
		xhr.send(null);
	};

	ReqFile = reqfile;
}());

