# wepy-plugin-aliyun-oss

[![Greenkeeper badge](https://badges.greenkeeper.io/jerexyz/wepy-plugin-aliyun-oss.svg)](https://greenkeeper.io/)

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
