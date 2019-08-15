'use strict';

const DigestUtils = require('../app/extend/utils/crypto_utils');
const assert = require('assert');


describe('#crypto_utils.js', () => {

  it('should be return string without salt value', function() {
    const md5 = DigestUtils.md5('data');
    assert.equal(md5.length, 32);
  });

  it('should be return string with salt value', function() {
    const md5 = DigestUtils.md5('data', 'dada');
    assert.equal(md5.length, 32);
  });

  it('should be throw error', function() {
    assert.throws(() => {
      DigestUtils.md5({ data: 'data' }, 'dada');
    });
  });

  it('should be throw error salt is must be string', function() {
    assert.throws(() => {
      DigestUtils.md5('data', { salt: 'salt' });
    });
  });


  // aes加密
  it('aes should be throw error secretKey or iv length must be 16', function() {
    assert.throws(() => {
      DigestUtils.aesEncrypt('data', 'abcd', 'abc');
    });
  });

  it('aes should be return string', function() {
    const aes = DigestUtils.aesEncrypt('data', 'abcdabcdabcdabcd', 'abcdabcdabcdabcd');
    assert.equal(aes.length, 32);
  });

  it('aes should be throw error data type is not suitable', function() {
    assert.throws(() => {
      DigestUtils.aesEncrypt({ data: 'data' }, 'abcdabcdabcdabcd', 'abcdabcdabcdabcd');
    });
  });

  // aes 解密
  it('should be return data', function() {
    const aes = DigestUtils.aesEncrypt('data', 'abcdabcdabcdabcd', 'abcdabcdabcdabcd');
    const result = DigestUtils.aesDecrypt(aes, 'abcdabcdabcdabcd', 'abcdabcdabcdabcd');
    assert.equal(result, 'data');
  });

  it('should be return null is not suitable', function() {
    const aes = DigestUtils.aesEncrypt('data', 'abcdabcdabcdabcd', 'abcdabcdabcdabcd');
    const result = DigestUtils.aesDecrypt(aes, 'abcdabcdabcdabda', 'abcdabcdabcdabcd');
    assert.equal(result, null);
  });

  it('should be throw error dataType is not suitable', function() {
    const aes = DigestUtils.aesEncrypt('data', 'abcdabcdabcdabcd', 'abcdabcdabcdabcd');
    assert.throws(() => {
      DigestUtils.aesDecrypt({ aes }, 'abcdabcdabcdabda', 'abcdabcdabcdabcd');
    });
  });


  it('should be return a cipher', function() {
    const aes = DigestUtils.getCipheriv('aes-128-cbc', 'abcdabcdabcdabcd', 'abcdabcdabcdabcd');
    let result;
    if (typeof aes.update === 'function') {
      result = true;
    }
    assert.equal(result, true);
  });

  it('should be return a decipher', function() {
    const aes = DigestUtils.getDecipheriv('aes-128-cbc', 'abcdabcdabcdabcd', 'abcdabcdabcdabcd');
    let result;
    if (typeof aes.update === 'function') {
      result = true;
    }
    assert.equal(result, true);
  });


});
