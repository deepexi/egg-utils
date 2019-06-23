/**
 * author:  qiye
 * createTime:    2019-06-12
 * updateTime:    2019-06-19
 * desc:    sse utils
 * version: 0.0.2
 */

'use strict';

const PassThrough = require('stream').PassThrough;

class SSEUtils {
  /**
   * SSE http协议发送消息
   * @param {Object} options 选项
   * @param {Function} options.setResHeader 设置请求头function，必须
   * @param {String} options.sendType once单次 repeat重复 other其他，默认发送一次
   * @param {String} options.sender 消息发送者，处理什么时候发送消息和结束发送消息，参数sendMsg func
   * @param {String} options.onceMsg 单次发送消息主体，默认是''
   * @param {Number} options.retry 长连接发送错误时，重试频率，毫秒, 默认10s
   * @return {Object} stream 流对象
   */
  static send(options) {
    const {
      setResHeader,
      sendType = 'once',
      sender,
      onceMsg = '',
      retry = 10000,
    } = options;
    if (typeof setResHeader !== 'function') {
      throw new Error('请传入setResHeader！');
    }

    // 设置响应头
    setResHeader.call(this, {
      'Content-Type': 'text/event-stream',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    // 转换流
    const stream = new PassThrough();
    const endCall = () => {
      stream.write('event: sseEnd\n');
      stream.write('data: \n\n'); // 多发一条信息，是sseEnd事件能成功被接收
      // 关闭stream
      stream.end();
    };

    // 消息发送一次
    const sendOnce = (onceMsg = '') => {
      // 声明消息id合重连时间
      stream.write(`id: ${+new Date()}\n`); // 消息ID
      stream.write(`retry: ${retry || 10000}\n`); // 重连时间，默认10s
      // 首次发送消息
      stream.write(`data: ${onceMsg}\n`); // 消息数据
      stream.write('\n\n'); // 消息结束
      endCall.call(this);
    };

    // 其他频率发送消息，msg为sseEnd，则结束发送消息
    const sendMsg = msg => {
      if (msg === 'sseEnd') {
        endCall.call(this);
        return;
      }
      stream.write(`data: ${msg}\n`); // 消息数据
      stream.write('\n\n'); // 消息结束
    };

    switch (sendType) {
      default:
      case 'once':
        sendOnce.call(this, onceMsg);
        break;
      // case 'repeat':
      case 'other':
        // sendType other需要sender
        if (typeof sender !== 'function') {
          throw new Error('请传入func sender，消息发送者！');
        }

        stream.write(`id: ${+new Date()}\n`); // 消息ID
        stream.write(`retry: ${retry || 10000}\n`); // 重连时间，默认10s
        // 发送消息
        sender.call(this, sendMsg);
    }

    return stream;
  }
}

module.exports = SSEUtils;
