/**
 * Created by anatd on 12/02/15.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var failureRec = new  Schema({
    type: String,
    error: String
});
var testCaseRec = new Schema({
    name: String,
    time: Number,
    className: String,
    skipped: Boolean,
    failures: [failureRec]
});

var testSuiteRec = new Schema({
    name: String,
    browserFullName: String,
    package: String,
    timeStamp: Date,
    hostName: String,
    testCases: [testCaseRec],
    tests: Number,
    errorsNum: Number,
    failures: Number,
    time: Number,
    systemOut: String,
    systemErr: String
});

var db = mongoose.model('testresults', testSuiteRec);

module.exports= db;

