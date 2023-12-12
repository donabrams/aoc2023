import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

testParseCard();
testCardValue();
day4pt1();
day4pt2();

function day4pt1() {
    const content = readFileSync("04.input", "utf8")
    const cards = content.split("\n")
    const totalValue = cards.map(parseCard)
    	.map(cardValue)
    	.reduce((total, val)=>total+val, 0)
    console.log(`day4pt1: ${totalValue}`)
}

function day4pt2() {
    const content = readFileSync("04.input", "utf8")
    const cards = content.split("\n")
    const totalCopies = cards.map(parseCard).map(numMatches)
    	.reduce((acc, numMatches) => {
    		const numCopies = 1 + (acc.copies.shift() || 0)
    		acc.total += numCopies;
    		// JS range [0...numMatches] trick
    		[...Array(numMatches).keys()].forEach(i => {
    			acc.copies[i] = numCopies + (acc.copies[i] || 0)
    		})
    		return acc;
    	}, {total: 0, copies: []}).total
    console.log(`day4pt2: ${totalCopies}`)
}

function parseCard(str) {
	const [_, numbers] = str.split(":");
	const [winning, scratched] = numbers.split("|");
	return {
		winning: winning.trim().split(/\s+/).map(str => parseInt(str, 10)),
		scratched: scratched.trim().split(/\s+/).map(str => parseInt(str, 10)),
	};
}

function testParseCard() {
	assert(JSON.stringify(parseCard("Card 196:  2 29 | 83  7")) ===
		JSON.stringify({winning: [2, 29], scratched: [83, 7]}))
}

function cardValue(card) {
	const total = numMatches(card);
	return total === 0 ? 0 : Math.pow(2, total-1);
}

function numMatches({winning, scratched}) {
	return scratched.filter(num => winning.includes(num)).length;
}

function testCardValue() {
	assert(cardValue({winning: [2, 3, 4], scratched: []}) === 0);
	assert(cardValue({winning: [2, 3, 4], scratched: [2]}) === 1);
	assert(cardValue({winning: [2, 3, 4], scratched: [2, 3]}) === 2);
	assert(cardValue({winning: [2, 3, 4], scratched: [2, 3, 4]}) === 4);
	assert(cardValue({winning: [2, 3, 4], scratched: [2, 3, 4, 5]}) === 4);
	assert(cardValue({winning: [2, 3, 4], scratched: [5]}) === 0);
}
