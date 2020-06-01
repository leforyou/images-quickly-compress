# images-quickly-compress
利用canvas画布压缩图片(ES6语法)

安装：
npm i images-quickly-compress

使用：

```js
import ImagesQuicklyCompress from  "images-quickly-compress";//导出：压缩图片插件
//压缩方式一：
let imageCompress = new ImagesQuicklyCompress({
    mode:'pixel',//根据像素总大小压缩
    num:1E6,//压缩后图片的总像素都是100万（相当于1000px * 1000px的图片）
    size:'500kb',//图片大小超过500kb执行压缩
    imageType:'image/png',//压缩率比较低
    quality:0.8
});

//压缩方式二：
let imageCompress = new ImagesQuicklyCompress({
    mode:'width',//根据固定宽度压缩
    num:500,//压缩后所有图片的宽度都是500px
    size:'500kb',//图片大小超过500kb执行压缩
    imageType:'image/jpeg', //jpeg压缩效果十分理想
    quality:0.6
});

//注意：files是input的change事件获取的对象
imageCompress.compressor(files).then(res=>{
    console.log('压缩结果：',res);//返回一个blod数组
    let blobArr = res;
    blobArr.forEach(blod => {
        let formData = new FormData();//创建模拟form表单的FormData对象
        formData.append('file',blod);//file是后端接收的变量
        let config = {
            headers:{'Content-Type':'multipart/form-data'}//添加请求头
        };
        axios.post('/api/upload',formData,config).then(response=>{
            //上传图片
            console.log(response.data);
        });
    });
});
```

HTML标签:

```html
<input type="file" accept="image/*" multiple id="imgFilesInput"/>
<!-- <input type="file" accept="image/*" capture="camera" id="fileBtn"/> -->
```

js代码:

```js
import ImagesQuicklyCompress from "./images-quickly-compress.js";
let imageCompress = new ImagesQuicklyCompress({
    mode:'pixel',
    num:1E6,
    size:'500kb',
    imageType:'image/jpeg',
    quality:0.8
});
document.querySelector('#imgFilesInput').addEventListener("change", function() {
    imageCompress.compressor(this.files).then(res=>{
        console.log('压缩结果：',res);
        let blobArr = res;
        blobArr.forEach(blod => {
            //bold格式的图片显示到页面
            let img = document.createElement('img');
            img.src = window.URL.createObjectURL(blod);
            img.onload = function(){
                document.body.appendChild(img);
                window.URL.revokeObjectURL(this.src);
            }
        });
    });
}, false);
```



github地址：

https://github.com/leforyou/images-quickly-compress

bug反馈：
https://github.com/leforyou/images-quickly-compress/issues



技术参考文档：
https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/toBlob
https://developer.mozilla.org/zh-CN/docs/Web/API/Blob
https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL



