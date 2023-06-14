import { readFileSync } from 'fs'
import { isReadable } from 'stream'

enum Operation {
    Add = 0,
    Subtract = 1,
    Multiply = 2,
    Divide = 3,
    Power = 4,
    DivisableBy = 5
}

enum LineType {
    MonkeyId = 0,
    StartingItems = 1,
    Operation = 2,
    Test = 3,
    TestIfBranch = 4,
    TestElseBranch = 5
}

class Monkey {
    id: number
    items: number[] = []
    initialItems: number[] = []
    operation: (number) => number
    worryMethod: (number) => number = (x: number) => Math.floor(x / 3)
    test: (number) => boolean
    testValue: number
    destinationMonkeyIds: [number, number]
    monkeyCatches: [(number) => void, (number) => void]
    timesInspected: number = 0

    constructor(id: number, items: number[], operation: (number) => number, test: (number) => boolean, destinationMonkeyIds: [number, number], testvalue: number) {
        this.id = id
        items.forEach(item => {
            this.initialItems.push(item)
            this.items.push(item)
        });
        this.operation = operation
        this.test = test
        this.destinationMonkeyIds = destinationMonkeyIds
        this.testValue = testvalue
    }

    reset() {
        this.items = this.initialItems
        this.timesInspected = 0
    }

    speak() {
        let words = ['oo-oo ah-ah', 'eeek!', 'OOOH OOOH']
        console.log(`${this.id}: Ahem, ${words[Math.floor(Math.random() * words.length)]}`)
    }

    getItems() {
        return this.items
    }

    next() {
        while (this.items.length > 0) {
            this.timesInspected += 1
            let item = this.items.pop()

            let dest = this.test(this.worryMethod(this.operation(item))) ? 0 : 1

            item = this.operation(item)
            item = this.worryMethod(item)

            if (this.test(item)) {
                this.monkeyCatches[0](item)
            } else {
                this.monkeyCatches[1](item)
            }
        }
    }

    catch(item: number): void {
        this.items.push(item)
    }
}

function stringToOperation(input: string): Operation | [Operation, Operation] {
    if (input == '+') { return Operation.Add }
    if (input == '-') { return Operation.Subtract }
    if (input == '*') { return [Operation.Multiply, Operation.Power] }
    if (input == '/') { return Operation.Divide }
    if (input == 'divisible') { return Operation.DivisableBy }

    throw new Error(`Could not parse ${input} into Operation`);

}

function resolveMultiplyOrPower(lhs: string, operation: [Operation, Operation], rhs: string): (input: number) => number {
    if (lhs == rhs && operation.includes(Operation.Power)) {
        return (input: number) => Number(input) * Number(input)
    }

    if (lhs != rhs && operation.includes(Operation.Multiply)) {
        return (input: number) => input * Number(rhs)
    }

    throw new Error(`Could not parse lhs:${lhs} operation:${operation} rhs:${rhs} into multiply or power operation`);
}

function getCalculation(lhs: string, operation: Operation | [Operation, Operation], rhs: string): (input: number) => number {
    if (Array.isArray(operation)) return resolveMultiplyOrPower(lhs, operation, rhs)

    switch (operation) {
        case Operation.Add:
            return (input: number) => input + Number(rhs)
        case Operation.Subtract:
            return (input: number) => input - Number(rhs)
        case Operation.Divide:
            return (input: number) => input / Number(rhs)
    }

    throw new Error(`Could not parse lhs:${lhs} operation:${operation} rhs:${rhs}`);
}
function getDivisibleBy(lhs: string, operation: Operation, rhs: string): (number) => boolean {
    if (operation == Operation.DivisableBy) return (arg0: number) => ((arg0 % Number(rhs)) == 0)
    throw new Error(`Could not parse lhs:${lhs} operation:${operation} rhs:${rhs}`);
}

function parseMonkey(inputTextBlock: string | string[]): Monkey {
    const lineParsingOptions: [LineType, RegExp][] = [
        [LineType.MonkeyId, /^\s*Monkey\s+(\d+):\s*$/],
        [LineType.StartingItems, /^\s*Starting items: +((?:\d+,? ?)+)\s*$/],
        [LineType.Operation, /^\s*Operation: new = (-?\d+|old) +([+-/*]) +(-?\d+|old)\s*$/],
        [LineType.Test, /^\s*Test:\s+(divisible)\s+by\s+(-?\d+)$\s*$/],
        [LineType.TestIfBranch, /^\s*If true: throw to monkey (\d+)\s*$/],
        [LineType.TestElseBranch, /^\s*If false: throw to monkey (\d+)\s*$/]
    ]

    function parseLine(line: string): [LineType, RegExpMatchArray] {
        line = line.trim()
        for (const lineParsingOption of lineParsingOptions) {
            let matches = line.match(lineParsingOption[1])
            if (matches) return [lineParsingOption[0], matches]
        }

        throw new Error(`Could not parse line: ${line}`)
    }

    let lines: string[]
    if (typeof inputTextBlock === 'string') {
        lines = inputTextBlock.split('\n')
    }
    else {
        lines = inputTextBlock
    }

    let parsedLines: Map<LineType, RegExpMatchArray> = new Map<LineType, RegExpMatchArray>()
    for (const line of lines) {
        let [lineType, matches] = parseLine(line)
        parsedLines[lineType] = matches
    }

    let id: number = Number(parsedLines[LineType.MonkeyId][1])

    let items: number[] = []
    for (const stringItemsof of parsedLines[LineType.StartingItems][1].split(', ')) {
        items.push(Number(stringItemsof))
    }

    let operationSymbol: Operation | [Operation, Operation] = stringToOperation(parsedLines[LineType.Operation][2])
    let operation: (number) => number
    operation = getCalculation(parsedLines[LineType.Operation][1], operationSymbol, parsedLines[LineType.Operation][3])


    let testOp = stringToOperation(parsedLines[LineType.Test][1])
    let testValue: number = Number(parsedLines[LineType.Test][2])
    // todo: support any operation other than divisible by
    if (testOp instanceof Array) throw new Error("Unexpected operation in test for monkey")
    let test: (number) => boolean = getDivisibleBy('', testOp, parsedLines[LineType.Test][2])

    let destinationMonkeyIds: [number, number] = [Number(parsedLines[LineType.TestIfBranch][1]), Number(parsedLines[LineType.TestElseBranch][1])]

    return new Monkey(id, items, operation, test, destinationMonkeyIds, testValue)
}

function getNextNLines(start: number, n: number, source: string[], skipLines: number = 0): { nextStart: number, lines: string[] } {
    return { nextStart: start + n + skipLines, lines: source.slice(start, start + n) }
}

function getMonkeyBusiness(monkeys: Iterator<Monkey>): number {
    let monkeyBusiness: number[] = []

    let iteratorResult = monkeys.next()

    while (!iteratorResult.done) {
        let monkey: Monkey = iteratorResult.value
        monkeyBusiness.push(monkey.timesInspected)
        iteratorResult = monkeys.next()
    }

    monkeyBusiness.sort((a, b) => a - b)
    let acc: number = 1
    for (const business of monkeyBusiness.slice(-2)) {
        acc *= business
    }

    return acc
}


const fileName = 'input.txt'
const file = readFileSync(fileName, 'utf-8');
let lines = file.split('\n')

let monkeys: Map<Number, Monkey> = new Map<Number, Monkey>()

let returned = getNextNLines(0, 6, lines, 1)
while (returned.nextStart <= lines.length) {
    let monkey = parseMonkey(returned.lines)
    monkeys.set(monkey.id, monkey)
    returned = getNextNLines(returned.nextStart, 6, lines, 1)
}

let testWiseProduct: number = 1
monkeys.forEach((monkey: Monkey) => {
    const happy = monkeys.get(monkey.destinationMonkeyIds[0])
    const sad = monkeys.get(monkey.destinationMonkeyIds[1])
    if (happy == undefined || sad === undefined) throw new Error(`Could not find monkeys, loking for ids: ${monkey.destinationMonkeyIds[0]}, ${monkey.destinationMonkeyIds[1]} but were able to get ${happy}, ${sad}`);

    monkey.monkeyCatches = [happy.catch.bind(happy), sad.catch.bind(sad)]

    testWiseProduct = testWiseProduct * monkey.testValue
});


for (let round = 0; round < 20; round++) {
    monkeys.forEach((monkey: Monkey) => {
        monkey.next()
    });
}
console.log(getMonkeyBusiness(monkeys.values()))


monkeys.forEach(monkey => { monkey.reset() });


monkeys.forEach((monkey: Monkey) => {
    monkey.worryMethod = (x: number) => (x % testWiseProduct)
});

for (let round = 0; round < 10000; round++) {
    monkeys.forEach((monkey: Monkey) => {
        monkey.next()
    });
}
console.log(getMonkeyBusiness(monkeys.values()))

