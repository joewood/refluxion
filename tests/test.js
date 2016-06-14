"use strict";
var chai_1 = require("chai");
var test_model_1 = require("./test-model");
/** Just a simple - does it compile correctly test */
describe('Decorator test', function () {
    describe('#Instantiate', function () {
        it('Should create a new Model instance', function () {
            var model = new test_model_1.MyModel();
            chai_1.assert.isNotNull(model);
        });
    });
});
//# sourceMappingURL=test.js.map