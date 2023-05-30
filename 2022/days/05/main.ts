import { readFileSync } from 'fs'



function parseInstruction(str: string): number[] {
    let regExp = new RegExp(/move (\d+) from (\d+) to (\d+)/)
    const matches = str.match(regExp)
    if (matches) {
        let matchesOfInterest: number[] = matches.slice(1).map(elem => Number(elem))

        return [matchesOfInterest[0], matchesOfInterest[1] - 1, matchesOfInterest[2] - 1]
    }
    throw new Error(`could not parse instruction: ${str}`);
}

function parseStacks(str: string, stacks: string[][]): string[][] {
    let index = 0
    const width = 4

    while (index < str.length) {
        if (str[index] == '[') {
            stacks[Number((index / width) )].unshift(str[index + 1])
        }
        index += width
    }

    return stacks
}

function moveBoxes(instruction: number[], stacks: string[][], atOnce: number = 1): string[][] {

    let [quantity, from, to] = instruction

    let removed = stacks[from].splice(-atOnce, atOnce)
    stacks[to] = stacks[to].concat(removed)

    if (quantity - atOnce > 0) {
        stacks = moveBoxes([quantity - 1, from, to], stacks, atOnce)
    }

    return stacks
}

enum State {
    Initalising,
    ReadingLabels,
    MovingBoxes
}



const file = readFileSync('input.txt', 'utf-8')

let stacksPartOne: string[][]= Array.from({ length: 9 }, () => []);
let stacksPartTwo: string[][]= Array.from({ length: 9 }, () => []);
let state: State = State.Initalising
const didgetOnlyRegex = new RegExp(/^(?: *\d *)+$/)

file.split('\n').forEach(line => {
    line = line.replace("\r","")

    if(state === State.Initalising){
        if(line.match(didgetOnlyRegex) != null){
            state = State.ReadingLabels
            return
        }
        stacksPartOne = parseStacks(line,stacksPartOne)
        stacksPartTwo = parseStacks(line,stacksPartTwo)
    }

    if(state === State.ReadingLabels){
        if(line == ''){
            state = State.MovingBoxes
            return
        }
    }

    if(state === State.MovingBoxes){
        if(line == ''){
            return
        }
        let instructions: number[] = parseInstruction(line)
        stacksPartOne = moveBoxes(instructions,stacksPartOne)
        stacksPartTwo = moveBoxes(instructions,stacksPartTwo,instructions[0])
    }
})


let accPartOne = ''
let accPartTwo = ''
stacksPartOne.forEach(stack => {
    if(stack.length != 0){
        accPartOne += stack.slice(-1)
    }
});

stacksPartTwo.forEach(stack => {
    if(stack.length != 0){
        accPartTwo += stack.slice(-1)
    }
});
console.log(accPartOne,accPartTwo)
