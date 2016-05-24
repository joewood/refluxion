"use strict";
var TsTypeInfo = require("ts-type-info");
var fs = require("fs");
var Path = require("path");
var path = require("path");
var helpers_1 = require("./helpers");
var graphql_generators_1 = require("./graphql-generators");
var normalizr_generators_1 = require("./normalizr-generators");
var graphql_client_generators_1 = require("./graphql-client-generators");
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
    .option("-n, --normalzr", "Generate normalizr schema file")
    .option("-g, --graphql", "Generate server side GraphQL support file")
    .option("-s, --sequelize", "Generate sequelize support file")
    .option("-r, --redux", "Generate redux support file")
    .command("refluxion <options> [dependent-files.ts] <file.ts>", "Specify input files to be processed for reflection.")
    .parse(process.argv);
var rawOutput = program["output"];
if (!fs.existsSync(rawOutput)) {
    console.error("Cannot find output dir " + path.resolve(rawOutput));
    process.exit(0);
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
var outputFilename = path.resolve(rawOutput);
var justFilename = Path.basename(mainFilename);
var clientQl = !!program["clientQl"];
var interfaces = !!program["interfaces"];
var normalzr = !!program["normalzr"];
var graphql = !!program["graphql"];
var sequelize = !!program["sequelze"];
var redux = !!program["redux"];
var writtenFiles = [];
console.log("Using Model File:" + mainFilename);
var gd = TsTypeInfo.getInfoFromFiles(inputFilenames);
var modelFile = gd.files.find(function (ff) { return Path.resolve(ff.fileName) === mainFilename; });
var root = modelFile.classes.find(function (i) { return !!i.decorators.find(function (d) { return d.name === "root"; }); });
if (!root) {
    console.error("Cannot find a class with the decorator `root`");
    process.exit(1);
}
console.log("Processing " + mainFilename + " for " + root.name);
if (clientQl) {
    var outputPath_1 = helpers_1.initializeFile(outputFilename + "/model.client-graphql.ts");
    writtenFiles.push(outputPath_1);
    helpers_1.appendLine(outputPath_1, "import { Query, GraphQLWhere } from \"refluxion\"");
    helpers_1.appendLine(outputPath_1, "import * as Model from \"./" + justFilename + "\";");
    helpers_1.iterateRoot(modelFile, root, function (p, collectClass, whereClass) {
        helpers_1.appendLine(outputPath_1, generate_interfaces_1.generateWhereInterface(whereClass));
        helpers_1.appendLine(outputPath_1, graphql_client_generators_1.getPrimitives(collectClass));
        helpers_1.appendLine(outputPath_1, graphql_client_generators_1.getQueryClass(collectClass, whereClass.name));
        helpers_1.appendLine(outputPath_1, generate_interfaces_1.generateNestedClass(collectClass));
    });
}
if (normalzr) {
    var outputPath_2 = helpers_1.initializeFile(outputFilename + "/model.normalzr.ts");
    writtenFiles.push(outputPath_2);
    helpers_1.appendLine(outputPath_2, "import { normalize, Schema, arrayOf, valuesOf } from \"normalizr\";");
    helpers_1.iterateRoot(modelFile, root, function (p, collectClass, whereClass) {
        helpers_1.appendLine(outputPath_2, "export var " + helpers_1.toCamel(collectClass.name) + " = new Schema(\"" + p.name + "\");");
    });
    helpers_1.iterateRoot(modelFile, root, function (p, collectClass, whereClass) {
        helpers_1.appendLine(outputPath_2, normalizr_generators_1.generateNormalizrDefine(collectClass));
    });
}
if (interfaces) {
    var outputPath = helpers_1.initializeFile(outputFilename + "/model.interfaces.ts");
    writtenFiles.push(outputPath);
    helpers_1.appendLine(outputPath, "import * as Model from \"./" + justFilename + "\";");
    helpers_1.appendLine(outputPath, generate_interfaces_1.generateInterfaceForClass(root, "", false));
    helpers_1.appendLine(outputPath, generate_interfaces_1.generateInterfaceForClass(root, "Lists", true));
}
if (graphql) {
    var outputPath_3 = helpers_1.initializeFile(outputFilename + "/model.graphql.ts");
    writtenFiles.push(outputPath_3);
    helpers_1.appendLine(outputPath_3, 'import * as GraphQL from "graphql";');
    helpers_1.appendLine(outputPath_3, 'var graphqlSeq = require("graphql-sequelize");');
    helpers_1.appendLine(outputPath_3, 'let {resolver, attributeFields, defaultListArgs, defaultArgs} = graphqlSeq;');
    helpers_1.appendLine(outputPath_3, 'import SequelizeModel from "./sequelize-model";');
    helpers_1.appendLine(outputPath_3, 'import {GraphQLDate} from "./graphql-date";');
    helpers_1.appendLine(outputPath_3, 'export interface GraphQLTypes {');
    helpers_1.iterateRoot(modelFile, root, function (p2, collectClass2, whereClass2) {
        helpers_1.appendLine(outputPath_3, "\t" + helpers_1.toCamel(collectClass2.name) + "Type ?: GraphQL.GraphQLObjectType;");
    });
    helpers_1.appendLine(outputPath_3, '}\n');
    helpers_1.appendLine(outputPath_3, 'export function getGraphQL( Seq: SequelizeModel ) : GraphQLTypes {');
    helpers_1.appendLine(outputPath_3, '\tconst types : GraphQLTypes = {};');
    helpers_1.iterateRoot(modelFile, root, function (p, collectClass, whereClass) {
        helpers_1.appendLine(outputPath_3, graphql_generators_1.generateGraphQLAttributes(p, collectClass, whereClass) + "\n");
    });
    helpers_1.appendLine(outputPath_3, "\treturn types;\n}\n");
    helpers_1.iterateRoot(modelFile, root, function (p, collectClass, whereClass) {
        helpers_1.appendLine(outputPath_3, graphql_generators_1.generateGraphQLArgs(p, collectClass, whereClass) + "\n");
    });
    helpers_1.iterateRoot(modelFile, root, function (p, collectClass, whereClass) {
        if (p.decorators.find(function (d) { return d.name === "useTable"; })) {
            helpers_1.appendLine(outputPath_3, graphql_generators_1.generateGraphQLEndPoints(p, collectClass, whereClass) + "\n");
        }
    });
    helpers_1.appendLine(outputPath_3, "export interface GraphQLWhere {}\n");
    helpers_1.iterateRoot(modelFile, root, function (p, collectClass, whereClass) {
        helpers_1.appendLine(outputPath_3, generate_interfaces_1.generateWhereInterface(whereClass));
    });
}
console.log("Writen Files:\n" + writtenFiles.join("\n"));
//# sourceMappingURL=refluxion.js.map