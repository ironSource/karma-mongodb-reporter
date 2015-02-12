var os = require('os');
var path = require('path');
var fs = require('fs');
var mongoose = require ('mongoose');
var db = require('./lib/db');


var MongoReporter = function(baseReporterDecorator, config, logger, helper, formatError) {
  var log = logger.create('reporter.mongo');
  var reporterConfig = config.mongoReporter || {};
  var pkgName = reporterConfig.suite || '';
  mongoose.connect(reporterConfig.mongoUrl);

  var suites;
  var pendingDbWritings = 0;
  var dbWritingFinished = function() {};
  var allMessages = [];

  baseReporterDecorator(this);

  this.adapters = [function(msg) {
    allMessages.push(msg);
  }];

  var initializeTestSuite = function(browser) {
    var timestamp = (new Date()).toISOString().substr(0, 19);
    var suite = suites[browser.id] = {
      name: browser.name, 'package': pkgName, timeStamp: timestamp, id: 0, hostName: os.hostname(), browserFullName:  browser.fullName};
  };

  this.onRunStart = function(browsers) {
    suites = Object.create(null);
  };

  this.onBrowserStart = function(browser) {
    initializeTestSuite(browser);
  };

  this.onBrowserComplete = function(browser) {
    var suite = suites[browser.id];

    if (!suite) {
      // This browser did not signal `onBrowserStart`. That happens
      // if the browser timed out duging the start phase.
      return;
    }

    var result = browser.lastResult;

    suite.tests = result.total;
    suite.errorsNum = (result.disconnected || result.error ? 1 : 0);
    suite.failures = result.failed;
    suite.time = ((result.netTime || 0) / 1000);
    suite.systemOut = (allMessages.join() + '\n');
    suite.systemErr = '';
  };

  this.onRunComplete = function() {
    db.create(suites, function(err) {
        pendingDbWritings++;
        if (err) {
            log.warn('Cannot write to db\n\t' + err.message);
        } else {
            log.debug('results written to db');
        }

        if (!--pendingDbWritings) {
            dbWritingFinished();
        }
    });

    suites = null;
    allMessages.length = 0;
  };

  this.specSuccess = this.specSkipped = this.specFailure = function(browser, result) {
    var spec = {
      name: result.description, time: ((result.time || 0) / 1000),
      className: (pkgName ? pkgName + ' ' : '') + browser.name + '.' + result.suite.join(' ').replace(/\./g, '_')
    };

    if (result.skipped) {
      spec.skipped = true;
    }

    if (!result.success) {
      result.log.forEach(function(err) {
        spec.failures.push({type: '', error: formatError(err)});
      });
    }
    suites[browser].testCases.push(spec);
  };

  // wait for writing all the xml files, before exiting
  this.onExit = function(done) {
    if (pendingDbWritings) {
      dbWritingFinished = done;
    } else {
      done();
    }
  };
};

MongoReporter.$inject = ['baseReporterDecorator', 'config', 'logger', 'helper', 'formatError'];

// PUBLISH DI MODULE
module.exports = {
  'reporter:mongo': ['type', MongoReporter]
};
