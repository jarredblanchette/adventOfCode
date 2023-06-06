import { readFileSync } from 'fs'

enum TerminalLineType {
    File = 1,
    Command = 2,
    Directory = 3
}

function parseLineType(line: string): [TerminalLineType | null, RegExpMatchArray | null] {
    const reCommand = /^\$ *(\w+) *([\w\/\.]+)*$/
    const reDir = /^dir (\w+)$/
    const reFile = /^(\d+) ([\w\.]+)$/

    if (reCommand.test(line)) {
        return [TerminalLineType.Command, line.match(reCommand)]
    }
    if (reDir.test(line)) {

        return [TerminalLineType.Directory, line.match(reDir)]
    }
    if (reFile.test(line)) {
        return [TerminalLineType.File, line.match(reFile)]
    }

    return [null, null]
}

function getFullElementName(path: string[], elementName: string): string {
    if (path.length == 0) {
        return '/'
    }

    if (path.length == 1) {
        return path[0] + elementName
    }

    let delimPath: string = path.reduce((acc, current) => {
        if (acc == '/' || current == '/') {
            return acc + current
        }
        return acc + '/' + current
    }, '')

    if (elementName == undefined) {
        return delimPath
    }

    return delimPath + '/' + elementName
}

class fileNode {
    children: string[]
    parent: string
    size: number
    type: string

    constructor(children?: string[], parent?: string, size?: number, type?: string) {
        if (children != undefined) this.children = children
        if (parent != undefined) this.parent = parent
        if (size != undefined) this.size = size
        if (type != undefined) this.type = type
    }
}


function addElement(path: string[], rawName: string, size?: number, type?: string) {
    let fileName: string = getFullElementName(path, rawName)
    let parentName = path.at(-1)
    if (parentName == undefined) throw new Error(`Missing parent node from path.  Path is ${path}`)
    let parentPath: string = getFullElementName(path.slice(0, -1), parentName)

    structure.set(fileName, new fileNode([], parentPath, size, type))

    let parent = structure.get(parentPath)
    if (!parent) throw new Error(`Missing parent node.  Expected parent at ${parentPath}`)

    parent.children.push(fileName)
    structure.set(parentPath, parent)
}

function computeSize(entityName: string) {
    let element = structure.get(entityName)
    if (!element) throw new Error(`Missing element.  Expected element at ${entityName}`)

    let acc = 0
    element.children.forEach(childName => {
        let child = structure.get(childName)

        if (child?.type == 'File') acc += child.size
        if (child?.type == 'Directory') {
            computeSize(childName)
            let s = structure.get(childName)?.size
            if (s != undefined) {
                acc += s
            }
        }

    });

    element.size = acc
}


// main
let path: string[] = ['/']
let structure: Map<string, fileNode> = new Map<string, fileNode>([['/', new fileNode([])]])

const file = readFileSync('input.txt', 'utf-8')

file.split('\n').forEach(line => {
    line = line.replace("\r", "")
    let [lineType, matches]: [TerminalLineType | null, RegExpMatchArray | null] = parseLineType(line)

    if (matches == null || lineType == null) {
        throw new Error(`Unknown pattern at line ${line}`);
    }

    if (lineType == TerminalLineType.Command) {

        if (matches[1] == 'ls') {
            return
        }

        if (matches[1] == 'cd') {
            switch (matches[2]) {
                case '..':
                    path.pop()
                    return;

                case '/':
                    path = ['/']
                    return;

                default:
                    path.push(matches[2])
                    return;
            }
        }
    }

    if (lineType == TerminalLineType.File) {

        let size: number = Number(matches[1])
        let rawName: string = String(matches[2])
        addElement(path, rawName, size, 'File')
    }

    if (lineType == TerminalLineType.Directory) {
        let rawName: string = String(matches[1])
        addElement(path, rawName, 0, 'Directory')
    }


})

computeSize('/')
let accPartOne: number = 0
const partOneMaxSize: number = 100000

const capacity: number = 70000000
const updateSpace: number = 30000000

let usedSpace: number
let root: fileNode | undefined = structure.get('/');

if (root !== undefined) {
    usedSpace = root.size;
} else {
    throw new Error("Missing root node in structure");
}

let toFree: number = updateSpace - (capacity - usedSpace)
let partTwoCandidate: number = usedSpace

structure.forEach(element => {

    if ((element.size < partOneMaxSize) && element.type == 'Directory') {
        accPartOne += element.size
    }

    if (element.type == 'Directory' && element.size < partTwoCandidate && element.size >= toFree) {
        partTwoCandidate = element.size
    }
});

console.log(accPartOne, partTwoCandidate)