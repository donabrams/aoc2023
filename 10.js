import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

/*

Timing: 

First part was just over an hour
second part was ANOTHER hour at least (got stuck on how to count area in a row correctly)

*/

const testData=`..F7.
.FJ|.
SJ.L7
|F--J
LJ...`
const testData2=`.F----7F7F7F7F-7....
.|F--7||||||||FJ....
.||.FJ||||||||L7....
FJL7L7LJLJ||LJ.L-7..
L--J.L7...LJS7F-7L7.
....F-J..F7FJ|L7L7L7
....L7.F7||L7|.L7L7|
.....|FJLJ|FJ|F7|.LJ
....FJL-7.||.||||...
....L---J.LJ.LJLJ...`
const testData3=`FF7FSF7F7F7F7F7F---7
L|LJ||||||||||||F--J
FL-7LJLJ||||||LJL-77
F--JF--7||LJLJ7F7FJ-
L---JF-JLJ.||-FJLJJ7
|F|F-JF---7F7-L7L|7|
|FFJF7L7F-JF7|JL---7
7-L-JL7||F7|L7F-7F7|
L.L7LFJ|||||FJL7||LJ
L7JLJL-JLJLJL--JLJ.L`

const [N, E, S, W] = [[-1, 0], [0, 1], [1, 0], [0,-1]];

testPart1();
day10pt1();

testPart2();
day10pt2();


function day10pt1() {
    const content = readFileSync("10.input", "utf8")
    const input = parse(content)
    const result = compute(input)
    console.log(`day10pt1: ${result}`)
}

function testPart1() {
    const input = parse(testData)
    const result = compute(input)
    assert(result === 8)
}

function parse(content) {
    const grid = content.split("\n").map(str=> str.split(""));
    const [h, w] = [grid.length, grid[0].length];
    for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
            if (grid[r][c] === 'S') {
                return {start: [r, c], grid};
            }
        }
    }
    throw new Error("could not find start in grid");
}

function compute({start, grid}) {
    const [h, w] = [grid.length, grid[0].length];
    const loop = [...Array(h).keys()].map(row => new Array(w).fill(0));
    const [r, c] = start;
    loop[r][c] = 1;
    let i = 1;
    let toProcess = [start];
    while (toProcess = processPipes(toProcess, grid, loop, h, w)) {
        i++;
    }
    return i-1;
}

function processPipes(pipes, grid, loop, h, w) {
    const newPipes = [];
    pipes.forEach(([row, col])=> {
        const pipes = getPipeDir(grid[row][col]) // get the pipe diff
            .map(([rd, cd])=> [row+rd, col+cd]) // get the connected neighbor coords
            .filter(([r,c])=> (r >= 0 && r < h && c >=0 && c < w)) // ignore out of bounds
            .filter(([r,c])=> grid[r][c] !== '.') // ignore empty
            .filter(([r,c])=> loop[r][c] === 0) // ignore places we've already looked in loop
            .filter(([r,c])=> getPipeDir(grid[r][c]).some(([rd, cd])=> r+rd === row && c+cd === col)) // ignore unconnected pipes
            .forEach(([r, c])=>{
                loop[r][c] = 1; // mark it in the loop so we don't look at it again
                newPipes.push([r, c]); // add a new pipe
            })
    });
    return newPipes.length ? newPipes : null;
}

function getPipeDir(p) {
    switch(p) {
        case '|': return [N, S]; // is a vertical pipe connecting north and south.
        case '-': return [E, W]; // is a horizontal pipe connecting east and west.
        case 'L': return [N, E]; // is a 90-degree bend connecting north and east.
        case 'J': return [N, W]; // is a 90-degree bend connecting north and west.
        case '7': return [S, W]; // is a 90-degree bend connecting south and west.
        case 'F': return [S, E]; // is a 90-degree bend connecting south and east.
        case 'S': return [N, E, S, W]; // is the starting position of the animal; there is a pipe on this
        default: throw new Error(`unknown pipe: ${p}`)
    }
}
function getVerticality(p, start) {
    switch(p) {
        case '|': return [1, 1]; // is a vertical pipe connecting north and south.
        case '-': return [0, 0]; // is a horizontal pipe connecting east and west.
        case 'L': return [1, 0]; // is a 90-degree bend connecting north and east.
        case 'J': return [1, 0]; // is a 90-degree bend connecting north and west.
        case '7': return [0, 1]; // is a 90-degree bend connecting south and west.
        case 'F': return [0, 1]; // is a 90-degree bend connecting south and east.
        case 'S': return start ? getVerticality(start) : [1, 1]; // is the starting position of the animal; there is a pipe on this
        default: throw new Error(`unknown pipe: ${p}`)
    }
}

function day10pt2() {
    const content = readFileSync("10.input", "utf8")
    const input = parse(content)
    // TODO: I visually inspected the input to determine the starting location was a 7;
    // I could figure it out by analyzing the neighbors, but it would take more time
    const result = computePart2(input, "7")
    console.log(`day10pt2: ${result}`)
}

function testPart2() {
    const input = parse(testData2)
    const result = computePart2(input, "F")
    console.log({result});
    assert(result===8)
    const input2 = parse(testData3)
    const result2 = computePart2(input2, "7")
    console.log({result});
    assert(result2===10)
}

function computePart2({start, grid}, startPipe) {
    const [h, w] = [grid.length, grid[0].length];
    const loop = [...Array(h).keys()].map(row => new Array(w).fill(0));
    const countedArea = [...Array(h).keys()].map(row => new Array(w).fill(" "));
    const [r, c] = start;
    loop[r][c] = 1;
    let toProcess = [start];
    while (toProcess = processPipes(toProcess, grid, loop, h, w)) {}
    let i = 0;
    // to process the included area, we count each row separately
    const area = loop.reduce((area, row) => {
        let j = 0;
        const [rowCount] = row.reduce((acc, cell) => {
            const [cellCount, vert, inLoop] = acc;
            if (cell) {
                const [n,s] = vert;
                // what we do with a new loop pipe depends on if it connects north or south (left-right doesn't matter)
                const [n1,s1] = getVerticality(grid[i][j], startPipe);
                j++;
                const [nt, st] = [n+n1, s+s1];
                if (nt >= 1 && st >= 1) {
                    // since we have a pipe going north AND south, then we need to toggle "in the loop"
                    return [cellCount, [0,0], !inLoop];
                } else if (nt > 1 || st > 1) {
                    // we have two pipes going up or down, so we reset the verticality
                    return [cellCount, [0,0], inLoop];
                } else {
                    // we take the most vertical (basically ignoring any '-') and move to the next cell
                    return [cellCount, [n1 > n ? n1 : n, s1 > s ? s1 : s], inLoop];
                }
            } else {
                j++;
                // we have a non-loop cell, so verify we're in the loop before incrementing
                return [inLoop ? (cellCount + 1) : cellCount, vert, inLoop];
            }
            return acc;
        }, [0,[0,0],false]);
        i++;
        return area += rowCount;
    }, 0)
    return area;
}
