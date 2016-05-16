import * as TsTypeInfo from "ts-type-info";
import { camelToUnderscore } from "common-ts/lib/core";
import fs = require("fs");
import * as Path from "path";

function convertMethodName(name: string): string {
    const noGet = name.replace("get", "");
    return noGet.slice(0, 1).toLowerCase() + noGet.slice(1);
}

function appendLine(path: string, line: string) {
    fs.appendFileSync(path, line + "\n");
}

/** For a specific class, for each many relationship add the specified line through the callback, same for each one-to-one */
function mapClassMembers(
    c: TsTypeInfo.ClassDefinition,
    hasMany: (d: TsTypeInfo.DecoratorDefinition, p: TsTypeInfo.ClassMethodDefinition) => string,
    hasOne: (d: TsTypeInfo.DecoratorDefinition, p: TsTypeInfo.ClassPropertyDefinition) => string)
    : string {
    let buffer = "";
    for (let p of c.methods || []) {
        if (!p.decorators || p.decorators.length === 0) continue;
        for (let d of p.decorators) {
            if (d.name === "hasMany") {
                buffer += hasMany(d, p) + "\n";
            }
        }
    }
    for (let p of c.properties || []) {
        if (!p.decorators || p.decorators.length === 0) continue;
        for (let d of p.decorators) {
            if (d.name === "hasOne") {
                if (d.arguments.length > 2) console.log("Prop " + p.name + " " + hasOne(d, p));
                buffer += hasOne(d, p) + "\n";
            }
        }
    }
    return buffer;
}

/** Convert the name of the class to the schema key name used for normalizr */
function classNameToNormalizr(typeName: string): string {
    let normVarName = typeName;
    if (normVarName.startsWith("I")) normVarName = normVarName.slice(1);
    normVarName = normVarName.charAt(0).toLowerCase() + normVarName.slice(1);
    return normVarName;
};

function getPrimitives(classDef: TsTypeInfo.ClassDefinition): string {
    let props = [];
    if (classDef.extendsTypeExpressions && classDef.extendsTypeExpressions.length > 0) {
        props = props.concat((classDef.extendsTypeExpressions[0].types[0].definitions[0] as TsTypeInfo.ClassDefinition).properties);
    }
    props = props.concat(classDef.properties);
    const typeDef = `type ${classDef.name}Primitives = ${props.map(prop => "\"" + prop.name + "\"").join(" | ")};`;
    const allProps = `const ${classDef.name}All = [${props.map(prop => "\"" + prop.name + "\"").join(", ")}];`;
    return typeDef + "\n" + allProps + "\n\n";
}

function getQueryClass(c: TsTypeInfo.ClassDefinition, whereClass: string): string {
    let buffer = "";
    buffer += `export class ${c.name}Query extends Query {\n`;
    buffer += `\tconstructor( primitives: ${c.name}Primitives[], nested: ${c.name}Nested = null, where: ${whereClass} | {id:string} = null, options = {}) {
            super(primitives,nested as Dict<Query>,where);
         }\n`;
    buffer += "}\n\n";
    return buffer;
}

function getNestedClass(collectClass: TsTypeInfo.ClassDefinition): string {
    let buffer = "";
    buffer += `export interface ${collectClass.name}Nested {\n`;
    buffer += mapClassMembers(collectClass,
        (d, p) => `\t${convertMethodName(p.name)}?: ${p.returnTypeExpression.types[0].typeArguments[0].text}Query;`,
        (d, p) => `\t${((d.arguments[2] && d.arguments[2].text) || p.name.replace("_id", "").replace("_code", "")).replace(/\"/g, "")}?: ${d.arguments[0].text}Query;`
    );
    buffer += "}\n";
    return buffer;
}

function getNormalizrDefine(collectClass: TsTypeInfo.ClassDefinition): string {
    let buffer = "";
    let normVarName = classNameToNormalizr(collectClass.name);
    buffer += `${normVarName}.define({\n`;
    buffer += mapClassMembers(collectClass,
        (d, p) => `\t${convertMethodName(p.name)} : arrayOf(${classNameToNormalizr(p.returnTypeExpression.types[0].typeArguments[0].text)}),`,
        (d, p) => `\t${((d.arguments[2] && d.arguments[2].text) || p.name.replace("_id", "").replace("_code", "")).replace(/\"/g, "")} : ${classNameToNormalizr(d.arguments[0].text)},`);
    buffer += "});\n";
    return buffer;
}

function getWhereInterface(collectClass: TsTypeInfo.ClassDefinition): string {
    let buffer = "";
    buffer += `export interface ${collectClass.name} extends GraphQLWhere {\n`;
    buffer += collectClass.properties.map(p => `\t${p.name}? : ${p.typeExpression.text};`).join('\n')+"\n";
    buffer += "}\n\n";
    return buffer;
}

////////////////////
if (process.argv.length < 3) {
    console.log("Usage: generate-query-classes <filename.ts>");
    process.exit();
}

const inputFilenames = process.argv.slice(2).map(arg => Path.resolve(process.cwd() + "/" + arg));
const mainFilename = inputFilenames[inputFilenames.length - 1];
const outputFilename = mainFilename.replace(".ts", ".query.ts");
const justFilename = Path.basename(mainFilename);

const gd = TsTypeInfo.getInfoFromFiles(inputFilenames);
const modelFile = gd.files.find(ff => Path.resolve(ff.fileName) === mainFilename);
const root = modelFile.classes.find(i => !!i.decorators.find(d => d.name === "root"));
if (!root) {
    console.error("Cannot find a class with the decorator `root`")
}
console.log(`Processing ${mainFilename} for ${root.name}`);

const outputPath = outputFilename;
if (fs.existsSync(outputPath)) {
    fs.truncateSync(outputPath);
}
appendLine(outputPath, "import { Query, GraphQLWhere } from \"refluxion\"");
appendLine(outputPath, "import { normalize, Schema, arrayOf, valuesOf } from \"normalizr\";");
appendLine(outputPath, `import * as Model from "./${justFilename}";`);

for (let p of root.properties) {
    const dec = p.decorators.find(d => d.name === "queryBy");
    if (!dec) continue;
    const whereClassName = dec.arguments[0].text;
    if (!whereClassName) continue;
    const whereClass = modelFile.classes.find(c => c.name === whereClassName);
    if (!whereClass) continue;

    let collectType = p.typeExpression.text;
    if (collectType.startsWith("Dict")) collectType = collectType.replace("Dict<", "").replace(">", "");
    console.log("collect:" + collectType);
    const collectClass = modelFile.classes.find(c => c.name === collectType);
    if (!collectClass) {
        console.error(`Cannot find type of Property ${p.name}: ${collectType}`)
    }
    appendLine(outputPath, `export var ${classNameToNormalizr(collectType)} = new Schema(\"${p.name}\");`);
}

for (let p of root.properties) {
    const dec = p.decorators.find(d => d.name === "queryBy");
    if (!dec) continue;
    const whereClassName = dec.arguments[0].text;
    if (!whereClassName) continue;
    const whereClass = modelFile.classes.find(c => c.name === whereClassName);
    if (!whereClass) continue;

    let collectType = p.typeExpression.text;
    if (collectType.startsWith("Dict")) collectType = collectType.replace("Dict<", "").replace(">", "");
    console.log("collect:" + collectType);
    const collectClass = modelFile.classes.find(c => c.name === collectType);
    if (!collectClass) {
        console.error(`Cannot find type of Property ${p.name}: ${collectType}`)
    }
    appendLine(outputPath, getWhereInterface(whereClass));
    appendLine(outputPath, getPrimitives(collectClass));
    appendLine(outputPath, getQueryClass(collectClass, whereClassName));
    appendLine(outputPath, getNestedClass(collectClass));
    appendLine(outputPath, getNormalizrDefine(collectClass));

}
console.log("Written File " + outputPath);

