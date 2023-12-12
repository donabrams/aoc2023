import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

const testData=``


testPart1();
day10pt1();

//testPart1();
//day10pt1();


function day10pt1() {
    const content = readFileSync("10.input", "utf8")
	const input = parse(testData)
	const result = compute(input)
    console.log(`day10pt1: ${result}`)
}

function testPart1() {
	const input = parse(testData)
	const result = compute(input)
	assert(result)
}

function parse(content) {
	return content;
}

function compute(d) {
	return;
}

function day10pt2() {
    const content = readFileSync("10.input", "utf8")
	const input = parse(testData)
	const result = compute(input)
    console.log(`day10pt2: ${result}`)
}

function testPart2() {
	const input = parse(testData)
	const result = compute(input)
	assert(result)
}