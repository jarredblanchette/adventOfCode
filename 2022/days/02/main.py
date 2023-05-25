if __name__ == '__main__':
    def to_int(play):
        if type(play) is int:
            return play
        con = {'X':0,'Y':1,'Z':2, 'A':0,'B':1,'C':2}
        return con.get(play,-1)
    
    def get_win(opponent):
        return ((opponent+1)%3)

    def get_loss(opponent):
        return ((opponent+2)%3)

    def get_play(opponent,play,strategy):
        if strategy == 'RPS':
            return play 

        if strategy == 'LDW':
            if play == 'X':
                return get_loss(to_int(opponent))
            elif play == 'Y':
                return opponent
            elif play == 'Z':
                return get_win(to_int(opponent))    

    def eval(opponent, play):
        victory,draw,loss = 6,3,0
        play = to_int(play)
        opponent = to_int(opponent)

        if play == opponent:
            return draw  + play + 1

        if (play+2)%3 == (opponent):
            return victory  + play + 1
        
        return loss + play + 1

    acc = 0
    score = [6,3,0]

    with open('input.txt','r') as fp:
        for line in fp:
            opponent,play = line.split(' ')
            play = play[0]
            opponent_index = to_int(opponent)
            actual_play = get_play(opponent,play,'LDW')
            acc +=  eval(opponent,actual_play)

    print(acc)