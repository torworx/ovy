var ovy = require("../ovy");

var assert = require("assert");

// Shared object
var Person = ovy.define({
    name: 'Mr. Unknown',

    constructor: function(name) { /* … */ },

    walk: function(steps) { /* … */ }
});
//

it('define a class', function(){
    var A = ovy.define('A', {
        f: 1,
        constructor: function () {
            this.f2 = 2;
        },
        m: function (p) {
            return p;
        }
    });

    var a = new A();
    assert.equal('A', a.$classname);
    assert.equal(a.f, 1);
    assert.equal(a.f2, 2);
    assert.equal(a.m("s"), "s");
});

it('define with extend', function(){

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


    var p1 = new OvyPerson("Torry");
    p1.setAddress("CN", "BJ", "XY");
    assert.equal('Torry', p1.name);
    assert.equal('CN', p1.country);
    assert.equal('BJ', p1.city);
    assert.equal('XY', p1.street);

    var p2 = new OvyChinaGuy("Leo");
    p2.setAddress("BJ", "XY");
    assert.equal('Leo', p2.name);
    assert.equal('China', p2.country);
    assert.equal('BJ', p2.city);
    assert.equal('XY', p2.street);

    var p3 = new OvyBeijingLover("Mary");
    p3.setAddress("XY");
    assert.equal('Mary', p3.name);
    assert.equal('China', p3.country);
    assert.equal('Beijing', p3.city);
    assert.equal('XY', p3.street);

    var instanceofTest = p3 instanceof OvyBeijingLover &&
        p3 instanceof OvyChinaGuy &&
        p3 instanceof OvyPerson;
    assert.ok(instanceofTest, 'failed the `instanceof` test.');
});

it('define with statics', function(){
    var A = ovy.define({
       statics: {
           f: 1,
           echo: function(msg) {
               return msg;
           }
       }
    });
    assert.equal(1, A.f);
    assert.equal('Hello World', A.echo('Hello World'));
});

it('define as singleton', function(){
    var A = ovy.define({
        singleton: true,
        f: 1
    });
    assert.equal(1, A.f);
});

it('define with private', function(){
    var Person = ovy.define((function(){
        var MIN_AGE =   1,                             // private variables
            MAX_AGE = 150;

        function isValidAge(age) {                     // private method
            return age >= MIN_AGE && age <= MAX_AGE;
        }

        return {
            constructor: function(name, age) {
                if ( !isValidAge(age)) {
                    throw "Invalid parameter";
                }

                this.name = name;
                this.age  = age;
            }
        };
    })());
});

it('define with mixins', function(){
    var Options = ovy.define({
        setOptions: function(opts) {
            this.opts = opts;
        }
    });

    var Events = ovy.define({
        bind: function(event, fn) {
            return true;
        },
        unbind: function(event, fn) {
            return false;
        }
    });

    var Foo = ovy.define({
        constructor: function(name) {
            this.name = name;
        }
    });

    var Bar = ovy.define({
        extend: Foo,
        mixins: {
            options: Options,
            events: Events
        },
        setOptions: function(opts) {
            this.config = opts;
            this.mixins.options.setOptions.call(this, opts);
        }
    });


    var bar = new Bar("Bar");
    bar.setOptions("nothing");

    assert.equal(bar.name, "Bar", "Invalid extend behavior, constructor must be bound correctly");
    assert.equal(bar.opts, "nothing", "Invalid mixins behavior, constructor must be bound correctly");
    assert.equal(bar.config, "nothing", "Invalid mixins behavior, constructor must be bound correctly");
    assert.ok(bar.bind(), "Invalid mixins behavior");
    assert.equal( !bar.unbind(), true, "Invalid mixins behavior");
});

it('define with inherits', function() {
    var Options = ovy.define({
        setOptions: function(opts) {
            this.opts = opts;
        }
    });

    var Events = ovy.define({
        bind: function(event, fn) {
            return true;
        },
        unbind: function(event, fn) {
            return false;
        }
    });

    var Foo = ovy.define({
        constructor: function(name) {
            this.name = name;
        }
    });

    var Bar = ovy.define({
        extend: Foo,
        inherits: [Options, Events]
    });


    var bar = new Bar("Bar");
    bar.setOptions("nothing");

    assert.equal(bar.name, "Bar", "Invalid extend behavior, constructor must be bound correctly");
    assert.equal(bar.opts, "nothing", "Invalid mixins behavior, constructor must be bound correctly");
    assert.ok(bar.bind(), "Invalid mixins behavior");
    assert.equal( !bar.unbind(), true, "Invalid mixins behavior");
});

it("mixins classes to a plain Class with ovy.mixin", function(){
    var Options = ovy.define({
        setOptions: function(opts) {
            this.opts = opts;
        }
    });

    var Events = ovy.define({
        bind: function(event, fn) {
            return true;
        },
        unbind: function(event, fn) {
            return false;
        }
    });

    var Foo = ovy.define({
        constructor: function(name) {
            this.name = name;
        }
    });

    var Bar = ovy.define({
        extend: Foo,
        setOptions: function(opts) {
            this.config = opts;
            this.mixins.options.setOptions.call(this, opts);
        }
    });

    ovy.mixins(Bar, {
        options: Options,
        events: Events
    });

    var bar = new Bar("Bar");
    bar.setOptions("nothing");

    assert.equal(bar.name, "Bar", "Invalid extend behavior, constructor must be bound correctly");
    assert.equal(bar.opts, "nothing", "Invalid mixins behavior, constructor must be bound correctly");
    assert.equal(bar.config, "nothing", "Invalid mixins behavior, constructor must be bound correctly");
    assert.ok(bar.bind(), "Invalid mixins behavior");
    assert.equal( !bar.unbind(), true, "Invalid mixins behavior");
});


it("inherits classes to a plain Class with ovy.inherit", function(){
    var Options = ovy.define({
        setOptions: function(opts) {
            this.opts = opts;
        }
    });

    var Events = ovy.define({
        bind: function(event, fn) {
            return true;
        },
        unbind: function(event, fn) {
            return false;
        }
    });

    var Foo = ovy.define({
        constructor: function(name) {
            this.name = name;
        }
    });

    var Bar = ovy.define({
        extend: Foo
    });

    ovy.inherits(Bar, [Options, Events]);

    var bar = new Bar("Bar");
    bar.setOptions("nothing");

    assert.equal(bar.name, "Bar", "Invalid extend behavior, constructor must be bound correctly");
    assert.equal(bar.opts, "nothing", "Invalid mixins behavior, constructor must be bound correctly");
    assert.ok(bar.bind(), "Invalid mixins behavior");
    assert.equal( !bar.unbind(), true, "Invalid mixins behavior");
});

it("object property", function(){
    var Person = ovy.define({
        addresses: null,
        constructor: function() {
            this.addresses = {};
        }
    });
    var p1 = new Person();
    p1.addresses['home'] = 'home'
    assert.ok(p1.addresses['home']);
    var p2 = new Person();
    p2.addresses['company'] = 'company'
    assert.notEqual(p2.addresses, p1.addresses);
    assert.ok(!p2.addresses['home']);
    assert.ok(p2.addresses['company']);
});

it("define extend from plain function", function() {
    function Person(name) {
        this.name = name;
    }

    var BeijingPerson = ovy.define({
        extend: Person,
        constructor: function() {
            BeijingPerson.$superclass.call(this, 'Beijing');
        }
    });

    assert.equal((new BeijingPerson).name, 'Beijing');
});

it("define subclass without constructor", function() {
    function Person(name) {
        this.name = name;
    }

    var BeijingPerson = ovy.define({
        extend: Person,
        setName: function(name) {
            this.name = name;
        }
    });

    assert.equal((new BeijingPerson('Beijing')).name, 'Beijing');
});

it("ovy closure", function() {

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

    var p = new OvyBeijingLover2("Mary");
    p.setAddress("CH");

    assert.equal(p.name, "Mary");
    assert.equal(p.country, "China");
    assert.equal(p.city, "Beijing");
    assert.equal(p.street, "CH");
});