import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

/*

pt  split       time
1   11:49.68    11:49.68
2   38:23.91    26:34.22

*/

const testData=`HASH`

const testData2=`rn=1,cm-,qp=3,cm=2,qp-,pc=4,ot=9,ab=5,pc-,pc=6,ot=7`

testPart1();
day15pt1();
testPart2();
day15pt2();

function day15pt1() {
    const content = readFileSync("15.input", "utf8")
    const input = parse(content)
    const result = compute(input)
    console.log(`day15pt1: ${result}`)
}

function testPart1() {
    assert(toNumber("HASH")===52)
    const input = parse(testData2)
    const result = compute(input)
    assert(result===1320)
}

function day15pt2() {
    const content = readFileSync("15.input", "utf8")
    const input = parse(content)
    const result = compute2(input)
    console.log(`day15pt2: ${result}`)
}

function testPart2() {
    const input = parse(testData2)
    const result = compute2(input)
    assert(result===145)
}

function parse(content) {
    return content.split(",")
}

function parse2(item) {
    const s = item.split("=");
    return s.length === 1
        ? { op: "-", label: item.substring(0, item.length-1)}
        : { op: "=", label: s[0], value: parseInt(s[1], 10)};
}


function compute(list) {
    return list.reduce((sum, str) => {
        return sum + toNumber(str)
    }, 0)
}
function compute2(list) {
    const boxes = Array.from(Array(256), ()=>[]);
    // load boxes
    list.forEach(str => {
        const instr = parse2(str)
        const box = boxes[toNumber(instr.label)];
        if (instr.op === "-") {
            // remove the lens if it exists
            const i = box.findIndex(({label}) => label === instr.label);
            if (i >= 0) {
                box.splice(i, 1)
            }
        } else { //op === "="
            // add lens with focal length or replace the focal length
            const i = box.findIndex(({label}) => label === instr.label);
            if (i >= 0) {
                box[i].focalLength = instr.value
            } else {
                box.push({label: instr.label, focalLength: instr.value})
            }
        }
    })
    // calculate boxes
    return boxes.reduce((sum, box, i) => sum + box.reduce((n, {focalLength}, j) => n + (i+1) * (j+1) * focalLength, 0), 0)
}

function toNumber(str) {
    let cur = 0;
    for (let i=0; i<str.length; i++) {
        const n = str.charCodeAt(i);
        cur += n;
        cur *= 17;
        cur %= 256;
    }
    return cur;
}