var Benchmark = require('benchmark').Benchmark;
var suite = new Benchmark.Suite('benchmark');
var date = new Date();

var Person = function() {

}

Person.prototype.$classname = 'Person';
Person.prototype.name = 'Mr. Unknown';

var ignoredKeys = {$classname: 1};

function chain(object, filter) {
    var F = function () {
    };
    if (filter) {
        var p = F.prototype,
            key;
        for(key in object) {
            if (!filter[key]) p[key] = object[key];
        }
    } else {
        F.prototype = object;
    }
    return new F();
}
suite
    .add('no filter', function () {
        chain(Person.prototype);
    })
    .add('with filter', function() {
        chain(Person.prototype, ignoredKeys);
    })
    // add listeners
    .on('cycle', function (event) {
        console.log(String(event.target));
    })
    .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').pluck('name'));
    })
    // run async
    .run({ 'async':true });