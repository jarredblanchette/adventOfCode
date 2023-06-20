import { readFileSync } from 'fs'

const START_CHARACTER = 'S'
const END_CHARACTER = 'E'

type Coordinate = {
    x: number
    y: number
}

function getMap(text: string[]): string[][] {
    let accumulator: string[][] = []

    for (const line of text) {
        let row: string[] = []
        for (let character of line) {
            if (character == "\r") continue
            row.push(character)
        }
        accumulator.push(row)
    }

    return accumulator
}

function getHeightmap(map: string[][]): number[][] {
    let accumulator: number[][] = []

    for (const horizontal of map) {
        let row: number[] = []
        for (let element of horizontal) {
            if (element == "\r") continue
            if (element == START_CHARACTER) element = 'a'
            if (element == END_CHARACTER) element = 'z'
            row.push(element.charCodeAt(0) - 'a'.charCodeAt(0))
        }
        accumulator.push(row)
    }

    return accumulator
}

function prettyPrint(map: string[][], visited: Coordinate[], edge: Coordinate[]): string {
    let accumulator: string = ''
    for (let y = 0; y < heightmap.length; y++) {
        const row = heightmap[y];
        for (let x = 0; x < row.length; x++) {
            let c: Coordinate = { x: x, y: y }

            let charToWrite = map[y][x]
            if (intersect(edge,[c]) > 0) charToWrite = "#"
            if (intersect(visited,[c]) > 0) charToWrite = "_"

            accumulator += charToWrite
        }
        accumulator += "\n"
    }
    return accumulator
}

function getAdjacent(heightmap: number[][], coord: Coordinate): Coordinate[] {
    let acc: Coordinate[] = []

    if (coord.x > 0) acc.push({ x: coord.x - 1, y: coord.y })
    if (coord.x + 1 < heightmap[0].length) acc.push({ x: coord.x + 1, y: coord.y })

    if (coord.y > 0) acc.push({ x: coord.x, y: coord.y - 1 })
    if (coord.y + 1 < heightmap.length) acc.push({ x: coord.x, y: coord.y + 1 })

    return acc
}

function getAccessible(heightmap: number[][], coord: Coordinate, candiates: Coordinate[]): Coordinate[] {
    let acc: Coordinate[] = []
    if (candiates.length == 0) return acc

    const targetValue: number = heightmap[coord.y][coord.x] + 1 // we can climb by one or slide down as much as we want

    candiates.forEach(candiate => {
        if (heightmap[candiate.y][candiate.x] <= targetValue) acc.push(candiate)
    });

    return acc
}

function findElement<Type>(map: Type[][], element: Type): Coordinate[] {
    let acc: Coordinate[] = []

    for (let y = 0; y < map.length; y++) {
        const row = map[y];
        for (let x = 0; x < row.length; x++) {
            const i = row[x];
            if (i == element) acc.push({ x, y })
        }
    }

    return acc
}

function intersect(listA: Coordinate[], listB: Coordinate[]):number {
    let acc = 0

    listA.forEach(a => {
        listB.forEach(b => {
            if (a.x == b.x && a.y == b.y) acc += 1
        });
    });

    return acc
}

function findSteps(start: Coordinate[], heightmap: number[][], exit: Coordinate[]): number | null {

    let steps = 0
    let edge: Coordinate[] = []
    start.forEach((item) => edge.push(item))
    let visited: Coordinate[] = []

    while (edge.length > 0 && intersect(exits,edge) == 0 ) {
        steps++

        let newEdge: Coordinate[] = []


        for (const location of edge) {
            visited.push(location)

            let adjacent: Coordinate[] = getAdjacent(heightmap, location)
            if (adjacent.length == 0) continue
          
            let candidates: Coordinate[] = getAccessible(heightmap, location, adjacent)
            if (candidates.length == 0) continue

            candidates.forEach(candidate => {
                if (!edge.concat(visited).concat(newEdge).some((element) => candidate.x == element.x && candidate.y == element.y)) {
                    newEdge.push(candidate)
                }
            });
        }

        edge = []
        newEdge.forEach((item) => edge.push(item))
    }

    if (intersect(exits,edge) > 0 ) return steps

    return null
}

let fs = readFileSync('input.txt', 'utf-8');
let splitString: string[] = fs.split('\n')
splitString.forEach(line => {
    line = line.replace("\r", '')
});

let map: string[][] = getMap(splitString)
let heightmap: number[][] = getHeightmap(map)

let starts: Coordinate[] = findElement<string>(map, START_CHARACTER)
let exits: Coordinate[] = findElement<string>(map, END_CHARACTER)



console.log(findSteps(starts, heightmap, exits))

starts = starts.concat(findElement(map,'a'))
console.log(findSteps(starts, heightmap, exits))
