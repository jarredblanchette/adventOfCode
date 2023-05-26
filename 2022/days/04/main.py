def getSpan(elfRange):
    return int(elfRange[2]) - int(elfRange[0]) + 1


def orderBySize(left, right):
    if getSpan(left) < getSpan(right):
        return left, right
    return right, left


def getOverlap(left, right):
    # mispredicted the problemn, so we calculate the overlap but in main loop just check we have any overlap
    # 0 1 2 3 4 5 6 7
    #     x-----x
    #   x---x
    #         x---x
    #       x-x
    # x-x
    #             x-x
    smaller, larger = orderBySize(left, right)

    # close out cases where our range is fully excluded
    if smaller[2] < larger[0] or smaller[0] > larger[2]:
        return 0

    # close out cases where we're fully enclosed
    if contained(smaller, larger):
        return getSpan(smaller)

    # our smaller is further to the left
    if smaller[0] <= larger[0] and smaller[2] <= larger[2]:
        return smaller[2] - larger[0] + 1

    # our smaller is further to the right
    if smaller[0] >= larger[0] and smaller[2] >= larger[2]:
        return larger[2] - smaller[0]  + 1

    return -1

def contained(left, right):
    smaller,larger = orderBySize(left,right)
    return (smaller[0] >= larger[0] and smaller[2] <= larger[2])

def process(elfRange):
    l,r = elfRange.split('-')
    return [int(l),'-', int(r)]
    

if __name__ == '__main__':
    file = 'input.txt'

    partOneAcc,partTwoAcc = 0,0
    with open(file, 'r') as fp:
        for line in fp:
            left, right = line.split(',')
            right = right.strip('\n')

            left,right = process(left),process(right)

            # handle part 1
            if contained(left,right):
                partOneAcc += 1

            # handle part 2
            if getOverlap(left,right) > 0:
                partTwoAcc += 1

    print(partOneAcc,partTwoAcc)