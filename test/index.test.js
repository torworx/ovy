var ovy = require('../index'),
    assert = require('assert');

it('ovy and plugins should exists', function() {
    assert.ok(ovy);
    assert.ok(ovy.arrays);
    assert.ok(ovy.functions);
    assert.ok(ovy.utils);
})