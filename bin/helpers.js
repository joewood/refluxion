"use strict";
var TsTypeInfo = require("ts-type-info");
var fs = require("fs");
var Path = require("path");
/** Convert the name of the class to the schema key name used for normalizr */
function toCamel(typeName) {
    var normVarName = typeName;
    if (normVarName.startsWith("I"))
        normVarName = normVarName.slice(1);
    normVarName = normVarName.charAt(0).toLowerCase() + normVarName.slice(1);
    return normVarName;
}
exports.toCamel = toCamel;
;
function convertMethodName(name) {
    var noGet = name.replace("get", "");
    return noGet.slice(0, 1).toLowerCase() + noGet.slice(1);
}
exports.convertMethodName = convertMethodName;
function appendLine(path, line) {
    fs.appendFileSync(path, line + "\n");
}
exports.appendLine = appendLine;
function getDictReturnType(p) {
    return p.returnTypeExpression.types[0].typeArguments[0].text;
}
exports.getDictReturnType = getDictReturnType;
function removePrefixI(c) {
    var name = "";
    if (c instanceof TsTypeInfo.ClassDefinition) {
        name = c.name;
    }
    else {
        name = c;
    }
    if (name.startsWith("I"))
        return name.slice(1);
    else
        return name;
}
exports.removePrefixI = removePrefixI;
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
                buffer += hasOne(d, p) + "\n";
            }
        }
    }
    return buffer;
}
exports.mapClassMembers = mapClassMembers;
function iterateRoot(modelFile, _root, processMember) {
    var _loop_1 = function(cmemb) {
        var _dec = cmemb.decorators.find(function (d) { return d.name === "queryBy"; });
        if (!_dec)
            return "continue";
        if (!_dec["arguments"] || !_dec["arguments"][0]) {
            console.warn("No Query By Decorator for " + cmemb.name);
            return "continue";
        }
        var _whereClassName = _dec["arguments"][0].text;
        if (!_whereClassName)
            return "continue";
        var _whereClass = modelFile.classes.find(function (c) { return c.name === _whereClassName; });
        if (!_whereClass)
            return "continue";
        var _collectType = cmemb.typeExpression.text;
        if (_collectType.startsWith("Dict"))
            _collectType = _collectType.replace("Dict<", "").replace(">", "");
        var _collectClass = modelFile.classes.find(function (c) { return c.name === _collectType; });
        processMember(cmemb, _collectClass, _whereClass);
    };
    for (var _i = 0, _a = _root.properties; _i < _a.length; _i++) {
        var cmemb = _a[_i];
        var state_1 = _loop_1(cmemb);
        if (state_1 === "continue") continue;
    }
}
exports.iterateRoot = iterateRoot;
function initializeFile(filename) {
    if (fs.existsSync(filename)) {
        fs.truncateSync(filename);
    }
    return Path.resolve(filename);
}
exports.initializeFile = initializeFile;
//# sourceMappingURL=helpers.js.map