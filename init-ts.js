#!/usr/bin/env node
const Fs = require('fs/promises');
const fileExist = require('fs').existsSync;
const Path = require('path');

const msg = new Map([
    ['success', 'Typescript environment initialization SUCCESS!'],
    ['starting', 'Typescript environment initialization STARTED!'],
    ['src', 'Src dir created'],
    ['dist', 'Dist dir created'],
    ['README.md', 'README.md created'],
    ['tsconfig.json', 'tsconfig.json created'],
    ['package.json', 'package.json created'],
]);
msg.set('spacer', '-'.repeat(Math.max(...[...msg.values()].map(e => e.length))));

function getTsconfig() {
    const path = Path.join(__dirname, 'tsconfig-origin.json');
    return Fs.readFile(path, 'utf-8');
}
function getPackage() {
    const path = Path.join(__dirname, 'package-origin.json');
    return parseJson(path);
}
function parseJson(name) {
    return Fs.readFile(name, 'utf-8').then(data => JSON.parse(data));
}
function patchValMain(object) {
    object.main = './dist/index.js';
}
function patchValScripts(object) {
    if (!object.scripts || typeof object.scripts !== 'object') {
        object.scripts = {};
    }
    const ref = object.scripts;

    ref.prestart = 'tsc --build tsconfig.json';
    ref.start = 'node .';
}
function patchValName(object, name) {
    object.name = name;
}

function getFirstArg() {
    return process.argv[2] ?? 'no-name';
}

function normalizeJson(json) {
    return JSON.stringify(json, null, ' '.repeat(4));
}

function createFile(name, data) {
    return Fs.writeFile(name, data, 'utf-8').then(onResolve(name), onReject(name));
}
function createDir(name) {
    return Fs.mkdir(name).then(onResolve(name), onReject(name));
}

function log(data) {
    console.log(msg.get(data) ?? data);
}

function onResolve(data) {
    return () => log(data);
}
function onReject(data) {
    return () => log(data);
}

function fullPatch(source) {
    const name = getFirstArg();
    patchValName(source, name);
    patchValMain(source);
    patchValScripts(source);
}
async function makePackage() {

    const p_name = 'package.json';
    const source = await (fileExist(p_name) ? parseJson(p_name) : getPackage());
    fullPatch(source);
    const sourceStr = normalizeJson(source);
    await createFile(p_name, sourceStr);
}

(async function main() {

    log('spacer');
    log('starting');
    log('spacer');



    await createDir('src');
    await createDir('dist');
    await createFile('README.md');
    await createFile('tsconfig.json', await getTsconfig());
    await makePackage();

    log('spacer');
    log('success');
    log('spacer');

})()


