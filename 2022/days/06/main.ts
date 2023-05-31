import { readFileSync } from 'fs'


class NotAnActualStream {
    private contents: string;
    private index: number = 0

    constructor(contents?: string) {
        if (contents) { this.contents = contents }
    }

    hasMore(): boolean {
        return (this.contents.length > this.index + 1)
    }

    append(more: string) {
        if (!this.contents) {
            this.contents = more

        } else {
            this.contents = this.contents.concat(more)

        }
    }

    getNumCharRead(): number {
        return this.index
    }

    next(characters?: number): string | null {
        if (!this.hasMore()) {
            return null
        }

        if (!characters) {
            characters = 1
        }

        if (this.contents.length > this.index + characters) {
            this.index += characters
            return this.contents.slice(this.index, this.index + characters)
        }

        let remainder = this.contents.length - this.index
        let result = this.contents.slice(this.index, this.index + remainder)
        this.index += remainder
        return result
    }
}

function unique(str: string): boolean {
    for (let index = 0; index < str.length; index++) {
        if(str.slice(index+1).includes(str[index])){
            return false
        }        
    }
    return true    
}

const file = readFileSync('input.txt', 'utf-8')
let stream: NotAnActualStream = new NotAnActualStream()

file.split('\n').forEach(line => {
    line = line.replace("\r", "")
    stream.append(line)
});

const windowLength = 14
let window = stream.next(windowLength)

if(window == null || window.length < windowLength){
    throw new Error("insufficent characters");
}

while(!unique(window))
{
    const next: string|null = stream.next()
    if(next == null){
        throw new Error(`encountered end of stream without unique substring of length ${windowLength}`);   
    }
    window = window?.slice(1).concat(next)
}

console.log(window,stream.getNumCharRead()+1)