import * as TsTypeInfo from "ts-type-info";
import { camelToUnderscore } from "core-ts/lib/core";
import fs = require("fs");
import * as Path from "path";
import path = require("path");

import { initializeFile, appendLine, convertMethodName, getDictReturnType, removePrefixI, toCamel, mapClassMembers, iterateRoot} from "./helpers";
import {generateGraphQLAttributes, generateGraphQLEndPoints, generateGraphQLArgs} from "./graphql-generators";
import {generateNormalizrDefine} from "./normalizr-generators";
import {getPrimitives, getQueryClass} from "./graphql-client-generators";
import {generateInterfaceForClass, generateNestedClass, generateWhereInterface} from "./generate-interfaces";

import * as program from "commander";

function inputFiles(val: string, memo: string[]) {
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


const rawOutput = program["output"];
if (!fs.existsSync(rawOutput)) {
    console.error("Cannot find output dir " + path.resolve(rawOutput));
    process.exit(0);
}

const rawInputs = program.args;
rawInputs.forEach(ri => {
    if (!fs.existsSync(ri)) {
        console.error("Cannot find input file " + path.resolve(ri));
        process.exit(0);
    }
})

const inputFilenames = program.args; // process.argv.slice(3).map(arg => Path.resolve(process.cwd() + "/" + arg));
const mainFilename = Path.resolve(inputFilenames[inputFilenames.length - 1]);
const outputFilename = path.resolve(rawOutput);
const justFilename = Path.basename(mainFilename);
const clientQl = !!program["clientQl"];
const interfaces = !!program["interfaces"];
const normalzr = !!program["normalzr"];
const graphql = !!program["graphql"];
const sequelize = !!program["sequelze"];
const redux = !!program["redux"];
const writtenFiles = [] as string[];


console.log("Using Model File:" + mainFilename);

const gd = TsTypeInfo.getInfoFromFiles(inputFilenames);

const modelFile = gd.files.find(ff => Path.resolve(ff.fileName) === mainFilename);

const root = modelFile.classes.find(i => !!i.decorators.find(d => d.name === "root"));
if (!root) {
    console.error("Cannot find a class with the decorator `root`");
    process.exit(1);
}
console.log(`Processing ${mainFilename} for ${root.name}`);

if (clientQl) {
    const outputPath = initializeFile(outputFilename + "/model.client-graphql.ts");
    writtenFiles.push(outputPath);
    appendLine(outputPath, "import { Query, GraphQLWhere } from \"refluxion\"");
    appendLine(outputPath, `import * as Model from "./${justFilename}";`);

    iterateRoot(modelFile, root, (p, collectClass, whereClass) => {
        appendLine(outputPath, generateWhereInterface(whereClass));
        appendLine(outputPath, getPrimitives(collectClass));
        appendLine(outputPath, getQueryClass(collectClass, whereClass.name));
        appendLine(outputPath, generateNestedClass(collectClass));
    });

}

if (normalzr) {
    const outputPath = initializeFile(outputFilename + "/model.normalzr.ts");
    writtenFiles.push(outputPath);
    appendLine(outputPath, "import { normalize, Schema, arrayOf, valuesOf } from \"normalizr\";");
    iterateRoot(modelFile, root, (p, collectClass, whereClass) => {
        appendLine(outputPath, `export var ${toCamel(collectClass.name)} = new Schema(\"${p.name}\");`);
    });
    iterateRoot(modelFile, root, (p, collectClass, whereClass) => {
        appendLine(outputPath, generateNormalizrDefine(collectClass));
    });

}

if (interfaces) {
    const outputPath = initializeFile(outputFilename + "/model.interfaces.ts");
    writtenFiles.push(outputPath);
    appendLine(outputPath, `import * as Model from "./${justFilename}";`);
    appendLine(outputPath, generateInterfaceForClass(root, "", false));
    appendLine(outputPath, generateInterfaceForClass(root, "Lists", true));

}

if (graphql) {
    const outputPath = initializeFile(outputFilename + "/model.graphql.ts");
    writtenFiles.push(outputPath);

    appendLine(outputPath, 'import * as GraphQL from "graphql";');
    appendLine(outputPath, 'var graphqlSeq = require("graphql-sequelize");');
    appendLine(outputPath, 'let {resolver, attributeFields, defaultListArgs, defaultArgs} = graphqlSeq;');
    appendLine(outputPath, 'import SequelizeModel from "./sequelize-model";');
    appendLine(outputPath, 'import {GraphQLDate} from "./graphql-date";');
    appendLine(outputPath, 'export interface GraphQLTypes {');
    iterateRoot(modelFile, root, (p2, collectClass2, whereClass2) => {
        appendLine(outputPath, `\t${toCamel(collectClass2.name)}Type ?: GraphQL.GraphQLObjectType;`);
    });
    appendLine(outputPath, '}\n');

    appendLine(outputPath, 'export function getGraphQL( Seq: SequelizeModel ) : GraphQLTypes {');
    appendLine(outputPath, '\tconst types : GraphQLTypes = {};');

    iterateRoot(modelFile, root, (p, collectClass, whereClass) => {
        appendLine(outputPath, generateGraphQLAttributes(p, collectClass, whereClass) + "\n");
    });
    appendLine(outputPath, "\treturn types;\n}\n");

    iterateRoot(modelFile, root, (p, collectClass, whereClass) => {
        appendLine(outputPath, generateGraphQLArgs(p, collectClass, whereClass) + "\n");
    });

    iterateRoot(modelFile, root, (p, collectClass, whereClass) => {
        if (p.decorators.find(d => d.name === "useTable")) {
            appendLine(outputPath, generateGraphQLEndPoints(p, collectClass, whereClass) + "\n");
        }
    });
    appendLine(outputPath,"export interface GraphQLWhere {}\n");
    
    iterateRoot(modelFile, root, (p, collectClass, whereClass) => {
        appendLine(outputPath, generateWhereInterface(whereClass));
    });
}
console.log("Writen Files:\n" + writtenFiles.join("\n"));


