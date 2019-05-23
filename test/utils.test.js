'use strict';

const assert = require('assert');
const mock = require('egg-mock');

describe('test/utils.test.js', () => {
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
