from enum import Enum, auto
import re
from typing import Callable, Tuple, Iterator


class LineType(Enum):
    NoOp = auto()
    AddX = auto()


def parseLine(line: str) -> Tuple[LineType, re.Match[str]]:
    reNoOp: re.Pattern = re.compile(r"^noop$")
    reAddX: re.Pattern = re.compile(r"^addx (-?\d+)$")

    noOpMatches = reNoOp.match(line)
    if noOpMatches:
        return LineType.NoOp, noOpMatches

    addXMatches = reAddX.match(line)
    if addXMatches:
        return LineType.AddX, addXMatches

    raise Exception(f"Could not parse line: {line}")


class cpu:

    class State(Enum):
        Ready = 1,
        Adding = 2

    instructions: Iterator
    xRegister: int
    clock: int
    state: State
    toAdd: int
    lineProcessing:  Callable[[str], str]
    more: bool

    def __init__(self, instructions: Iterator, xRegister: int | None = None, clock: int | None = None, lineProcessing: Callable[[str], str] | None = None):
        def stripper(string: str) -> str:
            return string.strip('\r\n')

        self.instructions = instructions
        self.xRegister = 1
        self.clock = 1
        self.state = cpu.State.Ready
        self.toAdd = 0
        self.lineProcessing = stripper
        self.more = True

        if xRegister:
            self.xRegister = xRegister
        if clock:
            self.clock = clock
        if lineProcessing:
            self.lineProcessing = lineProcessing

    def next(self):
        self.more = True
        self.clock += 1

        if self.state == cpu.State.Adding:
            self.xRegister += self.toAdd
            self.toAdd = 0
            self.state = cpu.State.Ready
            return

        line = next(self.instructions, None)
        if line is None:
            self.more = False
            return
        line = self.lineProcessing(line)

        lineType, matches = parseLine(line)

        if lineType == LineType.NoOp:
            return

        if lineType == LineType.AddX:
            self.state = cpu.State.Adding
            self.toAdd = int(matches[1])
            return


class crt:
    width: int = 40
    height: int = 6
    screen: list[list[str]]
    head = [0, 0]

    def __init__(self):
        self.screen = [['.' for x in range(0, self.width)]
                       for y in range(0, self.height)]

    def drawAt(self, x: int, y: int, charToDraw: str | None = None) -> None:
        if charToDraw is None:
            charToDraw = '#'
        self.screen[y][x] = charToDraw

    def next(self, sprite: int | None = None):
        if(self.head[0]>=self.width and self.head[1]>=self.height): return

        if sprite and abs(sprite - self.head[0]) <= 1:
            charToDraw = '#'
            self.drawAt(self.head[0], self.head[1], charToDraw)

        if self.head[0]+1 >= self.width:
            self.head[0] = 0
            self.head[1] += 1
            return
        
        self.head[0] +=1

    def formatDisplay(self) -> str:
        acc = ''
        for row in self.screen:
            for elem in row:
                acc+= elem       
            acc += '\n'
        return acc

if __name__ == '__main__':
    fileName = 'input.txt'

    registerX = 1
    clock = 1
    cyclesOfInterest = list(range(20, 260, 40))

    partOneAcc = 0

    with open(fileName, 'r') as fp:
        myCpu: cpu = cpu(iter(fp))
        myCrt: crt = crt()
        while myCpu.more:
            if (myCpu.clock in cyclesOfInterest):
                partOneAcc += myCpu.clock * myCpu.xRegister
                cyclesOfInterest.remove(myCpu.clock)
            myCrt.next(myCpu.xRegister)
            myCpu.next()
        

        print(partOneAcc)
        print(myCrt.formatDisplay())
