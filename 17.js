import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

/*

pt  split       time
1   47:16.03    47:16.03
2   76:25.62    29:09.59 <- most of this was figuring out I didn't change the dp setup correctly

After finishing this, I didn't like how much it recalculated every step or the step bound so I:
 1. added an expanded flag (compute3)
 2. instead of using h*w*2 steps, added as hasExpanded flag

It was then much much faster.

*/

const testData=`2413432311323
3215453535623
3255245654254
3446585845452
4546657867536
1438598798454
4457876987766
3637877979653
4654967986887
4564679986453
1224686865563
2546548887735
4322674655533`

testPart1();
//day17pt1();
testPart2();
//day17pt2();
testFasterRefactor();

function day17pt1() {
    const content = readFileSync("17.input", "utf8")
    const input = parse(content)
    const result = compute(input)
    console.log(`day17pt1: ${result}`)
}

function testPart1() {
    const input = parse(testData)
    const result = compute(input)
    assert(result===102)
}

function day17pt2() {
    const content = readFileSync("17.input", "utf8")
    const input = parse(content)
    const result = compute2(input)
    console.log(`day17pt2: ${result}`)
}

function testPart2() {
    const input = parse(testData)
    const result = compute2(input)
    assert(result===94)
}

function parse(content) {
    return content.split("\n").map(r=>r.split("").map(c=>parseInt(c, 10)))
}

function compute(map) {
    // y
    const h = map.length
    // x
    const w = map[0].length;
    // i
    const d = 2

    const NS = 0
    const EW = 1

    // set up an h * w * d array
    const data = Array.from(Array(h), (y)=>
                    Array.from(Array(w), (x)=>
                        Array(d).fill(Number.MAX_SAFE_INTEGER)))
    data[0][1][EW] = map[0][1]
    data[0][2][EW] = map[0][1] + map[0][2]
    data[0][3][EW] = map[0][1] + map[0][2] + map[0][3]
    data[1][0][NS] = map[1][0]
    data[2][0][NS] = map[1][0] + map[2][0]
    data[3][0][NS] = map[1][0] + map[2][0] + map[3][0]

    // max steps to reach end with min cost is twice height * width
    for (let s = 0; s < h*w*2; s++)
        for (let y = 0; y < h; y++)
            for (let x = 0; x < w; x++)
                for (let i = 0; i < d;i++) {
                    let cost = data[y][x][i];
                    switch(i) {
                        case NS:
                            for (let j=x+1; j < w && j <= (x+3);j++) {
                                cost += map[y][j]
                                data[y][j][EW] = Math.min(cost, data[y][j][EW])
                            }
                            cost = data[y][x][i];
                            for (let j=x-1;j >= 0 && j >= (x-3);j--) {
                                cost += map[y][j]
                                data[y][j][EW] = Math.min(cost, data[y][j][EW])
                            }
                            break;
                        case EW:
                            for (let j=y+1; j < h && j <= (y+3);j++) {
                                cost += map[j][x]
                                data[j][x][NS] = Math.min(cost, data[j][x][NS])
                            }
                            cost = data[y][x][i];
                            for (let j=y-1;j >= 0 && j >= (y-3);j--) {
                                cost += map[j][x]
                                data[j][x][NS] = Math.min(cost, data[j][x][NS])
                            }
                            break;
                    }
                }
    return data[h-1][w-1].reduce((min, cost) => cost < min ? cost : min, Number.MAX_SAFE_INTEGER);
}

function compute2(map) {
    // y
    const h = map.length
    // x
    const w = map[0].length;
    // i
    const d = 2

    const NS = 0
    const EW = 1

    // set up an h * w * d array
    const data = Array.from(Array(h), (y)=>
                    Array.from(Array(w), (x)=>
                        Array(d).fill(Number.MAX_SAFE_INTEGER)))
    let cost = map[0][1] + map[0][2] + map[0][3]
    for (let i = 4; i <= 10 && i < w; i++) {
        cost += map[0][i] 
        data[0][i][EW] = cost;
    }
    cost = map[1][0] + map[2][0] + map[3][0]
    for (let i = 4; i <= 10 && i < h; i++) {
        cost += map[i][0]
        data[i][0][NS] = cost;
    }

    // max steps to reach end with min cost is twice height * width
    for (let s = 0; s < h*w*2; s++)
        for (let y = 0; y < h; y++)
            for (let x = 0; x < w; x++)
                for (let i = 0; i < d;i++) {
                    let cost;
                    switch(i) {
                        case NS:
                            if (x < w-4) {
                                cost = data[y][x][i] + map[y][x+1] + map[y][x+2] + map[y][x+3]
                                for (let j=x+4; j < w && j <= (x+10);j++) {
                                    cost += map[y][j]
                                    data[y][j][EW] = Math.min(cost, data[y][j][EW])
                                }
                            }
                            if (x >= 4) {
                                cost = data[y][x][i] + map[y][x-1] + map[y][x-2] + map[y][x-3]
                                for (let j=x-4;j >= 0 && j >= (x-10);j--) {
                                    cost += map[y][j]
                                    data[y][j][EW] = Math.min(cost, data[y][j][EW])
                                }
                            }
                            break;
                        case EW:
                            if (y < h-4) {
                                cost = data[y][x][i] + map[y+1][x] + map[y+2][x] + map[y+3][x]
                                for (let j=y+4; j < h && j <= (y+10);j++) {
                                    cost += map[j][x]
                                    data[j][x][NS] = Math.min(cost, data[j][x][NS])
                                }
                            }
                            if (y >= 4) {
                                cost = data[y][x][i] + map[y-1][x] + map[y-2][x] + map[y-3][x]
                                for (let j=y-4;j >= 0 && j >= (y-10);j--) {
                                    cost += map[j][x]
                                    data[j][x][NS] = Math.min(cost, data[j][x][NS])
                                }
                            }
                            break;
                    }
                }

    //console.log("");
    //data.map(row=>console.log(row.map(([ns, ew])=>("000" + ns).slice(-3)+"/"+("000" + ew).slice(-3)).join(" ")));
    //console.log("");
    return data[h-1][w-1].reduce((min, cost) => cost < min ? cost : min, Number.MAX_SAFE_INTEGER);
}

function testFasterRefactor() {
    let input = parse(testData)
    let result = compute3(input)
    assert(result===102)
    const content = readFileSync("17.input", "utf8")
    input = parse(content)
    result = compute3(input)
    console.log(`day17pt1 (fast refactor): ${result}`)
}

function compute3(map) {
    // y
    const h = map.length
    // x
    const w = map[0].length;
    // i
    const d = 2

    const NS = 0
    const EW = 1

    // set up an h * w * d array
    const data = Array.from(Array(h), (y)=>
                    Array.from(Array(w), (x)=>
                        Array(d).fill(Number.MAX_SAFE_INTEGER)))
    const expanded = Array.from(Array(h), (y)=>
                        Array.from(Array(w), (x)=>
                            Array(d).fill(Number.MAX_SAFE_INTEGER)))
    data[0][1][EW] = map[0][1]
    data[0][2][EW] = map[0][1] + map[0][2]
    data[0][3][EW] = map[0][1] + map[0][2] + map[0][3]
    data[1][0][NS] = map[1][0]
    data[2][0][NS] = map[1][0] + map[2][0]
    data[3][0][NS] = map[1][0] + map[2][0] + map[3][0]

    // max steps to reach end with min cost is twice height * width
    let hasExpanded = true
    while (hasExpanded) {
        hasExpanded = false
        for (let y = 0; y < h; y++)
            for (let x = 0; x < w; x++)
                for (let i = 0; i < d;i++) {
                    if (expanded[y][x][i] === data[y][x][i]) {
                        // if the min didn't change, don't compute!
                        continue;
                    }
                    hasExpanded = true
                    let cost = data[y][x][i];
                    switch(i) {
                        case NS:
                            for (let j=x+1; j < w && j <= (x+3);j++) {
                                cost += map[y][j]
                                data[y][j][EW] = Math.min(cost, data[y][j][EW])
                            }
                            cost = data[y][x][i];
                            for (let j=x-1;j >= 0 && j >= (x-3);j--) {
                                cost += map[y][j]
                                data[y][j][EW] = Math.min(cost, data[y][j][EW])
                            }
                            break;
                        case EW:
                            for (let j=y+1; j < h && j <= (y+3);j++) {
                                cost += map[j][x]
                                data[j][x][NS] = Math.min(cost, data[j][x][NS])
                            }
                            cost = data[y][x][i];
                            for (let j=y-1;j >= 0 && j >= (y-3);j--) {
                                cost += map[j][x]
                                data[j][x][NS] = Math.min(cost, data[j][x][NS])
                            }
                            break;
                    }
                    // mark expanded with the min we just used
                    expanded[y][x][i] = data[y][x][i];
                }
    }
    return data[h-1][w-1].reduce((min, cost) => cost < min ? cost : min, Number.MAX_SAFE_INTEGER);
}