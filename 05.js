import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

/*

Time splits:
        split        since start
Part 1: 00:42:23.636	00:42:23.636
Part 2: 00:17:52.934	01:00:16.570

*/

const example = `seeds: 79 14 55 13

seed-to-soil map:
50 98 2
52 50 48

soil-to-fertilizer map:
0 15 37
37 52 2
39 0 15

fertilizer-to-water map:
49 53 8
0 11 42
42 0 7
57 7 4

water-to-light map:
88 18 7
18 25 70

light-to-temperature map:
45 77 23
81 45 19
68 64 13

temperature-to-humidity map:
0 69 1
1 0 69

humidity-to-location map:
60 56 37
56 93 4`

testParseConfig();
testGetDest();
day5pt1();
day5pt2();

function day5pt1() {
    const content = readFileSync("05.input", "utf8")
    const config = parseConfig(content);
    const minLocation = config.seeds.reduce((minLocation, seed) => {
    	let cur = { type: 'seed', value: seed};
    	while (cur.type != 'location') {
    		cur = getDest(config.maps, cur.type, cur.value);
    	}
    	return cur.value < minLocation
    		? cur.value
    		: minLocation
    }, Number.MAX_SAFE_INTEGER);
    console.log(`day5pt1: ${minLocation}`)
}

function day5pt2() {
    const content = readFileSync("05.input", "utf8")
    const config = parseConfig(content);
    let minLocation = Number.MAX_SAFE_INTEGER;

    while(config.seeds.length) {
    	const seeds = [config.seeds.shift(), config.seeds.shift()];
    	console.log("\n" + seeds[0]);
    	const max = seeds[0]+ seeds[1];
    	for (let v = seeds[0]; v<max;v++) {
    		let cur = { type: 'seed', value: v};
	    	while (cur.type != 'location') {
	    		cur = getDest(config.maps, cur.type, cur.value);
	    	}
	    	if (cur.value < minLocation) {
	    		minLocation = cur.value;
	    	}
	    	if (v % 1000000 === 0) { //log every million
	    		process.stdout.write(".")
	    	}
    	}
    }
    console.log(`day5pt2: ${minLocation}`)
}


function testParseConfig() {
	const config = parseConfig(example)
	assert(JSON.stringify(config.seeds) === JSON.stringify([79, 14, 55, 13]));
}

function testGetDest() {
	const config = parseConfig(example)
	let dest = getDest(config.maps, "seed", config.seeds[0])
	assert(dest.value === 81)
	assert(dest.type === 'soil')
	dest = getDest(config.maps, "seed", 98)
	assert(dest.value === 50)
	assert(dest.type === 'soil')
	dest = getDest(config.maps, "seed", 0)
	assert(dest.value === 0)
	assert(dest.type === 'soil')
}

function parseConfig(str) {
	const lines = str.split("\n");
	const seeds = lines[0].split(":")[1].trim().split(/\s+/).map(s=>parseInt(s, 10))

	lines.shift();
	lines.shift();

	let line;
	let ranges;
	const maps = {};

	while (lines.length) {
		line = lines.shift();
		if (line.includes("-to-")) {
			const [_, src, dest] = line.match(/(\w+)-to-(\w+) map:/)
			ranges = [];
			maps[src] = {
				dest,
				ranges,
			}
		} else if (line.length) {
			const [_, destStart, srcStart, rangeLength] = line.match(/(\d+) (\d+) (\d+)/)
			ranges.push({
				destStart: parseInt(destStart, 10),
				srcStart: parseInt(srcStart, 10),
				rangeLength: parseInt(rangeLength, 10),
			});
		}
	}
	return {
		seeds,
		maps
	}
}

function getDest(maps, type, value) {
	const {dest, ranges} = maps[type];
	const range = ranges.find(({srcStart, rangeLength}) => (value >= srcStart) && (value < srcStart+rangeLength));
	return {
		type: dest,
		value: range ? range.destStart + value - range.srcStart : value
	};
}