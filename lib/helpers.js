"use strict";
var TsTypeInfo = require("ts-type-info");
var fs = require("fs");
var Path = require("path");
function camelToUnderscore(str) {
    return splitCamel(str).join("_").toLowerCase();
}
exports.camelToUnderscore = camelToUnderscore;
function splitCamel(str) {
    var target = [];
    var index = 0;
    for (var n = 0; n < str.length; n++) {
        if (n == 0 || (str[n] >= "a" && str[n] <= "z"))
            continue;
        target.push(str.substr(index, n));
        index = n;
    }
    if (index < str.length)
        target.push(str.substr(index));
    return target;
}
exports.splitCamel = splitCamel;
function lowerFirstChar(str) {
    return str.slice(0, 1).toLowerCase() + str.slice(1);
}
exports.lowerFirstChar = lowerFirstChar;
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
var Table = (function () {
    function Table(modelFile, root, tableProperty) {
        this.modelFile = modelFile;
        this.root = root;
        this.tableProperty = tableProperty;
        this.isTable = !!tableProperty.decorators.find(function (d) { return d.name === "queryBy"; });
    }
    Table.prototype.getTableName = function () {
        var tableNameDec = this.tableProperty.decorators.find(function (d) { return d.name === "useTable"; });
        var tableName = this.tableProperty.name;
        if (!!tableNameDec) {
            var args = tableNameDec.arguments;
            if (!args || args.length === 0) {
                throw "useTable with no name " + tableName;
            }
            tableName = tableNameDec["arguments"][0].text;
            if (tableName.length > 1)
                tableName = tableName.slice(1, -1);
        }
        else {
            if (tableName.slice(-1) === "s")
                tableName = tableName.slice(0, -1);
            tableName = camelToUnderscore(tableName);
        }
        return tableName;
    };
    Table.prototype.getTableType = function () {
        if (!this.isTable)
            throw Error("getTableType called on a non-table: " + this.tableProperty.name);
        var tableTypeName = this.tableProperty.type.text;
        if (tableTypeName.startsWith("Dict"))
            tableTypeName = tableTypeName.replace("Dict<", "").replace(">", "");
        var tableType = this.modelFile.classes.find(function (c) { return c.name === tableTypeName; });
        if (!tableType) {
            console.warn("Cannot find Class for Type Name: " + tableTypeName, this.tableProperty);
        }
        return tableType;
    };
    Table.prototype.getTableInterfaceTypeName = function () {
        return "I" + removePrefixI(this.getTableType().name);
    };
    Table.prototype.getWhereClass = function () {
        var queryByDec = this.tableProperty.decorators.find(function (d) { return d.name === "queryBy"; });
        var whereClassName = queryByDec && queryByDec["arguments"] && queryByDec["arguments"][0] && queryByDec["arguments"][0].text;
        if (!whereClassName) {
            console.warn("No Query By Decorator for " + this.tableProperty.name);
            return null;
        }
        var whereClass = this.modelFile.classes.find(function (c) { return c.name === whereClassName; });
        if (!whereClass)
            console.warn("Cannot Find Query Class :" + whereClassName);
        return whereClass;
    };
    /** For a specific class, for each many relationship add the specified line through the callback, same for each one-to-one */
    Table.prototype.mapEntityRelationships = function (hasMany, hasOne) {
        var buffer = "";
        var tableType = this.getTableType();
        for (var _i = 0, _a = tableType.methods || []; _i < _a.length; _i++) {
            var p = _a[_i];
            if (!p.decorators || p.decorators.length === 0)
                continue;
            if (!p.decorators.find(function (d) { return d.name === "hasMany"; }))
                continue;
            buffer += hasMany(new HasMany(this.modelFile, this.root, tableType, p)) + "\n";
        }
        for (var _b = 0, _c = tableType.properties || []; _b < _c.length; _b++) {
            var p = _c[_b];
            if (!p.decorators || p.decorators.length === 0)
                continue;
            if (!p.decorators.find(function (d) { return d.name === "hasOne"; }))
                continue;
            buffer += hasOne(new HasOne(this.modelFile, this.root, tableType, p)) + "\n";
        }
        return buffer;
    };
    Table.prototype.mapEntityFields = function (fieldIteration) {
        var buffer = "";
        var tableType = this.getTableType();
        for (var _i = 0, _a = tableType.properties || []; _i < _a.length; _i++) {
            var p = _a[_i];
            if (!p.decorators || p.decorators.length === 0)
                continue;
            if (!p.decorators.find(function (d) { return d.name === "hasMany" || d.name === "hasOne"; }))
                continue;
            buffer += fieldIteration(new EntityField(this.modelFile, this.root, tableType, p)) + "\n";
        }
        return buffer;
    };
    return Table;
}());
exports.Table = Table;
var EntityField = (function () {
    function EntityField(modelFile, root, tableType, property) {
        this.modelFile = modelFile;
        this.root = root;
        this.tableType = tableType;
        this.property = property;
    }
    EntityField.prototype.isUnionLiteralType = function () {
        var propType = this.property.type;
        return (propType.unionTypes.length > 0) || ((propType.text.startsWith("\"")) || (propType.text.indexOf("|") >= 0));
    };
    EntityField.prototype.isUnionType = function () {
        var definition = this.property.type.definitions[0];
        if (definition && definition instanceof TsTypeInfo.TypeAliasDefinition) {
            return ((!!definition.type && definition.type.unionTypes.length > 0));
        }
        return this.property.type && this.property.type.unionTypes.length > 0;
    };
    EntityField.prototype.isEnum = function () {
        var definition = this.property.type.definitions[0];
        return definition && (definition instanceof TsTypeInfo.EnumDefinition);
    };
    EntityField.prototype.getName = function () {
        return this.property.name;
    };
    EntityField.prototype.getTypeName = function () {
        return this.property.type.text;
    };
    EntityField.prototype.getTypeArguments = function () {
        return this.property.type["typeArguments"];
    };
    EntityField.prototype.isPrimitive = function () {
        var name = this.getTypeName();
        return name === "string" || name === "boolean" || name === "number";
    };
    return EntityField;
}());
exports.EntityField = EntityField;
var HasMany = (function () {
    function HasMany(modelFile, root, tableType, property) {
        this.modelFile = modelFile;
        this.root = root;
        this.tableType = tableType;
        this.property = property;
        this.decorator = property.decorators.find(function (d) { return d.name === "hasMany"; });
    }
    HasMany.prototype.getName = function () {
        var noGet = this.property.name.replace("get", "");
        return "get_" + noGet.slice(0, 1).toLowerCase() + noGet.slice(1);
    };
    HasMany.prototype.getManyType = function () {
        var _this = this;
        // assume this is an array
        var foundType = this.modelFile.classes.find(function (c) { return c.name === (_this.property.returnType && _this.property.returnType.arrayElementType && _this.property.returnType.arrayElementType && _this.property.returnType.arrayElementType.text); });
        if (!foundType) {
            console.warn("Cannot find type to match the return type of " + this.property.name, this.property.returnType);
            console.trace("Stop");
        }
        return foundType;
    };
    HasMany.prototype.getManyTypeInterfaceName = function () {
        return "I" + removePrefixI(this.getManyType().name);
    };
    HasMany.prototype.getManyTableName = function () {
        var _this = this;
        var param = this.property.parameters[0];
        if (!param) {
            throw "No Parameter for getMany " + this.property.name;
        }
        if (!param.type.isArrayType()) {
            throw "getMany parameter type is not an array " + this.property.name;
        }
        var manyType = param.type.arrayElementType.definitions[0].name;
        if (!manyType) {
            throw "Cannot find definition for type used in getMany " + this.property.name;
        }
        var tableProp = this.root.properties.find(function (p) {
            var tab = new Table(_this.modelFile, _this.root, p);
            if (!tab.isTable) {
                return false;
            }
            return tab.getTableType().name === manyType;
        });
        if (!tableProp) {
            throw "Cannot find Root Property for " + manyType;
        }
        var table = new Table(this.modelFile, this.root, tableProp);
        return table.getTableName();
    };
    return HasMany;
}());
exports.HasMany = HasMany;
var HasOne = (function () {
    function HasOne(modelFile, root, tableType, property) {
        this.modelFile = modelFile;
        this.root = root;
        this.tableType = tableType;
        this.property = property;
        this.decorator = property.decorators.find(function (d) { return d.name === "hasOne"; });
    }
    HasOne.prototype.getName = function () {
        var name = this.decorator["arguments"][2] && this.decorator["arguments"][2].text;
        if (name && name[0] === "\"") {
            name = name.slice(1, -1);
        }
        if (!name) {
            name = this.property.name.replace("_id", "").replace("_code", "").replace(/\"/g, "");
        }
        return "get_" + name;
    };
    HasOne.prototype.getOneType = function () {
        var name = this.decorator["arguments"][0].text;
        return this.modelFile.classes.find(function (c) { return c.name === name; });
    };
    HasOne.prototype.getOneInterfaceTypeName = function () {
        return "I" + removePrefixI(this.getOneType().name);
    };
    HasOne.prototype.getOneTableName = function () {
        var lastDot = this.decorator.arguments[1].text.lastIndexOf(".");
        if (lastDot < 0)
            return null;
        var propName = this.decorator.arguments[1].text.slice(lastDot + 1);
        var prop = this.root.properties.find(function (p) { return p.name === propName; });
        if (!prop)
            return null;
        var table = new Table(this.modelFile, this.root, prop);
        return table.getTableName();
    };
    return HasOne;
}());
exports.HasOne = HasOne;
var lines = {};
function appendLine(path, line) {
    if (!lines[path]) {
        lines[path] = [];
    }
    lines[path].push(line);
}
exports.appendLine = appendLine;
function flushLines() {
    for (var _i = 0, _a = Object.keys(lines); _i < _a.length; _i++) {
        var f = _a[_i];
        fs.writeFileSync(f, lines[f].join("\n"));
    }
}
exports.flushLines = flushLines;
/** returns the type of a Dictionary used as the return type of the specified method */
function getDictReturnType(p) {
    return p.returnType.typeArguments[0].text;
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
function iterateRoot(modelFile, modelRoot, processMember) {
    for (var _i = 0, _a = modelRoot.properties; _i < _a.length; _i++) {
        var rootProp = _a[_i];
        processMember(new Table(modelFile, modelRoot, rootProp));
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