# egg-utils

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
[![Build Status](https://www.travis-ci.org/deepexi/egg-utils.svg?branch=master)](https://www.travis-ci.org/deepexi/egg-utils)
[![codecov](https://codecov.io/gh/deepexi/egg-utils/branch/master/graph/badge.svg)](https://codecov.io/gh/deepexi/egg-utils)

[npm-image]: https://img.shields.io/npm/v/@taccisum/egg-utils.svg
[npm-url]: https://www.npmjs.com/package/@taccisum/egg-utils
[download-image]: https://img.shields.io/npm/dm/@taccisum/egg-utils.svg
[download-url]: https://www.npmjs.com/package/@taccisum/egg-utils

## 依赖的插件

- circuit-fuses v4.x
- request v2.x

## 开启插件

```js
// config/plugin.js
exports.utils = {
  enable: true,
  package: 'egg-utils',
};
```

## 如何使用

### http utils

简单请求：

```js
const resp = await ctx.helper.http.requestGet('http://www.baidu.com')
```
### sse utils

#### 注意：node长连接默认2分钟会超时，如服务端连接发送事件的间隔需超过2分钟，需服务端自行处理（设置timeout时间 or 在2分钟的间隔内发送无效事件）

#### how to use（示例）

##### server端
###### 单次发送消息（如状态需实时返回给前端）
```js
const SSEUtils = ctx.helper.http.SSEUtils;
# server为服务端，监听请求
server.on('request', writeEventsOnce('hello world'));
function writeEventsOnce(msg) {
  return (req, res) => {
    const stream = SSEUtils.send({
      setResHeader: resHeaders => {
        res.writeHead(200, resHeaders);
      },
      sendType: 'once',
      onceMsg: msg,
    });

    res.body = stream.pipe(res);
  };
}
```
###### 其他情况发送消息（非单次，或者其他任意情况）
```js
const SSEUtils = ctx.helper.http.SSEUtils;
# server为服务端，监听请求
server.on('request', writeEventsInterval('hello world', 1000));
function writeEventsInterval(msgs, times = 1000) {
  let interval = null;
  return (req, res) => {
    const stream = SSEUtils.send({
      setResHeader: resHeaders => {
        res.writeHead(200, resHeaders);
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
        }, times);
      },
    });

    res.body = stream.pipe(res);
  };
}
```

##### 客户端
SSE 的客户端 API 部署在EventSource对象上
```js 
const es = new EventSource(server.url);
es.onmessage = (m) => {
    #your code，m.data为通讯信息
};
#可以接收其他的事件，如接收sseEnd事件，代表通讯结束
es.addEventListener('sseEnd', (event) => {
    #your code 
  }, false);
#客户端可主动结束通讯
es.close()
```
#### API
##### Methods
|   方法明   | 说明 | 参数 |
| :--: | :--: | ---- |
| send | 与客户端建立长连接,返回值是 stream对象 | optsions选项<br />options.setResHeader 设置请求头function，required<br />options.sendType once单次 repeat重复 other其他，默认发送一次<br />options.sender 消息发送者，处理什么时候发送消息和结束发送消息，参数sendMsg func，非一次使用<br />options.onceMsg 单次发送消息主体，默认是''<br />options.retry 长连接发送错误时，重试频率，毫秒, 默认10s |



## License

[MIT](LICENSE)
