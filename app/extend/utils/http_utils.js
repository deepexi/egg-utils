'use strict';

const request = require('request');
const Breaker = require('circuit-fuses').breaker;

class ResponseError extends Error {
  constructor(msg, res) {
    super(msg);
    this.response = res;
  }
}

class HttpUtils {
  constructor(logger) {
    this.logger = logger;
  }

  _getVerbFn(verb) {
    if (!verb) verb = 'GET';
    const command = request[(verb + '').trim().toLowerCase()];

    if (!command) {
      throw new Error('unsupported verb for http request');
    }
    return command;
  }

  _proxyCommand(command) {
    return new Breaker(command);
  }

  /**
   * request + 熔断器
   * @param {String} verb 动词
   * @param {String} url url
   * @param {Object} options 选项
   * @return {Promise<void>}
   */
  async runCircuitVerb(verb = 'GET', url, options) {
    const command = this._getVerbFn(verb);
    const breaker = this._proxyCommand(command);
    try {
      this.logger.debug(`外部请求url:${url},options:${JSON.stringify(options)}`);
      const res = await breaker.runCommand(url, options);
      if (res.statusCode >= 200 && res.statusCode < 300) return res.body;
      throw new ResponseError('响应错误', res);
    } catch (err) {
      // TODO:: 有关降级的策略 err.message = "CircuitBreaker Open"
      /* If the circuit is open the command is not run,
       * and an error with message "CircuitBreaker Open" is returned.
       * In this case, you can switch on the error and have a fallback technique
       */
      this.logger.warn(`${verb}:${url} ${err.message}`);
      throw err;
    }
  }

  /**
   * 发送http get 请求
   * @param {String} url url
   * @param {Object} qs 查询参数对象
   * @param {Object} options 选项
   * @return {Promise<*>} response
   */
  async requestGet(url, qs, options = { timeout: 30000, json: true }) {
    if (qs) options.qs = qs;
    return await this.runCircuitVerb('GET', url, options);
  }

  /**
     * 发送http post 请求
     * @param {String} url url
     * @param {Object} body request请求体
     * @param {Object} options 选项
     * @return {Promise<*>} response
     */
  async requestPost(url, body, options = { timeout: 150000, json: true }) {
    if (body) options.body = body;
    return await this.runCircuitVerb('POST', url, options);
  }

  /**
   * 发送http put 请求
   * @param {String} url url
   * @param {Object} body request请求体
   * @param {Object} options 选项
   * @return {Promise<*>} response
   */
  async requestPut(url, body, options = { timeout: 30000, json: true }) {
    if (body) options.body = body;
    return await this.runCircuitVerb('PUT', url, options);
  }
  /**
   * 发送http DELETE 请求
   * @param {String} url url
   * @param {Object} options 选项
   * @return {Promise<*>} response
   */
  async requestDelete(url, options = { timeout: 30000, json: true }) {
    return await this.runCircuitVerb('DELETE', url, options);
  }
}

module.exports = HttpUtils;
