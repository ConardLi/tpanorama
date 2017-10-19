# tpanorama

温馨提示：本地浏览请用火狐浏览器，使用chome会有问题，放到服务器上浏览就没有问题了

一款非常好用的全景生成，全景标记编辑插件！！
 
最近一直在研究全景功能，于是封装成一个方便小巧的插件以便大家使用！

插件包括两部分：全景展示部分，全景标记编辑部分，二者结合使用非常方便！

使用插件首先需要引用 three.js

# 1.全景展示

## 1.1 参数说明

参数名称 | 类型 | 说明 
:-: | :-: | :-: 
container |string| 存放全景的容器id 
url | string | 存放全景图片的路径 
lables | array | {position:{lon:经度,lat:纬度},logoUrl:'logo路径',text:'内容'}
widthSegments |num| 水平切段数 
heightSegments |num| 垂直切段数（值小粗糙速度快，值大精细速度慢） 
pRadius |num| 全景球的半径，影响视觉效果，推荐使用默认值 
minFocalLength |num| 镜头最小拉近距离 
maxFocalLength |num| 镜头最大拉近距离 
showlable |'show'/'click'| 显示标记的方式，分为直接显示和点击显示

## 1.2 公用方法


方法名称 | 说明 
:-:| :-: 
config | 给全景对象设置配置信息
init | 初始化全景对象 
clean | 清除全景对象 

## 1.3 使用

初始化：（参数不设置则采用默认参数）

```
        var opt,tp;
        window.onload = function () {
            opt = {
                container:'panoramaConianer',//容器
                url:'img/p1.png',
                lables:[
                    {position:{lon:180,lat:0},logoUrl:'',text:'我是一个标记'}
                ],
                widthSegments: 60,//水平切段数
                heightSegments: 40,//垂直切段数（值小粗糙速度快，值大精细速度慢）
                pRadius: 1000,//全景球的半径，推荐使用默认值
                minFocalLength: 6,//镜头最a小拉近距离
                maxFocalLength: 100,//镜头最大拉近距离
                showlable: 'show' // show,click
            }
            tp = new tpanorama(opt);
            tp.init();
        }
```

修改某些参数

```
opt.showlable = 'click';
opt.lables = [{position:{lon:180,lat:0},logoUrl:'img/logo.png',text:'点击了这个标记'}];
opt.url = 'img/p1.png';
tp.clean();
tp.config(opt);
tp.init();
```

![这里写图片描述](http://chuantu.biz/t6/42/1504930774x1929267553.png)

# 2.添加全景标记工具

在展示全景的时候，你或许会对标记的位置产生了疑问，如何确定标记的位置？

我们可以使用类似经纬度的参数来表达它，注意这里使用的经纬度并不是真正的经纬度，是我们根据地球的经纬度模拟出来的一个参数。

下面这个工具就是用于获取我们想标记位置的 '经纬度'的一种方法，有了这个工具就可以完美结合上面的全景展示工具来使用了。

## 2.1 参数说明

参数名称 | 类型 | 说明 
:-: | :-: | :-: 
container |string| 存放全景设置的容器id 
imgUrl | string | 全景图路径 
width | string | 指定宽度（这里图片必须严格按比例放置），高度自适应 
showGrid | bool | 是否显示全景图的网格
showPosition | bool | 是否显示经纬度信息框 
lableColor | string | 标记在图上的颜色 
gridColor | string | 绘制格网的颜色 
lables | array | 以前标记过的标记 {lon:114,lat:38,text:'标记一'}
addLable | bool | 是否开启双击添加标记(必须开启经纬度提示)
getLable | bool | 是否开启右键查询标记 (必须开启经纬度提示)
deleteLbale | bool | 开启默认中键删除 （必须开启经纬度提示）

## 2.2 公共方法

方法名称 | 说明 
:-:| :-: 
config | 给全景对象重新设置配置信息
init | 初始化全景设置对象 
getAllLables | 获取所有已经添加的标记 
addLable | 用于手动设置添加标记
getLable | 用于手动设置获取标记
delete | 用于手动删除标记
listen | 对全景对象监听事件

## 2.3 使用

### 2.3.1 默认参数使用

使用默认参数，对标记的增删查改已封装好，所有标记设置完成时可使用getAll方法与数据库进行交互

初始化（参数不设置则采用默认参数）

```
        var opt,s;
        window.onload = function () {
             opt = {
                container: 'set',//setting容器
                imgUrl: 'img/p3.png',
                width: '1000px',//指定宽度，高度自适应
                showGrid: true,//是否显示格网
                showPosition: true,//是否显示经纬度提示
                lableColor: '#9400D3',//标记颜色
                gridColor: '#48D1CC',//格网颜色
                lables: [
                    {lon:-72.00,lat:9.00,text:'蓝窗户'},{lon:114.12,lat:69.48,text:'一片云彩'},{lon:132.48,lat:-12.24,text:'大海'}
                    ],//标记   {lon:114,lat:38,text:'标记一'}
                addLable: true,//开启后双击添加标记  (必须开启经纬度提示)
                getLable: true,//开启后右键查询标记  (必须开启经纬度提示)
                deleteLbale:true//开启后中键删除(必须开启经纬度提示)
            };
            s = new tpanoramaSetting(opt);
            s.init();
        }
```

参数切换

```
        function changeImg(name) {
            if (name == "p1"){
                opt.lables = [{lon:178.56,lat:-15.84,text:'神像'}]
            }
            if (name == "p2"){
                opt.lables = [{lon:-80.64,lat:-16.92,text:'蓝色'},{lon:46.80,lat:10.44,text:'绿色'}]
            }
            if (name == "p4"){
                opt.lables = [{lon:48.96,lat:-20.16,text:'樱花'}]
            }
            opt.imgUrl = 'img/'+name+'.png';
            s.clean();
            s.config(opt);
            s.init();
        }
```


![这里写图片描述](http://chuantu.biz/t6/42/1504930807x2890149554.png)

### 2.3.2 自定义事件

很多情况下默认参数不能满足我们的业务需求，这时可以自定义事件。

插件提供了listen函数用于监听各种事件。

添加标记：


```
            s.listen('dblclick',function (e) {
                var text = prompt("标记名称");
                if (text!=null && text!= undefined && text!="") {
                    s.addLable(e,text);
                    alert("添加标记："+text+" 后台交互");
                }
            });
```

查询标记:

```
            s.listen('mousedown',function (e) {
                if (e.button == 2) {
                    var p = s.getLable(e);
                    if (p.lon!=null &&p.lon!=undefined&&p.lon!="" ) {
                        alert("经度：" + p.lon + ",纬度：" + p.lat + ",名称：" + p.text +"   其他操作");
                    }
                }
            });
```

删除标记:

```
            s.listen('mousedown',function (e) {
                if (e.button == 1) {
                    var p = s.getLable(e);
                    if (p.lon!=null &&p.lon!=undefined&&p.lon!="" ) {
                        var c = confirm("您确认要删除该标记吗？");
                        if (c) {
                            s.delete(p);
                            s.clean();
                            s.init();
                            alert("删除成功！   后台交互")
                        }
                    }
                }
            });
```

觉得本插件有用的记得点赞给星！谢谢大家支持！




