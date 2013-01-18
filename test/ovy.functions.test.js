var ovy = require('../ovy'),
    functions = require('../ovy.functions'),
    assert = require('assert');

describe('ovy.functions', function(){

    it('#createAlias', function() {
        var MyCoolClass = ovy.define('MyCoolClass', {
            m1: function() {
                return 'm1';
            },
            m2: function() {
                return 'm2';
            }
        });

        var test = new MyCoolClass();

        functions.createAlias(MyCoolClass, {
            m3: 'm1',
            m4: 'm2'
        });

        assert.equal('m1', test.m3());
        assert.equal('m2', test.m4());

        functions.createAlias(MyCoolClass, {
            m5: 'm3',
            m6: 'm4'
        });

        assert.equal('m1', test.m5());
        assert.equal('m2', test.m6());
    });

})