import * as TsTypeInfo from "ts-type-info";
import fs = require("fs-extra");
import * as Path from "path";
import path = require("path");
require('source-map-support').install();

import { initializeFile, lowerFirstChar, appendLine, getDictReturnType, removePrefixI, toCamel, Table, iterateRoot } from "./helpers";
import { generateGraphQLAttributes, generateGraphQLEndPoints, generateGraphQLArgs } from "./graphql-generators";
import { generateNormalizrDefine } from "./normalizr-generators";
import { getPrimitives, getQueryClass } from "./graphql-client-generators";
import { getSequelizeTypeofProp } from "./generate-sequelize-types";
import { generateInterfaceForClass, generateNestedClass, generateWhereInterface } from "./generate-interfaces";

import * as program from "commander";

function inputFiles(val: string, memo: string[]) {
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


const rawOutput = program["output"];
if (!fs.existsSync(rawOutput)) {
    console.log("Warning - cannot find dir " + rawOutput + ". mkdir.")
    fs.mkdirSync(rawOutput);
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
const outputDir = path.resolve(rawOutput);
const modelRelative = path.relative(outputDir, mainFilename);
const justRelativeFilename = modelRelative.replace(".ts", "").replace(/\\/g, "\/");
const clientQl = !!program["clientQl"];
const interfaces = !!program["interfaces"];
const normalizr = !!program["normalizr"];
const graphql = !!program["graphql"];
const sequelize = !!program["sequelize"];
const redux = !!program["redux"];
const writtenFiles = [] as string[];
console.log("DIR " + __dirname);
fs.copySync(__dirname + "/distribution/query.ts", outputDir + "/query.ts");
fs.copySync(__dirname + "/distribution/decorators.ts", outputDir + "/decorators.ts");


const outputBasename = Path.basename(mainFilename).replace(Path.extname(mainFilename), "");

console.log(`Refluxion:\n\tModel: ${mainFilename}\n\tOutput: ${outputDir}${path.sep}${outputBasename}.*.ts`);

const gd = TsTypeInfo.getInfoFromFiles(inputFilenames, {

    showDebugMessages: true,
    compilerOptions:
    {
        "target": "ES5",
        "module": "commonjs",
        "preserveConstEnums": true,
        "experimentalDecorators": true,
        // "moduleResolution": "node",
        // "lib": [
        //     "es2015",
        //     "es2016",
        //     "es2017",
        //     "es2017.object",
        //     "es2015.promise"
        // ],
        "types": ["node"]
    }
} as TsTypeInfo.Options);

const modelFile = gd.files.find(ff => Path.resolve(ff.fileName) === mainFilename);

const root = modelFile.classes.find(i => !!i.decorators.find(d => d.name === "root"));
if (!root) {
    console.error("Cannot find a class with the decorator `root`");
    process.exit(1);
}
console.log(`Processing ${mainFilename} for ${root.name}`);

if (clientQl) {
    const outputGraphQLClient = initializeFile(outputDir + "/" + outputBasename + ".client-graphql.ts");
    writtenFiles.push(outputGraphQLClient);
    appendLine(outputGraphQLClient, "import { Query, GraphQLWhere, Dict } from \"./query\"");
    appendLine(outputGraphQLClient, `import * as Model from "./${justRelativeFilename}";`);

    iterateRoot(modelFile, root, table => {
        if (!table.isTable) return;
        if (!table.getTableType()) {
            console.warn("Cannot find Table Type for " + table.getTableName());
            return;
        }
        appendLine(outputGraphQLClient, generateWhereInterface(table.getWhereClass()));
        appendLine(outputGraphQLClient, getPrimitives(table.getTableType()));
        appendLine(outputGraphQLClient, getQueryClass(table, table.getWhereClass().name));
        appendLine(outputGraphQLClient, generateNestedClass(table));
    });

}

if (sequelize) {
    const outputSequelize = initializeFile(outputDir + "/" + outputBasename + ".sequelize.ts");
    writtenFiles.push(outputSequelize);
    appendLine(outputSequelize, "import * as Sequelize from \"sequelize\";\n");
    appendLine(outputSequelize, `import * as Interfaces from "./${outputBasename}.interfaces";\n`);
    appendLine(outputSequelize, `interface Dict<T> { [index:string]:T; };`);

    // output interfaces for Sequelize Model
    iterateRoot(modelFile, root, table => {
        if (!table.isTable) return;
        appendLine(outputSequelize, `interface ${table.getTableType().name}Model extends Sequelize.Model<Interfaces.${table.getTableInterfaceTypeName()},any> {`)
        appendLine(outputSequelize, `\tassociations : {`);
        const buffer = table.mapClassMembers(
            hasMany => `\t\t${hasMany.getName()}: Sequelize.Model<Interfaces.${hasMany.getManyTypeInterfaceName()},any>;`,
            hasOne => `\t\t${hasOne.getName()}: Sequelize.Model<Interfaces.${hasOne.getOneInterfaceTypeName()},any>;`)
        appendLine(outputSequelize, buffer + "\t}");
        appendLine(outputSequelize, "}\n");
    });

    appendLine(outputSequelize, "export interface Tables {");
    iterateRoot(modelFile, root, (table) => {
        if (!table.isTable) return;
        appendLine(outputSequelize, `\t${table.getTableName()}: ${table.getTableType().name}Model;`);
    });
    appendLine(outputSequelize, "}\n");

    appendLine(outputSequelize, "export function initEntities( sequelize : Sequelize.Sequelize, coreFields: Sequelize.DefineAttributes, commonOptions: Sequelize.DefineOptions<any>, additionalOptions: Dict<Sequelize.DefineOptions<any>>) : Tables {");
    appendLine(outputSequelize, "\treturn {");

    iterateRoot(modelFile, root, (table) => {
        if (!table.isTable) return;
        appendLine(outputSequelize, `\t\t${table.getTableName()} : sequelize.define("${table.getTableName()}", <Sequelize.DefineAttributes>Object.assign({},coreFields,{`);
        for (let field of table.getTableType().properties) {
            let typeName = field.type.text;
            if (field.name === "id") continue;
            appendLine(outputSequelize, `\t\t\t${field.name}: { type: ${getSequelizeTypeofProp(field)} },`);
        }
        appendLine(outputSequelize, "\t\t}),");
        appendLine(outputSequelize, `\t\t\t<Sequelize.DefineOptions<any>>Object.assign({},commonOptions,additionalOptions["${table.getTableName()}"])`);
        appendLine(outputSequelize, `\t\t) as ${table.getTableType().name}Model,`);
    });
    appendLine(outputSequelize, "\t};");
    appendLine(outputSequelize, "}");

    appendLine(outputSequelize, "export function initAssociations( tables : Tables) : void {");
    iterateRoot(modelFile, root, table => {
        if (!table.isTable) return;
        const buffer = table.mapClassMembers(
            hasMany => `\ttables.${table.getTableName()}.hasMany(tables.${hasMany.getManyTableName()}, { as: "${hasMany.getName()}", constraints:false, foreignKeyConstraint:false, onUpdate:"NO ACTION", onDelete:"SET NULL"} )`,
            hasOne => `\ttables.${table.getTableName()}.belongsTo(tables.${hasOne.getOneTableName()}, { foreignKey: "${hasOne.property.name}", as: "${hasOne.getName()}", constraints:false, foreignKeyConstraint:false, onUpdate:"NO ACTION", onDelete:"SET NULL" })`
        );
        appendLine(outputSequelize, buffer);
    });


    appendLine(outputSequelize, "}");


}

if (normalizr) {
    const outputNormalizr = initializeFile(outputDir + "/" + outputBasename + ".normalizr.ts");
    writtenFiles.push(outputNormalizr);
    appendLine(outputNormalizr, "import { normalize, Schema, arrayOf, valuesOf } from \"normalizr\";");
    iterateRoot(modelFile, root, table => {
        if (!table.isTable) return;
        appendLine(outputNormalizr, `export var ${toCamel(table.getTableType().name)} = new Schema(\"${table.tableProperty.name}\");`);
    });
    iterateRoot(modelFile, root, table => {
        if (!table.isTable) return;
        appendLine(outputNormalizr, generateNormalizrDefine(table));
    });

}

if (interfaces) {
    const outputInterfaces = initializeFile(outputDir + "/" + outputBasename + ".interfaces.ts");
    writtenFiles.push(outputInterfaces);
    appendLine(outputInterfaces, `import * as Model from "./${justRelativeFilename}";\n`);
    appendLine(outputInterfaces, `interface Dict<T> { [index:string]:T; };`);
    appendLine(outputInterfaces, "export interface Base {");
    appendLine(outputInterfaces, "\tid?: string;");
    appendLine(outputInterfaces, "}\n");
    appendLine(outputInterfaces, generateInterfaceForClass(root, "", false));

    iterateRoot(modelFile, root, table => {
        if (!table.isTable) return;
        appendLine(outputInterfaces, generateInterfaceForClass(table.getTableType(), "", false));
    })
    appendLine(outputInterfaces, generateInterfaceForClass(root, "Lists", true));

    const outputPathOptional = initializeFile(outputDir + "/" + outputBasename + ".optional-interfaces.ts");
    writtenFiles.push(outputPathOptional);
    appendLine(outputPathOptional, `import * as Model from "./${justRelativeFilename}";\n`);
    appendLine(outputPathOptional, `interface Dict<T> { [index:string]:T; };`);
    appendLine(outputPathOptional, "export interface Base {");
    appendLine(outputPathOptional, "\tid?: string;");
    appendLine(outputPathOptional, "}\n");
    appendLine(outputPathOptional, generateInterfaceForClass(root, "", false));

    iterateRoot(modelFile, root, table => {
        if (!table.isTable) return;
        appendLine(outputPathOptional, generateInterfaceForClass(table.getTableType(), "", false, true));
    })
    appendLine(outputPathOptional, generateInterfaceForClass(root, "Lists", true, true));

}

if (graphql) {
    const outputGraphQL = initializeFile(outputDir + "/" + outputBasename + ".graphql.ts");
    writtenFiles.push(outputGraphQL);

    appendLine(outputGraphQL, 'import * as GraphQL from "graphql";');
    appendLine(outputGraphQL, 'var graphqlSeq = require("graphql-sequelize");');
    appendLine(outputGraphQL, 'let {resolver, attributeFields, defaultListArgs, defaultArgs} = graphqlSeq;');
    appendLine(outputGraphQL, 'import SequelizeModel from "../sequelize-model";');
    appendLine(outputGraphQL, 'import {GraphQLDate} from "../graphql-date";');
    appendLine(outputGraphQL, 'export interface GraphQLTypes {');
    iterateRoot(modelFile, root, table => {
        if (!table.isTable) return;
        appendLine(outputGraphQL, `\t${toCamel(table.getTableType().name)}Type ?: GraphQL.GraphQLObjectType;`);
    });
    appendLine(outputGraphQL, '}\n');

    appendLine(outputGraphQL, 'export function getGraphQL( Seq: SequelizeModel ) : GraphQLTypes {');
    appendLine(outputGraphQL, '\tconst types : GraphQLTypes = {};');

    iterateRoot(modelFile, root, table => {
        if (!table.isTable) return;
        appendLine(outputGraphQL, generateGraphQLAttributes(table, table.getTableType(), table.getWhereClass(), table.getTableName()) + "\n");
    });
    appendLine(outputGraphQL, "\treturn types;\n}\n");

    iterateRoot(modelFile, root, table => {
        if (!table.isTable) return;
        appendLine(outputGraphQL, generateGraphQLArgs(table.tableProperty, table.getTableType(), table.getWhereClass()) + "\n");
    });

    iterateRoot(modelFile, root, table => {
        if (table.isTable) {
            appendLine(outputGraphQL, generateGraphQLEndPoints(table.tableProperty, table.getTableType(), table.getWhereClass(), table.getTableName()) + "\n");
        }
    });
    appendLine(outputGraphQL, "export interface GraphQLWhere {}\n");

    iterateRoot(modelFile, root, table => {
        if (!table.isTable) return;
        appendLine(outputGraphQL, generateWhereInterface(table.getWhereClass()));
    });
}
console.log("Writen Files:\n" + writtenFiles.join("\n"));


