import * as t from 'three';
const {
  Vector2, PerspectiveCamera, Vector3, OrthographicCamera,
  Scene, SphereGeometry, Mesh, MeshBasicMaterial, Raycaster,
  ImageUtils, WebGLRenderer, Texture, SpriteMaterial, Sprite,
  TextureLoader, Math: tMath,
} = t;

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

var options = {
  container: 'panoramaConianer',//容器
  url: 'resources/img/panorama/pano-7.jpg',//全景图路径
  lables: [],//标记   {position:{lon:114,lat:38},logoUrl:'lableLogo.png',text:'我是一个标记'}
  widthSegments: 60,//水平切段数
  heightSegments: 40,//垂直切段数（值小粗糙速度快，值大精细速度慢）
  pRadius: 1000,//全景球的半径，推荐使用默认值
  minFocalLength: 1,//镜头最小拉近距离
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
window.tpanorama = tpanorama;
module.exports = tpanorama;