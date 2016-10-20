"use strict";
var helpers_1 = require("./helpers");
// export function generateTypesForClass(collectClass: TsTypeInfo.ClassDefinition, suffix: string, makeArrays: boolean): string {
//     let buffer = "";
//     const name = (collectClass.name.startsWith("I") ? collectClass.name : ("I" + collectClass.name)).replace("MasterClass", "") + suffix;
//     buffer += `\n// created from class ` + collectClass.name + "\n";
//     buffer += `\nexport interface ${name} {\n`;
//     buffer += collectClass.properties.map(p => {
//         let typeName = p.type.text;
//         let tt = p.type;
//         // if (typeName === "boolean" || typeName === "string") continue;
//         if (tt.typeArguments.length === 0) {
//             typeName = "Model." + typeName;
//         } else {
//             for (let ta of tt.typeArguments) {
//                 typeName = makeArrays ? ("Model." + ta.text + "[]") : typeName.replace(ta.text, "Model." + ta.text);
//                 break;
//             }
//         }
//         return `\t${p.name}: ${typeName};`;
//     }).join("\n");
//     buffer += "\n}\n";
//     return buffer;
// }
function getSequelizeTypeofProp(modelFile, modelRoot, entity, p) {
    var prop = new helpers_1.EntityField(modelFile, modelRoot, entity, p);
    if (p.type.text.startsWith("\"")) {
        return "Sequelize.STRING";
    }
    if (prop.isEnum()) {
        return "Sequelize.INTEGER";
    }
    if (prop.isUnionType()) {
        return "Sequelize.STRING";
    }
    var decs = p.decorators;
    if (decs && decs.find(function (d) { return d.name === "isIsoDate"; })) {
        return "\"DATE\"";
    }
    switch (p.type.text) {
        case "boolean":
            return "Sequelize.BOOLEAN";
        case "string":
            return (decs && decs.find(function (pp) { return pp.name === "length"; }))
                ? "Sequelize.STRING({length:" + decs.find(function (pp) { return pp.name === "length"; })["arguments"][0].text + "})" : "Sequelize.STRING";
        case "number":
            return (decs && decs.find(function (pp) { return pp.name === "integer"; })) ? "Sequelize.INTEGER" : "Sequelize.FLOAT";
        default:
            return "Sequelize." + p.type.text + "";
    }
}
exports.getSequelizeTypeofProp = getSequelizeTypeofProp;
//# sourceMappingURL=generate-sequelize-types.js.map