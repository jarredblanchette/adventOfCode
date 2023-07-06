import re
from typing import List, Tuple

SAND = 'o'  # '▒'
WALL = '#'  # '▓'
SOURCE = '+'
AIR = '.'


def initMap(width: int,  height: int) -> List[List[str]]:
    map: List[List[str]] = [[]]
    map.pop()
    for y in range(0, height):
        row = []
        for x in range(0, width):
            row.append(AIR)
        map.append(row)

    return map

# TODO: restructure this so we don't read over the whole input twice.


def readFile(file: str):

    def drawVerticalLine(map: List[List[str]], start: tuple[int, int], end: tuple[int, int], valueToWrite: str = WALL):
        if not lineIsVertical(start, end):
            raise Exception("Expected start and end to be in common column")

        startY = min(start[1], end[1])
        endY = max(start[1], end[1])
        for y in range(startY, endY+1):
            map[y][start[0]] = valueToWrite
        return map

    def drawHorizontalLine(map: List[List[str]], start: tuple[int, int], end: tuple[int, int], valueToWrite: str = WALL):
        if not lineIsHorizontal(start, end):
            raise Exception("Expected start and end to be in common row")

        startX = min(start[0], end[0])
        endX = max(start[0], end[0])
        for x in range(startX, endX+1):
            map[start[1]][x] = valueToWrite
        return map

    def lineIsHorizontal(start: tuple[int, int], end: tuple[int, int]) -> bool:
        return start[1] == end[1]

    def lineIsVertical(start: tuple[int, int], end: tuple[int, int]) -> bool:
        return start[0] == end[0]

    def getBounds(file: str) -> tuple[int, int]:
        maxX = 0
        maxY = 0
        regex = re.compile(r"((\d+),(\d+))")

        for line in file:
            for match in re.findall(regex, line):
                maxX = max(int(match[1]), maxX)
                maxY = max(int(match[2]), maxY)

        return (maxX, maxY)

    textBlob: List[str] = []
    for line in file:
        line = line.strip('\n')
        if line != '':
            textBlob.append(line)

    regex = re.compile(r"((\d+),(\d+))")

    width, height = getBounds(textBlob)

    map: List[List[str]] = initMap(width+1, height+1)

    for line in textBlob:
        pen: Tuple[Tuple[int, int], Tuple[int, int]] = [[], []]
        line = line.strip('\n')
        if line == '':
            continue
        matches = re.findall(regex, line)
        if matches:
            pen[0] = [int(matches[0][1]), int(matches[0][2])]
        for match in matches:
            pen[1] = pen[0]
            pen[0] = [int(match[1]), int(match[2])]

            # seems to get the tests backwards
            if (lineIsHorizontal(pen[0], pen[1])):
                map = drawHorizontalLine(map, pen[1], pen[0])

            if (lineIsVertical(pen[0], pen[1])):
                map = drawVerticalLine(map, pen[1], pen[0])

        if (lineIsHorizontal(pen[0], pen[1])):
            map = drawHorizontalLine(map, pen[1], pen[0])

        if (lineIsVertical(pen[0], pen[1])):
            map = drawVerticalLine(map, pen[1], pen[0])
    return map


def prettyPrint(map: List[List[str]], xWindow: Tuple[int, int] | None = None, yWindow: Tuple[int, int] | None = None):
    acc: str = ''

    if xWindow is None:
        xWindow = [0, len(map[0])+1]
    if yWindow is None:
        yWindow = [0, len(map)+1]

    for y, row in enumerate(map):
        if y >= yWindow[0] and y <= yWindow[1]:
            for x, element in enumerate(row):
                if x >= xWindow[0] and x <= xWindow[1]:
                    acc += element
            acc += '\n'
    print(acc)


def simulateSandStep(map: List[List[str]], active: Tuple[int, int]) -> Tuple[int, int] | None:
    """simulates sand flowing in a map. Takes a map, and the location of the sand to consider.  Returns the new location of that sand or none if the sand has exited"""

    def getDirection(coordinates: Tuple[int, int]) -> Tuple[int, int]:
        """determines the direction the sand should move.  

        Takes a coordinate, then checks if we're at the bottom of the map.  If not, checks against the map down, down left, and down right.  Returns the coordinates of the first empty space."""
        # check we can just remove ourself
        if coordinates[1] + 1 >= len(map):
            return (-1, -1)

        if map[coordinates[1]+1][coordinates[0]] == AIR:
            return (coordinates[0], coordinates[1]+1)

        if map[coordinates[1]+1][coordinates[0]-1] == AIR:
            return (coordinates[0]-1, coordinates[1]+1)

        if map[coordinates[1]+1][coordinates[0]+1] == AIR:
            return (coordinates[0]+1, coordinates[1]+1)

        return coordinates
    
    map[active[1]][active[0]] = SAND

    newLocation = getDirection(active)
    if newLocation == active:
        return active

    map[active[1]][active[0]] = AIR

    if newLocation != (-1, -1):
        map[newLocation[1]][newLocation[0]] = SAND
        return newLocation

    return None


def simulateSand(map: List[List[str]], start: Tuple[int, int]) -> bool:
    """simulates the path of sand on a map.  

    Params:
    Map: the board state, as a 2d array 
    Start: the location the sand is released initially

    Returns:
    bool, indicating if the sand remained on the board.  If it's worth simulating more sand
    """

    # This could be improved to be less hacky.  What we're saying is that the sand starts _off the board_ before entering.
    previousSandLocation = (start[0],start[1]-1)
    active = start 
    while active is not None and active != previousSandLocation:
        previousSandLocation = active
        active = simulateSandStep(map, active)
        # This shows the active bit of sand and 10 units in each direction
        # prettyPrint(map, [active[0]-10,active[0]+10],[active[1]-10,active[1]+10])

    return active is not None


def sweepMap(map: List[List[str]]):
    for row in map:
        for element in row:
            if element == SAND:
                element = AIR


def addFloor(map: List[List[str]]):

    width: int = len(map[0])
    acc: List[str] = []
    
    # add empty space
    for _ in range(width):
        acc.append(AIR)
    map.append(acc)

    acc = []
    # add floor
    for _ in range(width):
        acc.append(WALL)
    map.append(acc)


def partOne(map: List[List[str]]):
    bitsOfSand = 0
    sandPersisted = simulateSand(map, (500, 0))

    while sandPersisted:
        bitsOfSand += 1
        sandPersisted = simulateSand(map, (500, 0))

    return map, bitsOfSand


def partTwo(map: List[List[str]]):

    def padLeft(padding):
        for row in map:
            for _ in range(0, padding):
                row.insert(0, AIR)

    def padRight(padding):
        for row in map:
            for _ in range(0, padding):
                row.append(AIR)

    bitsOfSand = 1

    source = (500, 0)
    # We're doing the simpleset implementation and just going really wide for the floor.
    # Assuming the worst case, the _max_ width is equal to the height both left and right from our source.
    # Luckily, we can just whack the floor on after we've extended the width
    height = len(map)
    leftPadding = max(source[0], height) - 500
    rightPadding = max( (height - (len(map[0]) - 500)), 0)

    if rightPadding:
        padRight(rightPadding+20)
    if leftPadding:
        padLeft(leftPadding+20)

    addFloor(map)

    # We need to shift our frame of reference, to account for the case where we're having to left pad a lot
    # else we'd be putting the sand in the wrong place
    source = (source[0] + leftPadding, source[1])

    sandPersisted = simulateSand(map, source)

    while sandPersisted and map[source[1]][source[0]] == AIR:
        bitsOfSand += 1
        sandPersisted = simulateSand(map, source)

    return map, bitsOfSand


if __name__ == "__main__":

    # filename = r'example.txt'
    filename = r'input.txt'

    with open(filename, 'r') as fp:
        map: List[List[str]] = readFile(fp)

    map, bitsOfSand = partOne(map)
    prettyPrint(map)
    print(bitsOfSand)
    sweepMap(map)

    map, bitsOfSand = partTwo(map)
    prettyPrint(map)
    print(bitsOfSand)

