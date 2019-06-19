/**
 * author:  qiye@deepexi.com
 * date:    2019-06-12
 * desc:    sse utils
 * version: 0.0.1
 */

'use strict';

const PassThrough = require('stream').PassThrough;

class SSEUtils {
  /**
   * SSE http协议持续发送事件
   * @param {Function} setResHeader //设置请求头function
   * @param {Function} messageMaker 消息生产者
   * @param {Function} sender 消息生产者，一般与endCb结对
   * @param {Function} endTrigger 消息终止触发者
   * @param {Function} endCb 消息终止回调，一般与sender结对
   * @param {Object} options 选项
   * @param {Number} options.often 消息发送频率，毫秒
   * @param {Number} options.retry 重试频率，毫秒
   * @return {Object} stream 流对象
   */
  static sendContinuous(
    setResHeader,
    messageMaker,
    sender,
    endTrigger,
    endCb,
    options = { often: 3000, retry: 10000 }
  ) {
    if (!typeof setResHeader !== 'function') {
      throw new Error('请传入setResHeader！');
    }

    // 设置相应头
    setResHeader.call(this, {
      'Content-Type': 'text/event-stream',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    if (typeof messageMaker !== 'function') {
      // 无消息制造者
      messageMaker = () => {
        return '';
      };
    }
    // 转换流
    let stream = new PassThrough();
    let interval = null;
    // 监听通讯结束
    stream.on('close', () => {
      if (typeof endCb === 'function') {
        endCb.call(this);
        return;
      }
      clearInterval(interval);
    });

    // 声明消息id合重连时间
    stream.write(`id: ${+new Date()}\n`); // 消息ID
    stream.write(`retry: ${options.retry || 10000}\n`); // 重连时间，默认10s
    // 首次发送消息
    stream.write(`data: ${messageMaker.call(this)}\n`); // 消息数据
    stream.write('\n\n'); // 消息结束

    //重复发数据，频率默认为3s
    if (typeof sender === 'function') {
      sender.call(this);
      // 通讯结束
      if (endTrigger.call(this)) {
        stream.write('event: sseEnd\n');
        stream.write('data:  \n\n'); //多发一条信息，是sseEnd事件能成功被接收

        // 关闭stream
        stream.end();
      }
      return stream;
    }

    interval = setInterval(() => {
      stream.write(`data: ${messageMaker.call(this)}\n`); // 消息数据
      stream.write('\n\n'); // 消息结束

      // 通讯结束
      if (endTrigger.call(this)) {
        stream.write('event: sseEnd\n');
        stream.write('data:  \n\n'); //多发一条信息，是sseEnd事件能成功被接收

        // 关闭stream
        stream.end();
      }
    }, options.often || 3000);

    return stream;
  }
}

module.exports = SSEUtils;
