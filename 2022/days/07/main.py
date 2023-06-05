from enum import Enum,auto
import  re
from functools import reduce
class TerminalLineType(Enum):
    Command = auto()
    Directory = auto()
    File =auto()

def getCommandType(line): 
    reCommand = re.compile(r"^\$ *(\w+) *([\w\/\.]+)*$")
    reDir = re.compile(r"^dir (\w+)$")
    reFile = re.compile(r"^(\d+) ([\w\.]+)$")

    if reCommand.match(line):
        return TerminalLineType.Command, reCommand.match(line)

    if reDir.match(line):
        return TerminalLineType.Directory,reDir.match(line)
    
    if reFile.match(line):
        return TerminalLineType.File,reFile.match(line)

    return None,None

def addElement(path, structure, elementName, type, elementSize = None):

    elementName = getElementName(path,elementName)
    parent =getElementName(path[:-1],path[-1])

    if not structure.get(elementName,None):
        structure[elementName] = {'parent': set([path[-1]]) ,'children':set(),'type':type,'size': elementSize}
    else:
        structure[elementName]['parent'].add([elementName])
    structure[parent]['children'].add(elementName)

    return structure

def getElementName(path,elementName):
    def genString(accumulator, new):
        #this could be a lambda, but it's pushing what would be reasonably readable. Which it does anyway
        if new == '/':
            return accumulator
        if (len(accumulator) ==1 or accumulator[-1] == '/'):
            return accumulator + new
        return accumulator +'/'+new
    
    return reduce(genString, path + [elementName])

def computeSize(structure,element='/'):
    if element not in structure:
        return structure
    
    if structure[element]['size'] is not None:
        return structure
    
    children = structure[element]['children']
    acc = 0
    for child in children:
        structure = computeSize(structure,child)
        acc += structure[child]['size']
    
    structure[element]['size'] = acc
    return structure
    
    


if __name__=='__main__':
    fileName = 'input.txt'

    path = ['/']
    maxSizeForPartOne =  100000
        
    
    #this is basically a doubly linked list
    structure = {'/' : {'parent': None ,'children': set(),'size':None, 'type': 'directory'} }

    with open(fileName,'r') as fp:
        for line in fp:
            line.strip('\r\n')

            commandType,matches = getCommandType(line)
            if commandType is None or matches is None:
                raise Exception

            parent = getElementName(path[:-1],path[-1])

            if commandType == TerminalLineType.Command:
                command = matches[1]
                param = matches[2]
                
                if command == 'cd':
                    if param == '..':
                        path.pop()
                    elif param == '/':
                        path = ['/']
                    else:
                        structure = addElement(path, structure, param,'directory')
                        path.append(param)

            if commandType == TerminalLineType.Directory:
                param = getElementName(path,matches[1])
                structure[parent]['children'].add(param)

            if commandType == TerminalLineType.File:
                size = int(matches[1])
                name  = matches[2]
                fullName = getElementName(path,matches[2])
                structure = addElement(path,structure,name,'file' ,size)
                structure[parent]['children'].add(fullName)

    structure = computeSize(structure)

    partOneAcc = 0
    totalSize = structure['/']['size']

    partTwoBest = structure['/']['size']
    partTwoTarget = 30000000 - (70000000 - totalSize)
    
    for key in structure:
        element = structure[key]
        if element['type'] == 'directory' and element['size'] < maxSizeForPartOne:
            partOneAcc += element['size']

        if element['type'] == 'directory'  and element['size'] < partTwoBest and element['size'] >= partTwoTarget:
            partTwoBest = element['size']

    print(partOneAcc,partTwoBest)
    
    
