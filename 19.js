import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

/*

pt  split       time
1   41:40.75    41:40.75
2   134:50.60   93:09.85

*/

const testData=`px{a<2006:qkq,m>2090:A,rfg}
pv{a>1716:R,A}
lnx{m>1548:A,A}
rfg{s<537:gd,x>2440:R,A}
qs{s>3448:A,lnx}
qkq{x<1416:A,crn}
crn{x>2662:A,R}
in{s<1351:px,qqz}
qqz{s>2770:qs,m<1801:hdj,R}
gd{a>3333:R,R}
hdj{m>838:A,pv}

{x=787,m=2655,a=1222,s=2876}
{x=1679,m=44,a=2067,s=496}
{x=2036,m=264,a=79,s=2244}
{x=2461,m=1339,a=466,s=291}
{x=2127,m=1623,a=2188,s=1013}`

const workflowRegex = /([^\{]+){(.*),(\w+)}/
const ruleRegex = /([amsx]{1})([><]{1})(\d+):(\w+)/
const inventoryRegex = /\{x=(\d+),m=(\d+),a=(\d+),s=(\d+)\}/

testPart1();
day19pt1();
testPart2();
day19pt2();


function day19pt1() {
    const content = readFileSync("19.input", "utf8")
    const input = parse(content)
    const result = compute(input)
    console.log(`day19pt1: ${result}`)
}

function testPart1() {
    const input = parse(testData)
    const result = compute(input)
    assert(result===19114)
}

function day19pt2() {
    const content = readFileSync("19.input", "utf8")
    const input = parse(content)
    const result = compute2(input)
    console.log(`day19pt2: ${result}`)
}

function testPart2() {
    const input = parse(testData)
    const result = compute2(input)
    assert(result===167409079868000)
}

function parse(content) {
    let isInventory = false;
    const workflows = {};
    const inventory = [];
    content.split("\n").forEach(str=> {
        if (!isInventory) {
            if (str === "") {
                isInventory = true;
                return;
            }
            const [_, name, rulesStr, otherwise] = str.match(workflowRegex)
            const rules = rulesStr.split(",").map(s=>{
                const [_, type, comp, amount, nextWorkflow] = s.match(ruleRegex)
                return { type, comp, amount: parseInt(amount, 10), nextWorkflow };
            })
            workflows[name] = {
                rules,
                otherwise
            }
        } else {
            const [_, x, m, a, s] = str.match(inventoryRegex)
            inventory.push({x: parseInt(x, 10), m: parseInt(m, 10), a:parseInt(a, 10), s:parseInt(s, 10)});
        }
    })
    return {
        workflows,
        inventory
    }
}

function compute({workflows, inventory}) {
    const acceptedParts = inventory.filter(part=>{
        let nextWorkflow = "in";
        while (nextWorkflow !== "R" && nextWorkflow !== "A") {
            const {rules, otherwise} = workflows[nextWorkflow];
            nextWorkflow = rules.find(({type, comp, amount})=>{
                return comp === ">"
                    ? part[type] > amount
                    : part[type] < amount;
            })?.nextWorkflow || otherwise;
        }
        return nextWorkflow === "A"
    });
    return acceptedParts.reduce((sum, {x, m, a, s})=> sum+x+m+a+s, 0);
}

function compute2({workflows}) {
    return getNumAccepted(workflows, "in", {x: [1, 4000], m: [1, 4000], a: [1,4000], s: [1,4000]})
}

function getNumAccepted(workflows, nextWorkflow, minMaxes) {
    if (nextWorkflow === "R") return 0;
    if (["x", "m", "a", "s"].some(t=>minMaxes[t][0] > minMaxes[t][1])) return 0;
    if (nextWorkflow === "A") return ["x", "m", "a", "s"].reduce((product, t)=>product*(minMaxes[t][1]-minMaxes[t][0]+1), 1);

    const {rules, otherwise} = workflows[nextWorkflow];
    return [...rules, otherwise].reduce(({sum, remainderMinMax}, rule)=> {
        const { type, comp, amount, nextWorkflow: positive } = rule;

        if (!type) { // otherwise
            return {
                sum: sum + getNumAccepted(workflows, rule, remainderMinMax),
                remainderMinMax: null,
            }
        }

        const [min, max] = remainderMinMax[type];

        let nextMin = comp === ">"
            ? amount > min    
                ? amount + 1  // 1/min where a > 2000/amount => 2001/min
                : min         // 2500/min where a > 2000/amount => 2500/min
            : amount > min
                ? min         // 1/min where a < 2000/amount => 1/min
                : min         // 2500/min where a < 2000/amount => 2500/min
        let nextMax = comp === "<"
            ? amount < max   
                ? amount - 1  // 4000/max where a < 2000/amount => 1999/max
                : max         // 1500/max where a < 2000/amount => 1500/max
            : amount < max    
                ? max         // 4000/max where a > 2000/amount => 4000/max
                : max         // 1500/max where a > 2000/amount => 1500/max

        const nextNegMin = comp === ">"
            ? amount > min    
                ? min         // 1/min where a > 2000/amount => 1/min
                : min         // 2500/min where a > 2000/amount => 2500/min
            : amount > min
                ? amount      // 1/min where a < 2000/amount => 2000/min
                : min         // 2500/min where a < 2000/amount => 2500/min
        const nextNegMax = comp === "<"
            ? amount < max   
                ? max         // 4000/max where a < 2000/amount => 4000/max
                : max         // 1500/max where a < 2000/amount => 1500/max
            : amount < max    
                ? amount      // 4000/max where a > 2000/amount => 2000/max
                : max         // 1500/max where a > 2000/amount => 1500/max

        //console.log({nextWorkflow, type, positiveSplit: [positive, nextMin, nextMax], negativeSplit: [otherwise, nextNegMin, nextNegMax]})

        return {
            sum: sum + getNumAccepted(workflows, positive, {...remainderMinMax, [type]: [nextMin, nextMax]}),
            remainderMinMax: {...remainderMinMax, [type]: [nextNegMin, nextNegMax]}
        }
    }, {sum: 0, remainderMinMax: minMaxes}).sum;
}
