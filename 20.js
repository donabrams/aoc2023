import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'
import { lcm } from 'mathjs'

/*

1   33:11.24    33:11.24 (then break)
1   68:48.06    68:48.06

I'm not sure if this means I spent 101 minutes on part 1 or just 68 minutes :shrug: 
I got covid and a week later when I finally came back I had solved part 1 already (yay?)

part 2 was basically figuring out the cycles and most of it was choosing mathjs for lcm

2   37:03.78    37:03.78

TBH, I'm not a huge fan of these cycle AOC questions. They're rather convenient instead of general, 
but I suppose this is a pizzle contest so well designed input is part of it...

Assuming I spent 149 minutes on this, I am only 2.5x slower than place 100. 
Maybe it's because the conjunctions description was kinda confusing :shrug:

*/
const LOW = 0
const HIGH = 1

const OFF = 0
const ON = 1

const BROADCAST = 0;
const FLIPFLOP = 1;
const CONJUNCTION = 2;

const testData=`broadcaster -> a, b, c
%a -> b
%b -> c
%c -> inv
&inv -> a`


const testData2=`broadcaster -> a
%a -> inv, con
&inv -> b
%b -> con
&con -> output`

testPart1();
day20pt1();
//testPart2();
day20pt2();


function day20pt1() {
    const content = readFileSync("20.input", "utf8")
    const input = parse(content)
    const result = compute(input)
    console.log(`day20pt1: ${result}`)
}

function testPart1() {
    let input = parse(testData)
    let result = compute(input)
    assert(result===32000000)
    input = parse(testData2)
    result = compute(input)
    assert(result===11687500)
}

function day20pt2() {
    const content = readFileSync("20.input", "utf8")
    const input = parse(content)
    const result = compute2(input)
    console.log(`day20pt2: ${result}`)
}

function testPart2() {
    const input = parse(testData)
    const result = compute2(input)
    assert(result)
}

function parse(content) {
    return content.split("\n").reduce((modules, str)=> {
        if (0 === str.indexOf("broadcaster")) {
            const [_, moduleList] = str.match(/broadcaster -> (.*)/);
            modules["broadcaster"] = { t: BROADCAST, out: moduleList.split(",").map(s=>s.trim()) }
        } else if (str.charAt(0) === "%") {
            const [_, name, moduleList] = str.match(/%(\w+) -> (.*)/)
            modules[name] = { t: FLIPFLOP, out: moduleList.split(",").map(s=>s.trim()) }
        } else { // &
            const [_, name, moduleList] = str.match(/&(\w+) -> (.*)/);
            modules[name] = { t: CONJUNCTION, out: moduleList.split(",").map(s=>s.trim()) }
        }
        return modules
    }, {});
}

function compute(plan) {
    const machine = init(plan);
    let numPulses = [0,0]

    for (let i=0;i<1000;i++) {
        numPulses[LOW] += 1
        const targets = machine["broadcaster"].out.slice()
        const pulses = targets.map(()=>LOW)
        const srcs = targets.map(()=>"broadcaster")

        while (pulses.length) {
            const src = srcs.shift();
            const target = targets.shift();
            const pulse = pulses.shift();
            //console.log(`${src} -${pulse === LOW ? "low" : "high"}-> ${target}`)
            numPulses[pulse] += 1
            const m = machine[target];
            process(m, targets, pulses, srcs, pulse, target, src)
        }
    }

    //console.log({numPulses})

    return numPulses[LOW]*numPulses[HIGH]
}

function process(m, ts, ps, srcs, p, t, s) {
    if (!m) {
        return;
    }
    switch (m.t) {
        case FLIPFLOP: {
            if (p === LOW) {
                m.state = m.state === OFF ? ON : OFF;
                const pulse = m.state === ON ? HIGH : LOW
                for (let i=0;i<m.out.length;i++) {
                    ts.push(m.out[i]);
                    ps.push(pulse);
                    srcs.push(t);
                }
            }
        } break;
        case CONJUNCTION: {
            m.state.mem[m.state.idx[s]] = p;
            let pulse = LOW
            for (let i=0;i<m.state.mem.length;i++) {
                if (m.state.mem[i] === LOW) {
                    pulse = HIGH;
                    break;
                }
            }
            for (let i=0;i<m.out.length;i++) {
                ts.push(m.out[i]);
                ps.push(pulse);
                srcs.push(t);
            }

        }
    }
}

function init(plan) {
    const machine = Object.keys(plan).reduce((machine, key) => {
        const m = { ...plan[key] };
        if (m.t === FLIPFLOP) {
            m.state = OFF
        } else if (m.t === CONJUNCTION) {
            m.state = {
                mem: [],
                idx: {},
            };
        }
        machine[key] = m;
        return machine;
    }, {})
    // set up conjunction memory
    Object.keys(machine).forEach((key)=>{
        const m = machine[key]
        m.out.forEach(k=> {

            if (!machine[k]) return;

            if (machine[k].t === CONJUNCTION) {
                const s = machine[k].state
                s.idx[key]=s.mem.length
                s.mem.push(LOW)
            }
        })
    })
    return machine;
}

function compute2(plan) {
    console.log(plan)
    const machine = init(plan);
    // this list came from backtracking "rx"
    // {&sr, &sn, &rf, &vq} -> &hp -> rx
    // need a high on all four at once to trigger rx with LOW
    const breakdown = ["sr", "sn", "rf", "vq"];
    // let's hope there's a cycle
    const cycles = breakdown.reduce((cycles, k)=> {cycles[k] = [0]; return cycles;}, {});

    console.log({cycles});


    for (let i=0;true;i++) {
        const targets = machine["broadcaster"].out.slice()
        const pulses = targets.map(()=>LOW)
        const srcs = targets.map(()=>"broadcaster")

        while (pulses.length) {
            const src = srcs.shift();
            const target = targets.shift();
            const pulse = pulses.shift();
            if (target === "rx" && pulse === LOW) {
                // this took too long sadly and never fired for me
                return i+1
            }
            if (target === "hp" && pulse === HIGH) {
                console.log(`[${i}] ${src} -${pulse === LOW ? "low" : "high"}-> ${target}`)
                cycles[src].push(i);
                if (cycles[src].length%4 === 0) {
                    if (breakdown.every(k=>cycles[k].length >= 4)) {
                        console.log({cycles})
                        const cycleDiffs = breakdown.reduce((diffs, k) => {
                            const diff = [];
                            for (i=1;i<cycles[k].length;i++) {
                                diff[i-1] = cycles[k][i] - cycles[k][i-1];
                            }
                            diffs[k] = diff;
                            return diffs;
                        }, {})
                        console.log({cycleDiffs});
                        const cycleLengths = breakdown.map(k=>cycleDiffs[k][1]);
                        console.log({cycleLengths});
                        return lcm(...cycleLengths);
                    }
                }
            }
            const m = machine[target];
            process(m, targets, pulses, srcs, pulse, target, src)
        }
    }
    throw new Error("unreachable")
}