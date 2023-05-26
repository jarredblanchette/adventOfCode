import { readFileSync } from 'fs';

const file = readFileSync('input.txt', 'utf-8');

function findRepeats(characters: string, strings: string[]){
    for(const character of characters) 
    {
        let inAll = true
        strings.forEach(substrings => {
            if(!(substrings.includes(character))){
                inAll = false
            }
        });
        if(inAll){
            return character
        }
    };
    return null
}

function score(char : string){
    if (char.toUpperCase() === char){
        return char.charCodeAt(0) - 'A'.charCodeAt(0) + 27
    }
    return char.charCodeAt(0) - 'a'.charCodeAt(0) + 1
}

function splitRucksacks(rucksack:string) : string[]{
    return [rucksack.slice(0,(rucksack.length)/2), rucksack.slice((rucksack.length)/2)]
}

let partOneAcc: number = 0
let partTwoAcc : number = 0
let threeRucksacks : string[] = []
file.split('\n').forEach(rucksack => {
    // handle part 1
    let rucksackContents = splitRucksacks(rucksack)
    let repeatedCharacter = findRepeats(rucksackContents[0],rucksackContents)
    if(repeatedCharacter){
        partOneAcc += score(repeatedCharacter)
    }

    // handle part 2
    threeRucksacks.push(rucksack)
    if(threeRucksacks.length == 3){
        let threeRucksackContents : string = ''
        threeRucksacks.forEach(elem => {threeRucksackContents+=elem})
        let partTwoRepeatedCharacter = findRepeats(threeRucksackContents,threeRucksacks)
        if(partTwoRepeatedCharacter){
            partTwoAcc += score(partTwoRepeatedCharacter)
        }
        threeRucksacks = []
    }
});
console.log(partOneAcc)
console.log(partTwoAcc)

