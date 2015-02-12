# karma-mongodb-reporter

> Reporter for saving test results on MongoDB.

## Installation

The easiest way is to keep `karma-mongodb-reporter` as a devDependency in your `package.json`.
```json
{
  "devDependencies": {
    "karma": "~0.10",
    "karma-mongodb-reporter": "~0.1"
  }
}
```

You can simple do it by:
```bash
npm install karma-mongodb-reporter --save-dev
```

## Configuration
```js
// karma.conf.js
module.exports = function(config) {
  config.set({
    reporters: ['progress', 'mongo'],

    // the default configuration
    mongoReporter: {
      mongoURL: "mongodb://localhost:27017/mydb"
      suite: ''
    }
  });
};
```

You can pass list of reporters as a CLI argument too:
```bash
karma start --reporters junit,dots,mongo
```

----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
