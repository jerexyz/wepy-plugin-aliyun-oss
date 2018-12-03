import OSS from 'ali-oss';

interface OssOptionsInterface extends OSS.Options {
  cname?: string;
  static?: string;
}

interface ConfigInterface {
  limit?: number;
  refix?: string;
  debugMode?: boolean;
  time?: boolean;
  delDistImg?: boolean;
}

export interface OssUploaderOptions {
  oss: OssOptionsInterface;
  config: ConfigInterface;
}

export default class OssUploader {
  private options: OssUploaderOptions;
  private client: OSS;

  constructor(options: OssUploaderOptions) {
    this.options = options;

    this.options.oss = {
      ...{
        internal: false,
        secure: false,
        timeout: 60000
      },
      ...this.options.oss
    };

    this.options.oss.timeout = this.options.oss.timeout || 60000;

    this.client = new OSS({
      accessKeyId: this.options.oss.accessKeyId,
      accessKeySecret: this.options.oss.accessKeySecret,
      bucket: this.options.oss.bucket,
      // cname: this.options.oss.cname,
      endpoint: this.options.oss.endpoint,
      internal: this.options.oss.internal,
      region: this.options.oss.region,
      secure: this.options.oss.secure,
      timeout: this.options.oss.timeout
    });
  }

  public uploader(remotePath: string, localFile: string) {
    return new Promise((resolve, reject) => {
      try {
        this.client
          .put(remotePath, localFile)
          .then(res => {
            let url = res.url;
            if (this.options.oss.static) {
              url = res.url.replace(/^https:\S+.com/, this.options.oss.static);
            }
            resolve(url);
          })
          .catch(err => {
            reject(err);
          });
      } catch (e) {
        reject(e);
      }
    });
  }
}
