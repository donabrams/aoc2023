import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'
import { default as lcm } from 'compute-lcm';

/*
    absolute    lap
1	26:19.16	26:19.16
2	54:34.37	28:15.20

*/

const testData = `RL

AAA = (BBB, CCC)
BBB = (DDD, EEE)
CCC = (ZZZ, GGG)
DDD = (DDD, DDD)
EEE = (EEE, EEE)
GGG = (GGG, GGG)
ZZZ = (ZZZ, ZZZ)`

const testData2 = `LLR

AAA = (BBB, BBB)
BBB = (AAA, ZZZ)
ZZZ = (ZZZ, ZZZ)`

const testData3 = `LR

11A = (11B, XXX)
11B = (XXX, 11Z)
11Z = (11B, XXX)
22A = (22B, XXX)
22B = (22C, 22C)
22C = (22Z, 22Z)
22Z = (22B, 22B)
XXX = (XXX, XXX)`

const linePattern = /(\w+)\s+=\s+\((\w+),\s+(\w+)\)/
const ghostStart = /A$/
const ghostEnd = /Z$/

//testPart1();
//testPart1b();
//day8pt1();
testPart2();
day8pt2();

function day8pt1() {
    const content = readFileSync("08.input", "utf8")
    const {directions, map} = parse(content)
    let cur = 'AAA'
    let numSteps = 0;
    let dirIndex = 0;
    while (cur !== 'ZZZ') {
    	if (dirIndex >= directions.length) {
    		dirIndex = 0;
    	}
    	cur = map[cur][directions[dirIndex]];
    	dirIndex++
    	numSteps++
    }
    console.log(`day8pt1: ${numSteps}`)
}

function testPart1() {
    let {directions, map} = parse(testData)
    let cur = 'AAA'
    let numSteps = 0;
    let dirIndex = 0;
    while (cur !== 'ZZZ') {
    	if (dirIndex >= directions.length) {
    		dirIndex = 0;
    	}
    	cur = map[cur][directions[dirIndex]];
    	dirIndex++
    	numSteps++
    }
    assert(numSteps==2);
}

function testPart1b() {
    let {directions, map} = parse(testData2)
    let cur = 'AAA'
    let numSteps = 0;
    let dirIndex = 0;
    while (cur !== 'ZZZ') {
    	if (dirIndex >= directions.length) {
    		dirIndex = 0;
    	}
    	cur = map[cur][directions[dirIndex]];
    	dirIndex++
    	numSteps++
    }
    assert(numSteps==6);
}

function parse(str) {
	const lines = str.split("\n")
	const directions = lines.shift().split("")
	lines.shift()
	const map = {}
	let line
	while (line = lines.shift()) {
		const [_, location, L, R] = line.match(linePattern);
		map[location] = {L, R};
	}
	return {
		directions,
		map
	};
}


function day8pt2() {
    const content = readFileSync("08.input", "utf8")
    const {directions, map} = parse(content)
    let start = Object.keys(map).filter((s)=>ghostStart.test(s))
    const cycles = start.map((startLoc) => {
	    let cur = startLoc
	    let numSteps = 0;
	    let dirIndex = 0;
	    while (!ghostEnd.test(cur)) {
	    	if (dirIndex >= directions.length) {
	    		dirIndex = 0;
	    	}
	    	cur = map[cur][directions[dirIndex]];
	    	dirIndex++
	    	numSteps++
	    }
	    return numSteps;
    })
    cycles.forEach(c=> assert(0 === c%directions.length));
    const lcmCycles = lcm(cycles)
    console.log(`day8pt2: ${lcmCycles}`)
}

function testPart2() {
    const {directions, map} = parse(testData3)
    let cur = Object.keys(map).filter((s)=>ghostStart.test(s))
    let numSteps = 0;
    let dirIndex = 0;
    while (!cur.every((s)=>ghostEnd.test(s))) {
    	console.log(cur);
    	if (dirIndex >= directions.length) {
    		dirIndex = 0;
    	}
    	cur = cur.map(loc => map[loc][directions[dirIndex]]);
    	dirIndex++
    	numSteps++
    }
    console.log(cur);
    console.log("\n");
    assert(numSteps==6);

    let start = Object.keys(map).filter((s)=>ghostStart.test(s))
    const cycles = start.map((startLoc) => {
	    let cur = startLoc
	    let numSteps = 0;
	    let dirIndex = 0;
	    while (!ghostEnd.test(cur)) {
	    	if (dirIndex >= directions.length) {
	    		dirIndex = 0;
	    	}
	    	cur = map[cur][directions[dirIndex]];
	    	dirIndex++
	    	numSteps++
	    }
	    return numSteps;
    })
    console.log({cycles});
    const numDirCycles = cycles.map(c=> c/directions.length)
    console.log({numDirCycles});
}