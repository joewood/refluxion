import { assert } from "chai";

import {MyModel} from "./test-model";

/** Just a simple - does it compile correctly test */

describe('Decorator test', function () {
  describe('#Instantiate', function () {
    it('Should create a new Model instance', function () {
      const model = new MyModel();
      assert.isNotNull(model);
    });
  });
});