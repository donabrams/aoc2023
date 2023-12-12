import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'


day1pt2();

function day1pt1() {
	const content = readFileSync("01.input", "utf8")

	assert(getDigitFromString("12") === 12)
	assert(getDigitFromString("1") === 11)
	assert(getDigitFromString("152") === 12)
	assert(getDigitFromString("a12") === 12)
	assert(getDigitFromString("a1a2") === 12)
	assert(getDigitFromString("a1a2a") === 12)
	assert(getDigitFromString("a13a2a") === 12)

	const total = content.split("\n").map(getDigitFromString).reduce((n,t)=>n+t,0)
	console.log(`day1 pt1: ${total}`)
}

function getDigitFromString(s) {
	const [_, f] = /^[^\d]*(\d).*/.exec(s);
	const [_2, l] = /.*(\d)[^\d]*$/.exec(s);	
	return parseInt(`${f}${l ? l : f}`);
}

function day1pt2() {
	const content = readFileSync("01.input", "utf8")

	assert(getDigitFromString2("12") === 12)
	assert(getDigitFromString2("1") === 11)
	assert(getDigitFromString2("152") === 12)
	assert(getDigitFromString2("a12") === 12)
	assert(getDigitFromString2("a1a2") === 12)
	assert(getDigitFromString2("a1a2a") === 12)
	assert(getDigitFromString2("a13a2a") === 12)
	assert(getDigitFromString2("two13a2a") === 22)
	assert(getDigitFromString2("two13a2three") === 23)
	assert(getDigitFromString2("two13a2threesad") === 23)
	assert(getDigitFromString2("two1nine") === 29)
	assert(getDigitFromString2("eightwothree") === 83)
	assert(getDigitFromString2("abcone2threexyz") === 13)
	assert(getDigitFromString2("xtwone3four") === 24)
	assert(getDigitFromString2("4nineeightseven2") === 42)
	assert(getDigitFromString2("zoneight234") === 14)
	assert(getDigitFromString2("7pqrstsixteen") === 76)

	const total = content.split("\n").map(getDigitFromString2).reduce((n,t)=>n+t,0)
	console.log(`day1 pt2: ${total}`)
}

function getDigitFromString2(s) {
	// match from front, so capture first
	const [_, f] = /(\d|one|two|three|four|five|six|seven|eight|nine|zero)/.exec(s);
	// match from back and first .* is greedier than the second (in JS/node)
	const [_2, l] = /^.*(\d|one|two|three|four|five|six|seven|eight|nine|zero).*$/.exec(s);
	return parseInt(`${forceDigit(f)}${forceDigit(l ? l : f)}`);
}

function forceDigit(s) {
	return s.replaceAll("one", "1")
		.replaceAll("two", "2")
		.replaceAll("three", "3")
		.replaceAll("four", "4")
		.replaceAll("five", "5")
		.replaceAll("six", "6")
		.replaceAll("seven", "7")
		.replaceAll("eight", "8")
		.replaceAll("nine", "9")
		.replaceAll("zero", "0");
}