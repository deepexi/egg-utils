'use strict';

const assert = require('assert');
const mock = require('egg-mock');
const HttpUtils = require('../app/extend/utils/http_utils');

describe('test/utils.test.js', () => {
  describe('integrate with eggjs', () => {
    let app;
    before(() => {
      app = mock.app({
        baseDir: 'apps/utils-test',
      });
      return app.ready();
    });

    after(() => app.close());
    afterEach(mock.restore);

    it('should load utils /', () => {
      const ctx = app.mockContext();
      assert(ctx.helper.http, 'http utils should not be undefined!');
    });

    it('should get /', async () => {
      const ctx = app.mockContext();
      const r = await ctx.helper.http.requestGet('http://www.baidu.com');
      assert(r, 'response should not be empty');
    });
  });

  describe('HttpUtils', () => {
    describe('runCircuitVerb()', () => {
      const clog = msg => {
        console.log(msg);
      };

      const getUtils = () => {
        return new HttpUtils({
          debug: clog,
          info: clog,
          warn: clog,
          error: clog,
        });
      };

      describe('_getVerbFn()', () => {
        let utils;

        before(() => {
          utils = getUtils();
        });

        it('should get on default', () => {
          assert(utils._getVerbFn() === require('request').get);
        });

        it('should right when verb incollected', () => {
          assert(utils._getVerbFn('gEt') === require('request').get);
        });

        it('should right by verb', () => {
          assert(utils._getVerbFn('get') === require('request').get);
          assert(utils._getVerbFn('post') === require('request').post);
          assert(utils._getVerbFn('put') === require('request').put);
          assert(utils._getVerbFn('delete') === require('request').delete);
        });

        it('should error when unsupport verb', () => {
          try {
            utils._getVerbFn('unknown_verb');
            assert.fail();
          } catch (e) {
            // assert pass if catch error
          }
        });
      });
    });
  });
});
