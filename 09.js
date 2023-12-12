import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'


testPart1();
day9pt1();
//testPart2();
//day9pt2();


function day9pt1() {
    const content = readFileSync("09.input", "utf8")
    const input= parse(content)

    console.log(`day9pt1: ${}`)
}

function testPart1() {

}

function parse(content) {

}

function day9pt2() {
    const content = readFileSync("09.input", "utf8")
    const input= parse(content)

    console.log(`day9pt2: ${}`)
}