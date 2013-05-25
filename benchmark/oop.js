var Benchmark = require('benchmark').Benchmark;
var ovy = require('../ovy');
var jsface = require('jsface');
var util = require('util');

process._dejavu = {
    rc: {
        loose: true
    }
}
var dejavu = require('dejavu');


var suite = new Benchmark.Suite('benchmark');

// util.inherit
var Person = function(name) {
    this.name = name;
}

Person.prototype.setAddress = function(country, city, street) {
    this.country = country;
    this.city = city;
    this.street = street;
}

var ChinaGuy = function(name) {
    Person.call(this, name);
}

util.inherits(ChinaGuy, Person);

ChinaGuy.prototype.setAddress = function(city, street) {
    Person.prototype.setAddress.call(this, "China", city, street);
}

BeijingLover = function(name) {
    ChinaGuy.call(this, name);
}

util.inherits(BeijingLover, ChinaGuy);

BeijingLover.prototype.setAddress = function(street) {
    ChinaGuy.prototype.setAddress.call(this, "Beijing", street);
}

// ovy
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

// ovy closure
var OvyPerson3 = ovy.extend(function() {
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

var OvyChinaGuy3 = ovy.extend(OvyPerson3, function($super) {
    return {
        setAddress:function (city, street) {
            $super.setAddress('China', city, street);
        }
    }
});

var OvyBeijingLover3 = ovy.extend(OvyChinaGuy3, function ($super) {
    return {
        setAddress:function (street) {
            $super.setAddress('Beijing', street);
        }
    }
});

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
        .add('util.inherit', function () {
            var p = new BeijingLover("Mary");
            p.setAddress("CH");
        })
        .add('ovy', function () {
            var p = new OvyBeijingLover("Mary");
            p.setAddress("CH");
        })
        .add('ovy closure', function () {
            var p = new OvyBeijingLover3("Mary");
            p.setAddress("CH");
        })
        .add('JSFace', function () {
            var p = new JSFaceParisLover("Mary");
            p.setAddress("CH");
        })

        .add('dejavu', function() {
            var p = new dejavuClassParisLover("Mary");
            p.setAddress("CH");
        })

//        .add('dejavu optimized', function() {
//            var p36 = new dejavuClassParisLover2("Mary");
//            p36.setAddress("CH");
//        })

        .add('dejavu optimized closures', function() {
            var p = new dejavuClassParisLover3("Mary");
            p.setAddress("CH");
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

