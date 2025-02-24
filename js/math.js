﻿/*jslint devel:true*/
/**
 * global Float32Array, ArrayBuffer, Int16Array, QtnIV, Sub, MatIV
 * @method MatIV
 */
function MatIV() {
	"use strict";

	/**
	 * 行列の作成
	 * @method create
	 * @return array 行列
	 */
	this.create = function () {
		return new Float32Array(16);
	};
	/**
	 * 単位行列に設定
	 * @method identity
	 * @param {Array} dest 設定する行列
	 * @return dest 行列
	 */
	this.identity = function (dest) {
		dest[0]  = 1;
		dest[1]  = 0;
		dest[2]  = 0;
		dest[3]  = 0;
		dest[4]  = 0;
		dest[5]  = 1;
		dest[6]  = 0;
		dest[7]  = 0;
		dest[8]  = 0;
		dest[9]  = 0;
		dest[10] = 1;
		dest[11] = 0;
		dest[12] = 0;
		dest[13] = 0;
		dest[14] = 0;
		dest[15] = 1;
		return dest;
	};
	/**
	 * 行列の乗算
	 * @method multiply
	 * @param {Array} mat1 行列
	 * @param {Array} mat2 行列
	 * @param {Array} dest 結果を格納する行列
	 * @return dest 結果を格納する行列
	 */
	this.multiply = function (mat1, mat2, dest) {
		var a = mat1[0],  b = mat1[1],  c = mat1[2],  d = mat1[3],
		    e = mat1[4],  f = mat1[5],  g = mat1[6],  h = mat1[7],
		    i = mat1[8],  j = mat1[9],  k = mat1[10], l = mat1[11],
		    m = mat1[12], n = mat1[13], o = mat1[14], p = mat1[15],
		    A = mat2[0],  B = mat2[1],  C = mat2[2],  D = mat2[3],
		    E = mat2[4],  F = mat2[5],  G = mat2[6],  H = mat2[7],
		    I = mat2[8],  J = mat2[9],  K = mat2[10], L = mat2[11],
		    M = mat2[12], N = mat2[13], O = mat2[14], P = mat2[15];
		dest[0] = A * a + B * e + C * i + D * m;
		dest[1] = A * b + B * f + C * j + D * n;
		dest[2] = A * c + B * g + C * k + D * o;
		dest[3] = A * d + B * h + C * l + D * p;
		dest[4] = E * a + F * e + G * i + H * m;
		dest[5] = E * b + F * f + G * j + H * n;
		dest[6] = E * c + F * g + G * k + H * o;
		dest[7] = E * d + F * h + G * l + H * p;
		dest[8] = I * a + J * e + K * i + L * m;
		dest[9] = I * b + J * f + K * j + L * n;
		dest[10] = I * c + J * g + K * k + L * o;
		dest[11] = I * d + J * h + K * l + L * p;
		dest[12] = M * a + N * e + O * i + P * m;
		dest[13] = M * b + N * f + O * j + P * n;
		dest[14] = M * c + N * g + O * k + P * o;
		dest[15] = M * d + N * h + O * l + P * p;
		return dest;
	};
	/**
	 * 行列のスケーリング
	 * @method scale
	 * @param {Array} mat 行列
	 * @param {Array} vec ベクトル
	 * @param {Array} dest 結果を格納する行列
	 * @return dest 結果を格納する行列
	 */
	this.scale = function (mat, vec, dest) {
		dest[0]  = mat[0]  * vec[0];
		dest[1]  = mat[1]  * vec[0];
		dest[2]  = mat[2]  * vec[0];
		dest[3]  = mat[3]  * vec[0];
		dest[4]  = mat[4]  * vec[1];
		dest[5]  = mat[5]  * vec[1];
		dest[6]  = mat[6]  * vec[1];
		dest[7]  = mat[7]  * vec[1];
		dest[8]  = mat[8]  * vec[2];
		dest[9]  = mat[9]  * vec[2];
		dest[10] = mat[10] * vec[2];
		dest[11] = mat[11] * vec[2];
		dest[12] = mat[12];
		dest[13] = mat[13];
		dest[14] = mat[14];
		dest[15] = mat[15];
		return dest;
	};
	/**
	 * 行列の移動
	 * @method translate
	 * @param {Array} mat 行列
	 * @param {Array} vec 移動量
	 * @param {Array} dest 結果を格納する行列
	 * @return dest 結果を格納する行列
	 */
	this.translate = function (mat, vec, dest) {
		dest[0] = mat[0];
		dest[1] = mat[1];
		dest[2]  = mat[2];
		dest[3]  = mat[3];
		dest[4] = mat[4];
		dest[5] = mat[5];
		dest[6]  = mat[6];
		dest[7]  = mat[7];
		dest[8] = mat[8];
		dest[9] = mat[9];
		dest[10] = mat[10];
		dest[11] = mat[11];
		dest[12] = mat[0] * vec[0] + mat[4] * vec[1] + mat[8]  * vec[2] + mat[12];
		dest[13] = mat[1] * vec[0] + mat[5] * vec[1] + mat[9]  * vec[2] + mat[13];
		dest[14] = mat[2] * vec[0] + mat[6] * vec[1] + mat[10] * vec[2] + mat[14];
		dest[15] = mat[3] * vec[0] + mat[7] * vec[1] + mat[11] * vec[2] + mat[15];
		return dest;
	};
	/**
	 * 行列の回転
	 * @method rotate
	 * @param {Array} mat 行列
	 * @param {Array} angle 角度
	 * @param {Array} axis 軸
	 * @param {Array} dest 結果を格納する行列
	 * @return dest 結果を格納する行列
	 */
	this.rotate = function (mat, angle, axis, dest) {
		var sq = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]),
			a = axis[0],
			b = axis[1],
			c = axis[2],
			d = Math.sin(angle),
			e = Math.cos(angle),
			f = 1 - e,
			g = mat[0],
			h = mat[1],
			i = mat[2],
			j = mat[3],
			k = mat[4],
			l = mat[5],
			m = mat[6],
			n = mat[7],
			o = mat[8],
			p = mat[9],
			q = mat[10],
			r = mat[11],
			s = a * a * f + e,
			t = b * a * f + c * d,
			u = c * a * f - b * d,
			v = a * b * f - c * d,
			w = b * b * f + e,
			x = c * b * f + a * d,
			y = a * c * f + b * d,
			z = b * c * f - a * d,
			A = c * c * f + e;
		if (!sq) {
			return null;
		}
		
		if (sq !== 1) {
			sq = 1 / sq;
			a *= sq;
			b *= sq;
			c *= sq;
		}

		if (angle) {
			if (mat !== dest) {
				dest[12] = mat[12];
				dest[13] = mat[13];
				dest[14] = mat[14];
				dest[15] = mat[15];
			}
		} else {
			dest = mat;
		}
		dest[0]  = g * s + k * t + o * u;
		dest[1]  = h * s + l * t + p * u;
		dest[2]  = i * s + m * t + q * u;
		dest[3]  = j * s + n * t + r * u;
		dest[4]  = g * v + k * w + o * x;
		dest[5]  = h * v + l * w + p * x;
		dest[6]  = i * v + m * w + q * x;
		dest[7]  = j * v + n * w + r * x;
		dest[8]  = g * y + k * z + o * A;
		dest[9]  = h * y + l * z + p * A;
		dest[10] = i * y + m * z + q * A;
		dest[11] = j * y + n * z + r * A;
		return dest;
	};
	/**
	 * ビュー行列の生成
	 * @method lookAt
	 * @param {Array} eye 視線ベクトル
	 * @param {Array} center 位置ベクトル
	 * @param {Array} up アップベクトル
	 * @param {Array} dest 結果を格納する行列
	 * @return dest 結果を格納する行列
	 */
	this.lookAt = function (eye, center, up, dest) {
		var eyeX    = eye[0],    eyeY    = eye[1],    eyeZ    = eye[2],
			upX     = up[0],     upY     = up[1],     upZ     = up[2],
			centerX = center[0], centerY = center[1], centerZ = center[2],
			x0, x1, x2, y0, y1, y2, z0, z1, z2, l;

		if (eyeX === centerX && eyeY === centerY && eyeZ === centerZ) {
			return this.identity(dest);
		}
		z0 = eyeX - center[0];
		z1 = eyeY - center[1];
		z2 = eyeZ - center[2];
		l = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
		z0 *= l;
		z1 *= l;
		z2 *= l;
		x0 = upY * z2 - upZ * z1;
		x1 = upZ * z0 - upX * z2;
		x2 = upX * z1 - upY * z0;
		l = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
		if (!l) {
			x0 = 0;
			x1 = 0;
			x2 = 0;
		} else {
			l = 1 / l;
			x0 *= l;
			x1 *= l;
			x2 *= l;
		}
		y0 = z1 * x2 - z2 * x1;
		y1 = z2 * x0 - z0 * x2;
		y2 = z0 * x1 - z1 * x0;
		l = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
		if (!l) {
			y0 = 0;
			y1 = 0;
			y2 = 0;
		} else {
			l = 1 / l;
			y0 *= l;
			y1 *= l;
			y2 *= l;
		}
		dest[0] = x0;
		dest[1] = y0;
		dest[2]  = z0;
		dest[3]  = 0;
		dest[4] = x1;
		dest[5] = y1;
		dest[6]  = z1;
		dest[7]  = 0;
		dest[8] = x2;
		dest[9] = y2;
		dest[10] = z2;
		dest[11] = 0;
		dest[12] = -(x0 * eyeX + x1 * eyeY + x2 * eyeZ);
		dest[13] = -(y0 * eyeX + y1 * eyeY + y2 * eyeZ);
		dest[14] = -(z0 * eyeX + z1 * eyeY + z2 * eyeZ);
		dest[15] = 1;
		return dest;
	};
	
	/**
	 * 射影行列の計算
	 * @method perspective
	 * @param {Number} fovy 縦方向視野角
	 * @param {Number} aspect アスペクト
	 * @param {Number} near ニアクリップ
	 * @param {Number} far ファークリップ
	 * @param {Array} dest 結果を格納する行列
	 * @return dest 結果を格納する行列
	 */
	this.perspective = function (fovy, aspect, near, far, dest) {
		var t = near * Math.tan(fovy * Math.PI / 360),
			r = t * aspect,
			a = r * 2,
			b = t * 2,
			c = far - near;
		dest[0]  = near * 2 / a;
		dest[1]  = 0;
		dest[2]  = 0;
		dest[3]  = 0;
		dest[4]  = 0;
		dest[5]  = near * 2 / b;
		dest[6]  = 0;
		dest[7]  = 0;
		dest[8]  = 0;
		dest[9]  = 0;
		dest[10] = -(far + near) / c;
		dest[11] = -1;
		dest[12] = 0;
		dest[13] = 0;
		dest[14] = -(far * near * 2) / c;
		dest[15] = 0;
		return dest;
	};

	/**
	 * フラスタムの計算
	 * @method frust
	 * @param {Number} left 左
	 * @param {Number} right 右
	 * @param {Number} bottom 下
	 * @param {Number} top 上
	 * @param {Number} near ニア
	 * @param {Number} far ファー
	 * @param {Array} dest 結果を格納する行列
	 * @return dest 結果を格納する行列
	 */
	this.frust = function (left, right, bottom, top, near, far, dest) {
		var rl   =  (right - left),
			tb   =  (top - bottom),
			fn   =  (far - near);
		dest[0]  =  (near * 2.0) / rl;
		dest[1]  =  0;
		dest[2]  =  0;
		dest[3]  =  0;
		dest[4]  =  0;
		dest[5]  =  (near * 2.0) / tb;
		dest[6]  =  0;
		dest[7]  =  0;
		dest[8]  =  (right + left) / rl;
		dest[9]  =  (top + bottom) / tb;
		dest[10] = -(far + near) / fn;
		dest[11] = -1;
		dest[12] =  0;
		dest[13] =  0;
		dest[14] = -(far * near * 2.0) / fn;
		dest[15] =  0;
		return dest;
	};


	/**
	 * 射影行列の計算
	 * @method persp2
	 * @param {Number} id ID
	 * @param {Number} fovy 縦方向視野角
	 * @param {Number} aspect アスペクト
	 * @param {Number} near ニア
	 * @param {Number} far ファー
	 * @param {Array} dest 結果を格納する行列
	 */
	this.persp2 = function (id, fovy, aspect, near, far, dest) {
		var top       = near * Math.tan(fovy * Math.PI / 180),
			right     = top * aspect,
			left      = -right,
			bottom    = -top,
			right_2   = right  / 2,
			left_2    = left   / 2;

		if (id === 1) { return this.frust(left,        left_2, 0, top,     near, far, dest); }
		if (id === 2) { return this.frust(left_2,           0, 0, top,     near, far, dest); }
		if (id === 3) { return this.frust(left,        left_2, bottom, 0,  near, far, dest); }
		if (id === 4) { return this.frust(left_2,           0, bottom, 0,  near, far, dest); }
		if (id === 5) { return this.frust(0,          right_2, 0, top,     near, far, dest); }
		if (id === 6) { return this.frust(right_2,      right, 0, top,     near, far, dest); }
		if (id === 7) { return this.frust(0, right_2,  bottom, 0, near, far, dest); }
		if (id === 8) { return this.frust(right_2,      right, bottom, 0,  near, far, dest); }


		this.frust(-right, right, -top, top, near, far, dest);
	};

	/**
	 * 正投影行列の計算
	 * @method ortho
	 * @param {Number} left 左
	 * @param {Number} right 右
	 * @param {Number} top 上
	 * @param {Number} bottom 下
	 * @param {Number} near ニア
	 * @param {Number} far ファー
	 * @param {Array} dest 結果を格納する行列
	 * @return dest 結果を格納する行列
	 */
	this.ortho = function (left, right, top, bottom, near, far, dest) {
		var h = (right - left),
			v = (top - bottom),
			d = (far - near);
		dest[0]  = 2 / h;
		dest[1]  = 0;
		dest[2]  = 0;
		dest[3]  = 0;
		dest[4]  = 0;
		dest[5]  = 2 / v;
		dest[6]  = 0;
		dest[7]  = 0;
		dest[8]  = 0;
		dest[9]  = 0;
		dest[10] = -2 / d;
		dest[11] = 0;
		dest[12] = -(left + right) / h;
		dest[13] = -(top + bottom) / v;
		dest[14] = -(far + near) / d;
		dest[15] = 1;
		return dest;
	};
	/**
	 * 行列の転置
	 * @method transpose
	 * @param {Array} mat 行列
	 * @param {Array} dest 結果を格納する行列
	 * @return dest 結果を格納する行列
	 */
	this.transpose = function (mat, dest) {
		dest[0]  = mat[0];
		dest[1]  = mat[4];
		dest[2]  = mat[8];
		dest[3]  = mat[12];
		dest[4]  = mat[1];
		dest[5]  = mat[5];
		dest[6]  = mat[9];
		dest[7]  = mat[13];
		dest[8]  = mat[2];
		dest[9]  = mat[6];
		dest[10] = mat[10];
		dest[11] = mat[14];
		dest[12] = mat[3];
		dest[13] = mat[7];
		dest[14] = mat[11];
		dest[15] = mat[15];
		return dest;
	};
	/**
	 * 逆行列の計算
	 * @method inverse
	 * @param {Array} mat 行列
	 * @param {Array} dest 結果を格納する行列
	 * @return dest 結果を格納する行列
	 */
	this.inverse = function (mat, dest) {
		var a = mat[0],  b = mat[1],  c = mat[2],  d = mat[3],
		    e = mat[4],  f = mat[5],  g = mat[6],  h = mat[7],
		    i = mat[8],  j = mat[9],  k = mat[10], l = mat[11],
		    m = mat[12], n = mat[13], o = mat[14], p = mat[15],
		    q = a * f - b * e, r = a * g - c * e,
		    s = a * h - d * e, t = b * g - c * f,
		    u = b * h - d * f, v = c * h - d * g,
		    w = i * n - j * m, x = i * o - k * m,
		    y = i * p - l * m, z = j * o - k * n,
		    A = j * p - l * n, B = k * p - l * o,
		    ivd = 1 / (q * B - r * A + s * z + t * y - u * x + v * w);
		dest[0]  = (f * B - g * A + h * z) * ivd;
		dest[1]  = (-b * B + c * A - d * z) * ivd;
		dest[2]  = (n * v - o * u + p * t) * ivd;
		dest[3]  = (-j * v + k * u - l * t) * ivd;
		dest[4]  = (-e * B + g * y - h * x) * ivd;
		dest[5]  = (a * B - c * y + d * x) * ivd;
		dest[6]  = (-m * v + o * s - p * r) * ivd;
		dest[7]  = (i * v - k * s + l * r) * ivd;
		dest[8]  = (e * A - f * y + h * w) * ivd;
		dest[9]  = (-a * A + b * y - d * w) * ivd;
		dest[10] = (m * u - n * s + p * q) * ivd;
		dest[11] = (-i * u + j * s - l * q) * ivd;
		dest[12] = (-e * z + f * x - g * w) * ivd;
		dest[13] = (a * z - b * x + c * w) * ivd;
		dest[14] = (-m * t + n * r - o * q) * ivd;
		dest[15] = (i * t - j * r + k * q) * ivd;
		return dest;
	};
}

/**
 * クオータニオン
 * @method QtnIV
 */
function QtnIV() {
	"use strict";

	/**
	 * 作成
	 * @method create
	 * @return array クオータニオン
	 */
	this.create = function () {
		return new Float32Array(4);
	};
	/**
	 * 初期化
	 * @method identity
	 * @param {Array} dest 結果を格納するクオータニオン
	 * @return dest 結果を格納するクオータニオン
	 */
	this.identity = function (dest) {
		dest[0] = 0;
		dest[1] = 0;
		dest[2] = 0;
		dest[3] = 1;
		return dest;
	};
	/**
	 * 逆回転の計算
	 * @method inverse
	 * @param {Array} qtn クオータニオン
	 * @param {Array} dest 結果を格納するクオータニオン
	 * @return dest 結果を格納するクオータニオン
	 */
	this.inverse = function (qtn, dest) {
		dest[0] = -qtn[0];
		dest[1] = -qtn[1];
		dest[2] = -qtn[2];
		dest[3] =  qtn[3];
		return dest;
	};
	/**
	 * 正規化
	 * @method normalize
	 * @param {Array} dest 結果を格納するクオータニオン
	 * @return dest 結果を格納するクオータニオン
	 */
	this.normalize = function (dest) {
		var x = dest[0],
			y = dest[1],
			z = dest[2],
			w = dest[3],
			l = Math.sqrt(x * x + y * y + z * z + w * w);

		if (l === 0) {
			dest[0] = 0;
			dest[1] = 0;
			dest[2] = 0;
			dest[3] = 0;
		} else {
			l = 1 / l;
			dest[0] = x * l;
			dest[1] = y * l;
			dest[2] = z * l;
			dest[3] = w * l;
		}
		return dest;
	};
	/**
	 * クオータニオンの積
	 * @method multiply
	 * @param {Array} qtn1 クオータニオン
	 * @param {Array} qtn2 クオータニオン
	 * @param {Array} dest 結果を格納するクオータニオン
	 * @return dest 結果を格納するクオータニオン
	 */
	this.multiply = function (qtn1, qtn2, dest) {
		var ax = qtn1[0], ay = qtn1[1], az = qtn1[2], aw = qtn1[3],
			bx = qtn2[0], by = qtn2[1], bz = qtn2[2], bw = qtn2[3];
		dest[0] = ax * bw + aw * bx + ay * bz - az * by;
		dest[1] = ay * bw + aw * by + az * bx - ax * bz;
		dest[2] = az * bw + aw * bz + ax * by - ay * bx;
		dest[3] = aw * bw - ax * bx - ay * by - az * bz;
		return dest;
	};
	/**
	 * クオータニオンの回転
	 * @method rotate
	 * @param {Number} angle アングル
	 * @param {Array} axis 軸
	 * @param {Array} dest 結果を格納するクオータニオン
	 * @return dest 結果を格納するクオータニオン
	 */
	this.rotate = function (angle, axis, dest) {
		var sq = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2]),
			a = axis[0],
			b = axis[1],
			c = axis[2],
			s;

		if (!sq) {
			return null;
		}

		if (sq !== 1) {
			sq = 1 / sq;
			a *= sq;
			b *= sq;
			c *= sq;
		}

		s = Math.sin(angle * 0.5);
		dest[0] = a * s;
		dest[1] = b * s;
		dest[2] = c * s;
		dest[3] = Math.cos(angle * 0.5);
		return dest;
	};
	/**
	 * ベクトルに変換
	 * @method toVecIII
	 * @param {Array} vec ベクトル
	 * @param {Array} qtn クオータニオン
	 * @param {Array} dest 結果を格納するクオータニオン
	 * @return dest 結果を格納するクオータニオン
	 */
	this.toVecIII = function (vec, qtn, dest) {
		var qp = this.create(),
			qq = this.create(),
			qr = this.create();
		this.inverse(qtn, qr);
		qp[0] = vec[0];
		qp[1] = vec[1];
		qp[2] = vec[2];
		this.multiply(qr, qp, qq);
		this.multiply(qq, qtn, qr);
		dest[0] = qr[0];
		dest[1] = qr[1];
		dest[2] = qr[2];
		return dest;
	};
	/**
	 * マトリックスに変換
	 * @method toMatIV
	 * @param {Array} qtn クオータニオン
	 * @param {Array} dest 結果を格納するクオータニオン
	 * @return dest 結果を格納するクオータニオン
	 */
	this.toMatIV = function (qtn, dest) {
		var x = qtn[0], y = qtn[1], z = qtn[2], w = qtn[3],
			x2 = x + x,
			y2 = y + y,
			z2 = z + z,
			xx = x * x2,
			xy = x * y2,
			xz = x * z2,
			yy = y * y2,
			yz = y * z2,
			zz = z * z2,
			wx = w * x2,
			wy = w * y2,
			wz = w * z2;
		dest[0]  = 1 - (yy + zz);
		dest[1]  = xy - wz;
		dest[2]  = xz + wy;
		dest[3]  = 0;
		dest[4]  = xy + wz;
		dest[5]  = 1 - (xx + zz);
		dest[6]  = yz - wx;
		dest[7]  = 0;
		dest[8]  = xz - wy;
		dest[9]  = yz + wx;
		dest[10] = 1 - (xx + yy);
		dest[11] = 0;
		dest[12] = 0;
		dest[13] = 0;
		dest[14] = 0;
		dest[15] = 1;
		return dest;
	};
	/**
	 * 球面線形保管
	 * @method slerp
	 * @param {Array} qtn1 クオータニオン
	 * @param {Array} qtn2 クオータニオン
	 * @param {Number} time 補間値
	 * @param {Array} dest 結果を格納するクオータニオン
	 * @return dest 結果を格納するクオータニオン
	 */
	this.slerp = function (qtn1, qtn2, time, dest) {
		var ht = qtn1[0] * qtn2[0] + qtn1[1] * qtn2[1] + qtn1[2] * qtn2[2] + qtn1[3] * qtn2[3],
			hs = 1.0 - ht * ht,
			ph,
			pt,
			t0,
			t1;

		if (hs <= 0.0) {
			dest[0] = qtn1[0];
			dest[1] = qtn1[1];
			dest[2] = qtn1[2];
			dest[3] = qtn1[3];
		} else {
			hs = Math.sqrt(hs);
			if (Math.abs(hs) < 0.0001) {
				dest[0] = (qtn1[0] * 0.5 + qtn2[0] * 0.5);
				dest[1] = (qtn1[1] * 0.5 + qtn2[1] * 0.5);
				dest[2] = (qtn1[2] * 0.5 + qtn2[2] * 0.5);
				dest[3] = (qtn1[3] * 0.5 + qtn2[3] * 0.5);
			} else {
				ph = Math.acos(ht);
				pt = ph * time;
				t0 = Math.sin(ph - pt) / hs;
				t1 = Math.sin(pt) / hs;
				dest[0] = qtn1[0] * t0 + qtn2[0] * t1;
				dest[1] = qtn1[1] * t0 + qtn2[1] * t1;
				dest[2] = qtn1[2] * t0 + qtn2[2] * t1;
				dest[3] = qtn1[3] * t0 + qtn2[3] * t1;
			}
		}
		return dest;
	};
}


/**
 * 値のクランプ
 * @method saturate
 * @param {Number} x 値
 * @return number クランプされた値
 */
function saturate(x)
{
	return ((x < 0.0 ? 0.0 : x) > 1.0 ? 1.0 : x);
}
	
/**
 * エルミート補間
 * @method smoothstep
 * @param {Number} a 最小値
 * @param {Number} b 最大値
 * @param {Number} x 補間値
 * @return number 補間された値
 */
function smoothstep (a, b, x)
{
	x = saturate((x - a) / (b - a));
	return x * x * ( 3 - 2 * x );
}


//http://freespace.virgin.net/hugo.elias/models/m_perlin.htm
/**
 * コサイン補間
 * @method CosInter
 * @param {Number} a 最小値
 * @param {Number} b 最大値
 * @param {Number} x 補間値
 * @return number 補間された値
 */
function CosInter(a, b, x) {
	var ft = x * Math.PI,
		f  = (1 - Math.cos(ft)) * .5;
	return a * (1 - f) + b * f;
}

/**
 * Description
 * @method CosInter3v
 * @param {Array} a 最小値
 * @param {Array} b 最大値
 * @param {Array} x 補間値
 * @return number 補間された値
 */
function CosInter3v(a, b, x) {
	var arr = 
	[
		CosInter(a[0], b[0], x),
		CosInter(a[1], b[1], x),
		CosInter(a[2], b[2], x)
	];
	return arr;
}


/**
 * ベクトルの加算
 * @method Add
 * @param {Array} p0 ベクトル
 * @param {Array} p1 ベクトル
 * @return ret 計算結果のベクトル
 */
function Add(p0, p1) {
	var ret = [];
	ret.push(p0[0] + p1[0], p0[1] + p1[1], p0[2] + p1[2]);
	return ret;
}

/**
 * ベクトルの減算
 * @method Sub
 * @param {Array} p0 ベクトル
 * @param {Array} p1 ベクトル
 * @return ret 計算結果のベクトル
 */
function Sub(p0, p1) {
	var ret = [];
	ret.push(
		p0[0] - p1[0],
		p0[1] - p1[1],
		p0[2] - p1[2]);
	return ret;
}

/**
 * ベクトルの積算
 * @method Mul
 * @param {Array} p0 ベクトル
 * @param {Array} p1 ベクトル
 * @return ret 計算結果のベクトル
 */
function Mul(p0, p1) {
	var ret = [];
	ret.push(p0[0] * p1[0], p0[1] * p1[1], p0[2] * p1[2]);
	return ret;
}

/**
 * ベクトルの除算
 * @method Div
 * @param {Array} p0 ベクトル
 * @param {Array} p1 ベクトル
 * @return ret 計算結果のベクトル
 */
function Div(p0, p1) {
	var ret = [];
	ret.push(p0[0] / p1[0], p0[1] / p1[1], p0[2] / p1[2]);
	return ret;
}

/**
 * ベクトルの正規化
 * @method Normalize
 * @param {Array} p ベクトル
 * @return Array 計算結果のベクトル
 */
function Normalize(p) {
	var length = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
	return [p[0] / length, p[1] / length, p[2] / length];
}

/**
 * ベクトルの内積
 * @method Dot
 * @param {Array} p0 ベクトル
 * @param {Array} p1 ベクトル
 * @return ret 計算結果のベクトル
 */
function Dot(p0, p1) {
	return (p0[0] * p1[0]) + (p0[1] * p1[1]) + (p0[2] * p1[2]);
}

/**
 * ベクトルの大きさ
 * @method Length
 * @param {Array} p ベクトル
 * @return number ベクトルの大きさ
 */
function Length(p) {
	return Math.sqrt(Dot(p, p));
}

/**
 * ベクトルの距離
 * @method Distance
 * @param {Array} p0 ベクトル
 * @param {Array} p1 ベクトル
 * @return number ベクトルの距離
 */
function Distance(p0, p1) {
	var p = [p0[0] - p1[0], p0[1] - p1[1], p0[2] - p1[2]];
	return Math.sqrt(Dot(p, p));
}

/**
 * ベクトルを正規化
 * @method Normalize
 * @param {Array} p ベクトル
 * @return Array 正規化されたベクトル
 */
function Normalize(p) {
	var length = Length(p);
	return [p[0] / length, p[1] / length, p[2] / length];
}

/**
 * ベクトルの反転
 * @method Negative
 * @param {Array} p ベクトル
 * @return Array 反転されたベクトル
 */
function Negative(p) {
	var ret = [-p[0], -p[1], -p[2]];
	return ret;
}


/**
 * ベクトルの外積
 * @method Cross
 * @param {Array} p0 ベクトル
 * @param {Array} p1 ベクトル
 * @return Array 計算結果のベクトル
 */
function Cross(p0, p1)
{
	return [
		(p0[1] * p1[2]) - (p0[2] * p1[1]), 
		(p0[2] * p1[0]) - (p0[0] * p1[2]),
		(p0[0] * p1[1]) - (p0[1] * p1[0])
	];
}


/**
 * 最小最大値の取得
 * @method GetMinMax
 * @param {Array} min 取得したベクトル
 * @param {Array} max 取得したベクトル
 * @param {Array} pos 位置ベクトル
 */
function GetMinMax(min, max, pos)
{
	min[0] = Math.min(pos[0], min[0])
	min[1] = Math.min(pos[1], min[1])
	min[2] = Math.min(pos[2], min[2])
	
	max[0] = Math.max(pos[0], max[0]);
	max[1] = Math.max(pos[1], max[1]);
	max[2] = Math.max(pos[2], max[2]);
}

// Intersect Triagle
/**
 * 三角形の交差判定
 * @method IntersectTriangle
 * @param {Array} org 基点位置ベクトル
 * @param {Array} dir 方向ベクトル
 * @param {Array} v0 頂点1
 * @param {Array} v1 頂点2
 * @param {Array} v2 頂点3
 * @return Object 重心座標及びorg + t * dirのt値を返す. 交差しなかった場合はfalseを返す.
 */
function IntersectTriangle(org, dir, v0, v1, v2)
{
	var t       = 0,
		u       = 0,
		v       = 0,
		edge1   = [],
		edge2   = [],
		pvec    = [],
		det     = 0,
		inv_det = 0,
		tvec    = [],
		qvec    = [],
		EPSILON = 0.000001;
	edge1 = Sub(v1, v0);
	edge2 = Sub(v2, v0);
	pvec  = Cross(dir, edge2);
	det   = Dot(edge1, pvec);
	if (det > -EPSILON && det < EPSILON)
	{
		return false;
	}

	inv_det = 1.0 / det;
	tvec    = Sub(org, v0);
	
	u = Dot(tvec, pvec) * inv_det;
	if (u < 0.0 || u > 1.0)
	{
		return false;
	}

	qvec = Cross(tvec, edge1);
	v = Dot(dir, qvec) * inv_det
	if (v < -0.0 || (u + v) > 1.0)
	{
		return false;
	}
	
	t = Dot(edge2, qvec) * inv_det;
	return {'t':t, 'u':u, 'v':v};
}


/**
 * 球の交差判定
 * @method IntersectSphere
 * @param {Array} org 基点位置ベクトル
 * @param {Array} dir 方向ベクトル
 * @param {Number} point 球の中心点
 * @param {Number} radius 球の半径
 * @return org + t * dirのt値を返す. 交差しなかった場合はfalseを返す.
 */
function IntersectSphere(org, dir, point, radius)
{
	//https://code.google.com/p/aobench/
	/*
	var t = 0;
		B = 0,
		C = 0,
		D = 0,
		rs = [0, 0, 0];
	rs = Sub(org, point);
	B = Dot(rs, dir);
	C = Dot(rs, rs) - radius * radius;
	D = B * B - C;
	if (D > 0.0) {
		t = -B - Math.sqrt(D);
		if(t > 0) {
			return {'t' : t };
		}
	}
	*/
	var temp  = Sub(org, point),
		a,
		b,
		c,
		d,
		t = 999999.0;
	a = Dot(dir, dir);
	b = 2.0 * Dot(dir, temp);
	c = Dot(temp, temp) - radius * radius;
	d = b * b - 4 * a * c;
	if(d > 0) {
		t = (-b - d) / (2 * a);
		if(t > 0) {
			return {'t' : t };
		}
	}
	return false;
}

///vec4 outpos = invMatrix * inpos;
/**
 * 行列とベクトルの積算
 * @method MultMatrixVec4
 * @param {Array} a 行列
 * @param {Array} b ベクトル
 * @return ret ベクトル
 */
function MultMatrixVec4(a, b)
{
	var ret = 
		[a[0] * b[0] + a[4 + 0] * b[1] + a[8 + 0] * b[2] + a[12 + 0] * b[3],
		 a[1] * b[0] + a[4 + 1] * b[1] + a[8 + 1] * b[2] + a[12 + 1] * b[3],
		 a[2] * b[0] + a[4 + 2] * b[1] + a[8 + 2] * b[2] + a[12 + 2] * b[3],
		 a[3] * b[0] + a[4 + 3] * b[1] + a[8 + 3] * b[2] + a[12 + 3] * b[3]];
	return ret;
	
}

//https://github.com/g-truc/glm/blob/88f4a5ed827c316b5f6179bc51193a874a3a96ee/glm/gtc/matrix_transform.inl#L423
/**
 * 逆射影変換
 * @method UnProject
 * @param {Array} winpos スクリーン座標
 * @param {Array} invMatrix 変換用行列
 * @param {Array} viewport ビューポート
 * @param {Array} ray レイ
 */
function UnProject(winpos,
					invMatrix,
					viewport,
					ray)
{
	var i,
		inpos  = [],
		outpos = [];
	inpos    = [winpos[0], winpos[1], winpos[2], 1.0];
	inpos[0] = (inpos[0] - viewport[0]) / viewport[2];
	inpos[1] = (inpos[1] - viewport[1]) / viewport[3];
	
	for(i = 0 ; i < inpos.length; i = i + 1) {
		inpos[i] = inpos[i] * 2.0 - 1.0;
	}
	inpos[3] = 1.0;

	outpos = MultMatrixVec4(invMatrix, inpos);
	
	if (outpos[3] == 0.0) {
		console.log("UnProject failed.\n");
		return false;
	}
	
	ray[0] = outpos[0] / outpos[3];
	ray[1] = outpos[1] / outpos[3];
	ray[2] = outpos[2] / outpos[3];
}

//https://github.com/g-truc/glm/blob/88f4a5ed827c316b5f6179bc51193a874a3a96ee/glm/gtc/matrix_transform.inl#L423
/**
 * 逆射影変換ローカル版
 * @method UnProjectWithLocal
 * @param {Array} winpos スクリーン座標
 * @param {Array} invMatrix 変換用行列
 * @param {Array} localInvMatrix 変換用行列
 * @param {Array} viewport ビューポート
 * @param {Array} ray レイ
 */
function UnProjectWithLocal(winpos,
					invMatrix,
					localInvMatrix,
					viewport,
					ray)
{
	var raytemp = [],
		inpos   = [],
		outpos  = [];
	UnProject(winpos, invMatrix, viewport, raytemp);
	inpos[0] = raytemp[0];
	inpos[1] = raytemp[1];
	inpos[2] = raytemp[2];
	inpos[3] = 1.0;

	outpos = MultMatrixVec4(localInvMatrix, inpos);
	ray[0] = outpos[0] / outpos[3];
	ray[1] = outpos[1] / outpos[3];
	ray[2] = outpos[2] / outpos[3];
}
