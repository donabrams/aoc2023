import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

/*
 part one in 2h04m


*/

const testData=`#.##..##.
..#.##.#.
##......#
##......#
..#.##.#.
..##..##.
#.#.##.#.

#...##..#
#....#..#
..##..###
#####.##.
#####.##.
..##..###
#....#..#`


testPart1();
day13pt1();
testPart2();
day13pt2();


function day13pt1() {
    const content = readFileSync("13.input", "utf8")
    const input = parse(content)
    const result = compute(input)
    console.log(`day13pt1: ${result}`)
}

function testPart1() {
    const input = parse(testData)
    assert(JSON.stringify(input[0])===JSON.stringify(transpose(transpose(input[0]))))
    assert(compute(input)===405)

}

function day13pt2() {
    const content = readFileSync("13.input", "utf8")
    const input = parse(content)
    const result = getSmudgedPatternScore(input)
    console.log(`day13pt2: ${result}`)
}

function testPart2() {
    const input = parse(testData)
    const result = getSmudgedPatternScore(input)
    assert(result===400)
}

function parse(content) {
    const pattern = [];
    return content.split("\n").reduce((acc, line) => {
        const { patterns, pattern } = acc;
        if (!line.length) {
            const pattern = [];
            patterns.push(pattern);
            return { patterns, pattern};
        } else {
            pattern.push(line.split(""));
            return acc;
        }
    }, { patterns: [pattern], pattern }).patterns;
}

function compute(patterns) {
    return patterns.reduce((sum, pattern) => sum + 
        getReflections(pattern).reduce((sum, col)=>sum+col, 0) + 
        getReflections(transpose(pattern)).reduce((sum, col)=>sum+col, 0) * 100,
    0)
}

function transpose(input) {
    const i = input.length;
    return Array.from([...Array(input[0].length).keys()], (i)=>input.map((r)=>r[i]));
}

function getReflections(pattern) {
    const n = pattern.length;
    const m = pattern[0].length

    // approach: start with all candidate reflections, then iterate through each row and remove those that don't reflect
    const allPossibleReflections = [];
    for (let i = 1; i < m;i++) {
        allPossibleReflections.push(i);
    }

    return pattern.reduce((candidates, row) => candidates.filter((col) => {
        const max = m < (col + col) ? m : (col + col);
        for (let i = col, j=col-1; i < max; i++, j--) {
            if (row[i] !== row[j]) {
                return false;
            }
        }
        return true;
    }), allPossibleReflections);
}



function getSmudgedPatternScore(patterns) {
    return patterns.reduce((sum, p) => {
        const tp = transpose(p);
        let smudge = getSmudge(p);
        if (smudge) {
            return sum + smudge[2];
        } else {
            const tp = transpose(p);
            smudge = getSmudge(tp);
            return sum + 100 * smudge[2]
        }
    }, 0)
}

function getSmudge(pattern) {
    const n = pattern.length
    const m = pattern[0].length

    // approach: start with all candidate reflections, then iterate through each row and remove those that don't reflect
    const allPossibleReflections = [];
    for (let i = 1; i < m;i++) {
        allPossibleReflections.push(i);
    }

    let smudge;
    // we're looking for a reflection with exactly one row failing to reflect
    allPossibleReflections.forEach((col) => {
        let numFails = 0
        let coord;
        for (let ri=0; ri < n && numFails < 2; ri++) {
            const row = pattern[ri];
            const max = m < (col + col) ? m : (col + col);
            for (let i = col, j=col-1; i < max; i++, j--) {
                if (row[i] !== row[j]) {
                    numFails++
                    coord = [ri, row[i] === "#" ? i : j, col] // always replace the #
                }
            }
        }
        if (numFails === 1) {
            smudge = coord;
        }
    })
    return smudge;
}
