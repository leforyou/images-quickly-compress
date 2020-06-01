//export default class ImagesQuicklyCompress
export default class ImagesQuicklyCompress{//es6定义类
    constructor(props){//constructor是一个构造方法，用来接收参数
        let {mode = 'pixel',num,size='500kb',imageType='image/jpeg',quality=0.8} = props;
        this.mode = mode;//pixel：固定像素压缩，width：固定宽度压缩
        this.num = mode == 'pixel'?(num || 1E6) : (num || 5E2);//设置默认值
        this.size = Number((size + '').replace(/[^0-9|\.]/g,"")) * 1024;//忽略小于500kb的文件
        this.imageType = imageType;//【image/png 压缩率比较低】【image/jpeg 压缩效果十分理想】
        this.quality = quality;//压缩图片的质量

        this.canvas = null;
        this.ctx = null;
        this.creatCanvas();
    }
    creatCanvas() {
        //创建画布
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
    }
    setCanvasWidthHeight(img){
        //设置画布的宽高
        let {mode,num} = this;
        let canvasW,canvasH;
        let ratio = img.width / img.height;
        if(mode === 'pixel'){
            //假如总像素是一百万，图片的 长度*宽度 = 总像素，将图片压缩到一百万像素,临时画布的长*宽等于一百万即可
            //定义压缩图片的高度  canvasW/canvasH = ratio , canvasW * canvasH = num ,Math.sqrt()开平方
            //公式: canvasH = num/canvasW = canvasW/ratio;推出 canvasW * canvasW = num * ratio;
            canvasW = Math.sqrt(num * ratio);//简写公式
            canvasH = canvasW / ratio;//画面的宽高比必须等于被压缩图片的宽高比
            canvasW = Math.floor(canvasW);//向下取整
            canvasH = Math.floor(canvasH); //向下取整
        }else if(pixel === 'width'){
            canvasW = num;
            canvasH = canvasW / ratio;//画面的宽高比必须等于被压缩图片的宽高比
            canvasH = Math.floor(canvasH); //向下取整
        }
        this.canvas.width = canvasW; //设置画布的宽度
		this.canvas.height = canvasH; //设置画布的高度
    }

    async compressor(files){
        //压缩
        if(files.length === 0)return;
        let imgs_arr = await this.createIamgeURL(files);
        let {ctx,canvas,size,imageType,quality} = this;
        let PromiseArr = Array.from(imgs_arr).map(img=>{
            return new Promise((resolve,reject)=>{
                if(img.size > size){
                    //执行压缩
                    this.setCanvasWidthHeight(img);
                    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
                    if(canvas.toBlob === undefined){
                        let base64 = canvas.toDataURL(imageType, quality);//导出base64
                        let binary = window.atob(base64.split(',')[1]);
                        let array = [];
                        for(let i = 0; i < binary.length; i++) {
                            array.push(binary.charCodeAt(i));
                        }
                        let blob = new Blob([new Uint8Array(array)], {type:imageType});
                        resolve(blob);
                    }else{
                        //低版本的苹果不支持canvas.toBlob函数
                        canvas.toBlob((blob)=>{
                            resolve(blob);
                        }, imageType,quality);
                    }
                }else{
                    //不压缩
                    let blob = new Blob([img.file],{type:img.type});
                    resolve(blob);
                }
            });
        });
        return Promise.all(PromiseArr);
    }

    createIamgeURL(files){
        let PromiseArr = Array.from(files).map(file => {
            return new Promise((resolve,reject)=>{
                let img = document.createElement('img');
                img.src = window.URL.createObjectURL(file);//window.URL.createObjectURL(blob);二进制流图片也能显示
                img.file = file;//保存file文件对象
                img.name = file.name;
                img.size = file.size;
                img.type = file.type;
                img.onload = function(){
                    window.URL.revokeObjectURL(this.src);//前面创建URL，现在要释放它，不让它再用据内存和消耗浏览的性能。它与定时器的生成、清除的原理一样。这里不能使用它，因为使用它后图片的src将变成唯一的，只能用一个img元素标签指向这个链接
                    resolve(img);
                }
            });
        });
        return Promise.all(PromiseArr);
    }
    
}
