# egg-utils

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
[![Build Status](https://www.travis-ci.org/deepexi/egg-utils.svg?branch=master)](https://www.travis-ci.org/deepexi/egg-utils)
[![codecov](https://codecov.io/gh/deepexi/egg-utils/branch/master/graph/badge.svg)](https://codecov.io/gh/deepexi/egg-utils)

[npm-image]: https://img.shields.io/npm/v/@taccisum/egg-utils.svg
[npm-url]: https://www.npmjs.com/package/@taccisum/egg-utils
[download-image]: https://img.shields.io/npm/dm/@taccisum/egg-utils.svg
[download-url]: https://www.npmjs.com/package/@taccisum/egg-utils

[CHANGELOG](./CHANGELOG.md)

## 依赖的插件

- circuit-fuses v4.x
- request v2.x

## 如何使用

添加依赖

```bash
$ npm i @taccisum/egg-utils --save
```

开启插件

```js
// config/plugin.js
exports.utils = {
  enable: true,
  package: 'egg-utils',
};
```

### http utils

简单请求：

```js
const resp = await ctx.helper.http.requestGet('http://www.baidu.com')
```
### sse utils

注意：node长连接默认2分钟会超时，如服务端连接发送事件的间隔需超过2分钟，需服务端自行处理（设置timeout时间 or 在2分钟的间隔内发送无效事件）

#### 使用示例

##### server端
###### 单次发送消息（如状态需实时返回给前端）
```js
/* router */
app.get('logs', `/${APP_CONTEXT}/api/v2/logs`, app.controller.v1.getLog);
/* router */
const SSEUtils = ctx.helper.sse;
/* controller */
async getLog () {
  const ctx = this.ctx;
  ctx.body = SSEUtils.send({
    setResHeader: resHeaders => {
      ctx.set(resHeaders);
    },
    sendType: 'once',
    onceMsg: 'hello world',
  });
}
```
###### 其他情况发送消息（非单次，或者其他任意情况）
```js
/* router */
app.get('logs', `/${APP_CONTEXT}/api/v2/logs`, app.controller.v1.getLog);
/* router */
const SSEUtils = ctx.helper.sse;
/* controller */
async getLog () {
  const ctx = this.ctx;
  const msgs = ['hello' 'world'];
  let interval = null
  ctx.body = SSEUtils.send({
    setResHeader: resHeaders => {
      ctx.writeHead(resHeaders);
    },
    sendType: 'other',
    sender: send => {
      let index = 0;
      interval = setInterval(() => {
        const msg = index === msgs.length ? 'sseEnd' : msgs[index];
        send(msg);

        if (msg === 'sseEnd') {
          // 清除事件
          clearInterval(interval);
        }
        index++;
      }, 1000); //每秒发送一次消息
    },
  })
}
```

#### API
##### Methods

|   方法名   | 说明 | 参数 |
| :--: | :--: | ---- |
| send | 与客户端建立长连接,返回值是 stream对象 | optsions选项<br />options.setResHeader 设置请求头function，required<br />options.sendType once单次 repeat重复 other其他，默认发送一次<br />options.sender 消息发送者，处理什么时候发送消息和结束发送消息，参数send func，结束需要发送'sseEnd'消息，非一次使用<br />options.onceMsg 单次发送消息主体，默认是''<br />options.retry 长连接发送错误时，重试频率，毫秒, 默认10s<br /> options.msgReplace 无法处理消息带换行符的情况，提供替换的正则，默认为''<br /> options.finishCb stream结束时钩子函数 |

### crypto utils

#### 使用示例

##### md5加密
```js
const CryptoUtils = ctx.helper.crypto;
const hashData = CryptoUtils.md5('data', 'salt');
```
##### aes加密
```js
const CryptoUtils = ctx.helper.crypto;
const data = 'data';
const secretKey = 'secretKeyDataKey';   // 秘钥必须16位
const iv = 'secretKeyDataKey';          // 初始向量 initial vector 必须16位
CryptoUtils.aesEncrypt(data, secretKey, iv);
```

##### aes解密
```js
const CryptoUtils = ctx.helper.crypto;
const data = 'data';
const secretKey = 'secretKeyDataKey';   // 加密时的秘钥 必须16位
const iv = 'secretKeyDataKey';          // 加密时的初始向量 initial vector 必须16位
CryptoUtils.aesDecrypt(data, secretKey, iv);
```

##### aes加解密对象
```js
getCipheriv(algorithm, secretKey, iv);
getDecipheriv(algorithm, secretKey, iv);
```

## License

[MIT](LICENSE)
