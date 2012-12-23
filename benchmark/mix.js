var Oxy = require('../oxygen');
var jsface = require('jsface');
require('./lib/augment');

var Benchmark = require('benchmark').Benchmark;
var suite = new Benchmark.Suite('benchmark');

var Person = function(name) {
    this.name = name;
}

// Oxygen Inherits Define
var OxyInheritsCanSing = Oxy.define({
    sing: function(songName) {
        //
    }
});

var OxyInheritsCanPlayGuitar = Oxy.define({
    playGuitar: function() {
        //
    }
});

var OxyInheritsCoolGuy = Oxy.define({
    extend: Person,
    inherits: [OxyInheritsCanSing, OxyInheritsCanPlayGuitar],
    // make sure different method name
    play: function(songName) {
        this.playGuitar();
        this.sing(songName);
    }
});

// Oxygen Mixins Define
var OxyMixinsCanSing = Oxy.define({
    sing: function(songName) {
        //
    }
});

var OxyMixinsCanPlayGuitar = Oxy.define({
    playGuitar: function() {
        //
    }
});

var OxyMixinsCoolGuy = Oxy.define({
    extend: Person,
    mixins: {
        canSing: OxyMixinsCanSing,
        canPlayGuitar: OxyMixinsCanPlayGuitar
    },
    sing: function() {
        this.playGuitar();
        // this.mixins is a special object holding references to all mixins' prototypes
        this.mixins.canSing.sing.apply(this, arguments);
    }
});

// JSFace Define
var JSFaceCanSing = jsface.Class({
    sing: function(songName) {
        //
    }
});

var JSFaceCanPlayGuitar = jsface.Class({
    playGuitar: function() {
        //
    }
});

var JSFaceCoolGuy = jsface.Class([Person, JSFaceCanSing, JSFaceCanPlayGuitar], {
    // make sure different method name
    play: function(songName) {
        this.playGuitar();
        this.sing(songName);
    }
});

function test_oxygen_inherits() {
    var nicolas = new OxyInheritsCoolGuy("Nicolas");
    nicolas.play("November Rain");
}

function test_oxygen_mixins() {
    var nicolas = new OxyMixinsCoolGuy("Nicolas");
    nicolas.sing("November Rain");
}


function test_jsface() {
    var nicolas = new JSFaceCoolGuy("Nicolas");
    nicolas.play("November Rain");
}

// Run Benchmark
(function () {
    // add tests
    suite
        .add('JSFace', function () {
            test_jsface();
        })
        .add('OxygenJS (mixins)', function () {
            test_oxygen_mixins();
        })
        .add('OxygenJS (inherits)', function () {
            test_oxygen_inherits();
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

