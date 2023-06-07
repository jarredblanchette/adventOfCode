from typing import List


def isBoundry(x, y, forest):
    if (x == 0
            or y == 0
            or x == len(forest)-1
            or y == len(forest[0])-1
        ):
        return True
    return False


def getViews(row: List[int], column: List[int], x: int, y: int) -> List[List[int]]:
    """
    For a row and column, get what you can see for an index in order

    Returns what van be seen in an array of directions.  The directions are ordered:
    [Left, Right, Up, Down]

    Parameters:
    - row: The entirety of the row our tree inhabits.
    - column: The entirety of the column our tree inhabits.
    - x: The index in the row of our tree.
    - y: The index of the column of our tree.
      """
    left = row[:x][::-1]
    right = row[x+1:]
    up = column[:y][::-1]
    down = column[y+1:]

    return [left, right, up, down]


if __name__ == '__main__':
    fileName = 'input.txt'

    forest = []

    with open(fileName, 'r') as fp:
        for line in fp:
            line = line.strip('\r\n')
            row = []
            for character in line:
                row.append(int(character))
            forest.append(row)

    partOneAcc = 0
    partTwoBest = 0
    for y, row in enumerate(forest):
        for x, tree in enumerate(row):
            partOneCounted = False
            column = [irow[x] for irow in forest]

            if isBoundry(x, y, forest):
                partOneAcc += 1
                partOneCounted = True

            views = getViews(row, column, x, y)

            # This currently does part one and part two.
            # Could be seperated out, but it's readable enough and having two loops would not be good
            partTwoTreeScore = 1
            for i, treesInDirection in enumerate(views):

                # part one
                if len(treesInDirection) > 0 and max(treesInDirection) < tree and not partOneCounted:
                    partOneAcc += 1
                    partOneCounted = True

                # part two
                seeable = [t < tree for t in treesInDirection]
                sightDistance = len(seeable)
                if seeable.__contains__(False):
                    sightDistance = seeable.index(False) + 1
                partTwoTreeScore *= sightDistance

            if partTwoTreeScore > partTwoBest:
                partTwoBest = partTwoTreeScore

    print(partOneAcc, partTwoBest)
