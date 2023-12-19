import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

/*
    part one in 10 min
    part 2 was about 2 hrs; went down a functional rabbit hole (replacing the core of the nested loop) before I got to 
    rotating and then rotated the wrong way

*/

const testData=`O....#....
O.OO#....#
.....##...
OO.#O....O
.O.....O#.
O.#..O.#.#
..O..#O..O
.......O..
#....###..
#OO..#....`

const testData2=`.....#....
....#...O#
...OO##...
.OO#......
.....OOO#.
.O#...O#.#
....O#....
......OOOO
#...O###..
#..OO#....`

const testData3=`.....#....
....#...O#
.....##...
..O#......
.....OOO#.
.O#...O#.#
....O#...O
.......OOO
#..OO###..
#.OOO#...O`

const testData4=`.....#....
....#...O#
.....##...
..O#......
.....OOO#.
.O#...O#.#
....O#...O
.......OOO
#...O###.O
#.OOO#...O`


testPart1();
//day14pt1();
testPart2();
day14pt2();


function day14pt1() {
    const content = readFileSync("14.input", "utf8")
    const input = parse(content)
    const result = compute(input)
    console.log(`day14pt1: ${result}`)
}

function testPart1() {
    const input = parse(testData)
    const result = compute(input)
    assert(result===136)
}

function day14pt2() {
    const content = readFileSync("14.input", "utf8")
    const input = parse(content)
    //const cycleTest = compute2(input, 10000)
    // cycle is 102 long so let's do 10k + what we need to hit the cycle:
    const n = 1000000000 % 102
    const m = 10000 % 102
    const result = compute2(input, 10000 + n-m)

    console.log(`day14pt2: ${result[0]}`)
}

function testPart2() {
    const input = parse(testData)
    assert(JSON.stringify(input) === JSON.stringify(rotateClockwise(rotateClockwise(rotateClockwise(rotateClockwise(input))))))
    assert(JSON.stringify(tiltUp(input)) === JSON.stringify(tiltUp(tiltUp(input))))
    assert(load(tiltUp(input)) === 136)
    assert(JSON.stringify(parse(testData2)) === JSON.stringify(compute2(input, 1)[1]))
    assert(JSON.stringify(parse(testData3)) === JSON.stringify(compute2(input, 2)[1]))
    assert(JSON.stringify(parse(testData4)) === JSON.stringify(compute2(input, 3)[1]))
}

function parse(content) {
    return content.split("\n").map(str=>str.split(""))
}

function compute(map) {
    const h = map.length
    const w = map[0].length

    const final = Array.from(Array(h), ()=>Array(w).fill("."))

    let load = 0
    for (let c = 0; c < w; c++) {
        let nextDest = 0;
        for (let r = 0; r < h; r++)  {
            if (map[r][c] === "O") {
                final[nextDest][c] = "O"
                load += h - nextDest
                nextDest++
            } else if (map[r][c] === "#") {
                final[r][c] = "#"
                nextDest = r+1
            }
        }
    }
    return load
}

function compute2(map, numCyles) {
    let final
    let cur = map;
    for (let d = 0; d < numCyles; d++) {
        cur = tiltUp(cur) //n
        cur = rotateClockwise(cur);
        cur = tiltUp(cur) //w
        cur = rotateClockwise(cur);
        cur = tiltUp(cur) //s
        cur = rotateClockwise(cur);
        cur = tiltUp(cur) //e
        cur = rotateClockwise(cur); // back to normal
        console.log([load(cur), d])
    }
    return [load(cur), cur]
}

function tiltUp(map) {
    const h = map.length
    const w = map[0].length
    const tilted = Array.from(Array(h), ()=>Array(w).fill("."))
    for (let col = 0; col < w; col++) {
        let nextRoundRow = 0;
        for (let row = 0; row < h; row++)  {
            if (map[row][col] === "O") {
                tilted[nextRoundRow][col] = "O"
                nextRoundRow++
            } else if (map[row][col] === "#") {
                tilted[row][col] = "#"
                nextRoundRow = row + 1
            }
        }
    }
    return tilted;
}

function rotateClockwise(map) {
    const h = map.length;
    const w = map[0].length;
    const rotated = Array.from(Array(w), ()=>Array(h))
    for (let r = 0; r < h; r++) {
        const c2 = h-r-1;
        for (let c = 0, r2 = 0; c < w; c++,r2++)
            rotated[r2][c2] = map[r][c]
    }
    return rotated;
}

function printMap(map) {
    map.forEach(row=>console.log(row.join("")))
}

function load(map) {
    const h = map.length;
    const w = map[0].length;
    let load = 0;
    for (let r = 0; r < h; r++)
        for (let c = 0; c < w; c++)
            if (map[r][c] === "O")
                load += h-r
    return load;
}
