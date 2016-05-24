call tsc -p .
call node bin/generate-query-classes.js typings/global/core-js/index.d.ts ./src/test/test-model.ts
call tsc -p src/test
rem call node bin/generate-query-classes.js ../spa/src/service/model.ts
call node src/test/refluxion/src/test/test.js

