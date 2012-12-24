var Oxy = require("../oxygen");

var assert = require("assert");

// Shared object
var Person = Oxy.define({
    name: 'Mr. Unknown',

    constructor: function(name) { /* … */ },

    walk: function(steps) { /* … */ }
});
//

it('define a class', function(){
    var A = Oxy.define('A', {
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

    // OxygenJS Define
    var OxyPerson = Oxy.define({
        constructor: function(name) {
            this.name = name;
        },
        setAddress: function(country, city, street) {
            this.country = country;
            this.city = city;
            this.street = street;
        }
    });

    var OxyChinaGuy = Oxy.define({
        extend: OxyPerson,
        constructor: function(name) {
            OxyChinaGuy.$superclass.call(this, name)
        },
        setAddress: function(city, street) {
            OxyChinaGuy.$super.setAddress.call(this, 'China', city, street);
        }
    });

    var OxyBeijingLover = Oxy.define({
        extend: OxyChinaGuy,
        constructor: function(name) {
            OxyBeijingLover.$superclass.call(this, name);
        },
        setAddress: function(street) {
            OxyBeijingLover.$super.setAddress.call(this, 'Beijing', street);
        }
    });


    var p1 = new OxyPerson("Torry");
    p1.setAddress("CN", "BJ", "XY");
    assert.equal('Torry', p1.name);
    assert.equal('CN', p1.country);
    assert.equal('BJ', p1.city);
    assert.equal('XY', p1.street);

    var p2 = new OxyChinaGuy("Leo");
    p2.setAddress("BJ", "XY");
    assert.equal('Leo', p2.name);
    assert.equal('China', p2.country);
    assert.equal('BJ', p2.city);
    assert.equal('XY', p2.street);

    var p3 = new OxyBeijingLover("Mary");
    p3.setAddress("XY");
    assert.equal('Mary', p3.name);
    assert.equal('China', p3.country);
    assert.equal('Beijing', p3.city);
    assert.equal('XY', p3.street);
});

it('define with statics', function(){
    var A = Oxy.define({
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
    var A = Oxy.define({
        singleton: true,
        f: 1
    });
    assert.equal(1, A.f);
});

it('define with private', function(){
    var Person = Oxy.define((function(){
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

    var result = [];

    var CanSing = Oxy.define({
        sing: function(songName) {
            result.push("I'm singing " + songName);
        }
    });

    var CanPlayGuitar = Oxy.define({
        playGuitar: function() {
            result.push("I'm playing guitar");
            return result;
        }
    });

    var CoolGuy = Oxy.define({
        extend: Person,
        mixins: {
            canSing: CanSing,
            canPlayGuitar: CanPlayGuitar
        },
        sing: function() {
            result.push("Attention!");
            this.playGuitar();
            // this.mixins is a special object holding references to all mixins' prototypes
            this.mixins.canSing.sing.apply(this, arguments);
        }
    });

    var nicolas = new CoolGuy("Nicolas");
    nicolas.sing("November Rain");

    assert.equal(3, result.length);
    assert.equal("Attention!", result[0]);
    assert.equal("I'm playing guitar", result[1]);
    assert.equal("I'm singing November Rain", result[2]);
});

it('define with inherits', function() {

    var result = [];

    var CanSing = Oxy.define({
        sing: function(songName) {
            result.push("I'm singing " + songName);
            return result
        }
    });

    var CanPlayGuitar = Oxy.define({
        playGuitar: function() {
            result.push("I'm playing guitar");
            return result;
        }
    });

    var CoolGuy = Oxy.define({
        extend: Person,
        inherits: {
            canSing: CanSing,
            canPlayGuitar: CanPlayGuitar
        },
        // make sure different method name
        play: function(songName) {
            result.push("Attention!");
            this.playGuitar();
            this.sing(songName);
        }
    });

    var nicolas = new CoolGuy("Nicolas");
    nicolas.play("November Rain");

    assert.equal(3, result.length);
    assert.equal("Attention!", result[0]);
    assert.equal("I'm playing guitar", result[1]);
    assert.equal("I'm singing November Rain", result[2]);
});

it("mixins classes to a plain Class with Oxy.mixin", function(){
    var result = [];

    var CanSing = function(){};
    CanSing.prototype.sing = function(songName) {
        result.push("I'm singing " + songName);
    }


    var CanPlayGuitar = function(){};
    CanPlayGuitar.prototype.playGuitar = function() {
        result.push("I'm playing guitar");
        return result;
    }

    var CoolGuy = function(){};
    Oxy.mixins(CoolGuy, {
        canSing: CanSing,
        canPlayGuitar: CanPlayGuitar
    });
    CoolGuy.prototype.sing = function() {
        result.push("Attention!");
        this.playGuitar();
        // this.mixins is a special object holding references to all mixins' prototypes
        this.mixins.canSing.sing.apply(this, arguments);
    }

    var nicolas = new CoolGuy("Nicolas");
    nicolas.sing("November Rain");

    assert.equal(3, result.length);
    assert.equal("Attention!", result[0]);
    assert.equal("I'm playing guitar", result[1]);
    assert.equal("I'm singing November Rain", result[2]);
});


it("inherits classes to a plain Class with Oxy.inherit", function(){
    var result = [];

    var CanSing = function(){};
    CanSing.prototype.sing = function(songName) {
        result.push("I'm singing " + songName);
    }


    var CanPlayGuitar = function(){};
    CanPlayGuitar.prototype.playGuitar = function() {
        result.push("I'm playing guitar");
        return result;
    }

    var CoolGuy = function(){};
    Oxy.inherits(CoolGuy, [CanSing, CanPlayGuitar]);
    CoolGuy.prototype.play = function(songName) {
        result.push("Attention!");
        this.playGuitar();
        this.sing(songName);
    }

    var nicolas = new CoolGuy("Nicolas");
    nicolas.play("November Rain");

    assert.equal(3, result.length);
    assert.equal("Attention!", result[0]);
    assert.equal("I'm playing guitar", result[1]);
    assert.equal("I'm singing November Rain", result[2]);
});