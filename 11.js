import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

const testData=``


testPart1();
day11pt1();


//testPart2();
//day11pt2();


function day11pt1() {
    const content = readFileSync("11.input", "utf8")
    const input = parse(content)
    const result = compute(input)
    console.log(`day11pt1: ${result}`)
}

function testPart1() {
    const input = parse(testData)
    const result = compute(input)
    assert(result)
}


function parse(content) {
}

function compute(input) {
}

function day11pt2() {
    const content = readFileSync("11.input", "utf8")
    const input = parse(content)
    const result = compute(input)
    console.log(`day11pt1: ${result}`)
}

function testPart2() {
    const input = parse(testData)
    const result = compute(input)
    assert(result)
}