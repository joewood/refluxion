"use strict";
var TsTypeInfo = require("ts-type-info");
var fs = require("fs");
var Path = require("path");
function convertMethodName(name) {
    var noGet = name.replace("get", "");
    return noGet.slice(0, 1).toLowerCase() + noGet.slice(1);
}
function appendLine(path, line) {
    fs.appendFileSync(path, line + "\n");
}
/** For a specific class, for each many relationship add the specified line through the callback, same for each one-to-one */
function mapClassMembers(c, hasMany, hasOne) {
    for (var _i = 0, _a = c.methods || []; _i < _a.length; _i++) {
        var p = _a[_i];
        if (!p.decorators || p.decorators.length === 0)
            continue;
        for (var _b = 0, _c = p.decorators; _b < _c.length; _b++) {
            var d = _c[_b];
            if (d.name === "hasMany") {
                appendLine(outputPath, hasMany(d, p));
            }
        }
    }
    for (var _d = 0, _e = c.properties || []; _d < _e.length; _d++) {
        var p = _e[_d];
        if (!p.decorators || p.decorators.length === 0)
            continue;
        for (var _f = 0, _g = p.decorators; _f < _g.length; _f++) {
            var d = _g[_f];
            if (d.name === "hasOne") {
                if (d.arguments.length > 2)
                    console.log("Prop " + p.name + " " + hasOne(d, p));
                appendLine(outputPath, hasOne(d, p));
            }
        }
    }
}
/** Convert the name of the class to the schema key name used for normalizr */
function classNameToNormalizr(typeName) {
    var normVarName = typeName;
    if (normVarName.startsWith("I"))
        normVarName = normVarName.slice(1);
    normVarName = normVarName.charAt(0).toLowerCase() + normVarName.slice(1);
    return normVarName;
}
;
function getPrimitives(classDef) {
    var props = [];
    if (classDef.extendsTypeExpressions && classDef.extendsTypeExpressions.length > 0) {
        props = props.concat(classDef.extendsTypeExpressions[0].types[0].definitions[0].properties);
    }
    props = props.concat(classDef.properties);
    var typeDef = "type " + classDef.name + "Primitives = " + props.map(function (prop) { return "\"" + prop.name + "\""; }).join(" | ") + ";";
    var allProps = "const " + classDef.name + "All = [" + props.map(function (prop) { return "\"" + prop.name + "\""; }).join(", ") + "];";
    return typeDef + "\n" + allProps + "\n\n";
}
function getQueryClass(c, whereClass) {
    var buffer = "";
    buffer += "export class " + c.name + "Query extends Query {\n";
    buffer += "\tconstructor( primitives: " + c.name + "Primitives[], nested: " + c.name + "Nested, where: " + whereClass + ", options = {}) {\n            super(primitives,nested as Dict<Query>,where);\n         }\n";
    buffer += "}\n\n";
    return buffer;
}
////////////////////
if (process.argv.length < 3) {
    console.log("Usage: generate-query-classes <filename.ts>");
    process.exit();
}
var file = Path.resolve(process.cwd() + "/" + process.argv[2]);
var outputFile = file.replace(".ts", ".query.ts");
var gd = TsTypeInfo.getInfoFromFiles([file]);
var modelFile = gd.files.find(function (ff) { return Path.resolve(ff.fileName) === file; });
var root = modelFile.classes.find(function (i) { return !!i.decorators.find(function (d) { return d.name === "root"; }); });
if (!root) {
    console.error("Cannot find a class with the decorator `root`");
}
console.log("Processing " + file + " for " + root.name);
var outputPath = outputFile;
if (fs.existsSync(outputPath)) {
    fs.truncateSync(outputPath);
}
appendLine(outputPath, "import { Query } from \"./query\";");
appendLine(outputPath, "import { normalize, Schema, arrayOf, valuesOf } from \"normalizr\";");
var _loop_1 = function(p) {
    var dec = p.decorators.find(function (d) { return d.name === "queryBy"; });
    if (!dec)
        return "continue";
    var whereTypeName = dec.arguments[0].text;
    if (!whereTypeName)
        return "continue";
    var whereInterface = modelFile.interfaces.find(function (c) { return c.name === whereTypeName; });
    if (!whereInterface)
        return "continue";
    var collectType = p.typeExpression.text;
    var collectClass = modelFile.classes.find(function (c) { return c.name === collectType; });
    appendLine(outputPath, "export const " + classNameToNormalizr(p.typeExpression.text) + " = new Schema(\"" + p.name + "\");");
    appendLine(outputPath, getPrimitives(collectClass));
    appendLine(outputPath, getQueryClass(collectClass, whereTypeName));
    appendLine(outputPath, "export interface " + collectClass.name + "Nested {");
    mapClassMembers(collectClass, function (d, p) { return ("\t" + convertMethodName(p.name) + "?: " + p.returnTypeExpression.types[0].typeArguments[0].text + "Query;"); }, function (d, p) { return ("\t" + ((d.arguments[2] && d.arguments[2].text) || p.name.replace("_id", "").replace("_code", "")).replace(/\"/g, "") + "?: " + d.arguments[0].text + "Query;"); });
    appendLine(outputPath, "}\n");
    // find model master
    // for (let i of modelFile.interfaces) {
    //     if (i.name !== "ModelMaster") continue;
    //     appendLine(outputPath, "// Model Master For Normalizr");
    //     appendLine(outputPath, "export const user = new Schema(\"users\");");
    //     appendLine(outputPath, "export const qualification = new Schema(\"qualifications\");");
    //     appendLine(outputPath, "export const contract = new Schema(\"contracts\");");
    //     appendLine(outputPath, "export const assignment = new Schema(\"assignments\");");
    //     appendLine(outputPath, "export const site = new Schema(\"sites\");");
    //     appendLine(outputPath, "export const client = new Schema(\"clients\");");
    //     appendLine(outputPath, "export const agency = new Schema(\"agencies\");");
    //     appendLine(outputPath, "export const vendor = new Schema(\"vendors\");");
    //     appendLine(outputPath, "export const capability = new Schema(\"capabilities\");");
    //     appendLine(outputPath, "export const project = new Schema(\"projects\");");
    //     appendLine(outputPath, "export const job = new Schema(\"jobs\");");
    //     appendLine(outputPath, "export const jobRequirement = new Schema(\"jobRequirements\");");
    //     appendLine(outputPath, "export const availabilityEvent = new Schema(\"availabilityEvents\");");
    //     appendLine(outputPath, "export const userSite = new Schema(\"userSites\");");
    //     appendLine(outputPath, "export const timesheet = new Schema(\"timesheets\");");
    //     appendLine(outputPath, "");
    // break;
    // for (let p of i.properties) {
    //     console.log("MASTER PROP " + p.name);
    //     const types = p.typeExpression.types;
    //     if (!(types[0].definitions)) continue;
    //     if (types[0].definitions.length === 0) continue;
    //     const deff = types[0].definitions[0] as TsTypeInfo.InterfaceDefinition;
    //     if (!deff.isInterfaceDefinition()) continue;
    //     if (!deff.methods || deff.methods.length === 0) continue;
    //     console.log("Deff ", deff);
    //     const ofType = deff.methods[0].returnTypeExpression.text.toLowerCase();
    //     appendLine(outputPath, `const ${ofType} = new Schema("${i.name}")`);
    // }
    // }
    // for (let c of classes) {
    var normVarName = classNameToNormalizr(collectType);
    appendLine(outputPath, normVarName + ".define({");
    mapClassMembers(collectClass, function (d, p) { return ("\t" + convertMethodName(p.name) + " : arrayOf(" + classNameToNormalizr(p.returnTypeExpression.types[0].typeArguments[0].text) + "),"); }, function (d, p) { return ("\t" + ((d.arguments[2] && d.arguments[2].text) || p.name.replace("_id", "").replace("_code", "")).replace(/\"/g, "") + " : " + classNameToNormalizr(d.arguments[0].text) + ","); });
    appendLine(outputPath, "});\n");
};
for (var _i = 0, _a = root.properties; _i < _a.length; _i++) {
    var p = _a[_i];
    var state_1 = _loop_1(p);
    if (state_1 === "continue") continue;
}
console.log("Written File " + outputPath);
//# sourceMappingURL=generate-query-classes.js.map