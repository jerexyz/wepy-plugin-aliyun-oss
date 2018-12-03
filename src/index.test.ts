import Upload from './index';

test('upload should exist', () => {
  expect(
    new Upload({
      config: {},
      oss: {
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
        bucket: 'xmpt-sit',
        endpoint: 'https://oss-cn-shenzhen.aliyuncs.com',
        region: 'oss-cn-shenzhen'
      }
    })
  ).toBeTruthy();
});
