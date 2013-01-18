var Benchmark = require('benchmark').Benchmark;
var ovy = require('../ovy');
var jsface = require('jsface');


var suite = new Benchmark.Suite('benchmark');

// OvyJS Define
var OvyPerson = ovy.define({
    constructor: function(name) {
        this.name = name;
    },
    setAddress: function(country, city, street) {
        this.country = country;
        this.city = city;
        this.street = street;
    }
});

var OvyChinaGuy = ovy.define({
    extend: OvyPerson,
    constructor: function(name) {
        OvyChinaGuy.$superclass.call(this, name)
    },
    setAddress: function(city, street) {
        OvyChinaGuy.$super.setAddress.call(this, 'China', city, street);
    }
});

var OvyBeijingLover = ovy.define({
    extend: OvyChinaGuy,
    constructor: function(name) {
        OvyBeijingLover.$superclass.call(this, name);
    },
    setAddress: function(street) {
        OvyBeijingLover.$super.setAddress.call(this, 'Beijing', street);
    }
});

//
//
//function test_ovy_extend() {
//    var Person = ovy.extend(function() {
//        return {
//            constructor:function (name) {
//                this.name = name;
//            },
//            setAddress:function (country, city, street) {
//                this.country = country;
//                this.city = city;
//                this.street = street;
//            }
//        }
//    });
//
//    var ChinaGuy = ovy.extend(Person, function(Person, parent) {
//        return {
//            constructor:function () {
//                Person.call(this)
//            },
//            setAddress:function (city, street) {
//                parent.setAddress('China', city, street);
//            }
//        }
//    });
//
//    var BeiJingLover = ovy.extend(ChinaGuy, function (ChinaGuy, parent) {
//        return {
//            constructor:function (name) {
//                ChinaGuy.call(this, name);
//            },
//            setAddress:function (street) {
//                parent.setAddress('BeiJing', street);
//            }
//        }
//    });
//
//    var p1 = new Person("John");
//    p1.setAddress("US", "MT", "CH");
//
//    var p2 = new ChinaGuy("Leo");
//    p2.setAddress("MT", "CH");
//
//    var p3 = new BeiJingLover("Mary");
//    p3.setAddress("CH");
//}

//
//function test_ovy_extend_augment() {
//    var Person = ovy.extend(Object, function () {
//
//        this.setAddress = function (country, city, street) {
//            this.country = country;
//            this.city = city;
//            this.street = street;
//        }
//
//        return Person;
//
//        function Person(name) {
//            this.name = name;
//        }
//    });
//
//    var ChinaGuy = ovy.extend(Person, function (Person, parent) {
//
//        this.setAddress = function (city, street) {
//            parent.setAddress('China', city, street);
//        }
//
//        return ChinaGuy;
//
//        function ChinaGuy() {
//            Person.call(this)
//        }
//    });
//
//    var BeiJingLover = ovy.extend(ChinaGuy, function (ChinaGuy, parent) {
//        this.setAddress = function (street) {
//            parent.setAddress('BeiJing', street);
//        }
//        return BeijingLover;
//
//        function BeijingLover(name) {
//            ChinaGuy.call(this, name);
//        }
//    });
//
//    var p1 = new Person("John");
//    p1.setAddress("US", "MT", "CH");
//
//    var p2 = new ChinaGuy("Leo");
//    p2.setAddress("MT", "CH");
//
//    var p3 = new BeiJingLover("Mary");
//    p3.setAddress("CH");
//}
var JSFacePerson = jsface.Class({
    constructor:function (name) {
        this.name = name;
    },
    setAddress:function (country, city, street) {
        this.country = country;
        this.city = city;
        this.street = street;
    }
});

var JSFaceFrenchGuy = jsface.Class(JSFacePerson, {
    constructor:function (name) {
        JSFaceFrenchGuy.$super.call(this, name);
    },
    setAddress:function (city, street) {
        JSFaceFrenchGuy.$superp.setAddress.call(this, 'France', city, street);
    }
});

var JSFaceParisLover = jsface.Class(JSFaceFrenchGuy, {
    constructor:function (name) {
        JSFaceParisLover.$super.call(this, name);
    },
    setAddress:function (street) {
        JSFaceParisLover.$superp.setAddress.call(this, 'Paris', street);
    }
});

// Run Benchmark
(function () {
    // add tests
    suite
        .add('OvyJS', function () {
            var p1 = new OvyPerson("John");
            p1.setAddress("US", "MT", "CH");

            var p2 = new OvyChinaGuy("Leo");
            p2.setAddress("MT", "CH");

            var p3 = new OvyBeijingLover("Mary");
            p3.setAddress("CH");
        })
//        .add('OvyJS extend', function () {
//            test_ovy_extend();
//        })
//        .add('OvyJS extend(Augment style)', function() {
//            test_ovy_extend_augment();
//        })
        .add('JSFace', function () {
            var p1 = new JSFacePerson("John");
            p1.setAddress("US", "MT", "CH");

            var p2 = new JSFaceFrenchGuy("Leo");
            p2.setAddress("MT", "CH");

            var p3 = new JSFaceParisLover("Mary");
            p3.setAddress("CH");
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

