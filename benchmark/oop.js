var Benchmark = require('benchmark').Benchmark;
var ovy = require('../ovy');
var jsface = require('jsface');

process._dejavu = {
    rc: {
        loose: true
    }
}
var dejavu = require('dejavu');


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
    setAddress: function(city, street) {
        OvyChinaGuy.$super.setAddress.call(this, 'China', city, street);
    }
});

var OvyBeijingLover = ovy.define({
    extend: OvyChinaGuy,
    setAddress: function(street) {
        OvyBeijingLover.$super.setAddress.call(this, 'Beijing', street);
    }
});

var OvyPerson2 = ovy.extend(function() {
    return {
        constructor:function (name) {
            this.name = name;
        },
        setAddress:function (country, city, street) {
            this.country = country;
            this.city = city;
            this.street = street;
        }
    }
});

var OvyChinaGuy2 = ovy.extend(OvyPerson2, function($super) {
    return {
        setAddress:function (city, street) {
            $super.setAddress('China', city, street);
        }
    }
});

var OvyBeijingLover2 = ovy.extend(OvyChinaGuy2, function ($super) {
    return {
        setAddress:function (street) {
            $super.setAddress('Beijing', street);
        }
    }
});

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
//    var BeijingLover = ovy.extend(ChinaGuy, function (ChinaGuy, parent) {
//        return {
//            constructor:function (name) {
//                ChinaGuy.call(this, name);
//            },
//            setAddress:function (street) {
//                parent.setAddress('Beijing', street);
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
//    var p3 = new BeijingLover("Mary");
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
//    var BeijingLover = ovy.extend(ChinaGuy, function (ChinaGuy, parent) {
//        this.setAddress = function (street) {
//            parent.setAddress('Beijing', street);
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
//    var p3 = new BeijingLover("Mary");
//    p3.setAddress("CH");
//}

// JSFace
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


// dejavu
var dejavuClassPerson = dejavu.Class.declare({
    initialize: function(name) {
        this.name = name;
    },
    setAddress: function(country, city, street) {
        this.country = country;
        this.city = city;
        this.street = street;
    }
});

var dejavuClassFrenchGuy = dejavu.Class.declare({
    $extends: dejavuClassPerson,
    setAddress: function(city, street) {
        this.$super('France', city, street);
    }
});

var dejavuClassParisLover = dejavu.Class.declare({
    $extends: dejavuClassFrenchGuy,
    setAddress: function(street) {
        this.$super('Paris', street);
    }
});

// dejavu optimized

var dejavuClassPerson2 = dejavu.Class.declare({
    initialize: function(name){
        this.name = name;
    },
    setAddress: function(country, city, street) {
        this.country = country;
        this.city = city;
        this.street = street;
    }
}, true);

var dejavuClassFrenchGuy2 = dejavu.Class.declare({
    $extends: dejavuClassPerson2,
    initialize: function (name) {
        dejavuClassPerson2.call(this, name);
    },
    setAddress: function(city, street) {
        dejavuClassPerson2.prototype.setAddress.call(this, 'France', city, street);
    }
}, true);

var dejavuClassParisLover2 = dejavu.Class.declare({
    $extends: dejavuClassFrenchGuy2,
    initialize: function (name) {
        dejavuClassFrenchGuy2.call(this, name);
    },
    setAddress: function(street) {
        dejavuClassFrenchGuy2.prototype.setAddress.call(this, 'Paris', street);
    }
}, true);

// dejavu optimized closures
var dejavuClassPerson3 = dejavu.Class.declare(function () {
    return {
        initialize: function(name){
            this.name = name;
        },
        setAddress: function(country, city, street) {
            this.country = country;
            this.city = city;
            this.street = street;
        }
    };
}, true);

var dejavuClassFrenchGuy3 = dejavuClassPerson3.extend(function ($super) {
    return {
        setAddress: function(city, street) {
            $super.setAddress.call(this, 'France', city, street);
        }
    };
}, true);

var dejavuClassParisLover3 = dejavuClassFrenchGuy3.extend(function ($super) {
    return {
        setAddress: function(street) {
            $super.setAddress.call(this, 'Paris', street);
        }
    };
}, true);


// Run Benchmark
(function () {
    // add tests
    suite
        .add('ovy', function () {
            var p3 = new OvyBeijingLover("Mary");
            p3.setAddress("CH");
        })
        .add('ovy closure', function () {
            var p = new OvyBeijingLover2("Mary");
            p.setAddress("CH");
        })
//        .add('OvyJS extend(Augment style)', function() {
//            test_ovy_extend_augment();
//        })
        .add('JSFace', function () {
//            var p1 = new JSFacePerson("John");
//            p1.setAddress("US", "MT", "CH");
//
//            var p2 = new JSFaceFrenchGuy("Leo");
//            p2.setAddress("MT", "CH");

            var p3 = new JSFaceParisLover("Mary");
            p3.setAddress("CH");
        })

        .add('dejavu', function() {
            var p33 = new dejavuClassParisLover("Mary");
            p33.setAddress("CH");
        })

//        .add('dejavu optimized', function() {
//            var p36 = new dejavuClassParisLover2("Mary");
//            p36.setAddress("CH");
//        })

        .add('dejavu optimized closures', function() {
            var p39 = new dejavuClassParisLover3("Mary");
            p39.setAddress("CH");
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

