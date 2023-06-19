from typing import List, TypeVar, Callable

T = TypeVar('T')
START_VALUE = ord('S') - ord('a')
EXIT_VALUE = ord('E') - ord('a')


def readFile(file) -> List[List[int]]:
    map: List[List[int]] = [[]]
    map.pop()
    for line in file:
        line = line.strip('\n')
        row = [ord(element) - ord('a') for element in line]
        map.append(row)
    return map


def getAdjacent(area: List[List[T]], coordinate: tuple[int]) -> List[tuple[int]] | None:
    coordinates: List[tuple(int, int)] = []

    if (coordinate[1] > 0):
        coordinates.append((coordinate[0], coordinate[1]-1))

    if (coordinate[0]+1 < len(area[0])):
        coordinates.append((coordinate[0]+1, coordinate[1]))

    if (coordinate[1]+1 < len(area)):
        coordinates.append((coordinate[0], coordinate[1]+1))

    if (coordinate[0] > 0):
        coordinates.append((coordinate[0]-1, coordinate[1]))

    return coordinates


def getCoords(key: T, area: List[List[T]]) -> List[tuple[int, int]] | None:
    """returns the indicies of an element occuring in a list[list], or none if no such element exists"""
    acc = []
    for y, row in enumerate(area):
        for x, element in enumerate(row):
            if element == key:
                acc.append((x, y))
    if acc:
        return acc
    return None


def traversable(start: tuple[int, int], destination: tuple[int, int], area: List[List[int]]) -> bool:
    # return  area[start[1]][start[0]] == START_VALUE \
    # or area[destination[1]][destination[0]] == EXIT_VALUE\
    if area[destination[1]][destination[0]] == EXIT_VALUE:
        return ord('z')-ord('a') - area[start[1]][start[0]] <= 1
    if area[start[1]][start[0]] == START_VALUE:
        return area[destination[1]][destination[0]] <= 1
    return (area[destination[1]][destination[0]] - (area[start[1]][start[0]])) <= 1


def prettyPrint(area: List[List[int]], visited: List[tuple[int, int]], edge: List[tuple[int, int]]):
    acc = ''
    for y, row in enumerate(area):
        for x, element in enumerate(row):
            if (x, y) in visited:
                acc += '_'
            elif (x, y) in edge:
                acc += '#'
            else:
                acc += chr(element+ord('a'))
        acc += '\n'
    return acc


def findSteps(start: tuple[int, int] | List[tuple[int, int]], destination: tuple[int, int], area: List[List[int]], adjacencyMethod: Callable[[List[List[T]], tuple[int, int]], List[tuple[int, int]] | None] = getAdjacent) -> int | None:
    """Using a floodfill implementation, calculate the number of steps to get from start to destination.
    Returns the number of steps, or None if no path
    :param start:  the tuple (x,y) of where we start, or the list of tuples where we start
    :param destination: a tuple (x,y) of our destination
    :param area: a heightmap, a list of lists where each list is a row
    :param adjacencyMethod: a callable taking an param with the signature of area, and a tuple corosponding to the coord of interest.  Returns a list of tuples adjacent to our index, or none
    """

    steps: int = -1
    edge: List[tuple[int, int]]

    if type(start) is tuple:
        edge = [start]
    else:
        edge = start

    visited: List[tuple[int, int]] = []

    while not destination in visited and len(edge) > 0:
        steps += 1
        newEdge = []

        # if you size the console window correctly, prettyprint will give you a sort of movie of the floodfill, which is neat.
        # print(prettyPrint(area,visited,edge))

        for location in edge:

            visited.append(location)

            adjacent = adjacencyMethod(area, location)

            if adjacent is None:
                continue
            accessible = [
                x for x in adjacent if traversable(location, x, area)]

            if accessible is None:
                continue

            for x in accessible:
                if x not in visited \
                        and x not in newEdge \
                        and x not in edge:
                    newEdge.append(x)

        edge = newEdge

    if destination in visited:
        return steps

    return None


if __name__ == '__main__':
    filename = r'input.txt'

    area: List[List[int]]

    with open(filename, 'r') as fp:
        area = readFile(fp)

    start = getCoords(START_VALUE, area)
    exit = getCoords(EXIT_VALUE, area)
    exit = exit[0]

    print(findSteps(start, exit, area))

    # part two, just find from a
    start = getCoords(ord('a')-ord('a'), area)
    print(findSteps(start, exit, area))
