import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

const symbolRx = /[^\.\d]/ // anything but numbers or periods
const partRx = /\d+/g
const gearRx = /\*/g

testIsPartNumber()
day3pt1()
testIsOverlapping()
day3pt2()

function day3pt1() {
    const content = readFileSync("03.input", "utf8")
    const schematic = content.split("\n")

    const partNumberTotal = schematic
        .flatMap((row, rowIndex) => [...row.matchAll(partRx)]
            .map(numberMatch =>
                isPartNumber(schematic, rowIndex, numberMatch.index, numberMatch[0].length)
                    ? parseInt(numberMatch[0], 10)
                    : 0))
        .reduce((total,rowTotal) => total+rowTotal, 0)
    console.log(`day3pt1: ${partNumberTotal}`)
}

function isPartNumber(schematic, row, col, width) {
    return symbolRx.test(getNeighbors(schematic, row, col, width));
}

function testIsPartNumber() {
    const test = [
   //01234|6789|1
    "1....34....5",
    ".*.6$.......",
    ".....2..7...",
    "....*......$",
    "2343.......8"];

    assert(isPartNumber(test,0,0,1))
    assert(isPartNumber(test,0,5,2))
    assert(!isPartNumber(test,0,11,1))
    assert(isPartNumber(test,1,3,1))
    assert(isPartNumber(test,2,5,1))
    assert(!isPartNumber(test,2,8,1))
    assert(isPartNumber(test,4,0,4))
    assert(isPartNumber(test,4,11,1))
}

// includes diagonals
function getNeighbors(schematic, row, col, width=1) {
    const h = schematic.length;
    const w = schematic[row].length;
    return getRange(schematic, row-1, col-1, width+2) + "." +
           getRange(schematic, row, col-1, 1) + "." +
           getRange(schematic, row, col+width, 1) + "." +
           getRange(schematic, row+1, col-1, width+2);
}

function getRange(schematic, row, col, width) {
    if (row < 0 || row >= schematic.length) {
        return "";
    }
    const r = schematic[row];
    return r.substring(Math.max(0,col), Math.min(r.length, col+width));
}

function day3pt2() {
    const content = readFileSync("03.input", "utf8")
    const schematic = content.split("\n")
    const gearRatioTotal = schematic
        .flatMap((row, rowIndex) => [...row.matchAll(gearRx)]
            .map(({index: colIndex}) => getGearRatio(schematic, rowIndex, colIndex)))
        .reduce((total, gearRatio) => total+gearRatio, 0)
    console.log(`day3pt2: ${gearRatioTotal}`)
}

function getGearRatio(schematic, row, col) {
    // gear IFF *exactly* two neighboring parts 
    // FYI: digits are automatically parts since they are adjacent to this gear
    if ([...getNeighbors(schematic, row, col).matchAll(partRx)].length !== 2) {
        return 0
    }
    // find all the parts on each adjacent row (a little wasteful, but meh)
    return [].concat(
            [...(row === 0 ? [] : schematic[row-1].matchAll(partRx))],
            [...schematic[row].matchAll(partRx)],
            [...(row+1 === schematic.length ? [] : schematic[row+1].matchAll(partRx))])
    // then filter by adjacency
        .filter(partMatch => {
            const partSpan = [partMatch.index, partMatch[0].length+partMatch.index-1]
            const adjacencySpan = [col-1, col+1]
            return isOverlapping(partSpan, adjacencySpan)
        })
    // and multiply the part numbers
        .reduce((gearRatio, partNumber) => gearRatio * partNumber, 1)
}

function isOverlapping([a1, a2], [b1,b2]) {
    return a1 === b1 || ((a1 < b1) ? (b1 <= a2) : (a1 <= b2))
}

function testIsOverlapping() {
    assert(isOverlapping([1,1], [1,1]))
    assert(!isOverlapping([2,2], [1,1]))
    assert(!isOverlapping([1,1], [2,2]))
    assert(isOverlapping([1,2], [2,3]))
    assert(isOverlapping([2,3], [1,2]))
    assert(!isOverlapping([1,2], [3,4]))
    assert(!isOverlapping([3,4], [1,2]))
}
