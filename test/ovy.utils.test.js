var ovy = require('../ovy'),
    utils = require('../ovy.utils'),
    assert = require('assert');

describe('ovy.utils.DelayedTask', function(){
    it('task delay execution', function(done){
        var t;
        var task = new utils.DelayedTask(function(){
            assert.ok(new Date() - t > 5);
            done();
        });
        t = new Date();
        task.delay(500);
    })
});