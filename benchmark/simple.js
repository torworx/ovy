var Benchmark = require('benchmark').Benchmark;
var ovy = require('../ovy');
var jsface = require('jsface');


var suite = new Benchmark.Suite('benchmark');


function test_ovy() {
    var Person = ovy.define('Person', {
        name: {type: String},
        email: {type: String},
        age: {type: Number},
        sex: {type: String}
    });

}


function test_javascript() {
    var Person = function() {
        this.$classname = 'Person';
    };
    Person.prototype.name = {type: String};
    Person.prototype.email = {type: String};
    Person.prototype.age = {type: Number};
    Person.prototype.sex = {type: String};

}

function test_jsface() {
    var Person = jsface.Class({
        $classname: 'Person',
        name: {type: String},
        email: {type: String},
        age: {type: Number},
        sex: {type: String}
    });
}

// Run Benchmark
(function () {
    // add tests
    suite
        .add('OvyJS', function () {
            test_ovy();
        })
        .add('JSFace', function () {
            test_jsface();
        })
        .add('Javascript', function () {
            test_javascript();
        })
        // add listeners
        .on('cycle', function (event) {
            console.log(String(event.target));
        })
        .on('complete', function () {
            console.log('Fastest is ' + this.filter('fastest').pluck('name'));
        })
        .on('error', function (event) {
            console.error(String(event.target));
        })
        // run async
        .run({ 'async':true });
})();

