'use strict';

const assert = require('assert');
const SSEUtils = require('../app/extend/utils/sse_utils');

/* eslint-disable no-new */
const EventSource = require('eventsource');
const http = require('http');

let _port = 20000;
const servers = [];
process.on('exit', function() {
  if (servers.length > 0) {
    console.error(
      "************ Didn't kill all servers - there is still %d running.",
      servers.length
    );
  }
});

function createServer(callback) {
  const server = http.createServer();
  configureServer(server, 'http', _port++, callback);
}

function configureServer(server, protocol, port, callback) {
  const responses = [];

  const oldClose = server.close;
  server.close = function(closeCb) {
    responses.forEach(function(res) {
      res.end();
    });
    oldClose.call(this, function() {
      servers.splice(servers.indexOf(server), 1);
      closeCb && closeCb();
    });
  };

  server.on('request', function(req, res) {
    responses.push(res);
  });

  server.url = protocol + '://localhost:' + port;
  server.listen(port, function onOpen(err) {
    servers.push(server);
    callback(err, server);
  });
}

function writeEventsOnce(msg, finishCb) {
  return (req, res) => {
    const stream = SSEUtils.send({
      setResHeader: resHeaders => {
        res.writeHead(200, resHeaders);
      },
      sendType: 'once',
      onceMsg: msg,
      finishCb,
    });

    res.body = stream.pipe(res);
  };
}

function writeEventsArr(msgs) {
  return (req, res) => {
    const stream = SSEUtils.send({
      setResHeader: resHeaders => {
        res.writeHead(200, resHeaders);
      },
      sendType: 'other',
      sender: send => {
        msgs.forEach((msg, index) => {
          send(msg);
          if (index === msgs.length - 1) {
            send('sseEnd');
          }
        });
      },
    });

    res.body = stream.pipe(res);
  };
}
function writeEventsInterval(msgs, times = 1000, finishCb) {
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
      finishCb,
    });

    res.body = stream.pipe(res);
  };
}

describe('send msg', function() {
  it('should right when send msg once', function(done) {
    createServer(function(err, server) {
      if (err) return done(err);

      server.on('request', writeEventsOnce('hello world'));
      const es = new EventSource(server.url);

      es.onmessage = function(m) {
        assert.equal('hello world', m.data);
        server.close(done);
      };
    });
  });

  it('should right when send msg arr', function(done) {
    createServer(function(err, server) {
      if (err) return done(err);
      const msgs = [ 'hello', 'world' ];
      server.on('request', writeEventsArr(msgs));
      const es = new EventSource(server.url);
      let times = 0;
      es.onmessage = function(m) {
        times++;
        // 预计第二条信息获取为world
        if (times === 2) {
          assert.equal('world', m.data);
        }

        if (msgs.length === times) {
          server.close(done);
        }
      };
    });
  });

  it('should right when send msg interval', function(done) {
    createServer(function(err, server) {
      if (err) return done(err);
      const msgs = [ 'hello', 'world' ];
      server.on('request', writeEventsInterval(msgs, 1000));
      const es = new EventSource(server.url);
      let times = 0;
      es.onmessage = function(m) {
        times++;
        // 预计第二条信息获取为world
        if (times === 2) {
          assert.equal('world', m.data);
        }

        if (msgs.length === times) {
          server.close(done);
        }
      };
    });
  });
});

describe('sse finishCb', function() {
  it('should right when send msg once finishCb', function(done) {
    createServer(function(err, server) {
      if (err) return done(err);

      let finishFlag = false;
      server.on('request', writeEventsOnce('hello world', () => {
        finishFlag = true; // stream关闭标签
        assert.equal(true, finishFlag);
        done();
      }));

      const es = new EventSource(server.url);
      es.onmessage = () => {};

      // 主动关闭http request
      setTimeout(() => {
        server.close();
      }, 100);
    });
  });

  it('should right when send msg interval finishCb', function(done) {
    createServer(function(err, server) {
      if (err) return done(err);
      const msgs = [ 'finish01', 'finish02', 'finish03' ];
      let finishFlag = false;
      server.on('request', writeEventsInterval(msgs, 100, () => {
        finishFlag = true;
        assert.equal(true, finishFlag);
        done();
        // assert.equal(true, finishFlag);
      }));

      const es = new EventSource(server.url);
      es.onmessage = () => {};

      // 主动关闭http request
      setTimeout(() => {
        server.close();
      }, 100);
    });
  });
});

describe('sse error', function() {
  it('should error when send msg do not provide setResHeader option', function(done) {
    createServer(function(err, server) {
      if (err) return done(err);

      let errorFlag = false;
      server.on('request', (req, res) => {
        try {
          const stream = SSEUtils.send({
            sendType: 'other',
          });
          res.body = stream.pipe(res);
        } catch (e) {
          console.log('err111111111:', e);
          errorFlag = true;
          assert.equal(true, errorFlag);
          done();
        }
      });
      const es = new EventSource(server.url);
      es.onmessage = () => {};
    });
  });

  it('should error when send other type msg do not provide sender option', function(done) {
    createServer(function(err, server) {
      if (err) return done(err);

      let errorFlag = false;
      server.on('request', (req, res) => {
        try {
          const stream = SSEUtils.send({
            setResHeader: resHeaders => {
              res.writeHead(200, resHeaders);
            },
            sendType: 'other',
          });
          res.body = stream.pipe(res);
        } catch (e) {
          console.log('err222222:', e);
          errorFlag = true;
          assert.equal(true, errorFlag);
          done();
        }
      });
      const es = new EventSource(server.url);
      es.onmessage = () => {};
    });
  });
});

