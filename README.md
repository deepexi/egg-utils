# egg-utils

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]
[![Build Status](https://www.travis-ci.org/deepexi/egg-utils.svg?branch=master)](https://www.travis-ci.org/deepexi/egg-utils)
[![codecov](https://codecov.io/gh/deepexi/egg-utils/branch/master/graph/badge.svg)](https://codecov.io/gh/deepexi/egg-utils)

[npm-image]: https://img.shields.io/npm/v/egg-utils.svg
[npm-url]: https://www.npmjs.com/package/egg-utils
[download-image]: https://img.shields.io/npm/dm/egg-utils.svg
[download-url]: https://www.npmjs.com/package/egg-utils

<!--
Description here.
-->

### 依赖的插件

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

## License

[MIT](LICENSE)
