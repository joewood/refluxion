"use strict";
var TsTypeInfo = require("ts-type-info");
var gd = TsTypeInfo.getInfoFromFiles(["./test-file.ts"], {
    showDebugMessages: true,
    compilerOptions: {
        "target": "ES5",
        "module": "commonjs",
        "preserveConstEnums": true,
        "experimentalDecorators": true,
        "lib": [
            "es2015",
            "es2016",
            "es2017",
            "es2017.object",
            "es2015.promise"
        ],
        "types": []
    }
});
console.log(gd.files[0].classes[0]);
//# sourceMappingURL=try.js.map