import { readFileSync } from 'fs'

function is2dArray<T>(array: T[] | T[][]): array is T[][] {
    return Array.isArray(array[0])
}

function readForestFromFile(fileName: string): number[][] {
    const file = readFileSync(fileName, 'utf-8');

    let forest: number[][] = [];

    file.split('\n').forEach(line => {
        line = line.replace("\r", "");
        if (line == '' || line === undefined) return
        let row: number[] = [];
        for (let index = 0; index < line.length; index++) {
            const element = line[index];
            row.push(Number(element));
        }
        forest.push(row);
    }
    );
    return forest;
}

function getViews(x: number, y: number, forest: number[][]): number[][];
function getViews(x: number, y: number, row: number[], column: number[]): number[][];
function getViews(x: number, y: number, arg1: number[][] | number[], arg2?: number[]): number[][] {
    let row: number[] = []
    let column: number[] = []

    if (is2dArray(arg1)) {
        arg1.forEach(r => {
            column.push(r[x])
        });
        row = arg1[y]
    } else {
        if (arg2 === undefined) throw new Error("Expected arg1 to be number[] not undefined.")
        row = arg1
        column = arg2
    }

    let right: number[] = row.slice(x + 1)
    let left: number[] = row.slice(0, x).reverse()
    let up: number[] = column.slice(0, y).reverse()
    let down: number[] = column.slice(y + 1)

    return [left, right, up, down];
}

function isBoundary(forest: number[][], x: number, y: number): boolean {
    return x == 0 || y == 0 || x == forest[0].length - 1 || y == forest.length - 1
}

function viewDistance(view: number[], tree: number): number {
    let acc: number = 0
    // basically a do while
    for (let index = 0; index < view.length; index++) {
        const otherTree: number = view[index];
        acc += 1
        if (otherTree >= tree) {
            break
        }
    }
    return acc
}

let forest: number[][] = readForestFromFile('input.txt');

let partOneAcc: number = 0
let partTwoBest: number = 0
for (let y = 0; y < forest.length; y++) {
    const row = forest[y];
    for (let x = 0; x < row.length; x++) {
        const tree = row[x];
        let views: number[][] = getViews(x, y, forest)
        let partOneIncremented: boolean = false


        if (!partOneIncremented && isBoundary(forest, x, y)) {
            partOneIncremented = true
            partOneAcc++
        }
        if (!partOneIncremented) {
            for (let index = 0; index < views.length; index++) {
                const view = views[index];
                if (tree > Math.max(...view) && !partOneIncremented) {
                    partOneIncremented = true
                    partOneAcc++
                    break
                }
            }
        }

        
        let partTwoCandidate: number = 1
        views.forEach(view => {
            partTwoCandidate *= viewDistance(view,tree)
        });
        
        if(partTwoCandidate > partTwoBest){
            partTwoBest = partTwoCandidate
        }
    }
}

console.log(partOneAcc,partTwoBest)

