# egg-utils

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
[![Build Status](https://www.travis-ci.org/deepexi/egg-utils.svg?branch=master)](https://www.travis-ci.org/deepexi/egg-utils)
[![codecov](https://codecov.io/gh/deepexi/egg-utils/branch/master/graph/badge.svg)](https://codecov.io/gh/deepexi/egg-utils)

[npm-image]: https://img.shields.io/npm/v/@taccisum/egg-utils.svg
[npm-url]: https://www.npmjs.com/package/@taccisum/egg-utils
[download-image]: https://img.shields.io/npm/dm/@taccisum/egg-utils.svg
[download-url]: https://www.npmjs.com/package/@taccisum/egg-utils

## 依赖的插件

- circuit-fuses v4.x
- request v2.x

## 开启插件

```js
// config/plugin.js
exports.utils = {
  enable: true,
  package: 'egg-utils',
};
```

## 如何使用

### http utils

简单请求：

```js
const resp = await ctx.helper.http.requestGet('http://www.baidu.com')
```

## License

[MIT](LICENSE)
