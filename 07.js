import { readFileSync } from 'fs'
import { strict as assert } from 'node:assert'

/*

Timing

part1		80:27.98	80:27.98
until pause	82:43.86	02:15.87

Then about 1 hr the next morning

*/

const cards = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const cardsPt2 = ['A', 'K', 'Q', 'T', '9', '8', '7', '6', '5', '4', '3', '2', 'J'];
const rankedCards = cards.reduce((cards, card, i) => { cards[card] = i; return cards }, {});
const rankedCardsPt2 = cardsPt2.reduce((cards, card, i) => { cards[card] = i; return cards }, {});
const hands = ["fiveOfKind", "fourOfKind", "fullHouse", "threeOfKind", "twoPair", "onePair", "highCard"];
const rankedHands = hands.reduce((hands, hand, i) => { hands[hand] = i; return hands }, {});

testPart1();
testGetHandType();
day7pt1();
testPart2();
day7pt2();


function day7pt1() {
    const content = readFileSync("07.input", "utf8")
    const set = parse(content)
    	.map(({bid, hand})=>({bid, hand, type: getHandType(hand)}))
    set.sort(compareHand);
    const l = set.length;
    let winnings = 0;
    for (let i=0; i < l; i++) {
    	winnings += (i + 1) * set[i].bid
    }
    console.log(`day7pt1: ${winnings}`)
}

function testPart1() {
	const content =`32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483`
    const set = parse(content)
    	.map(({bid, hand})=>({bid, hand, type: getHandType(hand)}))
    set.sort(compareHand);
    const l = set.length;
    let winnings = 0;
    for (let i=0; i < l; i++) {
    	winnings += (i + 1) * set[i].bid
    }
    assert(winnings===6440)
}

function parse(content) {
	return content.split("\n").map((str) => {
		const [handStr, bidStr] = str.split(" ");
		return {
			hand: handStr.split(''),
			bid: parseInt(bidStr, 10),
		}
	})
}
function getHandType(hand, wildCard="*") {
	const cardToCountWithWilds = hand.reduce((cardToCount,card)=> {
		cardToCount[card] = (cardToCount[card] || 0) + 1
		return cardToCount
	}, {})
	const {[wildCard]: numWilds = 0, ...cardToCount} = cardToCountWithWilds;
	const countToCard = Object.keys(cardToCount).reduce((countToCard, card) => {
		const count = cardToCount[card]
		countToCard[count] = [...(countToCard[count] || []), card]
		return countToCard
	}, {})
	const analysis = {cardToCount, numWilds, countToCard}
	if (isFiveOfKind(analysis)) return "fiveOfKind"
	if (isFourOfKind(analysis)) return "fourOfKind"
	if (isFullHouse(analysis)) return "fullHouse"
	if (isThreeOfKind(analysis)) return "threeOfKind"
	if (isTwoPair(analysis)) return "twoPair"
	if (isOnePair(analysis)) return "onePair"
	return "highCard"
}

function testGetHandType() {
	assert(getHandType("JJJJJ".split(''), "J")==="fiveOfKind");
	assert(getHandType("KJJ66".split(''), "J")==="fourOfKind");
}

function isFiveOfKind({cardToCount, countToCard, numWilds}) {
	return countToCard[5] || numWilds === 5 ||
		numWilds && [...Array(numWilds).keys()].some((n)=>countToCard[5-(n+1)])
}
function isFourOfKind({cardToCount, countToCard, numWilds}) {
	return countToCard[4] || 
		numWilds && [...Array(numWilds).keys()].some((n)=>countToCard[4-(n+1)])
}
function isFullHouse({cardToCount, countToCard, numWilds}) {
	return (countToCard[3] && countToCard[2]) ||
		(numWilds === 1 && countToCard[2] && countToCard[2].length === 2)
}
function isThreeOfKind({cardToCount, countToCard, numWilds}) {
	return countToCard[3] || (numWilds === 1 && countToCard[2]) || (numWilds === 2)
}
function isTwoPair({cardToCount, countToCard, numWilds}) {
	return countToCard[2] && (countToCard[2].length === 2)
}
function isOnePair({cardToCount, countToCard, numWilds}) {
	return countToCard[2] || (numWilds === 1)
}

// 1 if a is stronger than b
function compareHand(a, b) {
	const aRank = rankedHands[a.type]
	const bRank = rankedHands[b.type]
	return aRank < bRank 
		? 1
		: aRank === bRank
			? compareRank(a.hand, b.hand)
			:  -1;
}

function compareRank(a, b) {
	for (let i = 0; i < a.length; i++) {
		let result = compareCard(a[i], b[i])
		if (result !== 0) {
			return result;
		}
	};
	return 0;
}

// 1 if a is stronger than b
function compareCard(a, b) {
	const aRank = rankedCards[a]
	const bRank = rankedCards[b]
	return aRank < bRank
		? 1
		: aRank === bRank
			? 0
			:  -1;
}

function day7pt2() {
    const content = readFileSync("07.input", "utf8")
    const set = parse(content)
    	.map(({bid, hand})=>({bid, hand, type: getHandType(hand, 'J')}))
    set.sort(compareHandPt2);
    const l = set.length;
    let winnings = 0;
    for (let i=0; i < l; i++) {
    	winnings += (i + 1) * set[i].bid
    }
    console.log(`day7pt2: ${winnings}`)
}

function testPart2() {
	const content =`32T3K 765
T55J5 684
KK677 28
KTJJT 220
QQQJA 483`
    const set = parse(content)
    	.map(({bid, hand})=>({bid, hand, type: getHandType(hand, 'J')}))
    set.sort(compareHandPt2);
    const l = set.length;
    let winnings = 0;
    for (let i=0; i < l; i++) {
    	winnings += (i + 1) * set[i].bid
    }
    assert(winnings===5905)
}

// 1 if a is stronger than b
function compareHandPt2(a, b) {
	return rankedHands[a.type] < rankedHands[b.type] 
		? 1
		: rankedHands[a.type] === rankedHands[b.type]
			? compareRankPt2(a.hand, b.hand)
			:  -1;
}
function compareRankPt2(a, b) {
	for (let i = 0; i < a.length; i++) {
		let result = compareCardPt2(a[i], b[i])
		if (result !== 0) {
			return result;
		}
	};
	return 0;
}
// 1 if a is stronger than b
function compareCardPt2(a, b) {
	return rankedCardsPt2[a] < rankedCardsPt2[b] 
		? 1
		: rankedCardsPt2[a] === rankedCardsPt2[b]
			? 0
			:  -1;
}
