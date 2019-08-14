'use strict';

const HttpUtils = require('./utils/http_utils');
const SSEUtils = require('./utils/sse_utils');
const CryptoUtils = require('./utils/crypto_utils');


module.exports = {
  get http() {
    return new HttpUtils(this.ctx.logger);
  },
  sse: SSEUtils,
  crypto: CryptoUtils,
};
