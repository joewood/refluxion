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
    hasOne: (d: TsTypeInfo.DecoratorDefinition, p: TsTypeInfo.ClassPropertyDefinition) => string) {
    for (let p of c.methods || []) {
        if (!p.decorators || p.decorators.length === 0) continue;
        for (let d of p.decorators) {
            if (d.name === "hasMany") {
                appendLine(outputPath, hasMany(d, p));
            }
        }
    }
    for (let p of c.properties || []) {
        if (!p.decorators || p.decorators.length === 0) continue;
        for (let d of p.decorators) {
            if (d.name === "hasOne") {
                if (d.arguments.length > 2) console.log("Prop " + p.name + " " + hasOne(d, p));
                appendLine(outputPath, hasOne(d, p));
            }
        }
    }
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

function getQueryClass(c: TsTypeInfo.ClassDefinition, whereClass:string): string {
    let buffer = "";
    buffer += `export class ${c.name}Query extends Query {\n`;
    buffer += `\tconstructor( primitives: ${c.name}Primitives[], nested: ${c.name}Nested, where: ${whereClass}, options = {}) {
            super(primitives,nested as Dict<Query>,where);
         }\n`;
    buffer += "}\n\n";
    return buffer;
}

////////////////////
if (process.argv.length < 3) {
    console.log("Usage: generate-query-classes <filename.ts>");
    process.exit();
}

const file = Path.resolve(process.cwd() + "/" + process.argv[2]);

const outputFile = file.replace(".ts", ".query.ts");
const gd = TsTypeInfo.getInfoFromFiles([file]);


const modelFile = gd.files.find(ff => Path.resolve(ff.fileName) === file);
const root = modelFile.classes.find(i => !!i.decorators.find(d => d.name === "root"));
if (!root) {
    console.error("Cannot find a class with the decorator `root`")
}
console.log(`Processing ${file} for ${root.name}`);

const outputPath = outputFile;
if (fs.existsSync(outputPath)) {
    fs.truncateSync(outputPath);
}
appendLine(outputPath, "import { Query } from \"./query\";");
appendLine(outputPath, "import { normalize, Schema, arrayOf, valuesOf } from \"normalizr\";");

for (let p of root.properties) {
    const dec = p.decorators.find(d => d.name === "queryBy");
    if (!dec) continue;
    const whereTypeName = dec.arguments[0].text;
    if (!whereTypeName) continue;
    const whereInterface = modelFile.interfaces.find(c => c.name === whereTypeName);
    if (!whereInterface) continue;
    const collectType = p.typeExpression.text;
    const collectClass = modelFile.classes.find( c=> c.name===collectType);
    appendLine(outputPath, `export const ${classNameToNormalizr(p.typeExpression.text)} = new Schema(\"${p.name}\");`);

    appendLine(outputPath, getPrimitives(collectClass));
    appendLine(outputPath, getQueryClass(collectClass,whereTypeName));
    


    appendLine(outputPath, `export interface ${collectClass.name}Nested {`);
    mapClassMembers(collectClass,
        (d, p) => `\t${convertMethodName(p.name)}?: ${p.returnTypeExpression.types[0].typeArguments[0].text}Query;`,
        (d, p) => `\t${((d.arguments[2] && d.arguments[2].text) || p.name.replace("_id", "").replace("_code", "")).replace(/\"/g, "")}?: ${d.arguments[0].text}Query;`
    );
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
    let normVarName = classNameToNormalizr(collectType);
    appendLine(outputPath, `${normVarName}.define({`);
    mapClassMembers(collectClass,
        (d, p) => `\t${convertMethodName(p.name)} : arrayOf(${classNameToNormalizr(p.returnTypeExpression.types[0].typeArguments[0].text)}),`,
        (d, p) => `\t${((d.arguments[2] && d.arguments[2].text) || p.name.replace("_id", "").replace("_code", "")).replace(/\"/g, "")} : ${classNameToNormalizr(d.arguments[0].text)},`);
    appendLine(outputPath, "});\n");
}
console.log("Written File " + outputPath);

