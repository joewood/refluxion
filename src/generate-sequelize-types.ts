import * as TsTypeInfo from "ts-type-info";
import fs = require("fs");
import * as Path from "path";
import { appendLine, getDictReturnType, removePrefixI, toCamel, iterateRoot} from "./helpers";

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


export function getSequelizeTypeofProp(p: TsTypeInfo.BasePropertyDefinition): string {
    if (p.type.text.startsWith("\"")) return "Sequelize.STRING";
    if (p.type.definitions[0] && p.type.definitions[0].isEnumDefinition()) {
        return "Sequelize.INTEGER";
    }
    const decs = (p as TsTypeInfo.ClassPropertyDefinition).decorators;
    if (decs && decs.find(d => d.name === "isIsoDate")) {
        return "\"DATE\"";
    }
    switch (p.type.text) {
        case "boolean":
            return "Sequelize.BOOLEAN";
        case "string":
            return (decs && decs.find(pp => pp.name === "length"))
                ? `Sequelize.STRING({length:${decs.find(pp => pp.name === "length")["arguments"][0].text}})` : "Sequelize.STRING";
        case "number":
            return (decs && decs.find(pp => pp.name === "integer")) ? "Sequelize.INTEGER" : "Sequelize.FLOAT";
        default:
            return "Sequelize." + p.type.text + "";
    }
}
