import { readFileSync } from 'fs'
import { writeFileSync } from 'fs'
const SAND = 'o'
const WALL = '#'
const SOURCE = '+'
const AIR = '.'

type Coordinate = { x: number, y: number }

function prettyPrint(map: string[][], boundA?: Coordinate, boundB?: Coordinate, targetFile?: string): void {
    let leftBound: number = 0
    let rightBound: number = map[0].length
    let topBound: number = 0
    let bottomBound: number = map.length

    if (boundA && boundB) {
        leftBound = Math.min(boundA.x, boundB.x)
        rightBound = Math.max(boundA.x, boundB.x)

        topBound = Math.min(boundA.y, boundB.y)
        bottomBound = Math.max(boundA.y, boundB.y)
    }

    let acc: string = ''
    map.forEach((row: string[], y: number) => {
        if (y >= topBound && y <= bottomBound) {
            row.forEach((element: string, x: number) => {
                if (x >= leftBound && y <= rightBound) {
                    acc += element
                }
            });
            acc += '\n'
        }
    });

    if (targetFile == null) {
        console.log(acc)
        return
    }

    let f = writeFileSync(targetFile, acc)
}

function getBlankMap(width: number, height: number): string[][] {
    let map: string[][] = Array.from({ length: height }, () => Array(width).fill(AIR))

    return map
}

function sweepMap(map: string[][]): void {
    map.forEach((row, y) => {
        row.forEach((_, x) => {
            if (map[y][x] == SAND) map[y][x] = AIR
        });
    });
}

function readFile(filePath: string): string[][] {
    const fs = readFileSync(filePath, 'utf-8')
    const lines: string[] = fs.split('\n')
    const regex = /((\d+),(\d+))/g;


    function drawVerticalLine(map: string[][], start: Coordinate, end: Coordinate): void {
        const startY = Math.min(start.y, end.y)
        const endY = Math.max(start.y, end.y)
        const x = start.x

        for (let y = startY; y <= endY; y++) {
            map[y][x] = WALL
        }
    }

    function drawHorizontalLine(map: string[][], start: Coordinate, end: Coordinate): void {
        const startX = Math.min(start.x, end.x)
        const endX = Math.max(start.x, end.x)
        const y = start.y

        for (let x = startX; x <= endX; x++) {
            map[y][x] = WALL
        }
    }

    function draw(map: string[][], pen: [Coordinate, Coordinate]): void {
        if (pen[0].x == pen[1].x) {
            drawVerticalLine(map, pen[0], pen[1])
        }

        else if (pen[0].y == pen[1].y) {
            drawHorizontalLine(map, pen[0], pen[1])
        }
    }

    // TODO: Do this smarter, so we do a single scan and maintain an offset.  
    function getBounds(lines: string[]): [number, number] {
        let maxX: number = 0
        let maxY: number = 0

        let matches: RegExpExecArray | null
        lines.forEach(line => {
            while ((matches = regex.exec(line)) !== null) {
                maxX = Math.max(Number(matches[2]), maxX)
                maxY = Math.max(Number(matches[3]), maxY)
            }
        });

        return [maxX, maxY]
    }

    function isTT<T>(item: [T | null, T | null]): item is [T, T] {
        return (item[0] != null && item[1] != null)
    }

    let [width, height] = getBounds(lines)
    let map: string[][] = getBlankMap(width + 1, height + 1)

    lines.forEach(line => {
        if (line == '') return
        let pen: [Coordinate | null, Coordinate | null] = [null, null]
        let matches
        while ((matches = regex.exec(line)) !== null) {

            pen[1] = pen[0]
            pen[0] = { x: Number(matches[2]), y: Number(matches[3]) }

            if (isTT<Coordinate>(pen)) {
                draw(map, pen)
            }
        }

        if (isTT<Coordinate>(pen)) {
            draw(map, pen)
        }

    });
    return map
}

function simulateSandStep(map: string[][], active: Coordinate): Coordinate | null {
    function getDirection(location: Coordinate): Coordinate | null {
        if (location.y + 1 >= map.length) {
            return null
        }

        let [x, y] = [location.x, location.y]

        y += 1
        if (map[y][x] == AIR) {
            return { x: x, y: y }
        }

        x = location.x - 1
        if (x <= 0) return null
        if (map[y][x] == AIR) {
            return { x: x, y: y }
        }

        x = location.x + 1
        if (x >= map[0].length) return null
        if (map[y][x] == AIR) {
            return { x: x, y: y }
        }

        return location
    }


    let newLocation: Coordinate | null = getDirection(active)

    if (newLocation == active) {
        map[active.y][active.x] = SAND
        return active
    }

    map[active.y][active.x] = AIR

    if (newLocation != null) {
        map[newLocation.y][newLocation.x] = SAND
    }

    return newLocation

}

function simulateSand(map: string[][], start?: Coordinate) {

    if (start == null) {
        start = { x: 500, y: 0 }
    }

    // remember where our sand is.  we then compare where it was to where it is, and if it's moving we keep simulating
    let previous = { x: start.x, y: start.y - 1 }
    let active: Coordinate | null = start
    while (active != null && active != previous) {
        previous = active
        active = simulateSandStep(map, active)
        // if (active != null) prettyPrint(map,{x:active.x-10,y:active.y-10},{x:active.x+10,y:active.y+10})
    }

    return active != null
}

function partOne(map: string[][], sweep: boolean = true): number {
    let bitsOfSand = 0
    let sandPersisted = simulateSand(map, { x: 500, y: 0 })

    while (sandPersisted) {
        bitsOfSand += 1
        sandPersisted = simulateSand(map, { x: 500, y: 0 })
    }

    if (sweep) sweepMap(map)

    return bitsOfSand
}

function partTwo(map: string[][], sweep: boolean = true): number {
    function addFloor() {
        let width: number = map[0].length
        map.push(Array(width).fill(AIR))
        map.push(Array(width).fill(WALL))
    }

    function pad(side: string, amount: number) {
        map.forEach(row => {
            for (let index = 0; index < amount; index++) {
                switch (side) {
                    case 'right':
                        row.push(AIR)
                        break;
                    case 'left':
                        row.unshift(AIR)
                        break
                    case '*':
                        row.push(AIR)
                        row.unshift(AIR)
                }
            }
        });
    }


    let bitsOfSand: number = 0
    let source: Coordinate = { x: 500, y: 0 }

    let height: number = map.length
    let width: number = map[0].length
    let leftPadding = Math.max(source.x, height + 2) - source.x
    let rightpadding = Math.max((2 + height - (width - source.x)), 0)

    if (leftPadding > 0) pad('left', leftPadding)
    source.x += leftPadding

    if (rightpadding > 0) pad('right', rightpadding)

    addFloor()


    let sandPersisted = simulateSand(map, source)

    while (map[source.y][source.x] != SAND) {
        bitsOfSand += 1
        sandPersisted = simulateSand(map, source)
    }

    if (sweep) sweepMap(map)

    return bitsOfSand + 1
}

// let path = 'example.txt'
let path = 'input.txt'
let map = readFile(path)


console.log(partTwo(map, false))
prettyPrint(map, undefined, undefined, 'out.txt')


