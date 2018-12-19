import fs from 'fs';
import md5File from 'md5-file';
import path from 'path';
import OssUpload, { OssUploaderOptions } from './ossUpload';
interface ApplyOptionInterface {
  code: string;
  file: string;
  next: () => {};
}

interface FileObj {
  path: string;
  bg: string;
  bgName: string;
}

class FileUpload {
  private options: OssUploaderOptions;
  private driver: OssUpload;
  constructor(options: OssUploaderOptions) {
    this.options = options;

    this.options.config = {
      ...{
        debugMode: false,
        delDistImg: true,
        limit: 1024,
        prefix: 'cdn-wxapp',
        time: true
      },
      ...this.options.config
    };

    this.driver = new OssUpload(this.options);
  }
  public apply(op: ApplyOptionInterface): any {
    const { code, file } = op;
    const config = this.options.config;
    const { debugMode } = config;
    if (debugMode) {
      console.log('\nwepy-plugin-image file:', file);
    }

    const reg = /\/assets\/\S+(.png|.jpeg|.svg|.jpg)/gi;
    if (!code) {
      if (debugMode) {
        console.error('code is null');
      }
      op.next();
    } else {
      const bgPaths = code.match(reg) || [];
      if (debugMode) {
        console.log('wepy-plugin-aliyun-oss bgPaths:\n', bgPaths);
      }

      const uploadList: FileObj[] = [];
      // op.next()
      bgPaths.forEach(item => {
        const bgImage = item;
        // 本身是绝对地址
        let bgPath = bgImage;
        let bgName = bgImage;

        if (!fs.existsSync(bgPath)) {
          bgPath = path.join(process.cwd(), bgImage);
        }

        ['.png', '.jpg', 'jpeg'].forEach(ext => {
          if (fs.existsSync(bgPath)) {
            return;
          }
          bgName = bgImage.replace(/.(svg|png|jpg|jpeg)/, ext);
          bgPath = path.join(process.cwd(), bgName);
        });

        if (debugMode) {
          console.log('bgPath:', bgPath);
        }

        if (!fs.existsSync(bgPath) && debugMode) {
          console.error('%s不存在', bgPath);
        }
        if (fs.existsSync(bgPath)) {
          bgName = md5File.sync(bgPath);
          uploadList.push({
            bg: bgImage,
            bgName,
            path: bgPath
          });
        }
      });

      const promiseUploadList: Array<Promise<any>> = [];
      uploadList.forEach(uploadfile => {
        promiseUploadList.push(
          new Promise(resolve => {
            this.driver
              .uploader(uploadfile.bgName.replace(/\//g, '_'), uploadfile.path)
              .then(url => {
                const image = uploadfile.bg;

                console.log(image + ' ----> ' + url, '上传到CDN成功');
                resolve({
                  ...uploadfile,
                  uploadUrl: url
                });
              })
              .catch(e => {
                console.log(e, '上传到CDN失败');
                resolve({});
              });
          })
        );
      });
      // 无图片的时候
      if (!promiseUploadList.length) {
        if (debugMode) {
          console.log('wepy-plugin-image no upload image');
        }
        op.next();
        return;
      }
      Promise.all(promiseUploadList)
        .then(resultList => {
          resultList.forEach(item => {
            const bgUrl = item.bg;
            const uploadUrl = (item.uploadUrl || '').replace(
              'http://',
              'https://'
            );
            op.code = op.code.replace(new RegExp(bgUrl, 'gi'), uploadUrl);
          });
          op.next();
        })
        .catch(e => {
          console.log(e);
        });
    }
  }
}

export default FileUpload;
