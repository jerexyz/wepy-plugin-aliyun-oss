import fs from 'fs';
import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import md5File from 'md5-file';
import path from 'path';
import OssUpload, { OssUploaderOptions } from './ossUpload';

const dbFile = path.join(process.cwd(), 'assets/file.json');

const adapter = new FileSync(dbFile);
const db = lowdb(adapter);

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

    const reg = /\/assets\/[a-zA-Z-_\u4e00-\u9fa5/0-9@#!~]+(.png|.jpeg|.svg|.jpg|.mp3)/gi;
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
      uploadList.forEach(uploadFile => {
        promiseUploadList.push(
          new Promise(resolve => {
            const fileKey = `${this.options.oss.endpoint}.${uploadFile.bgName}`;
            const existFileUrl = db.get(fileKey).value();
            if (existFileUrl) {
              resolve({ ...uploadFile, uploadUrl: existFileUrl });
              return;
            }
            this.driver
              .uploader(uploadFile.bgName.replace(/\//g, '_'), uploadFile.path)
              .then(url => {
                const image = uploadFile.bg;

                console.log(image + ' ----> ' + url, '上传到CDN成功');
                db.set(fileKey, url).write();
                resolve({
                  ...uploadFile,
                  uploadUrl: url
                });
              })
              .catch(e => {
                console.log('\u001b[31m' + e + '\u001b[39m', '上传到CDN失败');
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
