from typing import List, Tuple, TypeVar, Union
from functools import cmp_to_key

T = TypeVar('T')
NestedList = Union[T, List['NestedList[T]']]


def extractNestedList(line: str) -> NestedList[int]:
    nestedList: NestedList[int] = []

    toadd: str = ''

    index = 0
    while (index + 1 <= len(line)):
        character = line[index]

        if not character.isnumeric() and toadd != '':
            c = int(toadd)
            nestedList.append(c)
            toadd = ''

        if character == ',':
            index = index + 1
            continue

        if character == '[':
            endIndex = chopchop(line, index)
            subline = line[index+1:endIndex-1]
            subList = extractNestedList(subline)
            nestedList.append(subList)
            index = endIndex
            continue

        if character == ']':
            index = index + 1
            continue

        if character.isnumeric():
            toadd = toadd + character
            index = index + 1
            continue

    if toadd != '' and toadd.isnumeric():
        nestedList.append(int(toadd))

    return nestedList


def chopchop(line: str, startingIndex: int = 0, leftDelim: str = '[', rightDelim: str = ']'):
    """Returns the index that our substring has the same number of leftDelims and rightDelims.  

    IE, returns the index that we have the same number of left and right parenthesies"""
    depth = 0
    for index, character in enumerate(line[startingIndex:]):
        if character == leftDelim:
            depth = depth + 1

        if character == rightDelim:
            depth = depth - 1
            if depth == 0:
                return startingIndex + index + 1

    return -1


def readFile(file) -> List[NestedList[int]]:
    nestedLists: List[NestedList[int]] = []

    for line in file:
        line = line.strip('\n')
        if line == '':
            continue
        line = line[1:]
        list = extractNestedList(line)

        nestedLists.append(list)

    return nestedLists


def orderNestedLists(left, right):
    def compare(l, r):
        if l < r:
            return True
        if l > r:
            return False
        return None

    if type(left) == int and type(right) == int:
        return compare(left, right)

    if type(left) == int:
        left = [left]
    if type(right) == int:
        right = [right]

    for index in range(min(len(left), len(right))):
        result = orderNestedLists(left[index], right[index])
        if result is not None:
            return result

    return compare(len(left), len(right))


def partOne(lists: List[NestedList]) -> int:
    pairedLists = zip(lists[::2], lists[1::2])
    acc = 0

    for index, (left, right) in enumerate(pairedLists, start=1):
        ordered = orderNestedLists(left, right)
        if ordered:
            acc += index

    return acc


def partTwo(lists: List[NestedList]) -> int:

    def compareFuction(l, r):
        result = orderNestedLists(l, r)
        if result is True:
            return 1
        if result is False:
            return -1
        return 0

    divider_packets = [[[2]], [[6]]]

    for packet in divider_packets:
        lists.append(packet)

    lists.sort(key=cmp_to_key(compareFuction), reverse=True)

    acc: int = 1
    for packet in divider_packets:
        i = lists.index(packet) +1
        acc *= i
    return acc


if __name__ == "__main__":
    # for debugging these should be specified as absolute paths, for running they can just be specified as relative
    filename = r'example.txt'
    filename = r'input.txt'


    with open(filename, 'r') as fp:
        lists = readFile(fp)

    print(partOne(lists))
    print(partTwo(lists))
