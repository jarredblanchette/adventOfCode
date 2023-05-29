import { readFileSync } from 'fs'


function processElfRange(elfRange: string) : number[]
{
    const stringRange: String[] = elfRange.split('-')
    return [Number(stringRange[0]),Number(stringRange[1])]
}

function elfRangesOrdered(left: number[],right: number[]): boolean {
    return elfRangeLength(left) <= elfRangeLength(right)
}

function elfRangeLength(elfRange:number[]): number{
    if(elfRange.length != 2){
        return -1
    }

    return (elfRange[1] - elfRange[0] + 1)
}

function getElfRangesOverlap(leftElfRange:number[],rightElfRange:number[]): number{
    let smaller = leftElfRange
    let larger = rightElfRange
    
    if (!elfRangesOrdered(smaller,larger)){
        [smaller,larger] = [rightElfRange,leftElfRange]
    }
    
    // cases:
    // smaller is outside our larger range
    // smaller is entirely inside our larger range
    // smaller intersects our larger range
    if (smaller[1] < larger[0] || smaller[0] > larger[1]){
        return 0
    }

    if(smaller[0] >= larger[0] && smaller[1] <= larger[1]){
        return elfRangeLength(smaller)
    }

    if(smaller[0]<larger[0]){
        return elfRangeLength([larger[0],smaller[1]])
    }

    return elfRangeLength([smaller[0],larger[1]])
}

const file = readFileSync('input.txt', 'utf-8')

let accPartOne: number = 0
let accPartTwo: number = 0
file.split('\n').forEach(pair => {
    let p = pair.split(',')
    p[1] = p[1].replace("\r","")

    let smaller :number[] = processElfRange(p[0])
    let larger :number[] = processElfRange(p[1])
    if(!elfRangesOrdered(smaller,larger)){
        [smaller,larger] = [larger,smaller]
    }

    let overlap:number = getElfRangesOverlap(smaller,larger)

    if(overlap == elfRangeLength(smaller)){
        accPartOne += 1
    }

    if (overlap != 0){
        accPartTwo +=1
    }
})

console.log(`${accPartOne},${accPartTwo}`)