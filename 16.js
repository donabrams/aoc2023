import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

/*

pt  split       time
1   41:25.59    41:25.59
2   57:06.75    15:41.16

*/

const testData=`.|...\\....
|.-.\\.....
.....|-...
........|.
..........
.........\\
..../.\\\\..
.-.-/..|..
.|....-|.\\
..//.|....`


testPart1();
day16pt1();
testPart2();
day16pt2();

function day16pt1() {
    const content = readFileSync("16.input", "utf8")
    const input = parse(content)
    const result = compute(input)
    console.log(`day15pt1: ${result}`)
}

function testPart1() {
    const input = parse(testData)
    const result = compute(input)
    assert(result===46)
}

function day16pt2() {
    const content = readFileSync("16.input", "utf8")
    const input = parse(content)
    const result = compute2(input)
    console.log(`day16pt2: ${result}`)
}

function testPart2() {
    const input = parse(testData)
    const result = compute2(input)
    assert(result===51)
}

function parse(content) {
    return content.split("\n").map(r=>r.split(""))
}

                                //  x  y  dx dy
function compute(map, initialRay=[ -1, 0, 1, 0]) {
    const h = map.length
    const w = map[0].length;
    const energized = Array.from(Array(h), ()=> Array(w).fill(0));
    const memory = Array.from(Array(h), ()=> Array(w).fill(0));
    let rays = [initialRay];
    while (rays.length) {
        const newRays = [];
        for (let i = 0; i < rays.length; i++) {
            let [x, y, dx, dy] = rays[i];
            const x2 = x + dx;
            const y2 = y + dy;

            if (x2 >= 0 && x2 < w && y2 >= 0 && y2 < h) {
                // only parse a ray of light once
                // use 4 bits, 1 for each direction
                const memBit = dx !== 0
                    ? dx === -1
                        ? 1
                        : 2
                    : dy === -1
                        ? 4
                        : 8;
                if ((memory[y2][x2] & memBit) > 0) {
                    continue;
                } else {
                    memory[y2][x2] = memory[y2][x2] | memBit
                }
                // mark energized cell
                energized[y2][x2] = 1;
                // continue the ray
                const c = map[y2][x2];
                if (c === ".") {
                    newRays.push([x2, y2, dx, dy])
                } else if (c === "|") {
                    if (dx != 0) {
                        newRays.push([x2, y2, 0, 1])
                        newRays.push([x2, y2, 0, -1])
                    } else {
                        newRays.push([x2, y2, dx, dy])
                    }
                } else if (c === "-") {
                    if (dy != 0) {
                        newRays.push([x2, y2, 1, 0])
                        newRays.push([x2, y2, -1, 0])
                    } else {
                        newRays.push([x2, y2, dx, dy])
                    }
                } else if (c === "/") {
                    newRays.push([x2, y2, -dy, -dx])
                } else if (c === "\\") {
                    newRays.push([x2, y2, dy, dx])
                } else {
                    console.log(c);
                    throw new Error("unknown");
                }
            }
        }
        rays = newRays;
    }
    return energized.reduce((sum, row)=> sum + row.reduce((n, c) => n+c, 0), 0)
}

function compute2(map) {
    const h = map.length
    const w = map[0].length;
    let max = 0;
    let debugRay = null;
    for (let i = 0; i < h; i++) {
        const fromLeft = compute(map, [-1, i, 1, 0]);
        if (fromLeft > max) {
            max = fromLeft;
            debugRay = [-1, i, 1, 0];
        }
        const fromRight = compute(map, [w, i, -1, 0]);
        if (fromRight > max) {
            max = fromRight;
            debugRay = [w, i, -1, 0];
        }
    }
    for (let i = 0; i < w; i++) {
        const fromTop = compute(map, [i, -1, 0, 1]);
        if (fromTop > max) {
            max = fromTop;
            debugRay = [i, -1, 0, 1];
        }
        const fromBot = compute(map, [i, h, 0, -1]);
        if (fromBot > max) {
            max = fromBot;
            debugRay = [i, h, 0, -1];
        }
    }
    console.log({ debugRay, max })
    return max
}