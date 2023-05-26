import functools

def splitRucksack(rucksack: str):
    return rucksack[0:int(len(rucksack)/2)], rucksack[int(len(rucksack)/2):].strip('\n')


def findRepeats(characters, lists):
    for character in characters:
        inAll = True
        for list in lists:
            if character not in list:
                inAll = False
                break
        if inAll: 
            return character
    return


def scoreCharacter(character):
    if character.isupper():
        return ord(character) - ord('A') + 27
    return ord(character) - ord('a') + 1


if __name__ == '__main__':
    file = 'input.txt'

    # part one
    accumulator = 0
    with open(file, 'r') as fp:
        for rucksack in fp:
            compartments = splitRucksack(rucksack)
            accumulator += scoreCharacter(findRepeats(compartments[0],compartments))
    print(accumulator)

    accumulator = 0
    with open(file, 'r') as fp:
        rucksacks = []
        for rucksack in fp:
            rucksacks.append(rucksack)
            if len(rucksacks) != 3:
                continue

            combinedRucksacks = functools.reduce(lambda l1,l2: l1 + l2, rucksacks)            
            accumulator += scoreCharacter(findRepeats(combinedRucksacks,rucksacks))

            rucksacks = []
    print(accumulator)