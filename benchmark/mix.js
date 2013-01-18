var ovy = require('../ovy');
var jsface = require('jsface');
require('./lib/augment');

var Benchmark = require('benchmark').Benchmark;
var suite = new Benchmark.Suite('benchmark');

var Person = function(name) {
    this.name = name;
};

// ovy Inherits Define
var OvyInheritsCanSing = ovy.define({
    sing: function(songName) {
        //
    }
});

var OvyInheritsCanPlayGuitar = ovy.define({
    playGuitar: function() {
        //
    }
});

var OvyInheritsCoolGuy = ovy.define({
    extend: Person,
    inherits: [OvyInheritsCanSing, OvyInheritsCanPlayGuitar],
    // make sure different method name
    play: function(songName) {
        this.playGuitar();
        this.sing(songName);
    }
});

// ovy Mixins Define
var OvyMixinsCanSing = ovy.define({
    sing: function(songName) {
        //
    }
});

var OvyMixinsCanPlayGuitar = ovy.define({
    playGuitar: function() {
        //
    }
});

var OvyMixinsCoolGuy = ovy.define({
    extend: Person,
    mixins: {
        canSing: OvyMixinsCanSing,
        canPlayGuitar: OvyMixinsCanPlayGuitar
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

function test_ovy_inherits() {
    var nicolas = new OvyInheritsCoolGuy("Nicolas");
    nicolas.play("November Rain");
}

function test_ovy_mixins() {
    var nicolas = new OvyMixinsCoolGuy("Nicolas");
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
        .add('OvyJS (mixins)', function () {
            test_ovy_mixins();
        })
        .add('OvyJS (inherits)', function () {
            test_ovy_inherits();
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

