"use strict";
var TsTypeInfo = require("ts-type-info");
var fs = require("fs-extra");
var Path = require("path");
var path = require("path");
require('source-map-support').install();
var helpers_1 = require("./helpers");
var graphql_generators_1 = require("./graphql-generators");
var normalizr_generators_1 = require("./normalizr-generators");
var graphql_client_generators_1 = require("./graphql-client-generators");
var generate_sequelize_types_1 = require("./generate-sequelize-types");
var generate_interfaces_1 = require("./generate-interfaces");
var program = require("commander");
function inputFiles(val, memo) {
    memo.push(val);
    return memo;
}
program.version("0.0.1")
    .option("-o, --output [dir]", "Specify output path")
    .option("-c, --client-ql", "Generate client side GraphQL support file")
    .option("-f, --interfaces", "Generate interfaces from model")
    .option("-n, --normalizr", "Generate normalizr schema file")
    .option("-g, --graphql", "Generate server side GraphQL support file")
    .option("-s, --sequelize", "Generate sequelize support file")
    .option("-r, --redux", "Generate redux support file")
    .command("refluxion <options> [dependent-files.ts] <file.ts>", "Specify input files to be processed for reflection.")
    .parse(process.argv);
var rawOutput = program["output"];
if (!fs.existsSync(rawOutput)) {
    console.log("Warning - cannot find dir " + rawOutput + ". mkdir.");
    fs.mkdirSync(rawOutput);
}
var rawInputs = program.args;
rawInputs.forEach(function (ri) {
    if (!fs.existsSync(ri)) {
        console.error("Cannot find input file " + path.resolve(ri));
        process.exit(0);
    }
});
var inputFilenames = program.args; // process.argv.slice(3).map(arg => Path.resolve(process.cwd() + "/" + arg));
var mainFilename = Path.resolve(inputFilenames[inputFilenames.length - 1]);
var outputDir = path.resolve(rawOutput);
var modelRelative = path.relative(outputDir, mainFilename);
var justRelativeFilename = modelRelative.replace(".ts", "").replace(/\\/g, "\/");
var clientQl = !!program["clientQl"];
var interfaces = !!program["interfaces"];
var normalizr = !!program["normalizr"];
var graphql = !!program["graphql"];
var sequelize = !!program["sequelize"];
var redux = !!program["redux"];
var writtenFiles = [];
console.log("DIR " + __dirname);
fs.copySync(__dirname + "/distribution/query.ts", outputDir + "/query.ts");
fs.copySync(__dirname + "/distribution/decorators.ts", outputDir + "/decorators.ts");
var outputBasename = Path.basename(mainFilename).replace(Path.extname(mainFilename), "");
console.log("Refluxion:\n\tModel: " + mainFilename + "\n\tOutput: " + outputDir + path.sep + outputBasename + ".*.ts");
var gd = TsTypeInfo.getInfoFromFiles(inputFilenames, {
    showDebugMessages: true,
    compilerOptions: {
        "target": "ES5",
        "module": "commonjs",
        "preserveConstEnums": true,
        "experimentalDecorators": true,
        // "lib":new Array(
        //     "es2015",
        //     "es2016",
        //     "es2017",
        //     "es2017.object",
        //     "es2015.promise"
        //     ),
        "types": []
    }
});
var modelFile = gd.files.find(function (ff) { return Path.resolve(ff.fileName) === mainFilename; });
var root = modelFile.classes.find(function (i) { return !!i.decorators.find(function (d) { return d.name === "root"; }); });
if (!root) {
    console.error("Cannot find a class with the decorator `root`");
    process.exit(1);
}
console.log("Processing " + mainFilename + " for " + root.name);
if (clientQl) {
    var outputGraphQLClient_1 = helpers_1.initializeFile(outputDir + "/" + outputBasename + ".client-graphql.ts");
    writtenFiles.push(outputGraphQLClient_1);
    helpers_1.appendLine(outputGraphQLClient_1, "import { Query, GraphQLWhere, Dict } from \"./query\"");
    helpers_1.appendLine(outputGraphQLClient_1, "import * as Model from \"./" + justRelativeFilename + "\";");
    helpers_1.iterateRoot(modelFile, root, function (table) {
        if (!table.isTable)
            return;
        if (!table.getTableType()) {
            console.warn("Cannot find Table Type for " + table.getTableName());
            return;
        }
        helpers_1.appendLine(outputGraphQLClient_1, generate_interfaces_1.generateWhereInterface(table.getWhereClass()));
        helpers_1.appendLine(outputGraphQLClient_1, graphql_client_generators_1.getPrimitives(table.getTableType()));
        helpers_1.appendLine(outputGraphQLClient_1, graphql_client_generators_1.getQueryClass(table, table.getWhereClass().name));
        helpers_1.appendLine(outputGraphQLClient_1, generate_interfaces_1.generateNestedClass(table));
    });
}
if (sequelize) {
    var outputSequelize_1 = helpers_1.initializeFile(outputDir + "/" + outputBasename + ".sequelize.ts");
    writtenFiles.push(outputSequelize_1);
    helpers_1.appendLine(outputSequelize_1, "import * as Sequelize from \"sequelize\";\n");
    helpers_1.appendLine(outputSequelize_1, "import * as Interfaces from \"./" + outputBasename + ".interfaces\";\n");
    helpers_1.appendLine(outputSequelize_1, "interface Dict<T> { [index:string]:T; };");
    // output interfaces for Sequelize Model
    helpers_1.iterateRoot(modelFile, root, function (table) {
        if (!table.isTable)
            return;
        helpers_1.appendLine(outputSequelize_1, "interface " + table.getTableType().name + "Model extends Sequelize.Model<Interfaces." + table.getTableInterfaceTypeName() + ",any> {");
        helpers_1.appendLine(outputSequelize_1, "\tassociations : {");
        var buffer = table.mapClassMembers(function (hasMany) { return ("\t\t" + hasMany.getName() + ": Sequelize.Model<Interfaces." + hasMany.getManyTypeInterfaceName() + ",any>;"); }, function (hasOne) { return ("\t\t" + hasOne.getName() + ": Sequelize.Model<Interfaces." + hasOne.getOneInterfaceTypeName() + ",any>;"); });
        helpers_1.appendLine(outputSequelize_1, buffer + "\t}");
        helpers_1.appendLine(outputSequelize_1, "}\n");
    });
    helpers_1.appendLine(outputSequelize_1, "export interface Tables {");
    helpers_1.iterateRoot(modelFile, root, function (table) {
        if (!table.isTable)
            return;
        helpers_1.appendLine(outputSequelize_1, "\t" + table.getTableName() + ": " + table.getTableType().name + "Model;");
    });
    helpers_1.appendLine(outputSequelize_1, "}\n");
    helpers_1.appendLine(outputSequelize_1, "export function initEntities( sequelize : Sequelize.Sequelize, coreFields: Sequelize.DefineAttributes, commonOptions: Sequelize.DefineOptions<any>, additionalOptions: Dict<Sequelize.DefineOptions<any>>) : Tables {");
    helpers_1.appendLine(outputSequelize_1, "\treturn {");
    helpers_1.iterateRoot(modelFile, root, function (table) {
        if (!table.isTable)
            return;
        helpers_1.appendLine(outputSequelize_1, "\t\t" + table.getTableName() + " : sequelize.define(\"" + table.getTableName() + "\", <Sequelize.DefineAttributes>Object.assign({},coreFields,{");
        for (var _i = 0, _a = table.getTableType().properties; _i < _a.length; _i++) {
            var field = _a[_i];
            var typeName = field.type.text;
            if (field.name === "id")
                continue;
            helpers_1.appendLine(outputSequelize_1, "\t\t\t" + field.name + ": { type: " + generate_sequelize_types_1.getSequelizeTypeofProp(field) + " },");
        }
        helpers_1.appendLine(outputSequelize_1, "\t\t}),");
        helpers_1.appendLine(outputSequelize_1, "\t\t\t<Sequelize.DefineOptions<any>>Object.assign({},commonOptions,additionalOptions[\"" + table.getTableName() + "\"])");
        helpers_1.appendLine(outputSequelize_1, "\t\t) as " + table.getTableType().name + "Model,");
    });
    helpers_1.appendLine(outputSequelize_1, "\t};");
    helpers_1.appendLine(outputSequelize_1, "}");
    helpers_1.appendLine(outputSequelize_1, "export function initAssociations( tables : Tables) : void {");
    helpers_1.iterateRoot(modelFile, root, function (table) {
        if (!table.isTable)
            return;
        var buffer = table.mapClassMembers(function (hasMany) { return ("\ttables." + table.getTableName() + ".hasMany(tables." + hasMany.getManyTableName() + ", { as: \"" + hasMany.getName() + "\", constraints:false, foreignKeyConstraint:false, onUpdate:\"NO ACTION\", onDelete:\"SET NULL\"} )"); }, function (hasOne) { return ("\ttables." + table.getTableName() + ".belongsTo(tables." + hasOne.getOneTableName() + ", { foreignKey: \"" + hasOne.property.name + "\", as: \"" + hasOne.getName() + "\", constraints:false, foreignKeyConstraint:false, onUpdate:\"NO ACTION\", onDelete:\"SET NULL\" })"); });
        helpers_1.appendLine(outputSequelize_1, buffer);
    });
    helpers_1.appendLine(outputSequelize_1, "}");
}
if (normalizr) {
    var outputNormalizr_1 = helpers_1.initializeFile(outputDir + "/" + outputBasename + ".normalizr.ts");
    writtenFiles.push(outputNormalizr_1);
    helpers_1.appendLine(outputNormalizr_1, "import { normalize, Schema, arrayOf, valuesOf } from \"normalizr\";");
    helpers_1.iterateRoot(modelFile, root, function (table) {
        if (!table.isTable)
            return;
        helpers_1.appendLine(outputNormalizr_1, "export var " + helpers_1.toCamel(table.getTableType().name) + " = new Schema(\"" + table.tableProperty.name + "\");");
    });
    helpers_1.iterateRoot(modelFile, root, function (table) {
        if (!table.isTable)
            return;
        helpers_1.appendLine(outputNormalizr_1, normalizr_generators_1.generateNormalizrDefine(table));
    });
}
if (interfaces) {
    var outputInterfaces_1 = helpers_1.initializeFile(outputDir + "/" + outputBasename + ".interfaces.ts");
    writtenFiles.push(outputInterfaces_1);
    helpers_1.appendLine(outputInterfaces_1, "import * as Model from \"./" + justRelativeFilename + "\";\n");
    helpers_1.appendLine(outputInterfaces_1, "interface Dict<T> { [index:string]:T; };");
    helpers_1.appendLine(outputInterfaces_1, "export interface Base {");
    helpers_1.appendLine(outputInterfaces_1, "\tid?: string;");
    helpers_1.appendLine(outputInterfaces_1, "}\n");
    helpers_1.appendLine(outputInterfaces_1, generate_interfaces_1.generateInterfaceForClass(root, "", false));
    helpers_1.iterateRoot(modelFile, root, function (table) {
        if (!table.isTable)
            return;
        helpers_1.appendLine(outputInterfaces_1, generate_interfaces_1.generateInterfaceForClass(table.getTableType(), "", false));
    });
    helpers_1.appendLine(outputInterfaces_1, generate_interfaces_1.generateInterfaceForClass(root, "Lists", true));
    var outputPathOptional_1 = helpers_1.initializeFile(outputDir + "/" + outputBasename + ".optional-interfaces.ts");
    writtenFiles.push(outputPathOptional_1);
    helpers_1.appendLine(outputPathOptional_1, "import * as Model from \"./" + justRelativeFilename + "\";\n");
    helpers_1.appendLine(outputPathOptional_1, "interface Dict<T> { [index:string]:T; };");
    helpers_1.appendLine(outputPathOptional_1, "export interface Base {");
    helpers_1.appendLine(outputPathOptional_1, "\tid?: string;");
    helpers_1.appendLine(outputPathOptional_1, "}\n");
    helpers_1.appendLine(outputPathOptional_1, generate_interfaces_1.generateInterfaceForClass(root, "", false));
    helpers_1.iterateRoot(modelFile, root, function (table) {
        if (!table.isTable)
            return;
        helpers_1.appendLine(outputPathOptional_1, generate_interfaces_1.generateInterfaceForClass(table.getTableType(), "", false, true));
    });
    helpers_1.appendLine(outputPathOptional_1, generate_interfaces_1.generateInterfaceForClass(root, "Lists", true, true));
}
if (graphql) {
    var outputGraphQL_1 = helpers_1.initializeFile(outputDir + "/" + outputBasename + ".graphql.ts");
    writtenFiles.push(outputGraphQL_1);
    helpers_1.appendLine(outputGraphQL_1, 'import * as GraphQL from "graphql";');
    helpers_1.appendLine(outputGraphQL_1, 'var graphqlSeq = require("graphql-sequelize");');
    helpers_1.appendLine(outputGraphQL_1, 'let {resolver, attributeFields, defaultListArgs, defaultArgs} = graphqlSeq;');
    helpers_1.appendLine(outputGraphQL_1, 'import SequelizeModel from "../sequelize-model";');
    helpers_1.appendLine(outputGraphQL_1, 'import {GraphQLDate} from "../graphql-date";');
    helpers_1.appendLine(outputGraphQL_1, 'export interface GraphQLTypes {');
    helpers_1.iterateRoot(modelFile, root, function (table) {
        if (!table.isTable)
            return;
        helpers_1.appendLine(outputGraphQL_1, "\t" + helpers_1.toCamel(table.getTableType().name) + "Type ?: GraphQL.GraphQLObjectType;");
    });
    helpers_1.appendLine(outputGraphQL_1, '}\n');
    helpers_1.appendLine(outputGraphQL_1, 'export function getGraphQL( Seq: SequelizeModel ) : GraphQLTypes {');
    helpers_1.appendLine(outputGraphQL_1, '\tconst types : GraphQLTypes = {};');
    helpers_1.iterateRoot(modelFile, root, function (table) {
        if (!table.isTable)
            return;
        helpers_1.appendLine(outputGraphQL_1, graphql_generators_1.generateGraphQLAttributes(table, table.getTableType(), table.getWhereClass(), table.getTableName()) + "\n");
    });
    helpers_1.appendLine(outputGraphQL_1, "\treturn types;\n}\n");
    helpers_1.iterateRoot(modelFile, root, function (table) {
        if (!table.isTable)
            return;
        helpers_1.appendLine(outputGraphQL_1, graphql_generators_1.generateGraphQLArgs(table.tableProperty, table.getTableType(), table.getWhereClass()) + "\n");
    });
    helpers_1.iterateRoot(modelFile, root, function (table) {
        if (table.isTable) {
            helpers_1.appendLine(outputGraphQL_1, graphql_generators_1.generateGraphQLEndPoints(table.tableProperty, table.getTableType(), table.getWhereClass(), table.getTableName()) + "\n");
        }
    });
    helpers_1.appendLine(outputGraphQL_1, "export interface GraphQLWhere {}\n");
    helpers_1.iterateRoot(modelFile, root, function (table) {
        if (!table.isTable)
            return;
        helpers_1.appendLine(outputGraphQL_1, generate_interfaces_1.generateWhereInterface(table.getWhereClass()));
    });
}
console.log("Writen Files:\n" + writtenFiles.join("\n"));
//# sourceMappingURL=refluxion.js.map