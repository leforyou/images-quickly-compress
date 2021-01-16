# images-quickly-compress
利用canvas画布压缩图片(ES6语法)

**安装：**
npm install images-quickly-compress --save

**使用方式：**

```js
import ImagesQuicklyCompress from  "images-quickly-compress";//导出：压缩图片插件
//压缩方式一：
let imageCompress = new ImagesQuicklyCompress({
    mode:'pixel',//根据像素总大小压缩
    num:1E6,//压缩后图片的总像素都是100万（相当于1000px * 1000px的图片）
    size:'500kb',//图片大小超过500kb执行压缩
    imageType:'image/jpeg',//jpeg压缩效果十分理想
    quality:0.8
});

//压缩方式二：
let imageCompress = new ImagesQuicklyCompress({
    mode:'width',//根据固定宽度压缩
    num:500,//压缩后所有图片的宽度都是500px
    size:'500kb',//图片大小超过500k压缩率比较低b执行压缩
    imageType:'image/png', //压缩率比较低
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

**参数说明：**

| 参数      | 说明                                                         | 是否必须 | 类型          | 默认值       |
| :-------- | ------------------------------------------------------------ | :------- | :------------ | :----------- |
| mode      | pixel：是以固定的像素压缩。width：以固定的宽度进行压缩。     | 否       | String        | 'pixel'      |
| num       | pixel模式对应num默认值是100万像素，输出的图片总像素数 1E6 = 宽 * 高<br />width模式对应num的默认值是500，输出的图片宽度都是500px。 | 否       | Number        | 1E6          |
| size      | 对超过该值的图片进行压缩,单位是KB。                          | 否       | String/Number | '500kb'或500 |
| imageType | 压缩后输入图片的格式：<br />image/jpeg 压缩率比较高，效果十分理想。<br />image/png 压缩率比较低。 | 否       | String        | 'image/jpeg' |
| quality   | 压缩质量。数值越低压缩后的体积越小，但图片越模糊，建议使用0.8。 | 否       | Number        | 0.8          |

**Vue中使用方式：**

```vue
<template>
    <div style="position: relative;">
        <div>上传图片</div>
        <UploadImage :multiple="true" :count="10" :before-upload="beforeUpload" :on-success="uploadSuccess"/>
    </div>
</template>

<script>
import UploadImage from '@/components/UploadImage';//引入上传图片的组件。注意路径修改
export default {
    name: "UserAlbum",
    components: {
		UploadImage
    },
    methods: {
        beforeUpload(){
            //上传前的函数,在这里能控制上传图片的数量。
            /*
                同步的处理方式:
                    1. 不返任何值即undefined 允许上传
                    2. return true;//允许上传
                    3. return false;//不允许上传
            */
            //异步的处理方式:
            return new Promise((resolve,reject)=>{
                resolve(true);//只有返回true才允许上传，其它方式都不允许上传
            });
        },
        uploadSuccess(arr){
            //上传成功回调函数
        },
    },
};
</script>
```

注：UploadImage.vue组件需要安装axios和接口路径需要修改。UploadImage组件是不带任何样式的，使用了absolute绝对定位，使用前需要给它的父标签添加relative相对定位。

```vue
<template>
    <div class="UploadImage" @click.stop="upload">
        <div @click.stop="()=>{/*阻止input的点击事件冒泡*/}">
            <input type="file" accept="image/*" :multiple="multiple" :id="inputID"/>
        </div>
    </div>
</template>
<script>
import axios from 'axios';
let imageCompress = new ImagesQuicklyCompress({
    mode: 'pixel', //根据像素总大小压缩
    num: 1E6, //压缩后图片的总像素都是100万（相当于1000px * 1000px的图片）
    size: '500kb', //图片大小超过500kb执行压缩
    imageType: 'image/jpeg', //jpeg压缩效果十分理想
    quality: 0.8
});
export default {
    name: "UploadImage",
    props:{
        count:{
            type:Number,
            default:1,
        },
        multiple:{
            type:Boolean,
            default:false,
        },
        beforeUpload:Function,
        onSuccess: {
            type: Function,
            default: function(){}
        },
    },
    data() {
        let inputID = `id_${Date.now()}_${parseInt(Math.random() * 10000000)}`;
        return {
            inputID:inputID,
            input:null,
        };
    },
    created() {
        
    },
    mounted() {
        this.$nextTick(function() {
            this.input = document.querySelector(`#${this.inputID}`);
            this.input.addEventListener('change',this.change,false);
        });
    },
    beforeDestroy() {
        if(this.input){
            this.input.removeEventListener('change',this.change,false);
        }
    },
    methods: {
        upload(){
            let beforeUpload = this.beforeUpload;
            if(beforeUpload === undefined){
                this.handleInput();
            }else{
                let before = beforeUpload();
                if(before && before.then) {
                    before.then(state=>{
                        if(state === true){
                            this.handleInput();
                        }
                    });
                }else if(before === true || before === undefined){
                    this.handleInput();
                }
            }
        },
        handleInput(){
            //模拟点击input
            this.input.click();
        },
        change(e){
            let files = e.target.files;
            if(files.length === 0)return;
            if(this.count === 0)return;
            imageCompress.compressor(files).then(res=>{
                let all = [];
                let blobArr = res;
                for (let i = 0; i < blobArr.length; i++) {
                    if(i < this.count){//多选超出数量限制的图片，不上传
                        const blod = blobArr[i];
                        let formData = new FormData();//创建模拟form表单的FormData对象
                        formData.append('file',blod);//file是后端接收的变量
                        let p = axios.post('/wxServiceAccount/uploadImageSingle',formData);
                        all.push(p);
                    }
                }
                if(all.length === 0)return;
                Promise.all(all).then(res=>{
                    let arr = res.map(obj=>{
                        if(obj.code === 200)return obj.result;
                    });
                    this.onSuccess(arr);
                    this.input.value = null;//清空就能重复上传
                });
            });
        }
    },
};
</script>
<style scoped lang="scss">
.UploadImage{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    z-index: 99;
    opacity: 0;
    overflow: hidden;
    input{
        position: absolute;
        top: 110%;
        left: 110%;
    }
}
</style>
```

**React + Ant Design的使用方式：**

Upload组件在上传前进行压缩

```react
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Upload, message,Modal } from 'antd';
import { LoadingOutlined,PlusOutlined } from '@ant-design/icons';
import ImagesQuicklyCompress from "images-quickly-compress"; //导出：压缩图片插件

let imageCompress = new ImagesQuicklyCompress({
  mode: 'pixel', //根据像素总大小压缩
  num: 1E6, //压缩后图片的总像素都是100万（相当于1000px * 1000px的图片）
  size: '500kb', //图片大小超过500kb执行压缩
  imageType: 'image/jpeg', //jpeg压缩效果十分理想
  quality: 0.8
});

class UploadImage extends Component<any, any> {
  static propTypes: {};
  static defaultProps: { limit: number };
  constructor(props: any) {
    super(props);
    this.state = {
      loading: false,
      fileList: [
        /* {
          uid: '-3',
          url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        } */
      ],
    };
  }
  componentDidMount() {
    
  }
  componentWillReceiveProps(props: any) {
    
  }
  async beforeUpload(file:any, fileList:any) {
    //上传前
    if(this.state.fileList.length + fileList.length > this.props.limit){
      message.error(`最多上传${this.props.limit}张图片!`);
      return Promise.reject();
    }
    let [blod] = await imageCompress.compressor([file]);
    blod.uid = file.uid;
    const isLt2M = blod.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片不能超过2MB!');
      return Promise.reject();
    }
    return  Promise.resolve(blod);
  }
  handleChange = (info:any) => {
    //删除与上传 都执行
    
  }
  onPreview(file:any){
    //查看图片
    let src = file.url;
    Modal.info({
      icon:'',
      title: '图片查看',
      okText:'关闭',
      content: (
        <div>
          <img alt="example" style={{ width: '100%' }} src={src} />
        </div>
      )
    });
  };
  
  render() {
    const uploadButton = (
      <div>
        {this.state.loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const { fileList } = this.state;
    return (
        <Upload
          name="image"
          action={this.props.action || "/wxServiceAccount/uploadImageSingle"}
          accept="image/*"
          listType="picture-card"
          className="avatar-uploader"
          fileList={fileList}
          multiple={true}
          beforeUpload={this.beforeUpload.bind(this)}
          onChange={this.handleChange}
          onPreview={this.onPreview}
          headers={{
            token:sessionStorage.getItem('token') || ""
          }}
        >
          {fileList.length < this.props.limit ? uploadButton : ''}
        </Upload>
    );
  }
}

export default UploadImage;


UploadImage.propTypes = {
  name:PropTypes.string.isRequired,
  form:PropTypes.object.isRequired,
  limit:PropTypes.number,//默认值最多上传99张图片
  action:PropTypes.string,
}

UploadImage.defaultProps = {
  limit: 99
}
```

下面是将压缩后的图片回显到页面，作为知识的扩展，不感兴趣忽略。注：网上有的插件使用base64 URL方式将图片回显到页面，对于体积大的图片，回显过程会明显卡死，但用bold URL能实现秒加载不卡顿。

```html
<!-- HTML标签: -->
<input type="file" accept="image/*" multiple id="imgFilesInput"/>
<!-- <input type="file" accept="image/*" capture="camera" id="fileBtn"/> -->
```

```js
//js代码:
import ImagesQuicklyCompress from "images-quickly-compress.js";
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



bug反馈：

https://github.com/leforyou/images-quickly-compress/issues



技术参考文档：

https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/toBlob

https://developer.mozilla.org/zh-CN/docs/Web/API/Blob

https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL
