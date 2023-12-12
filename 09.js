import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

/*
Timing:

1	22:22.29	22:22.29
2	28:43.10	06:20.81

*/


const testData=`0 3 6 9 12 15
1 3 6 10 15 21
10 13 16 21 30 45`

testPart1();
day9pt1();
testPart2();
day9pt2();


function day9pt1() {
    const content = readFileSync("09.input", "utf8")
    const arrays= parse(content)
	const score = arrays.reduce((sum,ary) => sum + nextVal(ary), 0)
    console.log(`day9pt1: ${score}`)
}

function testPart1() {
	const arrays = parse(testData)
	const score = arrays.reduce((sum,ary) => sum + nextVal(ary), 0)
	assert(score === 114)
}

function parse(content) {
	return content.split("\n").map(line => line.split(" ").map(s=>parseInt(s, 10)))
}

function nextVal(ary) {
	const diffs = []
	ary.forEach((v, i) => {
		if (i > 0) {
			diffs.push(v - ary[i-1]);
		}
	})
	return ary.pop() + 
		(diffs.every(v=>0===v)
			? 0
			: nextVal(diffs))
}
function prevVal(ary) {
	const diffs = []
	ary.forEach((v, i) => {
		if (i > 0) {
			diffs.push(v - ary[i-1]);
		}
	})
	return ary[0] - 
		(diffs.every(v=>0===v)
			? 0
			: prevVal(diffs))
}

function day9pt2() {
    const content = readFileSync("09.input", "utf8")
    const arrays = parse(content)
	const score = arrays.reduce((sum,ary) => sum + prevVal(ary), 0)
    console.log(`day9pt2: ${score}`)
}


function testPart2() {
	const arrays = parse(testData)
	const score = arrays.reduce((sum,ary) => sum + prevVal(ary), 0)
	assert(score === 2)
}