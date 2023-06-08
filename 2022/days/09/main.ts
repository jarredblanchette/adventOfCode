import { readFileSync } from 'fs'
import { relative } from 'path'

enum Direction {
    Up = 'U',
    Down = 'D',
    Left = 'L',
    Right = 'R'
}

function getDirection(candidateCharacter: string): Direction {
    switch (candidateCharacter) {
        case 'U':
            return Direction.Up
        case 'D':
            return Direction.Down
        case 'L':
            return Direction.Left
        case 'R':
            return Direction.Right

        default:
            throw new Error(`Unrecognised candidate: ${candidateCharacter}`);
    }
}

function parseLine(line: string): { moveAmount: number, moveDirection: Direction } {
    const reLine = /^(\w) *(\d+) *$/
    let matches = line.match(reLine)
    if (matches) {
        let moveAmount: number = parseInt(matches[2])
        let moveDirection: Direction = getDirection(matches[1])
        return { moveAmount, moveDirection }
    }

    throw new Error(`Cannot parse line correctly:\n${line}`)
}

function moveRope(rope: number[][], moveDirection: Direction): number[][] {

    rope[0] = moveHead(rope[0], moveDirection)
    for (let index = 1; index < rope.length; index++) {
        rope[index] = moveTail(rope[index - 1], rope[index])
    }


    return rope
}

function moveHead(head: number[], moveDirection: Direction): number[] {
    switch (moveDirection) {
        case Direction.Up:
            head[1] -= 1
            break;
        case Direction.Down:
            head[1] += 1
            break;
        case Direction.Left:
            head[0] -= 1
            break;
        case Direction.Right:
            head[0] += 1
            break;
    }
    return head
}

function moveTail(head: number[], tail: number[]): number[] {
    // case head is on top of the tail
    if (head[0] == tail[0] && head[1] == tail[1]) {
        return tail
    }

    let xDelta = tail[0] - head[0]
    let yDelta = tail[1] - head[1]

    // if they're off by one
    if (Math.abs(xDelta) == 1 && Math.abs(yDelta) == 1) {
        return tail
    }

    // in line
    if (xDelta == 0) {
        if (Math.abs(yDelta) == 2) {
            tail[1] = head[1] + yDelta / 2
            return tail
        }
    }
    // in line
    if (yDelta == 0) {
        if (Math.abs(xDelta) == 2) {
            tail[0] = head[0] + xDelta / 2
            return tail
        }
    }

    // two away in both directions
    if (Math.abs(xDelta) == 2 && Math.abs(yDelta) == 2) {
        tail[1] = head[1] + (yDelta / 2)
        tail[0] = head[0] + (xDelta / 2)
        return tail
    }

    // two away in y direction, align in x and move one closer in y
    if (Math.abs(yDelta) == 2) {
        tail[0] = head[0]
        tail[1] = head[1] + (yDelta / 2)
        return tail
    }

    // two away in x, align in y and move one closer in xs
    if (Math.abs(xDelta) == 2) {
        tail[0] = head[0] + (xDelta / 2)
        tail[1] = head[1]
        return tail
    }


    return tail
}


function visualise(rope: number[][]): string[][] {
    function translate(point: number[],minX:number,minY:number): number[] {
        return [point[0] - minX, point[1] -minY]
    }
    const defaultCharacter = '.'
    let xmin = 0
    let xmax = 1
    let ymin = 0
    let ymax = 1

    rope.forEach(knot => {
        xmin = Math.min(xmin, knot[0])
        xmax = Math.max(xmax, knot[0])
        ymin = Math.min(ymin, knot[1])
        ymax = Math.max(ymax, knot[1])
    });

    let height = ymax - ymin + 1
    let width = xmax - xmin + 1

    let head = rope[0]

    let grid: string[][] = Array.from({ length: height }, () => Array.from({ length: width }, () => defaultCharacter));
    for (let index = 0; index < rope.length; index++) {
        const knot = rope[index];
        let translated: number[] = translate(knot,xmin,ymin)
        if (grid[translated[1]][translated[0]] == defaultCharacter) {
            let charToDraw = index.toString()
            if (index == 0) {
                charToDraw = 'H'
            }

            grid[translated[1]][translated[0]] = charToDraw
        }
    }

    return grid
}

function logLocation(visited: number[][], candidate: number[]): number[][] {
    let isNew = true
    for (let index = 0; index < visited.length; index++) {
        const prevLocation = visited[index];
        if (prevLocation[0] == candidate[0] && prevLocation[1] == candidate[1]) {
            isNew = false
            break
        }
    }
    if (isNew) visited.push([...candidate])

    return visited
}

const fileName = 'example.txt'
const file = readFileSync(fileName, 'utf-8');

let rope: number[][] = Array.from({ length: 10 }, () => [0, 0]);
let partOneVistited: number[][] = []
let partTwoVistited: number[][] = []

partOneVistited = logLocation(partOneVistited, rope[1])

file.split('\n').forEach(line => {
    line = line.replace("\r", "")
    if (line.length == 0) return

    let { moveAmount, moveDirection } = parseLine(line)

    while (moveAmount > 0) {
        rope = moveRope(rope, moveDirection)
        partOneVistited = logLocation(partOneVistited, rope[1])
        partTwoVistited = logLocation(partTwoVistited, rope[9])
        moveAmount -= 1
        // console.log(visualise(rope))
    }
});

console.log(partOneVistited.length, partTwoVistited.length)