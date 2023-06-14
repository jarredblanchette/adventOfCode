from typing import Dict, Iterator, List, Callable, Tuple, get_type_hints
from enum import Enum, auto
from math import floor
import re
from functools import reduce


class Op(Enum):
    Add = auto(),
    Subtract = auto(),
    Multiply = auto(),
    Divide = auto(),
    Power = auto()
    LessThan = auto(),
    GreaterThan = auto(),
    DivisableBy = auto()


def toOp(characters: str) -> Op | List[Op]:
    if characters == '+':
        return Op.Add
    if characters == '-':
        return Op.Subtract
    if characters == '*':
        return [Op.Multiply, Op.Power]
    if characters == '/':
        return Op.Divide
    if characters == '<':
        return Op.LessThan
    if characters == '>':
        return Op.GreaterThan
    if characters == 'divisible':
        return Op.DivisableBy

    raise Exception(f"Could not parse {characters} to Op")


def multiplyOrPower(lhs: str, operations: List[Op], rhs: str) -> Callable[[int], int]:
    if Op.Power in operations and lhs == rhs:
        return getCalculation(Op.Power, 0)
    elif Op.Multiply in operations:
        return getCalculation(Op.Multiply, int(rhs))
    raise Exception(
        f"Could not parse {lhs} {operations} {rhs} into a Callable")


def getCalculation(op: Op, value: int) -> Callable[[int], int | bool]:
    if op == Op.Add:
        return lambda elem: elem + value
    if op == Op.Subtract:
        return lambda elem: elem - value
    if op == Op.Multiply:
        return lambda elem: elem * value
    if op == Op.Divide:
        return lambda elem: int(elem / value)
    if op == Op.Power:
        return lambda elem: elem * elem
    if op == Op.LessThan:
        return lambda elem: elem < value
    if op == Op.GreaterThan:
        return lambda elem: elem > value
    if op == Op.DivisableBy:
        return lambda elem: (elem % value) == 0

    raise Exception("Exception in converting to expression")


class LineType(Enum):
    MonkeyId = auto(),
    StartingItems = auto(),
    Operation = auto(),
    Test = auto(),
    TestIfBranch = auto(),
    TestElseBranch = auto()


class Parser:
    reMonkeyId: Tuple[LineType, re.Pattern] = (
        LineType.MonkeyId, re.compile(r"^Monkey +(\d+):$"))
    reStartingItems: Tuple[LineType, re.Pattern] = (
        LineType.StartingItems, re.compile(r"^\s+Starting items: +((?:\d+,? ?)+)"))
    reOperation: Tuple[LineType, re.Pattern] = (LineType.Operation, re.compile(
        r"^\s+Operation: new = (-?\d+|old) +([+-/*]) +(-?\d+|old)"))
    reTest: Tuple[LineType, re.Pattern] = (
        LineType.Test, re.compile(r"^\s+Test:\s+(divisible)\s+by\s+(-?\d+)$"))
    reIfBranch: Tuple[LineType, re.Pattern] = (
        LineType.TestIfBranch, re.compile(r"^\s+If true: throw to monkey (\d+)"))
    reElseBranch: Tuple[LineType, re.Pattern] = (
        LineType.TestElseBranch, re.compile(r"^\s+If false: throw to monkey (\d+)"))

    def parseMonkey(self, monkeyString: str | List[str]):
        myDict: Dict[LineType, re.Match[str]] = {}

        if isinstance(monkeyString, str):
            monkeyString = monkeyString.split('\n')

        for line in monkeyString:
            line = line.strip('\r\n')
            lineType, matches = self.parse(line)
            myDict[lineType] = matches

        id = int(myDict[LineType.MonkeyId][1])
        items = [int(x) for x in myDict[LineType.StartingItems][1].split(', ')]

        operation = toOp(myDict[LineType.Operation][2])
        if isinstance(operation, List) and Op.Multiply in operation and Op.Power in operation:
            operation = multiplyOrPower(
                myDict[LineType.Operation][1], operation, myDict[LineType.Operation][3])
        else:
            if not isinstance(operation, Op):
                raise Exception("Expected an Op value")
            operation = getCalculation(
                operation, int(myDict[LineType.Operation][3]))

        testOp = toOp(myDict[LineType.Test][1])
        # todo: extend to support anything other than Divisible By
        if testOp != Op.DivisableBy:
            raise NotImplemented
        test = getCalculation(Op.DivisableBy, int(myDict[LineType.Test][2]))

        # todo: improve so it's not quite as much of ducktyping
        returnedValue = type(test(5))
        if returnedValue == int:
            raise Exception(
                f"Monkey test should return type of Callable[[int], bool] not Callable[[int], int]")

        destinationMonkeys: List[int] = [
            int(myDict[LineType.TestIfBranch][1]), int(myDict[LineType.TestElseBranch][1])]

        m = Monkey(id, items, operation, test, destinationMonkeys)  # type: ignore
        m.testValue = int(myDict[LineType.Test][2])
        return m

    def parse(self, line: str) -> Tuple[LineType, re.Match[str]]:
        for lineTypeRePattern in [self.reMonkeyId, self.reStartingItems, self.reOperation, self.reTest, self.reIfBranch, self.reElseBranch]:
            matches = lineTypeRePattern[1].match(line)
            if matches:
                return lineTypeRePattern[0], matches

        raise Exception(f"Could not parse line {line}")


class Monkey:
    id: int
    items: List[int]
    operation: Callable[[int], int]
    worryMethod: Callable[[int], int]
    test: Callable[[int], bool]
    testValue:int = 0
    destinationMonkeyIds: List[int]
    monkeyCatches: List[Callable[[int], None]]
    timesInspected: int

    def __init__(self, id: int, items: List[int], operation: Callable[[int], int], test: Callable[[int], bool], destinations: List[int] | None = None, worryMethod: Callable[[int], int] | None = None,) -> None:
        self.id = id
        self.items = items
        self.operation = operation
        self.test = test
        self.timesInspected = 0

        if worryMethod is None:
            worryMethod = lambda i: floor(i/3)
        self.worryMethod = worryMethod

        if destinations:
            self.destinationMonkeyIds = destinations

    def catchItem(self, item: int):
        # print(f"Eeek! {self.id} is catching {item}")
        self.items.append(item)

    def next(self):

        while len(self.items) > 0:
            item = self.items.pop(0)
            self.timesInspected += 1

            item = self.operation(item)
            item = self.worryMethod(item)

            if self.test(item):
                self.monkeyCatches[0](item)
            else:
                self.monkeyCatches[1](item)



if __name__ == '__main__':
    partOneMonkeyDict: dict[str, Monkey] = {}
    partTwoMonkeyDict: dict[str, Monkey] = {}
    fileName = 'input.txt'

    parser: Parser = Parser()

    with open(fileName, 'r') as fp:

        monkeyLines = fp.read().splitlines(False)

        start, end = 0, 6
        while start < len(monkeyLines):
            monkeyString = reduce(lambda l, r: l+'\n'+r,
                                  monkeyLines[start:end])
            currentMonkey: Monkey = parser.parseMonkey(monkeyString)
            partOneMonkeyDict[str(currentMonkey.id)] = currentMonkey

            currentMonkey: Monkey = parser.parseMonkey(monkeyString)
            partTwoMonkeyDict[str(currentMonkey.id)] = currentMonkey
            start, end = end+1, end+7

    # get all our monkeys able to talk to each other
    for monkeyDict in [partOneMonkeyDict,partTwoMonkeyDict]:
        for monkeyId in monkeyDict:
            # print(f"hooking up monkey {monkeyId} to {partOneMonkeyDict[monkeyId].destinationMonkeyIds}")
            monkeyDict[monkeyId].monkeyCatches = [monkeyDict[str(
                destId)].catchItem for destId in monkeyDict[monkeyId].destinationMonkeyIds]
            

    # 
    testProduct = reduce(lambda a,b:a*b,[monkey.testValue for monkey in partTwoMonkeyDict.values()])
    for id in partTwoMonkeyDict:
        partTwoMonkeyDict[id].worryMethod = lambda x: x % testProduct

    for round in range(1, 21):
        for monkey in partOneMonkeyDict.values():
            monkey.next()

    monkeyBusiness = [
        monkey.timesInspected for monkey in partOneMonkeyDict.values()]
    monkeyBusiness.sort()
    print(monkeyBusiness, reduce(lambda a, b: a*b, monkeyBusiness[-1:-3:-1]))

    for round in range(1, 10001):
        for monkey in partTwoMonkeyDict.values():
            monkey.next()

    monkeyBusiness = [
        monkey.timesInspected for monkey in partTwoMonkeyDict.values()]
    monkeyBusiness.sort()
    print(monkeyBusiness, reduce(lambda a, b: a*b, monkeyBusiness[-1:-3:-1]))
