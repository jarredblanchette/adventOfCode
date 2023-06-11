import { readFileSync, createReadStream } from 'fs'

enum Operation {
    NoOp = 0,
    AddX = 1
}

enum State {
    Ready = 0,
    Adding = 1
}

function parseLine(line: string): { op: Operation, matches: RegExpMatchArray | null } {
    const reNoOP = /^ *noop *$/
    const reAddX = /^ *addx (-?\d+) *$/

    let noOpMatches = line.match(reNoOP)
    if (noOpMatches) {
        return { op: Operation.NoOp, matches: null }
    }

    let addXMatches = line.match(reAddX)
    if (addXMatches) {
        return { op: Operation.AddX, matches: addXMatches }
    }

    throw new Error(`Cannot parse line correctly:\n${line}`)
}

class cpu {
    instructions: Iterator<string>
    xRegister: number
    clock: number
    state: State
    toAdd: number
    more: boolean

    constructor(instructions: Iterator<string>, xRegister?: number, clock?: number) {
        this.instructions = instructions
        this.xRegister = xRegister ?? 1
        this.clock = clock ?? 1
        this.state = State.Ready
        this.toAdd = 0
        this.more = true
    }

    next() {
        if (!this.more) return

        if (this.state === State.Adding) {
            this.clock += 1
            this.xRegister += this.toAdd
            this.toAdd = 0
            this.state = State.Ready
            return
        }

        if (this.state != State.Ready) throw new Error("Unknown state");

        let result = this.instructions.next()
        if (result.done) {
            this.more = false
            return
        }

        let { op, matches } = parseLine(result.value.replace('\r', ''))

        switch (op) {
            case Operation.NoOp:
                this.clock += 1
                return;
            case Operation.AddX:
                if (matches == null) throw new Error(`Expected matches for operation == AddX, but got none.`);
                this.clock += 1
                this.state = State.Adding
                this.toAdd = Number(matches[1])
                return
            default:
                throw new Error(`Unknown operation type: ${op}`);
        }
    }
}

class crt {
    head: number[]
    width: number
    height: number
    screen: string[][]
    writeCharacter: string

    constructor(head?: number[], width?: number, height?: number, defaultCharacter?: string, writeCharacter?: string) {
        this.head = head ?? [0, 0]
        this.width = width ?? 40
        this.height = height ?? 6
        this.writeCharacter = writeCharacter ?? '#'

        defaultCharacter = defaultCharacter ?? '.'
        this.screen = Array.from({ length: this.height }, () => Array.from({ length: this.width }, () => defaultCharacter)) as string[][]
    }

    next(sprite?: number): void {
        if (this.head[0] >= this.width && this.head[1] >= this.height) return

        if (sprite && Math.abs(sprite - this.head[0]) <= 1) {
            this.screen[this.head[1]][this.head[0]] = this.writeCharacter
        }

        if (this.head[0] + 1 >= this.width) {
            this.head[0] = 0
            this.head[1] += 1
            return
        }

        this.head[0] += 1
    }

    prettyPrint(): string {
        let acc: string = ''

        for (let y = 0; y < this.screen.length; y++) {
            const row = this.screen[y];
            for (let x = 0; x < row.length; x++) {
                const pixel: string = row[x];
                acc += pixel
            }
            acc += "\n"
        }

        return acc
    }
}

class fakeIterator implements Iterator<string>{
    fileLike: string
    index: number
    delim: string
    constructor(fileLike: string, delim?: string) {
        this.fileLike = fileLike
        this.delim = delim ?? '\n'
        this.index = 0
    }
    next(...args: [] | [undefined]): IteratorResult<string, any> {
        let nextLine
        let nextIndex = this.fileLike.indexOf(this.delim, this.index + 1)
        if (nextIndex == -1) return { value: '', done: true }
        nextLine = this.fileLike.slice(this.index, nextIndex)
        this.index = nextIndex + 1
        return { value: nextLine, done: false }
    }
    return?(value?: any): IteratorResult<string, any> {
        throw new Error('Method not implemented.')
    }
    throw?(e?: any): IteratorResult<string, any> {
        throw new Error('Method not implemented.')
    }

}

const fileName = 'input.txt'
const file = readFileSync(fileName, 'utf-8');
let instructions: fakeIterator = new fakeIterator(file)

let myCpu: cpu = new cpu(instructions)
let myCrt: crt = new crt([0, 0], 40, 6)

let cyclesOfInterest = [20, 60, 100, 140, 180, 220]
let partOneAcc: number = 0

while (myCpu.clock <= 240) {
    if (cyclesOfInterest.indexOf(myCpu.clock) != -1) {
        partOneAcc += myCpu.clock * myCpu.xRegister
    }

    myCrt.next(myCpu.xRegister)
    myCpu.next()

}

console.log(partOneAcc)
console.log(myCrt.prettyPrint())