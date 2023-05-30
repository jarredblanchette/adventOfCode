import re
from enum import Enum, auto

def parseInitialState(line: str, stacks: list[list[str]]):
    # assuming we have single digit labels
    offset = 0
    boxWidth = 4
    while len(line) > offset:
        if line[offset] == '[':
            stacks[int(offset/boxWidth)] = [line[offset+1]] + stacks[int(offset/boxWidth)]
        offset += boxWidth
    return stacks

def parseMove(line: str):
    matches = re.match(r'move (\d+) from (\d+) to (\d+)', line)
    if matches is None:
        return []
    l = list(map(lambda x: int(x),matches.groups()))
    l[1] -= 1
    l[2] -= 1

    return l

def moveBoxes(stacks: list[list[str]],instructions : list[int], amount:int=1):

    boxes = stacks[instructions[1]][-amount:]
    stacks[instructions[1]] = stacks[instructions[1]][:-amount]
    stacks[instructions[2]] += boxes

    if instructions[0] > 1:
        return moveBoxes(stacks,[instructions[0]-1,instructions[1],instructions[2]],amount)

    return stacks
        

if __name__ == '__main__':
    class State(Enum):
        INIT = auto()
        LABLES= auto()
        MOVING= auto()
    
    fileName = 'example.txt'

    stackPtOne: list[list[str]] = [[]]*9
    stackPtTwo: list[list[str]] = [[]]*9


    state = State.INIT

    partOneAcc = ''
    partTwoAcc = ''
    with open(fileName,'r') as file:
        for line in file:
            if state is State.INIT:
                if re.match(r'^(?: *\d *)+$',line) is not None:
                    state = State.LABLES
                    continue
                else:
                    stackPtOne = parseInitialState(line,stackPtOne)
                    stackPtTwo = parseInitialState(line,stackPtTwo)

            
            if state is State.LABLES:
                if re.match(r'^ *$',line) is not None:
                    state = State.MOVING
                    continue
            
            if state is State.MOVING:
                instructions = parseMove(line)

                stackPtOne = moveBoxes(stackPtOne,parseMove(line))

                stackPtTwo = moveBoxes(stackPtTwo,parseMove(line),amount=parseMove(line)[0])

    for stack in stackPtOne:
        if stack != []:
            partOneAcc += stack[-1]

    for stack in stackPtTwo:
        if stack != []:
            partTwoAcc += stack[-1]
    print(partOneAcc,partTwoAcc)