"use strict";
var TsTypeInfo = require("ts-type-info");
var gd = TsTypeInfo.getInfoFromFiles(["./test-file.ts"], {
    showDebugMessages: true,
    compilerOptions: {
        "target": "ES5",
        "module": "commonjs",
        "preserveConstEnums": true,
        "experimentalDecorators": true,
        // "lib": [
        // ],
        "types": []
    }
});
console.log(gd.files[0].classes[0].methods[0].name);
console.log("Retun Type", gd.files[0].classes[0].methods[1].returnType);
console.log("Retun Type", gd.files[0].classes[0].methods[1].returnType.typeArguments);
//# sourceMappingURL=try.js.map