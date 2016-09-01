import * as TsTypeInfo from "ts-type-info";
const gd = TsTypeInfo.getInfoFromFiles(["./test-file.ts"], {
    showDebugMessages: true,
    compilerOptions:
    {
        "target": "ES5",
        "module": "commonjs",
        "preserveConstEnums": true,
        "experimentalDecorators": true,
        // "lib": [
        // ],
        "types": [
        ]
    }
} as TsTypeInfo.Options);

console.log(gd.files[0].classes[0].methods[0].name);
console.log(gd.files[0].classes[0].methods[0].returnType.text);
