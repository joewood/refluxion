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
    var buffer = "";
    for (var _i = 0, _a = c.methods || []; _i < _a.length; _i++) {
        var p = _a[_i];
        if (!p.decorators || p.decorators.length === 0)
            continue;
        for (var _b = 0, _c = p.decorators; _b < _c.length; _b++) {
            var d = _c[_b];
            if (d.name === "hasMany") {
                buffer += hasMany(d, p) + "\n";
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
                buffer += hasOne(d, p) + "\n";
            }
        }
    }
    return buffer;
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
function getNestedClass(collectClass) {
    var buffer = "";
    buffer += "export interface " + collectClass.name + "Nested {\n";
    buffer += mapClassMembers(collectClass, function (d, p) { return ("\t" + convertMethodName(p.name) + "?: " + p.returnTypeExpression.types[0].typeArguments[0].text + "Query;"); }, function (d, p) { return ("\t" + ((d.arguments[2] && d.arguments[2].text) || p.name.replace("_id", "").replace("_code", "")).replace(/\"/g, "") + "?: " + d.arguments[0].text + "Query;"); });
    buffer += "}\n";
    return buffer;
}
function getNormalizrDefine(collectClass) {
    var buffer = "";
    var normVarName = classNameToNormalizr(collectClass.name);
    buffer += normVarName + ".define({\n";
    buffer += mapClassMembers(collectClass, function (d, p) { return ("\t" + convertMethodName(p.name) + " : arrayOf(" + classNameToNormalizr(p.returnTypeExpression.types[0].typeArguments[0].text) + "),"); }, function (d, p) { return ("\t" + ((d.arguments[2] && d.arguments[2].text) || p.name.replace("_id", "").replace("_code", "")).replace(/\"/g, "") + " : " + classNameToNormalizr(d.arguments[0].text) + ","); });
    buffer += "});\n";
    return buffer;
}
function getWhereInterface(collectClass) {
    var buffer = "";
    buffer += "export interface " + collectClass.name + " {\n";
    buffer += collectClass.properties.map(function (p) { return ("\t" + p.name + "? : " + p.typeExpression.text + ";"); }).join('\n') + "\n";
    buffer += "}\n\n";
    return buffer;
}
////////////////////
if (process.argv.length < 3) {
    console.log("Usage: generate-query-classes <filename.ts>");
    process.exit();
}
var inputFilenames = process.argv.slice(2).map(function (arg) { return Path.resolve(process.cwd() + "/" + arg); });
var mainFilename = inputFilenames[inputFilenames.length - 1];
var outputFilename = mainFilename.replace(".ts", ".query.ts");
var justFilename = Path.basename(mainFilename);
var query_file = Path.resolve(process.cwd() + "/src/test/query.ts");
var gd = TsTypeInfo.getInfoFromFiles(inputFilenames);
var modelFile = gd.files.find(function (ff) { return Path.resolve(ff.fileName) === mainFilename; });
var root = modelFile.classes.find(function (i) { return !!i.decorators.find(function (d) { return d.name === "root"; }); });
if (!root) {
    console.error("Cannot find a class with the decorator `root`");
}
console.log("Processing " + mainFilename + " for " + root.name);
var outputPath = outputFilename;
if (fs.existsSync(outputPath)) {
    fs.truncateSync(outputPath);
}
appendLine(outputPath, fs.readFileSync(query_file, "UTF8"));
appendLine(outputPath, "\n\n");
appendLine(outputPath, "import { normalize, Schema, arrayOf, valuesOf } from \"normalizr\";");
appendLine(outputPath, "import * as Model from \"./" + justFilename + "\";");
var _loop_1 = function(p) {
    var dec = p.decorators.find(function (d) { return d.name === "queryBy"; });
    if (!dec)
        return "continue";
    var whereClassName = dec.arguments[0].text;
    if (!whereClassName)
        return "continue";
    var whereClass = modelFile.classes.find(function (c) { return c.name === whereClassName; });
    if (!whereClass)
        return "continue";
    var collectType = p.typeExpression.text;
    if (collectType.startsWith("Dict"))
        collectType = collectType.replace("Dict<", "").replace(">", "");
    console.log("collect:" + collectType);
    var collectClass = modelFile.classes.find(function (c) { return c.name === collectType; });
    if (!collectClass) {
        console.error("Cannot find type of Property " + p.name + ": " + collectType);
    }
    appendLine(outputPath, "export var " + classNameToNormalizr(collectType) + " = new Schema(\"" + p.name + "\");");
};
for (var _i = 0, _a = root.properties; _i < _a.length; _i++) {
    var p = _a[_i];
    var state_1 = _loop_1(p);
    if (state_1 === "continue") continue;
}
var _loop_2 = function(p) {
    var dec = p.decorators.find(function (d) { return d.name === "queryBy"; });
    if (!dec)
        return "continue";
    var whereClassName = dec.arguments[0].text;
    if (!whereClassName)
        return "continue";
    var whereClass = modelFile.classes.find(function (c) { return c.name === whereClassName; });
    if (!whereClass)
        return "continue";
    var collectType = p.typeExpression.text;
    if (collectType.startsWith("Dict"))
        collectType = collectType.replace("Dict<", "").replace(">", "");
    console.log("collect:" + collectType);
    var collectClass = modelFile.classes.find(function (c) { return c.name === collectType; });
    if (!collectClass) {
        console.error("Cannot find type of Property " + p.name + ": " + collectType);
    }
    appendLine(outputPath, getWhereInterface(whereClass));
    appendLine(outputPath, getPrimitives(collectClass));
    appendLine(outputPath, getQueryClass(collectClass, whereClassName));
    appendLine(outputPath, getNestedClass(collectClass));
    appendLine(outputPath, getNormalizrDefine(collectClass));
};
for (var _b = 0, _c = root.properties; _b < _c.length; _b++) {
    var p = _c[_b];
    var state_2 = _loop_2(p);
    if (state_2 === "continue") continue;
}
console.log("Written File " + outputPath);
//# sourceMappingURL=generate-query-classes.js.map