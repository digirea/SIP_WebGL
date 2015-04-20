/*jslint devel:true*/
/*global DataView, FileReader, Float32Array, ArrayBuffer */

/* ported SimpleSTLB.h */


(function () {
	"use strict";
	var loadSTLB = {},
			filename = '';

	/**
	 * 法線の計算.
	 * @method calcNormal
	 * @param {Array} pos 頂点配列
	 * @param {Number} i 頂点インデックス.
	 * @return normal 法線.
	 */
	function calcNormal(pos, i) {
		var normal = [0, 0, 0],
			x   = 0,
			y   = 1,
			z   = 2,
			i0  = 0,
			i1  = 3,
			i2  = 6,
			x0  = pos[i + x + i0],
			x1  = pos[i + x + i1],
			x2  = pos[i + x + i2],
			y0  = pos[i + y + i0],
			y1  = pos[i + y + i1],
			y2  = pos[i + y + i2],
			z0  = pos[i + z + i0],
			z1  = pos[i + z + i1],
			z2  = pos[i + z + i2],
			vx0 = x2 - x0,
			vy0 = y2 - y0,
			vz0 = z2 - z0,
			vx1 = x1 - x0,
			vy1 = y1 - y0,
			vz1 = z1 - z0,
			
			//cross
			cx  = vy0 * vz1 - vz0 * y1,
			cy  = vz0 * vx1 - vx0 * z1,
			cz  = vx0 * vy1 - vy0 * x1,
			invlen = 1.0 / Math.sqrt(cx * cx + cy * cy + cz * cz);
		
		//normalize
		cx *= invlen;
		cy *= invlen;
		cz *= invlen;
		normal[0] = cx;
		normal[1] = cy;
		normal[2] = cz;
		return normal;
	}


	/**
	 * アスキーSTLの読み込み.
	 * @method loadbinSTLA
	 * @param {DataView} dataview 読み込み先データビュー
	 * @return data 読み込んだデータ
	 */
	function loadbinSTLA(dataview) {
		var i              = 0,
			datalen        = dataview.byteLength,
			linebuf        = [],
			ch             = 0,
			m_pos          = [],
			m_normal       = [],
			m_pos_idx      = 0,
			m_normal_idx   = 0,
			nor            = null,
			x              = 0,
			y              = 0,
			z              = 0,
			maxValue = 9999999,
			Bmin = [maxValue, maxValue, maxValue],
			Bmax = [-maxValue,-maxValue,-maxValue],
			ret;
		while(i < datalen) {
			//read per line.
			ch = dataview.getUint8(i);
			i++;
			if(ch === 10 || ch === 13) { //terminate -> '\r', '\n'
				if(linebuf.length <= 0) {
					continue;
				}
				linebuf.push(0);
				linebuf = String.fromCharCode.apply(null, linebuf);
				linebuf = linebuf.replace(/\s+/g, ' ');
				
				//Cue string.
				if(linebuf[0] == ' ') {
					linebuf = linebuf.slice(1);
				}
				linebuf = linebuf.split(' ');

				//normal
				if(linebuf[0] === 'facet') {
					x = parseFloat(linebuf[2], 10);
					y = parseFloat(linebuf[3], 10);
					z = parseFloat(linebuf[4], 10);
					nor = Normalize([x, y, z]);
					m_normal.push(x, y, z);
					m_normal.push(x, y, z);
					m_normal.push(x, y, z);
				}
				
				//vertex
				if(linebuf[0] === 'vertex') {
					x = parseFloat(linebuf[1], 10);
					y = parseFloat(linebuf[2], 10);
					z = parseFloat(linebuf[3], 10);
					GetMinMax(Bmin, Bmax, [x, y, z]);
					m_pos.push(x, y, z);
				}
				
				//reset and continue;
				linebuf = [];
				continue;
			}
			linebuf.push(ch);
		}
		ret = {
			"name"   : filename,
			"pos"    : m_pos,
			"normal" : m_normal,
			"min"    : Bmin,
			"max"    : Bmax
		};
		return ret;
	}
	
	///---------------------------------------------------------------------------
	///
	/// struct triData
	/// {
	///   float normal[3]; //0
	///   float vtx0[3];   //3
	///   float vtx1[3];   //0
	///   float vtx2[3];   //0
	///   unsigned short pad;
	/// };
	///
	///---------------------------------------------------------------------------
	/**
	 * バイナリSTLの読み込み.
	 * @method loadbinSTLB
	 * @param {DataView} dataview 読み込み先データビュー
	 * @return data 読み込んだデータ
	 */
	function loadbinSTLB(dataview) {
		var i           = 0,
			inner       = 0,
			trisize     = 12,
			index       = 80,  //skip header
			vertexCount,
			m_pos,
			m_normal,
			triCount,
			tri,
			offset,
			i0 = 0,
			i1 = 3,
			i2 = 6,
			x  = 0,
			y  = 1,
			z  = 2,
			nx,
			ny,
			nz,
			nor,
			maxValue = 9999999,
			Bmin = [maxValue, maxValue, maxValue],
			Bmax = [-maxValue,-maxValue,-maxValue];
		
		
		triCount = dataview.getInt32(index, true);//read triangle number.
		index += 4;
		
		vertexCount = triCount * 3 * 3;

		console.log('triCount   :' + triCount);
		console.log('vertexCount:' + vertexCount);

		m_pos    = new Float32Array(vertexCount);
		m_normal = new Float32Array(vertexCount);

		for (i = 0; i < vertexCount; i += 9) {
			tri = new Float32Array(trisize);
			for (inner = 0; inner < trisize; inner = inner + 1) {
				offset = index + inner * 4;
				tri[inner] = dataview.getFloat32(offset, true);
			}

			//index
			nx = tri[0];
			ny = tri[1];
			nz = tri[2];

			m_normal[i + i0 + x]  = nx;
			m_normal[i + i0 + y]  = ny;
			m_normal[i + i0 + z]  = nz;

			m_normal[i + i1 + x]  = nx;
			m_normal[i + i1 + y]  = ny;
			m_normal[i + i1 + z]  = nz;

			m_normal[i + i2 + x]  = nx;
			m_normal[i + i2 + y]  = ny;
			m_normal[i + i2 + z]  = nz;

			m_pos[i + i0 + x]     = tri[3];
			m_pos[i + i0 + y]     = tri[3 + 1];
			m_pos[i + i0 + z]     = tri[3 + 2];
			GetMinMax(Bmin, Bmax, [m_pos[i + i0 + x], m_pos[i + i0 + y], m_pos[i + i0 + z]] );

			m_pos[i + i1 + x]     = tri[6];
			m_pos[i + i1 + y]     = tri[6 + 1];
			m_pos[i + i1 + z]     = tri[6 + 2];
			GetMinMax(Bmin, Bmax, [m_pos[i + i1 + x], m_pos[i + i1 + y], m_pos[i + i1 + z]] );

			m_pos[i + i2 + x]     = tri[9];
			m_pos[i + i2 + y]     = tri[9 + 1];
			m_pos[i + i2 + z]     = tri[9 + 2];
			GetMinMax(Bmin, Bmax, [m_pos[i + i2 + x], m_pos[i + i2 + y], m_pos[i + i2 + z]] );

			if (nx === 0 && ny === 0 && nz === 0) {
				nor = calcNormal(m_pos, i);
				m_normal[i]     = nor[0];
				m_normal[i + 1] = nor[1];
				m_normal[i + 2] = nor[2];
			}

			index += 50;
		}

		//console.log('POS' + m_pos);
		//console.log('NORMAL' + m_normal);
		//console.log('[DEBUG] STLB Done.');

		//todo Mesh Data
		return {
			"name"   : filename,
			"pos"    : m_pos,
			"normal" : m_normal,
			"min"    : Bmin,
			"max"    : Bmax
		};
	}
	
	/**
	 * STLデータの読み込み.
	 * @method loadSTLInternal
	 * @param {DataView} dataview 読み込み先データビュー
	 * @return data 読み込んだデータ.
	 */
	function loadSTLInternal(dataview) {
		var i           = 0,
			buf,
			stlascii_header = 'solid     ',
			testlen;
		buf =  new Uint16Array(stlascii_header.length);
		for(i = 0 ; i < stlascii_header.length; i++) {
			buf[i] = dataview.getUint8(i);
		}
		buf = String.fromCharCode.apply(null, buf);
		console.log(buf);
		
		if( buf.match(/solid/) ) {
			testlen = dataview.byteLength / 4;
			for (i = 0; i < testlen; ++i) {
				buf = dataview.getUint8(i);
				if (buf >= 0x7F || buf == 0x00) {
					return true;
				}
			}
			console.log('STL is ASCII');
			return loadbinSTLA(dataview);
		}
		console.log('STL is BINARY');
		return loadbinSTLB(dataview);
	}
	
	/**
	 * バイナリを開き,STLの読み込みを開始する.
	 * @method openBinary
	 * @param {Event} evt ファイル入力イベント
	 * @param {Function} callback 読み込み後に呼ばれるコールバック.
	 */
	function openBinary(evt, callback) {
		var files  = evt.target.files,
			fr     = new FileReader(),
			file,
			i;
		
		if (!fr.readAsArrayBuffer) {
			alert('Brewsor not support FileReader.');
			return;
		}

		/**
		 * 読み込み終了コールバック
		 * @method onloadend
		 * @param {Event} e イベント
		 */
		fr.onloadend = function (e) {
			var data    = e.target.result,
				dataview;
      console.log('LOADEND------------', e);
			if (data) {
				dataview = new DataView(data);
				console.log('loadSTLB ' + loadSTLB);
				callback(loadSTLInternal(dataview));
			}
		};

		/**
		 * エラー時に呼ばれるコールバック
		 * @method onerror
		 * @param {Error} error エラー
		 */
		fr.onerror = function (error) {
			alert('Brewsor not support FileReader.');
			console.log(error);
		};

		for (i = 0, file = files[i]; file; i = i + 1, file = files[i]) {
			filename = file.name;
			fr.readAsArrayBuffer(file);
		}
	}

	window.loadSTLB = loadSTLB;
	window.loadSTLB.openBinary = openBinary;
}());




