def unique(list):
    for index,item in enumerate(list):
        if item in list[index+1:]:
            return False
    return True

if __name__ == '__main__':
    filename = 'input.txt'
    windowLength = 14
    window = ''
    datastream = ''

    with open(filename,'r') as file:
        for line in file:
            line.strip('\n\r')
            datastream += line
    
    datastream = iter(datastream)
    
    while len(window) < windowLength:
        window += next(datastream)

    index = windowLength

    while(not unique(window)):        
        index +=1
        window = window[1:] + next(datastream)
    print(window,index)