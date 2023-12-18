import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

/*

*/

const testData=``


testPart1();
day13pt1();
//testPart2();
//day13pt2();


function day13pt1() {
    const content = readFileSync("13.input", "utf8")
    const input = parse(content)
    const result = compute(input)
    console.log(`day13pt1: ${result}`)
}

function testPart1() {
    const input = parse(testData)
    assert(compute(input))
}

function day13pt2() {
    const content = readFileSync("13.input", "utf8")
    const input = parse(content)
    const result = compute(unFoldData(input))
    console.log(`day13pt2: ${result}`)
}

function testPart2() {
    const input = parse(testData)
    const result = compute(unFoldData(input))
    assert(result)
}

function parse(content) {
    return content.split("\n").map(row => ({})
}

function compute(input) {
    return 0
}