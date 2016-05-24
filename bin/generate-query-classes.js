"use strict";
var TsTypeInfo = require("ts-type-info");
var fs = require("fs");
var Path = require("path");
var helpers_1 = require("./helpers");
var graphql_generators_1 = require("./graphql-generators");
var normalizr_generators_1 = require("./normalizr-generators");
var graphql_client_generators_1 = require("./graphql-client-generators");
////////////////////
if (process.argv.length < 3) {
    console.log("Usage: generate-query-classes [client|graphql] <filename.ts> --out server");
    process.exit();
}
var inputFilenames = process.argv.slice(3).map(function (arg) { return Path.resolve(process.cwd() + "/" + arg); });
var mainFilename = inputFilenames[inputFilenames.length - 1];
var server = (process.argv[2] == "graphql");
var outputFilename = mainFilename.replace(".ts", !server ? ".query.ts" : ".graphql.ts");
var justFilename = Path.basename(mainFilename);
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
if (!server) {
    helpers_1.appendLine(outputPath, "import { Query, GraphQLWhere } from \"refluxion\"");
    helpers_1.appendLine(outputPath, "import { normalize, Schema, arrayOf, valuesOf } from \"normalizr\";");
    helpers_1.appendLine(outputPath, "import * as Model from \"./" + justFilename + "\";");
    helpers_1.iterateRoot(modelFile, root, function (p, collectClass, whereClass) {
        helpers_1.appendLine(outputPath, "export var " + helpers_1.toCamel(collectClass.name) + " = new Schema(\"" + p.name + "\");");
    });
    helpers_1.appendLine(outputPath, getInterfaceForClass(root, "", false));
    helpers_1.appendLine(outputPath, getInterfaceForClass(root, "Lists", true));
    helpers_1.iterateRoot(modelFile, root, function (p, collectClass, whereClass) {
        helpers_1.appendLine(outputPath, getWhereInterface(whereClass));
        helpers_1.appendLine(outputPath, graphql_client_generators_1.getPrimitives(collectClass));
        helpers_1.appendLine(outputPath, graphql_client_generators_1.getQueryClass(collectClass, whereClass.name));
        helpers_1.appendLine(outputPath, getNestedClass(collectClass));
        helpers_1.appendLine(outputPath, normalizr_generators_1.generateNormalizrDefine(collectClass));
    });
}
else {
    helpers_1.appendLine(outputPath, 'import * as GraphQL from "graphql";');
    helpers_1.appendLine(outputPath, 'var graphqlSeq = require("graphql-sequelize");');
    helpers_1.appendLine(outputPath, 'let {resolver, attributeFields, defaultListArgs, defaultArgs} = graphqlSeq;');
    helpers_1.appendLine(outputPath, 'import SequelizeModel from "./sequelize-model";');
    helpers_1.appendLine(outputPath, 'export interface GraphQLTypes {');
    helpers_1.iterateRoot(modelFile, root, function (p2, collectClass2, whereClass2) {
        helpers_1.appendLine(outputPath, "\t" + helpers_1.toCamel(collectClass2.name) + "Type ?: GraphQL.GraphQLObjectType;");
    });
    helpers_1.appendLine(outputPath, '}\n');
    helpers_1.appendLine(outputPath, 'export function getGraphQL( Seq: SequelizeModel ) : GraphQLTypes {');
    helpers_1.appendLine(outputPath, '\tconst types : GraphQLTypes = {};');
    helpers_1.iterateRoot(modelFile, root, function (p, collectClass, whereClass) {
        helpers_1.appendLine(outputPath, graphql_generators_1.generateGraphQLAttributes(p, collectClass, whereClass) + "\n");
    });
    helpers_1.appendLine(outputPath, "\treturn types;\n}\n");
    helpers_1.iterateRoot(modelFile, root, function (p, collectClass, whereClass) {
        helpers_1.appendLine(outputPath, graphql_generators_1.generateWhereClass(p, collectClass, whereClass) + "\n");
    });
    helpers_1.iterateRoot(modelFile, root, function (p, collectClass, whereClass) {
        helpers_1.appendLine(outputPath, graphql_generators_1.generateGraphQLEndPoints(p, collectClass, whereClass) + "\n");
    });
}
console.log("Written File " + outputPath);
//# sourceMappingURL=generate-query-classes.js.map