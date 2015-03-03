/*jslint devel:true*/
/*global XMLHttpRequest*/

var ReqFile;

(function () {
	"use strict";
	var reqfile = function () {
	    this.text = null;
	};

	reqfile.prototype.getURL = function (url, cb) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url);
		xhr.send();
		xhr.addEventListener("load", (function (callback) {
			return function (ev) {
			    cb(ev.srcElement.responseText);
			};
		}(cb)));
	};

	ReqFile = reqfile;
}());

