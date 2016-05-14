call tsc -p .
call node bin/generate-query-classes.js ./src/test/model.ts
call node bin/generate-query-classes.js ../spa/src/service/model.ts
call node bin/test/test.js

