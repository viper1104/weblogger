# Web Logger

![weblogger](https://i.imgur.com/1CDgjKe.png)

[Demo](https://viper1104.github.io/weblogger/examples/index.html)

## Install

    npm install weblogger --save

## Usage

### Init

```js
const WebLogger = require('weblogger');

const LogName = {
	LOG_NAME_1: 'log-name-1',
	LOG_NAME_2: 'log-name-2',
};

const logger = new WebLogger({
    nameSpaces: Object.values(LogName),
    storageKey: 'web-logger',
    disabledColors: false,
});
```

### Show and hide log filter

```js
logger.showLogFilter();
logger.hideLogFilter();
```

### Write logs

```js
logger.debug(LogName.LOG_NAME_1, 'test debug message', [1, 2, 3], 'testStr');
logger.info(LogName.LOG_NAME_1, 'test info message');
logger.warn(LogName.LOG_NAME_2, 'test warn message');
logger.error(LogName.LOG_NAME_2, 'test error message', 1, 2, 3);
```

## License

Log Filter is released under the [MIT License](http://www.opensource.org/licenses/MIT).