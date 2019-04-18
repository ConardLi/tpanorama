/** 
 * todo 完全脱离 引用方式
 * todo import example
 * todo npm
 * todo npm example
 * todo react
 */

import * as t from 'three';
const {
  Vector2, PerspectiveCamera, Vector3, OrthographicCamera,
  Scene, SphereGeometry, Mesh, MeshBasicMaterial, Raycaster,
  ImageUtils, WebGLRenderer, Texture, SpriteMaterial, Sprite,
  TextureLoader, Math: tMath,
} = t;


(function (global, undefined) {

  var _camera, _scene, _renderer;
  var _cameraOrtho, _sceneOrtho;
  var _fov = 75;
  var _pRadius = 1000;
  var _raycaster;
  var _container;
  var _isUserInteracting = false;
  var _lon = 0, _lat = 0;
  var _onPointerDownLon = 0, _onPointerDownLat = 0;
  var _onPointerDownPointerX = 0, _onPointerDownPointerY = 0;
  var _mouse = new Vector2();
  var _clickableObjects = [];
  var _sprites = [];
  var _lables = [];
  var _count1 = 1;

  var options = {
    container: 'panoramaConianer',//容器
    url: 'resources/img/panorama/pano-7.jpg',//全景图路径
    lables: [],//标记   {position:{lon:114,lat:38},logoUrl:'lableLogo.png',text:'我是一个标记'}
    widthSegments: 60,//水平切段数
    heightSegments: 40,//垂直切段数（值小粗糙速度快，值大精细速度慢）
    pRadius: 1000,//全景球的半径，推荐使用默认值
    minFocalLength: 1,//镜头最a小拉近距离
    maxFocalLength: 100,//镜头最大拉近距离
    showlable: 'show' // show,click
  }


  function tpanorama(opt) {
    this.render(opt);
  }

  tpanorama.prototype = {
    constructor: this,
    def: {},
    render: function (opt) {
      this.def = extend(options, opt, true);
      document.getElementById(this.def.container).innerHTML = '';
      _lables = [];
      initContainer(this.def.container);
      initCamera();
      initRaycaster();
      makePanorama(this.def.pRadius, this.def.widthSegments, this.def.heightSegments, this.def.url);
      initRenderer();
      initLable(this.def.lables, this.def.showlable);
      _container.addEventListener('mousedown', onDocumentMouseDown, false);
      _container.addEventListener('mousemove', onDocumentMouseMove, false);
      _container.addEventListener('mouseup', onDocumentMouseUp, false);
      _container.addEventListener('mousewheel', (e) => {
        onDocumentMouseWheel(e, this.def.minFocalLength, this.def.maxFocalLength);
      }, false);
      _container.addEventListener('DOMMouseScroll', (e) => {
        onDocumentMouseWheel(e, this.def.minFocalLength, this.def.maxFocalLength);
      }, false);
      _container.addEventListener('click', onDocumentMouseClick, false);
      global.addEventListener('resize', onWindowResize, false);
      animate();
    }
  }

  function extend(o, n, override) {
    for (var key in n) {
      if (n.hasOwnProperty(key) && (!o.hasOwnProperty(key) || override)) {
        o[key] = n[key];
      }
    }
    return o;
  }

  function isEmpty(str) {
    if (str == undefined || str == null || str == "" || typeof str == 'undefined') {
      return true;
    }
  }

  function initContainer(c) {
    _container = document.getElementById(c);
  }

  function initCamera() {
    _camera = new PerspectiveCamera(_fov, window.innerWidth / window.innerHeight, 1, 1100);
    _camera.target = new Vector3(0, 0, 0);
    _cameraOrtho = new OrthographicCamera(-window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 1, 10);
    _cameraOrtho.position.z = 10;
    _scene = new Scene();
    _sceneOrtho = new Scene();
  }

  function initRaycaster() {
    _raycaster = new Raycaster();
  }

  function makePanorama(pRadius, widthSegments, heightSegments, u) {
    var mesh = new Mesh(new SphereGeometry(pRadius, widthSegments, heightSegments),
      new MeshBasicMaterial(
        { map: ImageUtils.loadTexture(u) }
      ));
    mesh.scale.x = -1;
    _scene.add(mesh);
  }

  function initRenderer() {
    _renderer = new WebGLRenderer();
    _renderer.setSize(window.innerWidth, window.innerHeight);
    _renderer.autoClear = false;
    _container.appendChild(_renderer.domElement);
  }

  function onDocumentMouseDown(event) {
    event.preventDefault();
    _isUserInteracting = true;
    _onPointerDownPointerX = event.clientX;
    _onPointerDownPointerY = event.clientY;
    _onPointerDownLon = _lon;
    _onPointerDownLat = _lat;
  }

  function onDocumentMouseMove(event) {
    if (_isUserInteracting) {
      _lon = (_onPointerDownPointerX - event.clientX) * 0.1 + _onPointerDownLon;
      _lat = (event.clientY - _onPointerDownPointerY) * 0.1 + _onPointerDownLat;
    }
  }

  function onDocumentMouseUp() {
    _isUserInteracting = false;
  }

  function onDocumentMouseClick(event) {
    _mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    _mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    _raycaster.setFromCamera(_mouse, _cameraOrtho);
    var intersects = _raycaster.intersectObjects(_clickableObjects);
    intersects.forEach(function (element) {
      alert("Intersection: " + element.object.name);
    });
  }

  function onDocumentMouseWheel(ev, minFocalLength, maxFocalLength) {
    var ev = ev || window.event;
    var down = true;
    var m = _camera.getFocalLength();
    down = ev.wheelDelta ? ev.wheelDelta < 0 : ev.detail > 0;
    if (down) {
      if (m > minFocalLength) {
        m -= m * 0.05
        _camera.setFocalLength(m);
      }
    } else {
      if (m < maxFocalLength) {
        m += m * 0.05
        _camera.setFocalLength(m);
      }
    }
    if (ev.preventDefault) {
      ev.preventDefault();
    }
    return false;
  }

  function onWindowResize() {
    _camera.aspect = window.innerWidth / window.innerHeight;
    _camera.projectionMatrix.makePerspective(_fov, _camera.aspect, 1, 1100);
    _camera.updateProjectionMatrix();
    _cameraOrtho.left = -window.innerWidth / 2;
    _cameraOrtho.right = window.innerWidth / 2;
    _cameraOrtho.top = window.innerHeight / 2;
    _cameraOrtho.bottom = -window.innerHeight / 2;
    _cameraOrtho.updateProjectionMatrix();
    _renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function initLable(lables, showlable) {
    if (showlable == 'show') {
      for (var i = 0; i < lables.length; i++) {
        _lables.push(createLableSprite(_sceneOrtho, lables[i].text, lables[i].position));
      }
    } else if (showlable == 'click') {
      for (var i = 0; i < lables.length; i++) {
        _sprites.push(createSprite(lables[i].position, lables[i].logoUrl, lables[i].text));
      }
    }
  }

  function createLableSprite(scene, name, position) {
    var canvas1 = document.createElement('canvas');
    var context1 = canvas1.getContext('2d');
    var metrics = context1.measureText(name);
    var width = metrics.width * 1.5;
    context1.font = "10px 宋体";
    context1.fillStyle = "rgba(0,0,0,0.95)"; // white border
    context1.fillRect(0, 0, width + 8, 20 + 8);
    context1.fillStyle = "rgba(0,0,0,0.2)"; // black filler
    context1.fillRect(2, 2, width + 4, 20 + 4);
    context1.fillStyle = "rgba(255,255,255,0.95)"; // text color
    context1.fillText(name, 4, 20);
    var texture1 = new Texture(canvas1);
    texture1.needsUpdate = true;
    var spriteMaterial = new SpriteMaterial({ map: texture1 });
    var sprite1 = new Sprite(spriteMaterial);
    sprite1.scale.set(1.0, 1.0, 1.0);
    sprite1.position.set(0, 0, 0);
    sprite1.name = name;
    var lable = {
      name: name,
      pos: position,
      canvas: canvas1,
      context: context1,
      texture: texture1,
      sprite: sprite1
    };
    _sceneOrtho.add(lable.sprite);
    return lable;
  }


  function createSprite(position, url, name) {
    var textureLoader = new TextureLoader();
    var ballMaterial = new SpriteMaterial({
      map: textureLoader.load(url)
    });
    var sp1 = {
      pos: position,
      name: name,
      sprite: new Sprite(ballMaterial)
    };
    sp1.sprite.scale.set(32, 32, 1.0);
    sp1.sprite.position.set(0, 0, 0);
    sp1.sprite.name = name;
    _sceneOrtho.add(sp1.sprite);
    _clickableObjects.push(sp1.sprite);
    return sp1;
  }


  function animate() {
    requestAnimationFrame(animate);
    render();
  }


  function render() {
    calPosition();
    addSprites();
    runRender();
  }


  function calPosition() {
    _lat = Math.max(-85, Math.min(85, _lat));
    var phi = tMath.degToRad(90 - _lat);
    var theta = tMath.degToRad(_lon);
    _camera.target.x = _pRadius * Math.sin(phi) * Math.cos(theta);
    _camera.target.y = _pRadius * Math.cos(phi);
    _camera.target.z = _pRadius * Math.sin(phi) * Math.sin(theta);
    _camera.lookAt(_camera.target);
  }


  function addSprites() {
    if (typeof (_sprites) != "undefined") {
      for (var i = 0; i < _sprites.length; i++) {
        var wp = geoPosition2World(_sprites[i].pos.lon, _sprites[i].pos.lat);
        var sp = worldPostion2Screen(wp, _camera);
        var test = wp.clone();
        test.project(_camera);
        if (test.x > -1 && test.x < 1 && test.y > -1 && test.y < 1 && test.z > -1 && test.z < 1) {
          _sprites[i].sprite.scale.set(32, 32, 32);
          _sprites[i].sprite.position.set(sp.x, sp.y, 1);
        }
        else {
          _sprites[i].sprite.scale.set(1.0, 1.0, 1.0);
          _sprites[i].sprite.position.set(0, 0, 0);
        }
      }
    }
    if (typeof (_lables) != "undefined") {
      for (var i = 0; i < _lables.length; i++) {
        var wp = geoPosition2World(_lables[i].pos.lon, _lables[i].pos.lat);
        var sp = worldPostion2Screen(wp, _camera);
        var test = wp.clone();
        test.project(_camera);
        if (test.x > -1 && test.x < 1 && test.y > -1 && test.y < 1 && test.z > -1 && test.z < 1) {
          var metrics = _lables[i].context.measureText(_lables[i].name);
          var width = metrics.width * 3.5;
          _lables[i].sprite.scale.set(400, 150, 1.0);
          _lables[i].sprite.position.set(sp.x + width, sp.y - 40, 1);
        }
        else {
          _lables[i].sprite.scale.set(1.0, 1.0, 1.0);
          _lables[i].sprite.position.set(0, 0, 0);
        }
      }
    }
  }


  function geoPosition2World(lon, lat) {
    lat = Math.max(-85, Math.min(85, lat));
    var phi = tMath.degToRad(90 - lat);
    var theta = tMath.degToRad(lon);

    var result = {
      x: _pRadius * Math.sin(phi) * Math.cos(theta),
      y: _pRadius * Math.cos(phi),
      z: _pRadius * Math.sin(phi) * Math.sin(theta)
    }
    return new Vector3(result.x, result.y, result.z);
  }

  function worldPostion2Screen(world_vector, camera) {
    var vector = world_vector.clone();
    vector.project(camera);
    var result = {
      x: Math.round((vector.x + 1) * window.innerWidth / 2 - window.innerWidth / 2),
      y: Math.round(window.innerHeight / 2 - (-vector.y + 1) * window.innerHeight / 2),
      z: 0
    };
    return new Vector3(result.x, result.y, result.z);
  }


  function runRender() {
    _renderer.clear();
    _renderer.render(_scene, _camera);
    _renderer.clearDepth();
    _renderer.render(_sceneOrtho, _cameraOrtho);
  }



  var _setContainer;
  var _hideImgId = "hideimgid825";
  var _himg;
  var _cvId = 'cv825';
  var _cv;
  var _infoId = 'info825';
  var _info;
  var _lable = [];
  var count = 1;


  var setOpt = {
    container: 'myDiv',//setting容器
    imgUrl: 'resources/img/panorama/3.jpg',
    width: '',//指定宽度，高度自适应
    showGrid: true,//是否显示格网
    showPosition: true,//是否显示经纬度提示
    lableColor: '#9400D3',//标记颜色
    gridColor: '#48D1CC',//格网颜色
    lables: [],//标记   {lon:114,lat:38,text:'标记一'}
    addLable: true,//开启后双击添加标记  (必须开启经纬度提示)
    getLable: true,//开启后右键查询标记  (必须开启经纬度提示)
    deleteLbale: true,//开启默认中键删除 （必须开启经纬度提示）
  }


  function panoramaSetting(opt) {
    this.config(opt);
  }


  panoramaSetting.prototype = {
    constructor: this,
    def: {},
    config: function (opt) {
      this.def = extend(setOpt, opt, true);
    },
    init: function () {
      var that = this;
      _lable = this.def.lables;
      initSetContainer(this.def.container, this.def.imgUrl);
      setTimeout(function () {
        adptpImg(that.def.width, that.def.imgUrl);
        clearCanvas();
        if (that.def.showGrid) {
          initGrid(that.def.gridColor);
        }
        if (that.def.showPosition) {
          initCursor();
        }
        initLables(that.def.lables, that.def.lableColor);
        var then = that;
        if (count == 2) {
          if (that.def.addLable) {
            _info.addEventListener("dblclick", function (e) {
              var text = prompt("标记名称");
              if (!isEmpty(text)) {
                addMark(e, then.def.lableColor, text);
              }
            });
          }
          if (that.def.getLable) {
            document.oncontextmenu = function (e) {
              e.preventDefault();
            };
            _info.addEventListener("mousedown", function (e) {
              if (e.button == 2) {
                var p = selectLable1(e);
                if (!isEmpty(p.lon)) {
                  alert("经度" + p.lon + ",纬度" + p.lat + ",名称" + p.text);
                }
              }
            });
          }
          if (that.def.deleteLbale) {
            _info.addEventListener("mousedown", function (e) {
              if (e.button == 1) {
                var p = selectLable1(e);
                if (!isEmpty(p.lon)) {
                  var c = confirm("您确认要删除该标记吗？");
                  if (c) {
                    removeByValue(_lable, p);
                    that.clean();
                    that.init();
                  }
                }
              }
            });
          }
        }
      }, 100);
      count++;
    },
    getAllLables: function () {
      return _lable;
    },
    addLable: function (e, text) {
      var position = addMark(e, this.def.lableColor, text);
    },
    getLable: function (e) {
      return selectLable1(e);
    },
    listen: function (type, fun) {
      _info.addEventListener(type, function (e) {
        fun(e);
      })
    },
    delete: function (p) {
      if (!isEmpty(p.lon)) {
        removeByValue(_lable, p);
      }
    },
    clean: function () {
      document.getElementById(this.def.container).innerHTML = '';
    }
  }


  function initSetContainer(c, url) {
    _setContainer = document.getElementById(c);

    _himg = document.getElementById(_hideImgId);
    if (_himg != null) {
      document.body.removeChild(_himg);
    }
    _himg = document.createElement('img');
    _himg.style.visibility = 'hidden';
    _himg.id = _hideImgId;
    _himg.src = url;

    _cv = document.getElementById(_cvId);
    if (_cv != null) {
      _setContainer.removeChild(_cv);
    }
    _cv = document.createElement('canvas');
    _setContainer.appendChild(_cv);
    _cv.id = _cvId;

    _info = document.getElementById(_infoId);
    if (_info != null) {
      document.body.removeChild(_info);
    } else {
      _info = document.createElement('div');
    }
    _info.id = _infoId;
    _info.style.height = "40px";
    _info.style.width = "110px";
    _info.style.backgroundColor = "#3C8DBC";
    _info.style.display = "none";
    _info.style.position = "absolute";
    _info.style.filter = "alpha(Opacity=80)";
    _info.style.mozOpacity = 0.5;
    _info.style.opacity = 0.8;
    _info.style.fontFamily = "楷体";
    _info.style.fontWeight = "bold";
    _info.style.textShadow = "0 0 0.2em #fffd84";
    _info.style.textAlign = "center";
    document.body.appendChild(_info);
  }


  function adptpImg(width, url) {
    if (!isEmpty(width)) {
      _setContainer.style.width = width;
    }
    _setContainer.style.backgroundImage = '';
    var naturalHeight = _himg.naturalHeight;
    var naturalWidth = _himg.naturalWidth;
    var scale = naturalHeight / naturalWidth;
    var height = scale * _setContainer.style.width.split("px")[0];
    _setContainer.style.height = height + "px";


    setTimeout(function () {
      _setContainer.style.backgroundRepeat = 'no-repeat';
      _setContainer.style.backgroundPosition = '0% 0%';
      _setContainer.style.backgroundSize = 'cover';
      _setContainer.style.backgroundImage = "url(" + url + ")";
    }, 100);
  }


  function initGrid(color) {
    _cv.width = _setContainer.style.width.split("px")[0];
    _cv.height = _setContainer.style.height.split("px")[0];
    if (_cv.getContext) {
      var ctx = _cv.getContext("2d"),
        width = _cv.width,
        height = _cv.height;
      ctx.strokeStyle = color;
      for (var i = 1; i < 19; i++) {
        if (i == 9) {
          ctx.lineWidth = 3;
        } else {
          ctx.lineWidth = 0.8;
        }
        ctx.beginPath();
        ctx.moveTo(0, i * height / 18);
        ctx.lineTo(width, i * height / 18);
        ctx.stroke();
      }
      for (var j = 1; j < 37; j++) {
        if (j == 18) {
          ctx.lineWidth = 3;
        } else {
          ctx.lineWidth = 0.8;
        }
        ctx.beginPath();
        ctx.moveTo(j * width / 36, 0);
        ctx.lineTo(j * width / 36, height);
        ctx.stroke();
      }
    }
  }

  function clearCanvas() {
    var ctx = _cv.getContext("2d");
    var h = _setContainer.height;
    var w = _setContainer.width;
    ctx.clearRect(0, 0, w, h);
  }


  function initCursor() {
    var minX = _setContainer.offsetLeft;
    var maxX = minX + _setContainer.style.width.split("px")[0];
    var minY = _setContainer.offsetTop;
    var maxY = minY + _setContainer.style.height.split("px")[0];
    document.onmousemove = function (ev) {
      var oEvent = ev || event;
      var pos = getXY(oEvent);
      if (pos.x < maxX && pos.x > minX && pos.y < maxY && pos.y > minY) {
        _info.style.display = "block";
        _info.style.left = pos.x + "px";
        _info.style.top = pos.y + "px";
        updateInfoDiv(ev);
      } else {
        _info.style.display = "none";
      }
    };
  }


  function getXY(eve) {
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
    return { x: scrollLeft + eve.clientX, y: scrollTop + eve.clientY };
  }

  function updateInfoDiv(e) {
    var position = calLonLat(e);
    var html = "经度：" + position.lon + "</br>" + "纬度：" + position.lat;
    _info.innerHTML = html;
  }


  function calLonLat(e) {
    var h = _setContainer.style.height.split("px")[0];
    var w = _setContainer.style.width.split("px")[0];
    var ix = _setContainer.offsetLeft;
    var iy = _setContainer.offsetTop;
    iy = iy + h;
    var x = e.clientX;
    var y = e.clientY;
    var lonS = (x - ix) / w;
    var lon = 0;
    if (lonS > 0.5) {
      lon = -(1 - lonS) * 360;
    } else {
      lon = 1 * 360 * lonS;
    }
    var latS = (iy - y) / h;
    var lat = 0;
    if (latS > 0.5) {
      lat = (latS - 0.5) * 180;
    } else {
      lat = (0.5 - latS) * 180 * -1
    }
    lon = lon.toFixed(2);
    lat = lat.toFixed(2);
    return { lon: lon, lat: lat };
  }


  function initLables(arr, color) {
    for (var i in arr) {
      var p = arr[i];
      var m = getXYByLonLat(p.lon, p.lat);
      drawCircle(m.x, m.y);
      drawText(m.x, m.y, p.text, color);
    }
  }


  function drawText(x, y, txt, lableColor) {
    var canvas = _cv;
    var ctx = canvas.getContext("2d");
    ctx.font = "bold 20px 楷体";
    ctx.fillStyle = lableColor;
    ctx.fillText(txt, x, y);
  }


  function drawCircle(x, y) {
    var canvas = _cv;
    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "#0000ff";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    ctx.fillStyle = "#ff0000";
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, 2 * Math.PI, true);
    ctx.closePath();
    ctx.fill();
  }


  function getXYByLonLat(lon, lat) {
    var x = 0;
    var y = 0;
    var h = _setContainer.style.height.split("px")[0];
    var w = _setContainer.style.width.split("px")[0];
    if (lon > 0) {
      x = 1 * lon / 180 * 0.5 * w;
    } else {
      x = (1 + lon / 180) * 0.5 * w + 0.5 * w;
    }
    if (lat > 0) {
      y = (1 - lat / 90) * h * 0.5;
    } else {
      y = -1 * lat / 90 * 0.5 * h + 0.5 * h
    }
    return { x: x, y: y }
  }


  function addMark(e, color, text) {
    var pos = getXY(e);
    var iX = _setContainer.offsetLeft;
    var iY = _setContainer.offsetTop;
    var x = pos.x - iX;
    var y = pos.y - iY;
    drawCircle(x, y);
    drawText(x, y, text, color);
    var ll = calLonLat(e);
    var l = { lon: ll.lon, lat: ll.lat, text: text }
    _lable.push(l);
    return l;
  }

  function selectLable1(e) {
    var flag = false;
    var p;
    for (var i = 0; i < _lable.length; i++) {
      p = _lable[i];
      var m = getXYByLonLat(p.lon, p.lat);
      var iX = _setContainer.offsetLeft;
      var iY = _setContainer.offsetTop;
      var screenX = e.clientX;
      var screenY = e.clientY;
      var x = screenX - iX;
      var y = screenY - iY;
      var cx = x - m.x;
      var cy = y - m.y;
      var distence = Math.sqrt(cx * cx + cy * cy);
      if (distence <= 5) {
        flag = true;
        break;
      }
    }
    if (flag) {
      return p;
    } else {
      return {};
    }
  }


  function removeByValue(arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].lon == val.lon && arr[i].lat == val.lat) {
        arr.splice(i, 1);
        break;
      }
    }
  }


  global.tpanorama = tpanorama;
  global.tpanoramaSetting = panoramaSetting;
  global.tpanoramaSetContainer = _setContainer;

}(window));