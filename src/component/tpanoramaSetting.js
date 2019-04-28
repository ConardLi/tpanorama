
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
            if (text) {
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
              if (p.lon) {
                alert("经度" + p.lon + ",纬度" + p.lat + ",名称" + p.text);
              }
            }
          });
        }
        if (that.def.deleteLbale) {
          _info.addEventListener("mousedown", function (e) {
            if (e.button == 1) {
              var p = selectLable1(e);
              if (p.lon) {
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
    if (p.lon) {
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
  if (width) {
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

module.exports = panoramaSetting;