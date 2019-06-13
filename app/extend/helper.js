'use strict';

const HttpUtils = require('./utils/http_utils');

module.exports = {
  get http() {
    return new HttpUtils(this.ctx.logger);
  },
};
