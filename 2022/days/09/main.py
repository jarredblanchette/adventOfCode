import re
from enum import Enum, auto
from typing import List


class Direction(Enum):
    Up = auto(),
    Down = auto(),
    Left = auto(),
    Right = auto()


def logLocation(tail: List[int], covered: List[List[int]]) -> List[List[int]]:
    if tail not in covered:
        covered.append([tail[0], tail[1]])
    return covered


def strToDirectionEnum(string: str) -> Direction:
    if string == 'U':
        return Direction.Up
    if string == 'D':
        return Direction.Down
    if string == 'L':
        return Direction.Left
    if string == 'R':
        return Direction.Right
    raise Exception(
        f'Could not parse direction, {string} is not a valid direction')


def parseLine(line: str) -> re.Match[str]:
    reCommand = re.compile(r"^ *(\w+) *(\d+) *$")
    matches = reCommand.match(line)
    if matches is None:
        raise Exception(f'Line {line} could not be parsed')
    return matches


def moveRope(rope: List[List[int]], direction: Direction) -> List[List[int]]:
    rope[0] = moveHead(rope[0], direction)
    for i, follower in enumerate(rope[1:]):
        i = i + 1
        leader = rope[i-1]
        follower = tailFollow(leader, follower)

    return rope


def tailFollow(head: List[int], tail: List[int]) -> List[int]:
    # covering
    if tail == head:
        return tail

    xDelta, yDelta = tail[0]-head[0], tail[1]-head[1]

    # in line vertically
    if yDelta == 0:
        if xDelta == - 2:
            tail[0] = head[0] - 1

        if xDelta == 2:
            tail[0] = head[0] + 1

        return tail

    # inline horizontally
    if xDelta == 0:
        if yDelta == - 2:
            tail[1] = head[1] - 1

        if yDelta == 2:
            tail[1] = head[1] + 1

        return tail

    # cover the diagonal cases
    # off by 2,2
    if abs(xDelta) == 2 and abs(yDelta) == 2:
        if xDelta == -2:
            tail[0] = head[0]-1
        else:
            tail[0] = head[0]+1

        if yDelta == -2:
            tail[1] = head[1]-1
        else:
            tail[1] = head[1]+1

        return tail

    # off by 2,1
    # below and offset
    if yDelta == - 2:
        tail[1] = head[1] - 1
        tail[0] = head[0]
        return tail

    # above and offset
    if yDelta == 2:
        tail[1] = head[1] + 1
        tail[0] = head[0]
        return tail

    # left and offset
    if xDelta == - 2:
        tail[0] = head[0] - 1
        tail[1] = head[1]
        return tail

    # right and offset
    if xDelta == 2:
        tail[0] = head[0] + 1
        tail[1] = head[1]
        return tail

    # else they're diagonal one step
    return tail


def moveHead(head, direction):
    if direction == Direction.Up:
        head[1] = head[1] - 1
    if direction == Direction.Down:
        head[1] = head[1] + 1
    if direction == Direction.Left:
        head[0] = head[0]-1
    if direction == Direction.Right:
        head[0] = head[0]+1

    return head


def visualise(rope: List[List[int]]):
    width, height = getRange(rope)

    grid = [['.' for x in range(0, width)] for y in range(0, height)]

    for index, knot in enumerate(rope):
        grid[knot[1]][knot[0]] = str(index)

    grid[rope[0][1]][rope[0][0]] = 'H'
    return grid


def getRange(rope):
    minHorizontal, maxHorizontal = min(
        min([x[0] for x in rope]), 0), max([x[0] for x in rope])
    minVertical, maxVertical = min(
        min([x[1] for x in rope]), 0), max([x[1] for x in rope])
    horizontal = maxHorizontal - minHorizontal + 1
    vertical = maxVertical - minVertical + 1
    return horizontal, vertical


if __name__ == '__main__':
    fileName = 'input.txt'

    head, tail = [0, 0], [0, 0]
    rope = [[0, 0] for i in range(10)]

    coveredPartOne = []
    coveredPartTwo = []
    with open(fileName, 'r') as fp:
        for line in fp:
            line = line.strip('\r\n')
            matches = parseLine(line)
            amount, direction = int(matches[2]), strToDirectionEnum(matches[1])
            while amount > 0:
                head = moveHead(head, direction)
                tail = tailFollow(head, tail)
                rope = moveRope(rope, direction)
                amount = amount-1

                coveredPartOne = logLocation(tail, coveredPartOne)
                coveredPartTwo = logLocation(rope[-1], coveredPartTwo)
                # visual = visualise(rope)
                # for row in visual:
                #     acc = ''
                #     for elem in row:
                #         acc += elem
                #     print(acc)

    print(len(coveredPartOne), len(coveredPartTwo))
