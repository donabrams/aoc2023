import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

/*

try to get a feel for using DP casually

took about 90 min

*/

const testData=`???.### 1,1,3
.??..??...?##. 1,1,3
?#?#?#?#?#?#?#? 1,3,1,6
????.#...#... 4,1,1
????.######..#####. 1,6,5
?###???????? 3,2,1`


testPart1();
day12pt1();
testPart2();
day12pt2();


function day12pt1() {
    const content = readFileSync("12.input", "utf8")
    const input = parse(content)
    const result = compute(input)
    console.log(`day12pt1 (compute): ${result}`)
}

function testPart1() {
    const input = parse(testData)
    assert(compute(input)===21)
}

function day12pt2() {
    const content = readFileSync("12.input", "utf8")
    const input = parse(content)
    const result = compute(unFoldData(input))
    console.log(`day12pt2: ${result}`)
}

function testPart2() {
    const input = parse(testData)
    const result = compute(unFoldData(input))
    assert(result===525152)
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
    // i in r of [.?#]
    const r = records.length+1;
    // j in g of int
    const g = contGroups.length+1;
    // k in l  of current contGroup consumed
    const l = contGroups.reduce((max, l)=>l > max ? l : max, 0)+1;

    // set up an r * g * l array
    const data = Array.from(Array(r), (i)=>
                    Array.from(Array(g), (j)=>
                        // in this l array, contGroups[j] has been consumed ${index} and has l[index] permutations
                        Array(l).fill(0)))

    // base case: 1 permutation that hasn't done anything yet
    data[0][0][0] = 1;

    // data[i] is calculated solely from data[i-1]
    for (let i = 1; i < r; i++) {
        const record = records[i-1];
        // in this j * l array, record is consumed
        for (let j = 0; j < g; j++) {

            // handle "." case
            if (record === "." || record === "?") {
                // only completed groups are included
                data[i][j][0] = data[i-1][j][0] + (j === 0 ? 0 : data[i-1][j-1][contGroups[j-1]])
            }

            // handle "#" case
            if (record === "#" || record === "?") {
                for (let k = 1; k <= contGroups[j]; k++) {
                    data[i][j][k] = data[i-1][j][k-1];
                }
            }
        }
    }
    const numPerms = data[r-1][g-2][contGroups[g-2]] + data[r-1][g-1][0];
    return numPerms;
}

function unFoldData(input) {
    const zeroToFour = [...Array(5).keys()];
    return input.map(({records, contGroups})=>{
        const unfoldedRecords = zeroToFour.flatMap((s)=>records.concat("?"));
        unfoldedRecords.pop(); // remove extra trailing ?
        return {
            records: unfoldedRecords,
            contGroups: zeroToFour.flatMap((s)=>contGroups),
        }
    })
}