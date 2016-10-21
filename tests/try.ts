import * as TsTypeInfo from "ts-type-info";
const gd = TsTypeInfo.getInfoFromFiles(["../src/test/test-model.ts"], {
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
console.log(gd.files[0].typeAliases);
console.log("Retun Type",gd.files[0].classes[0].methods[2].returnType);
console.log("Retun Type",gd.files[0].classes[0].methods[2].returnType.typeArguments);
