Dee-swaggerize 

## Usage

```js
var swaggerize = require('@sigodenh/dee-swaggerize');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

swaggerize(app, {
    // swagger 对象
    api: require('./fixtures/defs/pets.json'),
    // 处理器函数，是一个对象，其每个属性对应一个接口操作。
    handlers: require('./handlers'),
    // 安全控制函数，是一个对象，其每个属性对应一个安全验证操作。
    security: require('./security'),
    // 处理解析出的 Route 对象
    routeIteratee: function(route) {
        return route;
    }
});
```
