# wepy-plugin-aliyun-oss
>A plugin for wepy is used to upload images to aliyun-oss

## Install

```js
yarn add wepy-plugin-aliyun-oss --dev
```

## Usage

```js
module.exports = {
  ...
  plugins: {
    'aliyun-oss': {
      oss: {
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
        bucket: 'xmpt-sit',
        endpoint: 'https://oss-cn-shenzhen.aliyuncs.com',
        region: 'oss-cn-shenzhen'
      },
      config: { debugMode: false, time: false },
    },
  },
  ...
}
```
