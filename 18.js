import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

/*

pt  time
1   126:07.79 (over 3 sessions and a terrible headache)
2   58:36.68 (refactored to remove a debug graph since it woulda been too big)


I feel like I don't need to iterate over each row (y) and instead of duplicating sorting and area calc per row, could
add some rectangles together much faster similar to how I sorted the x-axis.

I also feel like the x sort could be cleaned up / simplified but didn't look into it too much

*/

const testData=`R 6 (#70c710)
D 5 (#0dc571)
L 2 (#5713f0)
D 2 (#d2c081)
R 2 (#59c680)
D 2 (#411b91)
L 5 (#8ceee2)
U 2 (#caa173)
L 1 (#1b58a2)
U 2 (#caa171)
R 2 (#7807d2)
U 3 (#a77fa3)
L 2 (#015232)
U 2 (#7a21e3)`

const regex = /([UDLR]{1}) (\d+) \(#([a-f0-9]{6})\)/;

testPart1();
day18pt1();
testPart2();
day18pt2();


function day18pt1() {
    const content = readFileSync("18.input", "utf8")
    const input = parse(content)
    const result = compute(input)
    console.log(`day18pt1: ${result}`)
}

function testPart1() {
    const input = parse(testData)
    const result = compute(input)
    assert(result===62)
}

function day18pt2() {
    const content = readFileSync("18.input", "utf8")
    const input = parse(content)
    const result = compute2(fixInput(input))
    console.log(`day18pt2: ${result}`)
}

function testPart2() {
    const input = parse(testData)
    const result = compute2(fixInput(input))
    assert(result===952408144115)
}

function parse(content) {
    return content.split("\n").map(str => {
        const [_, dir, distStr, color] = str.match(regex)
        return {
            dir,
            dist: parseInt(distStr, 10),
            color
        };
    })
}

function compute(edges) {
    let src = [0,0];
    const pointyEdges = [];
    let xMin = 0, xMax = 0, yMin = 0, yMax = 0;
    for (const edge of edges) {
        const {dir, dist} = edge;
        const dest = [...src];
        switch(dir) {
            case "U": dest[1] -= dist; break;
            case "D": dest[1] += dist; break;
            case "R": dest[0] += dist; break;
            case "L": dest[0] -= dist; break;
        }
        if (dest[0] < xMin) xMin = dest[0]
        if (dest[0] > xMax) xMax = dest[0]
        if (dest[1] < yMin) yMin = dest[1]
        if (dest[1] > yMax) yMax = dest[1]
        pointyEdges.push({src, dest, dir})
        src = dest;
    }
    const w = xMax - xMin + 1;
    const h = yMax - yMin + 1;
    const normalizedEdges = pointyEdges.map(({src: [x1, y1], dest: [x2,y2], dir}) => ({dir, src: [x1-xMin, y1-yMin], dest:[x2-xMin, y2-yMin]}));
    const graph = Array.from(Array(h), () => Array(w).fill("."));

    let area = 0;
    for (let y=0; y<h;y++) {
        // only edges that are on this row
        const rowEdges = normalizedEdges.filter(({src: [x1, y1], dest: [x2,y2], dir})=>(dir === "U" || dir === "D") && ((y1 <= y && y2 >= y) || (y1 >= y && y2 <= y)))
        rowEdges.sort(({src: [x1]}, {src: [x2]})=>x1-x2) // sort so that lower x is first
        rowEdges.reduce((acc, {src:[x], dir}) => {
            const { isInside, prevDir, col } = acc;
            if (isInside) {
                console.log({isInside, col, x})
                for (let i=col; i<x;i++) {
                    graph[y][i] = "#"
                    area++;
                }
            }
            // edge is always a #
            graph[y][x] = "#";
            area++;
            // setup acc for next edge
            acc.col = x+1;
            // we only toggle isInside if the dir changes, ie two sequential ups don't toggle
            acc.isInside = prevDir === null ? true : (prevDir === dir ? isInside : !isInside)
            acc.prevDir = dir;
            console.log({y, acc})
            return acc;
        }, {col: 0, isInside: false, prevDir: null})
    }
    console.log("")
    graph.forEach(row=>console.log(row.join("")));
    console.log("")

    // R/L edges sometimes don't get filled, so let's do so!
    normalizedEdges.filter(({dir})=>dir==="R" || dir==="L").forEach(({src, dest, dir}) => {
        const y = src[1];
        const x0 = src[0] < dest[0] ? src[0] : dest[0];
        const x1 = src[0] < dest[0] ? dest[0] : src[0];
        for (let i=x0+1;i<x1;i++) {
            if (graph[y][i] !== "#") {
                graph[y][i] = "#"
                area++;
            }
        }
    })


    console.log("")
    graph.forEach(row=>console.log(row.join("")));
    console.log("")
    return area;
}

function compute2(edges) {
    let src = [0,0];
    const pointyEdges = [];
    let xMin = 0, xMax = 0, yMin = 0, yMax = 0;
    for (const edge of edges) {
        const {dir, dist} = edge;
        const dest = [...src];
        switch(dir) {
            case "U": dest[1] -= dist; break;
            case "D": dest[1] += dist; break;
            case "R": dest[0] += dist; break;
            case "L": dest[0] -= dist; break;
        }
        if (dest[0] < xMin) xMin = dest[0]
        if (dest[0] > xMax) xMax = dest[0]
        if (dest[1] < yMin) yMin = dest[1]
        if (dest[1] > yMax) yMax = dest[1]
        pointyEdges.push({src, dest, dir})
        src = dest;
    }
    const w = xMax - xMin + 1;
    const h = yMax - yMin + 1;
    const normalizedEdges = pointyEdges.map(({src: [x1, y1], dest: [x2,y2], dir}) => ({dir, src: [x1-xMin, y1-yMin], dest:[x2-xMin, y2-yMin]}));

    let area = 0;
    for (let y=0; y<h;y++) {
        // only edges that are on this row
        const rowEdges = normalizedEdges.filter(({src: [x1, y1], dest: [x2,y2], dir})=>((y1 <= y && y2 >= y) || (y1 >= y && y2 <= y)))
        // sort so that lower x is first and U/D before L/R
        rowEdges.sort(({src: [ax], dest: [ax2], dir: adir}, {src: [bx], dest: [bx2], dir: bdir}) => {
            if (adir === "R" || adir === "L") {
                return (bdir === "R" || bdir === "L")
                    ? ax-bx
                    : adir === "R"
                        ? ax === bx
                            ? 1 // R/L after U/D if same x
                            : ax-bx
                        : ax2 === bx
                            ? 1 // R/L after U/D if same x
                            : ax2-bx
            } else if (bdir === "R" || bdir === "L") {
                return bdir === "R"
                    ? ax === bx
                        ? -1 // R/L after U/D if same x
                        : ax-bx
                    : ax === bx2
                        ? -1 // R/L after U/D if same x
                        : ax-bx2
            } else {
                return ax-bx
            }
        })
        rowEdges.reduce((acc, {src:[x1, y1], dest:[x2,y2], dir}) => {
            const { isInside, prevDir, col } = acc;
            if (dir === "R") {
                area += x2-x1-1;
                acc.col=x2
                return acc;
            }
            if (dir === "L") {
                area += x1-x2-1;
                acc.col=x1
                return acc;
            }
            // U/D edge is always a #
            area++;
            // now fill in col...x1 for U/D edges
            if (isInside && prevDir !== dir) {
                area += x1-col;
            }
            // setup acc for next edge
            acc.col = x1+1;
            // we only toggle isInside if the dir changes, ie two sequential ups don't toggle
            acc.isInside = prevDir === null ? true : (prevDir === dir ? isInside : !isInside)
            acc.prevDir = dir;
            return acc;
        }, {col: 0, isInside: false, prevDir: null})
    }
    return area;
}

function fixInput(input) {
    const dirMap = {"0": "R", "1": "D", "2": "L", "3": "U"}
    return input.map(({color})=> {
        const dist = parseInt(color.substring(0,5), 16);
        const dir = dirMap[color.charAt(5)];
        return {dist, dir};
    });
}