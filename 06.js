import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'


/* 
Timing:

      total       lap
pt1   16:42.85    16:42.85
pt2   21:01.36    04:18.51

*/

day6pt1();
day6pt2();


function day6pt1() {
    const content = readFileSync("06.input", "utf8")
    const races = parseRaces(content);

    const numWayProduct = races.reduce((numWayProduct, {time, distance}) => {
        let newWays = 0;

        console.log({time, distance});
        for (let i = 1; i < time; i++) {
            if (distance < (time-i)*i) {
                newWays++;
            }
        }
        return numWayProduct * newWays;
    }, 1);

    console.log(`day6pt1: ${numWayProduct}`)
}

function parseRaces(content) {
    const [timeStr, distanceStr] = content.split("\n");
    const times = timeStr.split(":")[1].trim().split(/\s+/).map((t=>parseInt(t, 10)));
    const distances = distanceStr.split(":")[1].trim().split(/\s+/).map((t=>parseInt(t, 10)));
    const races = [];
    times.forEach((time, i) => races.push({time, distance: distances[i]}))
    return races;
}
function parseRacesPt2(content) {
    const [timeStr, distanceStr] = content.split("\n");
    const time = parseInt(timeStr.split(":")[1].trim().replace(/\s+/g, ""), 10)
    const distance = parseInt(distanceStr.split(":")[1].trim().replace(/\s+/g, ""), 10);
    return {time, distance};
}



function day6pt2() {
    const content = readFileSync("06.input", "utf8")
    const {time, distance} = parseRacesPt2(content);
    console.log({time, distance});

    let numWays = 0;
    for (let i = 1; i < time; i++) {
        if (distance < (time-i)*i) {
            numWays++;
        }
    }
    console.log(`day6pt2: ${numWays}`)
}