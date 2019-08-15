/**
 * author:  zhangyongbin
 * createTime:    2019-08-12
 * updateTime:    2019-08-12
 * desc:    DigestUtils
 * version: 1.0.0
 */

'use strict';

const crypto = require('crypto');

class DigestUtils {

  /**
   * md5加密
   * @param {string} data      加密数据
   * @param {string} salt    可选对象，加盐值，salt，默认为''
   * @return {string}    加密后字符串
   */
  static md5(data, salt = '') {
    if (typeof (data) !== 'string') {
      throw new Error('data必须为字符串！');
    }
    if (typeof (salt) !== 'string') {
      throw new Error('salt必须为字符串！');
    }
    const saltData = `${data}${salt}`;
    const hash = crypto.createHash('md5');
    hash.update(saltData);
    return hash.digest('hex');
  }

  /**
   * aes加密
   * @param {string}data          加密的数据
   * @param {string}secretKey     密钥16位
   * @param {string}iv            初始向量 initial vector 16 位
   * @return {string}             加密后字符串
   */
  static aesEncrypt(data, secretKey, iv) {
    if (secretKey.length !== 16 || iv.length !== 16) {
      throw new Error('secretKey和iv长度必须为16');
    }
    const algorithm = 'aes-128-cbc';
    secretKey = Buffer.from(secretKey, 'utf8');
    iv = Buffer.from(iv, 'utf8');
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  }

  /**
   * aes解密
   * @param {string}data          解密的数据
   * @param {string}secretKey     密钥 16 位
   * @param {string}iv            初始向量 initial vector 16 位
   * @return {string}    解密后字符串
   */
  static aesDecrypt(data, secretKey, iv) {
    if (secretKey.length !== 16 || iv.length !== 16) {
      throw new Error('secretKey和iv长度必须为16');
    }
    const algorithm = 'aes-128-cbc';
    secretKey = Buffer.from(secretKey, 'utf8');
    iv = Buffer.from(iv, 'utf8');
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    let decrypted = decipher.update(data, 'hex', 'utf8');
    try {
      decrypted += decipher.final('utf8');
    } catch (e) {
      return null;
    }
    return decrypted;
  }

  /**
   * 获取aes加密对象
   * @param {string}algorithm 算法
   * @param {string}secretKey 秘钥
   * @param {string}iv        初始向量 initial vector
   * @return {Cipher}         对象Cipher
   */
  static getCipheriv(algorithm, secretKey, iv) {
    return crypto.createCipheriv(algorithm, secretKey, iv);
  }

  /**
   * 获取aes解密对象
   * @param {string}algorithm   算法
   * @param {string}secretKey   秘钥
   * @param {string}iv          初始向量 initial vector
   * @return {Decipher}         对象Decipher
   */
  static getDecipheriv(algorithm, secretKey, iv) {
    return crypto.createDecipheriv(algorithm, secretKey, iv);
  }

}

module.exports = DigestUtils;
