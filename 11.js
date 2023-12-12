import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

/*

Timing:
part1	42:26.93	42:26.93
part2	49:33.53	07:06.60

*/

const testData=`...#......
.......#..
#.........
..........
......#...
.#........
.........#
..........
.......#..
#...#.....`


testPart1();
day11pt1();


testPart2();
day11pt2();


function day11pt1() {
    const content = readFileSync("11.input", "utf8")
    const input = parse(content)
    const result = compute(input)
    console.log(`day11pt1: ${result}`)
}

function testPart1() {
    const input = parse(testData)
    const result = compute(input)
    assert(result===374)
}


function parse(content) {
	return content.split("\n").map(rowStr => rowStr.split("").map(s=>s==="#"))
}

function compute(input, distortionFactor=2) {
	const h = input.length;
	const w = input[0].length;
	const rawGalaxies = input.flatMap((row, i)=>row.map((isGalaxy, j)=>isGalaxy ? [i,j] : null).filter(s=>s))
	const blankRows = [...Array(h).keys()].filter((i) => !rawGalaxies.some(([r]) => r === i));
	const blankColumns = [...Array(w).keys()].filter((i) => !rawGalaxies.some(([_, c]) => c === i));
	const galaxies = rawGalaxies.map(([r, c])=>[
		r + (blankRows.filter((br)=> r > br).length * (distortionFactor-1)),
		c + (blankColumns.filter((bc)=> c > bc).length * (distortionFactor-1)),
	]);
	let sum = 0;
	for (let i = 0; i < galaxies.length; i++) {
		const [ir, ic] = galaxies[i];
		for (let j = i+1; j < galaxies.length; j++) {
			const [jr, jc] = galaxies[j];
			const dist = (ir > jr ? (ir - jr) : (jr - ir))
				+ (ic > jc ? (ic - jc) : (jc - ic))
			sum += dist
		}
	}
	return sum;
}

function day11pt2() {
    const content = readFileSync("11.input", "utf8")
    const input = parse(content)
    const result = compute(input,1000000)
    console.log(`day11pt2: ${result}`)
}

function testPart2() {
    const input = parse(testData)
    console.log({x10: compute(input, 10), x100: compute(input, 100)});
    assert(compute(input, 10)===1030)
    assert(compute(input, 100)===8410)
}