/*jslint devel:true*/
/*global QtnIV, MatIV, Negative, Distance, CosInter */

var Camera;
var test_time = 0;
(function () {
	"use strict";
	/**
	 * コンストラクタ
	 * @method camera
	 */
	var camera = function () {
		this.qtn               = new QtnIV();
		this.mtx               = new MatIV();
		this.mode              = 'proj';
		this.camPos            = [0, 0, 0];
		this.camPosStart       = [0, 0, 0];
		this.camPosEnd         = [0, 0, 0];
		this.camAt             = [0, 0, 0];
		this.camAtStart        = [0, 0, 0];
		this.camUp             = [0, 0, 0];
		this.camRot            = [0, 0, 0];
		this.camRotPrev        = [0, 0, 0];
		this.camWorldPos       = [0, 0, 0];
		this.camWorldPosStart  = [0, 0, 0];
		this.camWorldPosEnd    = [0, 0, 0];
		this.RotateMatrix      = this.mtx.identity(this.mtx.create());
		this.RotateMatrixStart = this.mtx.identity(this.mtx.create());
		this.camRotStart       = [0, 0, 0];
		this.camRotEnd         = [0, 0, 0];
		this.screen            = [0, 0];
		this.lerpState         = false;
		this.lerpTime          = 0;
		this.lerpTimeDelta     = 0;
		this.projmode          = 0;
	};

	/**
	 * スクリーンのセットアップ
	 * @method setupScreen
	 * @param {Array} スクリーン
	 */
	camera.prototype.setupScreen = function (s) {
		this.screen = s;
	};

	/**
	 * ビューのリセット
	 * @method resetView
	 */
	camera.prototype.resetView = function () {
		console.log('View Matrix RESET');
		this.qtn               = new QtnIV();
		this.camPos            = [0, 0, -256];
		this.camAt             = [0, 0, 0];
		this.camAtStart        = [0, 0, 0];
		this.camUp             = [0, 1, 0];
		this.camRot            = [0, 0, 0];
		this.camRotPrev        = [0, 0, 0];
		this.camWorldPosStart  = [0, 0, 0];
		this.camWorldPosEnd    = [0, 0, 0];
		this.camWorldPos       = [0, 0, 0];
		this.lerpTime          = 0;
		this.RotateMatrix      = this.mtx.identity(this.mtx.create());
	};

	/**
	 * ビュー方向の変更
	 * @method ViewSide
	 * @param {String} type ビュー方向
	 */
	camera.prototype.ViewSide = function (type) {
		var z = 1000;//this.getCamPosZ();
		this.resetView();
		
		if (type === 'x') {
			this.camPos[0] = z;
			this.camPos[1] = 0;
			this.camPos[2] = 0;

			this.mtx.rotate(this.RotateMatrix, (Math.PI * -90.0) / 180.0, [0, 1, 0], this.RotateMatrix);
		}
		if (type === 'y') {
			this.camPos[0] = 0;
			this.camPos[1] = z;
			this.camPos[2] = 0;
			this.mtx.rotate(this.RotateMatrix, (Math.PI * -90.0) / 180.0, [1, 0, 0], this.RotateMatrix);
		}
		if (type === 'z') {
			this.camPos[0] = 0;
			this.camPos[1] = 0;
			this.camPos[2] = -z;
		}
		if (type === 'x-') {
			this.camPos[0] = -z;
			this.camPos[1] = 0;
			this.camPos[2] = 0;
			this.mtx.rotate(this.RotateMatrix, (Math.PI * 90.0) / 180.0, [0, 1, 0], this.RotateMatrix);
		}
		if (type === 'y-') {
			this.camPos[0] = 0;
			this.camPos[1] = -z;
			this.camPos[2] = 0;
			this.mtx.rotate(this.RotateMatrix, (Math.PI * 90.0) / 180.0, [1, 0, 0], this.RotateMatrix);
		}
		if (type === 'z-') {
			this.camPos[0] = 0;
			this.camPos[1] = 0;
			this.camPos[2] = z;
			this.mtx.rotate(this.RotateMatrix, (Math.PI * 180.0) / 180.0, [0, 1, 0], this.RotateMatrix);
		}

	};

	/**
	 * ビューモードの設定
	 * @method ViewMode
	 * @param {String} type ビューモード
	 */
	camera.prototype.ViewMode = function (mode) {
		if (mode === 'pers') {
			this.projmode = 0;
		}

		if (mode === 'ortho') {
			this.projmode = 1;
		}

	};


	/**
	 * 位置の設定
	 * @method pos
	 * @param {Number} x x
	 * @param {Number} y y
	 * @param {Number} z z
	 * @return Array 設定したベクトル
	 */
	camera.prototype.pos = function (x, y, z) {
		this.camPos   = [x, y, z];
		return this.camPos;
	};
	
	/**
	 * ターゲット位置の設定
	 * @method at
	 * @param {Number} x x
	 * @param {Number} y y
	 * @param {Number} z z
	 * @return Array 設定したベクトル
	 */
	camera.prototype.at = function (x, y, z) {
		this.camAt   = [x, y, z];
		return this.camAt;
	};
	
	/**
	 * アップベクトルの設定
	 * @method up
	 * @param {Number} x x
	 * @param {Number} y y
	 * @param {Number} z z
	 * @return Array 設定したベクトル
	 */
	camera.prototype.up = function (x, y, z) {
		this.camUp   = [x, y, z];
		return this.camUp;
	};

	/**
	 * 位置の加算
	 * @method addPos
	 * @param {Number} x x
	 * @param {Number} y y
	 * @param {Number} z z
	 * @return Array 設定したベクトル
	 */
	camera.prototype.addPos = function (x, y, z) {
		this.camPos[0] += x;
		this.camPos[1] += y;
		this.camPos[2] += z;
		return this.camPos;
	};

	/**
	 * ターゲット位置の加算
	 * @method addAt
	 * @param {Number} x x
	 * @param {Number} y y
	 * @param {Number} z z
	 * @return Array 設定したベクトル
	 */
	camera.prototype.addAt = function (x, y, z) {
		this.camAt[0] += x;
		this.camAt[1] += y;
		this.camAt[2] += z;
		return this.camAt;
	};

	/**
	 * 回転値の加算
	 * @method addRotate
	 * @param {Number} x x
	 * @param {Number} y y
	 * @param {Number} z z
	 * @return Array 設定したベクトル
	 */
	camera.prototype.addRotate = function (x, y, z) {
		this.camRot[0] += x;
		this.camRot[1] += y;
		this.camRot[2] += z;
		return this.camRot;
	};

	/**
	 * 補間値のセットアップ
	 * @method setupLerp
	 * @param {Number} min 最小値
	 * @param {Number} max 最大値
	 * @param {Array} trans 移動量
	 * @param {Number} scale 拡縮量
	 */
	camera.prototype.setupLerp = function (min, max, trans, scale, rotate) {
		var len = 0,
			i,
			temp,
			tempmin    = [1,1,1,1],
			tempmax    = [1,1,1,1],
			scalesign  = [1,1,1,1],
			mtx        = new MatIV(),
			rMatrixX   = mtx.identity(mtx.create()),
			rMatrixY   = mtx.identity(mtx.create()),
			rMatrixZ   = mtx.identity(mtx.create()),
			rMatrix    = mtx.identity(mtx.create()),
			maxscale   = 0;
		
		if (scale) {
			for (i = 0 ; i < scale.length; i++) {
				temp = Math.abs(parseFloat(scale[i]));
				if (maxscale < temp) {
					maxscale = temp;
				}
				
				//create sig
				temp = parseFloat(scale[i]);
				if (temp < 0) {
					scalesign[i] = -1;
				}
			}
		}
		
		if (maxscale === 0) {
			maxscale = 1;
		}

		//scale
		tempmin[0] = min[0] * maxscale * scalesign[0];
		tempmin[1] = min[1] * maxscale * scalesign[1];
		tempmin[2] = min[2] * maxscale * scalesign[2];
		tempmax[0] = max[0] * maxscale * scalesign[0];
		tempmax[1] = max[1] * maxscale * scalesign[1];
		tempmax[2] = max[2] * maxscale * scalesign[2];

		//create rotate matrix
		if(rotate) {
			mtx.rotate(rMatrixX, (Math.PI * rotate[0]) / 180.0, [1, 0, 0], rMatrixX);
			mtx.rotate(rMatrixY, (Math.PI * rotate[1]) / 180.0, [0, 1, 0], rMatrixY);
			mtx.rotate(rMatrixZ, (Math.PI * rotate[2]) / 180.0, [0, 0, 1], rMatrixZ);
			mtx.multiply(rMatrixX,  rMatrix, rMatrix);
			mtx.multiply(rMatrixY,  rMatrix, rMatrix);
			mtx.multiply(rMatrixZ,  rMatrix, rMatrix);

			//apply
			tempmin = MultMatrixVec4(rMatrix, tempmin);
			tempmin[0] /= tempmin[3];
			tempmin[1] /= tempmin[3];
			tempmin[2] /= tempmin[3];
			
			tempmax = MultMatrixVec4(rMatrix, tempmax);
			tempmax[0] /= tempmax[3];
			tempmax[1] /= tempmax[3];
			tempmax[2] /= tempmax[3];
			console.log(tempmax, tempmin);
		}

		this.camWorldPosStart[0]   = this.camWorldPos[0];
		this.camWorldPosStart[1]   = this.camWorldPos[1];
		this.camWorldPosStart[2]   = this.camWorldPos[2];
		this.camWorldPosEnd[0]     = (tempmax[0] + tempmin[0]) / 2;
		this.camWorldPosEnd[1]     = (tempmax[1] + tempmin[1]) / 2;
		this.camWorldPosEnd[2]     = (tempmax[2] + tempmin[2]) / 2;

		console.log('setupLerp : cwp->', this.camWorldPos, this.camRot, min, max, trans, scale);
		if (trans) {
			this.camWorldPosEnd[0] += parseFloat(trans[0]);
			this.camWorldPosEnd[1] += parseFloat(trans[1]);
			this.camWorldPosEnd[2] += parseFloat(trans[2]);
		}

		this.camWorldPosEnd     = Negative(this.camWorldPosEnd);

		this.camPosStart[0]     = this.camPos[0];
		this.camPosStart[1]     = this.camPos[1];
		this.camPosStart[2]     = this.camPos[2];
		
		this.camAtStart[0]      = this.camAt[0];
		this.camAtStart[1]      = this.camAt[1];
		this.camAtStart[2]      = this.camAt[2];
		
		this.camPosEnd[0]       = 0;
		this.camPosEnd[1]       = 0;
		this.camPosEnd[2]       = 0;

		this.camPosEnd[2]       = -Distance(tempmax, tempmin);

		this.lerpTime           = 0;
		this.lerpTimeDelta      = 1.0 / 30.0;
		this.lerpState          = true;
	};

	/**
	 * カメラz位置の取得
	 * @method getCamPosZ
	 * @return number カメラz絶対座標
	 */
	camera.prototype.getCamPosZ = function () {
		return Math.abs(this.camPos[2]);
	};

	/**
	 * ビュープロジェクションマトリックスの取得
	 * @method getViewProjMatrix
	 * @param {Number} fov 視野角
	 * @param {Number} aspect アスペクト
	 * @param {Number} near ニア
	 * @param {Number} far ファー
	 * @return vpMatrix ビュープロジェクションマトリックス
	 */
	camera.prototype.getViewProjMatrix = function (fov, aspect, near, far) {
		var mtx      = new MatIV(),
			tMatrix  = mtx.identity(mtx.create()),
			vpMatrix = mtx.identity(mtx.create()),
			vMatrix  = mtx.identity(mtx.create()),
			pMatrix  = mtx.identity(mtx.create()),
			dist     = 1;
		mtx.lookAt(this.camPos, this.camAt, [0, 1, 0], vMatrix);
		if (this.projmode === 0) {
			mtx.perspective(fov, aspect, near, far, pMatrix);
		} else {
			dist = Distance(this.camPos, this.camAt);
			mtx.ortho(-dist * aspect, dist * aspect, dist, -dist, -far, far, pMatrix);
		}
		
		mtx.multiply(pMatrix, vMatrix, vpMatrix);
		
		mtx.translate(tMatrix, this.camWorldPos,  tMatrix);
		mtx.multiply(vpMatrix, this.RotateMatrix, vpMatrix);
		mtx.multiply(vpMatrix, tMatrix,           vpMatrix);
		return vpMatrix;
	};

	/**
	 * ビューマトリックスの取得
	 * @method getViewMatrix
	 * @return vMatrix ビューマトリックス
	 */
	camera.prototype.getViewMatrix = function () {
		var mtx      = new MatIV(),
			vMatrix  = mtx.identity(mtx.create()),
			tMatrix  = mtx.identity(mtx.create()),
			vMatrix  = mtx.identity(mtx.create());

		mtx.lookAt(this.camPos, this.camAt, [0, 1, 0], vMatrix);
		
		mtx.translate(tMatrix, this.camWorldPos,  tMatrix);
		mtx.multiply(vMatrix, this.RotateMatrix, vMatrix);
		mtx.multiply(vMatrix, tMatrix,           vMatrix);
		return vMatrix;
	};
	
	/**
	 * カメラ位置からターゲットまでの距離返す
	 * @method getAtDistance
	 * @return number 距離
	 */
	camera.prototype.getAtDistance = function () {
		return Distance(Sub(this.camAtStart, this.camPosStart));
	};
	
	/**
	 * カメラの補間
	 * @method LeapCamera
	 */
	camera.prototype.LeapCamera = function () {
		this.lerpTime = this.lerpTime + this.lerpTimeDelta;
		if (this.lerpTime >= 1.0) {
			this.lerpTime = 1.0;
			this.lerpState = false;
		}
		this.camWorldPos[0]   = CosInter(this.camWorldPosStart[0], this.camWorldPosEnd[0], this.lerpTime);
		this.camWorldPos[1]   = CosInter(this.camWorldPosStart[1], this.camWorldPosEnd[1], this.lerpTime);
		this.camWorldPos[2]   = CosInter(this.camWorldPosStart[2], this.camWorldPosEnd[2], this.lerpTime);
		this.camPos[0]        = CosInter(this.camPosStart[0],      this.camPosEnd[0], this.lerpTime);
		this.camPos[1]        = CosInter(this.camPosStart[1],      this.camPosEnd[1], this.lerpTime);
		this.camPos[2]        = CosInter(this.camPosStart[2],      this.camPosEnd[2], this.lerpTime);
		this.camAt[0]         = CosInter(this.camAtStart[0],       0, this.lerpTime);
		this.camAt[1]         = CosInter(this.camAtStart[1],       0, this.lerpTime);
		this.camAt[2]         = CosInter(this.camAtStart[2],       0, this.lerpTime);
		if (this.lerpTime >= 1.0) {
			this.lerpTime = 0.0;
		}
	};

	/**
	 * 視線ベクトルの取得
	 * @method getEyeDirection
	 * @return Array 正規化された視線ベクトル
	 */
	camera.prototype.getEyeDirection = function () {
		return Normalize(Sub(this.camPos, this.camAt));
		
	}

	/**
	 * 回転行列の更新
	 * @method updateRotateMatrix
	 * @param {Number} r 回転値
	 * @param {Number} y y移動量
	 * @param {Number} x x移動量
	 */
	camera.prototype.updateRotateMatrix = function (r, y, x) {
		var qt = this.qtn.identity(this.qtn.create()),
			qMatrixXY = this.mtx.identity(this.mtx.create());
		this.qtn.rotate(r, [y, x, 0.0], qt);
		this.qtn.toMatIV(qt, qMatrixXY);
		this.mtx.multiply(qMatrixXY, this.RotateMatrix, this.RotateMatrix);
		this.camRotPrev[0] = this.camRot[0];
		this.camRotPrev[1] = this.camRot[1];
		this.camRotPrev[2] = this.camRot[2];
	};
	
	/**
	 * Description
	 * @method updateMatrix
	 * @param {Array} wh 幅高さ
	 */
	camera.prototype.updateMatrix = function (wh) {
		if (this.lerpState === false) {
			var x        = this.camRot[0] - this.camRotPrev[0],
				y        = this.camRot[1] - this.camRotPrev[1],
				sq       = Math.sqrt(x * x + y * y),
				r        = sq * 2.0 * Math.PI * wh;
			if (sq !== 1) {
				sq = 1 / sq;
				x *= sq;
				y *= sq;
			}
			if (isNaN(x)) { x = 0; }
			if (isNaN(y)) { y = 0; }
			this.updateRotateMatrix(r, y, x);

			return;
		}
		this.LeapCamera();

	};

	/**
	 * Description
	 * @method init
	 */
	camera.prototype.init = function () {
		this.resetView();
	};
	
	Camera = camera;
}());
