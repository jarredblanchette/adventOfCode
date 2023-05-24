# https://adventofcode.com/2022/day/1


if __name__ == '__main__':
    input_filename = 'input.txt'

    calorie_list = []

    with open(file=input_filename, mode='r') as fp:
        candidate_total = 0
        for line in fp:
            if line == '\n':
                calorie_list.append(candidate_total)
                candidate_total = 0
                continue

            candidate_total = candidate_total + int(line)
        calorie_list.append(candidate_total)
    

    # using sort is nlogn, max is n, remove is n
    # to preserve calorie list, just copy it and use the copy
    max_calories_list = []
    for n in [1,2,3]:
        m = max(calorie_list)
        max_calories_list.append(m)
        calorie_list.remove(m)
    
    print(max(max_calories_list),sum(max_calories_list))


