import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'


const gameRx = /Game (\d*)/
const roundRx = /(\d*) (red|green|blue)/

const max = {
	r: 12,
	g: 13,
	b: 14
};

day2pt2()

function day2pt1() {
	const content = readFileSync("02.input", "utf8")

	assert(JSON.stringify(parseGame("Game 12: 31 blue, 42 red; 14543 red, 2 green, 65 blue; 22 green")) ===
		JSON.stringify({
			id: 12,
			rounds: [
				{ blue: 31, red: 42},
				{ red: 14543, green: 2, blue: 65},
				{ green: 22},
			],
		}))

	const possibleIdsTotal = content.split("\n")
		.map(parseGame)
		.filter(({rounds}) => rounds.every(round => 
			(round.red || 0) <= max.r && (round.green || 0) <= max.g && (round.blue || 0) <= max.b))
		.reduce((t, { id }) => t + id, 0)
	console.log(`day2pt1: ${possibleIdsTotal}`);
}

function parseGame(s) {
	const [game, rounds] = s.split(":");
	const [_, id] = gameRx.exec(game);
	const results = rounds.split(";").map(rs => {
		return rs.split(",").reduce((acc, result) => {
			const [_2, n, color] = roundRx.exec(result.trim());
			acc[color] = parseInt(n, 10);
			return acc;
		}, {});
	})
	return {
		id: parseInt(id, 10),
		rounds: results
	}
}


function day2pt2() {
	const content = readFileSync("02.input", "utf8")

	const totalPower = content.split("\n")
		.map(parseGame)
		.reduce((power, game) => {
			const {rounds} = game;
			const { red, green, blue } = rounds.reduce((gameMax, {red = 0, green = 0, blue = 0 }) => 
				({red: red > gameMax.red ? red : gameMax.red,
				green: green > gameMax.green ? green : gameMax.green, 
				blue: blue > gameMax.blue ? blue : gameMax.blue}), {red: 0, green: 0, blue: 0 });
			return power + red * green * blue;
		}, 0)
	console.log(`day2pt2: ${totalPower}`);
}


