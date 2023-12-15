import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'
import { memoize, difference } from 'lodash-es'
import { default as G } from 'generatorics'

/*

Timing:

part 1: about an hour (mostly struggling to remember n choose k terminology)
part 2: 3 hours so far (10:24)

*/

const testData=`???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1`

const testData2=`?????#???? 6,1`

const zeroToFour = [...Array(5).keys()];

const getNumDistributionsMemo = memoize(getNumDistributions, (a, b) => {
    //console.log({memo: "memo", a, b, key: (a << 16) + b});
    return JSON.stringify([a, b]) // a << 16 + b
}) // hopefully b stays under 2^16 lol

assert(35===getNumDistributionsMemo(3, 5));
testCompute2();
testPart1();
day12pt1();
testPart2();
day12pt2();


function day12pt1() {
    const content = readFileSync("12.input", "utf8")
    const input = parse(content)
    const result = compute(input)
    console.log(`day12pt1 (compute): ${result}`)
    const result2 = compute2(input)
    console.log(`day12pt1 (compute2): ${result2}`)
}

function testPart1() {
    const input = parse(testData)
    assert(compute(input)===21)
    assert(compute2(input)===21)
}

function day12pt2() {
    const content = readFileSync("12.input", "utf8")
    const input = parse(content)
    const result = compute2(unFoldData(input))
    console.log(`day12pt2: ${result}`)
}

function testPart2() {
    const input = parse(testData)
    const result = compute2(unFoldData(input))
    assert(result===525152)
}

function testCompute2() {
    const input = parse(testData2)
    assert(compute(input)===6)
    assert(compute2(input)===6)

    const input2 = parse(readFileSync("12.input", "utf8"));
    return input2.map((row) => {
        const [a, b] = [computeRow(row), computeRow2(row)]
        //console.log({row, a, b});
        assert(a===b);
    })
    assert(compute2(unFoldData(input))===506250)
}

function parse(content) {
	return content.split("\n").map(row => {
		const [recordsStr, contGroupsStr] = row.split(" ");
		return {
			records: recordsStr.split(""),
			contGroups: contGroupsStr.split(",").map(s=>parseInt(s,10)),
		};
	})
}

function compute(input) {
	return input.reduce((sum, row) => {
		return sum + computeRow(row);
	}, 0);
}
function computeRow(row) {
    const { records, contGroups } = row;
    const totalDamaged = contGroups.reduce((s, l)=>s+l, 0);
    const knownDamaged = records.filter(r=>r==="#").length;
    const toFind = totalDamaged-knownDamaged;
    const totalUnknown = records.filter(r=>r==="?").length;

    console.log({
        n: totalUnknown, 
        k: toFind, 
        numToTest: G.choices(totalUnknown, toFind, {replace: false, ordered:false})});

    const combos = G.combination([...Array(totalUnknown).keys()], toFind);
    const regex = new RegExp("^\.*" + contGroups.map(n=>`[#]{${n}}`).join("\.+") + "\.*$");

    let numValidPermutations = 0;

    let c = 0;
    for (let p of combos) {
        let i = 0;
        let pi = 0;
        const s = records.reduce((str,r) => {
            if (r !== "?") {
                return str + r;
            } else if (pi < toFind && p[pi] === i) {
                pi++;
                i++;
                return str + "#"
            } else {
                i++;
                return str + "."
            }
        }, "")
        if (regex.test(s)) {
            numValidPermutations++
        }
        c++
        if (c % 1000000 === 0) { //log every million
            process.stdout.write(".")
        }
    };
    //console.log({ records: records.join(""), contGroups, numValidPermutations })
    return numValidPermutations;
}

function compute2(input) {
    //console.log({length: input.length});
    return input.reduce((sum, row) => {
        return sum + computeRow2(row);
    }, 0)
}

function computeRow2(row) {
    const { records, contGroups } = row;
    console.log({row: records.join(""), contGroups});

    const segments = getSegments(records);
    const initialRun = { numPerm: 1, contGroupIndex: 0, numToConsume: contGroups[0], needsSpace: false };
    const finalRuns = segments.reduce((runs, segment) => {
        const mu = process.memoryUsage();
        console.log({ segment, runs: runs.length, avg: mu.heapUsed/runs.length });
        if (segment.type === "#") {
            if (segment.isTerminal) {
                //console.log({"a#":"a#"})
                return runs.filter(({numToConsume})=> numToConsume === segment.len)
                    // completes entire contigous size and the "."/ EOL is a given since this is terminal
                    .map(({numPerm, contGroupIndex})=>({
                        numPerm,
                        contGroupIndex: contGroupIndex + 1,
                        numToConsume: contGroups[contGroupIndex + 1]
                    }))
            } else {
                //console.log({"b#":"b#"})
                return runs.filter(({numToConsume})=> numToConsume >= segment.len)
                    .map(({numPerm, contGroupIndex, numToConsume})=> numToConsume === segment.len
                        // completes entire contigous size, but needs a "." or EOL
                        ? { numPerm,
                            contGroupIndex: contGroupIndex + 1,
                            numToConsume: contGroups[contGroupIndex + 1],
                            needsSpace: true }
                        // has more left to consume
                        : { numPerm,
                            contGroupIndex,
                            numToConsume: numToConsume - segment.len })
            }
        } else { // if segment.type === "?"
            return runs.flatMap(({ numPerm, contGroupIndex, numToConsume, needsSpace }) => {
                const newRuns = [];

                if (contGroupIndex === contGroups.length || numToConsume === contGroups[contGroupIndex]) {
                    // add an all "." run for completed runs and non-consumed runs
                    newRuns.push({
                        numPerm,
                        contGroupIndex,
                        numToConsume
                    })
                    //console.log({a:newRuns.length})
                }

                // handle final case here
                if (contGroupIndex === contGroups.length) return newRuns;


                // space is the length of the ? segment that isn't taken up by # or the needed separating .
                let space = (needsSpace ? segment.len - 1 : segment.len);
                // toConsider is the contiguousGroup
                let toConsider = contGroupIndex;
                // this is the base index (used to calculate all the ways we can distribute space around contGroups)
                let baseIndex = contGroupIndex-1;

                // if we're already consuming a contiguous space we need to finish it
                if (numToConsume !== contGroups[toConsider]) {
                    // note that it doesn't consume the trailing '.'
                    space -= numToConsume;
                    toConsider++;
                    // since we can't distribute space before this group, we increment baseIndex
                    baseIndex++;

                    if (space < 0 && !segment.isTerminal) {
                        // if we can only consume part of the cont Group
                        newRuns.push({ numPerm,
                            contGroupIndex,
                            numToConsume: numToConsume - segment.len })
                        //console.log({b:newRuns.length})
                    } else if (space === 0 && segment.isTerminal) {
                        // we can only use up all the space if the next run isn't a '#'
                        newRuns.push({ numPerm,
                            contGroupIndex: toConsider,
                            numToConsume: contGroups[toConsider] })
                        //console.log({c:newRuns.length})
                    } else if (space > 0) {
                        // this finishes the group then adds all "."
                        newRuns.push({ numPerm,
                            contGroupIndex: toConsider,
                            numToConsume: contGroups[toConsider] })
                        //console.log({d:newRuns.length})
                    }
                    // put a '.' after anything consumed
                    space -= 1
                }

                // for each loop, we look at toConsider and 
                // calculate all the ways we can consume 
                while (space >= 0) {
                    const extraSpace = space - contGroups[toConsider] - (segment.isTerminal ? 0 : 1);
                    //console.log({space, toConsider, extraSpace, isTerminal: !!segment.isTerminal});

                    if (extraSpace >= 0) {
                        const combos = extraSpace === 0 ? 1 : getNumDistributionsMemo(extraSpace, toConsider - baseIndex + 1)
                        // full consumption
                        newRuns.push({
                            numPerm: numPerm * combos,
                            contGroupIndex: toConsider + 1,
                            numToConsume: contGroups[toConsider + 1] })
                        //console.log({e:newRuns.length, combos, in: {numSpaces: extraSpace, numPlaces: toConsider - baseIndex + 1}})
                    }

                    if (!segment.isTerminal) {
                        // partial consumption
                        const maxConsumption = extraSpace >= 0 ? contGroups[toConsider] : space;
                        //console.log({extraSpace, space, groupSize: contGroups[toConsider], maxConsumption})
                        for (let toConsume = 1; toConsume <= maxConsumption; toConsume++) {
                            // i is the amount we're consuming
                            newRuns.push({
                                numPerm: numPerm * getNumDistributionsMemo(space - toConsume, toConsider - baseIndex), 
                                contGroupIndex: toConsider,
                                numToConsume: contGroups[toConsider]-toConsume })
                        }
                        //console.log({f:newRuns.length})
                    }

                    // remove the space of the group we just considered as well as the preceeding "."
                    space -= (contGroups[toConsider] + 1)

                    // consider the next group
                    toConsider++

                    // no more groups to consume, so break!
                    if (toConsider === contGroups.length) break;
                }

                //console.log({before: newRuns.length})
                //console.log({run: {numPerm, contGroupIndex, numToConsume, needsSpace}, newRuns})

                const dedupedRuns = Object.values(newRuns.reduce((cache, run)=>{
                    const key = JSON.stringify(run)
                    if (!cache[key]) {
                        cache[key] = run;
                    } else {
                        cache[key].numPerm += run.numPerm;
                    }
                    return cache
                }, {}))

                //console.log({after: dedupedRuns.length})
                return dedupedRuns;
            })
        }
    }, [initialRun])

    const totalPerm = finalRuns.filter(({contGroupIndex})=> contGroupIndex === contGroups.length)
        .reduce((sum, {numPerm})=>sum+numPerm, 0);
    //console.log({row: records.join(""), contGroups, totalPerm})
    return totalPerm;
}

// segments are either groups of all ? or #
function getSegments(records) {
    // split the records by "." to create segments with just ? and #
    return records.join("").split(/\.+/).filter(t=>t.length)
        .flatMap((segment)=> {
            const subSegments = [];
            // set the type of a segment as either ? or # as appropriate
            let s = { type: segment[0], len: 1};
            for (let i = 1; i < segment.length; i++) {
                if (s.type === segment[i]) {
                    s.len++
                } else {
                    subSegments.push(s)
                    s = { type: segment[i], len: 1 }
                }
            }
            // mark any group followed by a "." as terminal
            s.isTerminal = true;
            subSegments.push(s);
            return subSegments;
        })
}

function getNumDistributions(numSpaces, numPlaces) {
    if (numSpaces === 0)
        return 1
    if (numPlaces === 0)
        throw new Error("numPlaces should be more than 0")
    if (numPlaces === 1)
        return 1;

    //console.log({numSpaces, numPlaces});

    /* (r + n − 1)! / r!(n − 1)! => a!/b!/c!*/
    const a = [...Array(numSpaces + numPlaces - 1).keys()].map(n=>n+1);
    const b = [...Array(numSpaces).keys()].map(n=>n+1);
    const c = [...Array(numPlaces - 1).keys()].map(n=>n+1);

    //console.log({a, b, c})

    const a_reduced = difference(a, b);
    const a_reduced2 = difference(a_reduced, c);
    const b_reduced = difference(b, a);
    const c_reduced = difference(c, a_reduced);
    const b_reduced2 = difference(b_reduced, c_reduced);
    const c_reduced2 = difference(c_reduced, b_reduced);

    //console.log({a_reduced, b_reduced, c_reduced})
    //console.log({a_reduced2, b_reduced2, c_reduced2})

    const a_fac = a_reduced2.reduce((s,n)=>s*n, 1);
    const b_fac = b_reduced2.reduce((s,n)=>s*n, 1);
    const c_fac = c_reduced2.reduce((s,n)=>s*n, 1);


    //console.log({a_fac, b_fac, c_fac})

    const combinations = a_fac / b_fac / c_fac;

    //console.log({combinations})

    return combinations;
}

function unFoldData(input) {
	return input.map(({records, contGroups})=>{
		const unfoldedRecords = zeroToFour.flatMap((s)=>records.concat("?"));
		unfoldedRecords.pop(); // remove extra trailing ?
		return {
			records: unfoldedRecords,
			contGroups: zeroToFour.flatMap((s)=>contGroups),
		}
	})
}