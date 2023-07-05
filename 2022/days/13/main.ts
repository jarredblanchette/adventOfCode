import { readFileSync } from 'fs'
type NestedArray<T> = Array<NestedArray<T>> | T;

function getSubclauseEndIndex(input: string, startingIndex: number, leftDelim: string = '[', rightDelim: string = ']'): number {
    let depth: number = 0

    for (let index = startingIndex; index < input.length; index++) {
        const element = input[index];

        if (element == leftDelim) {
            depth += 1
            continue
        }

        if (element == rightDelim) {
            depth -= 1

            if (depth == 0) return index + 1
        }

    }

    return -1
}

function extractNestedList(input: string, leftDelim: string = '[', rightDelim: string = ']'): NestedArray<number> {
    let nestedArray: NestedArray<number> = []
    let toAdd: string = ''

    for (let index = 0; index < input.length; index++) {
        const character: string = input[index];

        if (!isNaN(parseInt(character))) {
            toAdd += character
        } else if (toAdd != '') {
            nestedArray.push(parseInt(toAdd))
            toAdd = ''
        }

        if (character == leftDelim) {
            const endIndex: number = getSubclauseEndIndex(input, index, leftDelim, rightDelim)
            const substring: string = input.slice(index + 1, endIndex - 1)
            nestedArray.push(extractNestedList(substring, leftDelim, rightDelim))
            input = input.slice(endIndex)
        }
    }

    if (toAdd != '') {
        nestedArray.push(parseInt(toAdd))
        toAdd = ''
    }

    return nestedArray
}

function loadLists(input: string): NestedArray<number>[] {
    const splitString: string[] = fs.split('\n')
    let lists: NestedArray<number>[] = []
    lists.pop()

    splitString.forEach(line => {
        line = line.replace("\r", '')
        if (line != '') lists.push(extractNestedList(line))
    })

    return lists
}



function ordered(left: NestedArray<number>, right: NestedArray<number>): number {
    function cmp(left: number, right: number): number {
        return right - left
    }

    if (typeof (left) == 'number' && typeof (right) == 'number') return cmp(left, right)

    if (typeof (left) == 'number') left = [left]
    if (typeof (right) == 'number') right = [right]

    const minlen = Math.min(left.length, right.length)

    for (let index = 0; index < minlen; index++) {
        const res = ordered(left[index], right[index])
        if (res != 0) return res
    }

    return cmp(left.length, right.length)
}

function indexOf(lists: NestedArray<number>[], value: NestedArray<number>): number {
    for (let index = 0; index < lists.length; index++) {
        const element = lists[index];
        if (element == value) return index
    }
    return -1
}

function partOne(lists: NestedArray<number>[]): number {
    // my kingdom for list[::2] and list[1::2]
    const firsts = lists.filter((element, index) => index % 2 == 0)
    const seconds = lists.filter((element, index) => (index + 1) % 2 == 0)
    let pairedLists: NestedArray<number>[][] = []
    pairedLists.pop()

    for (let i = 0; i < firsts.length; i++) {
        const f = firsts[i];
        const s = seconds[i]
        pairedLists.push([f, s])
    }

    let acc = 0
    pairedLists.forEach((pair, index) => {
        const sorted = ordered(pair[0], pair[1])
        if (sorted != null && sorted > 0) acc += index + 1
    });

    return acc

}

function partTwo(lists: NestedArray<number>[], dividerPackets: NestedArray<number>[] = [[[2]],[[6]]]): number {

    dividerPackets.forEach(packet => {
        lists.push(packet)
    });

    lists.sort(ordered).reverse()

    let acc = 1
    dividerPackets.forEach(packet => {
        acc *= indexOf(lists,packet) +1
    });

    return acc

}


let fs = readFileSync('input.txt', 'utf-8');
let lists: NestedArray<number>[] = loadLists(fs);

console.log(partOne(lists))
console.log(partTwo(lists))
