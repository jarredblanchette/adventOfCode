import { readFileSync } from 'fs';

function getInt(play: string ): number {
    const hands_as_ints = new Map<string, number>([
        ["A", 0],
        ["B", 1],
        ["C", 2],
        ["X", 0],
        ["Y", 1],
        ["Z", 2]
    ]);
    return hands_as_ints.get(play) ?? -1
}

function getWinningHand(opponent: number): number {
    return (opponent + 1) % 3
}
function getLosingHand(opponent: number): number {
    return (opponent + 2) % 3
}

function evaluate(opponent: string | number, play: string | number): number {
    if (typeof (opponent) === 'string') {
        opponent = getInt(opponent)
    }
    if (typeof (play) === 'string') {
        play = getInt(play)
    }

    const winScore = 6
    const drawScore = 3
    const loseScore = 0
    // console.log(`${opponent},${play}`)
    if (opponent == play) {
        return drawScore + play + 1
    }

    if (play == getWinningHand(opponent)) {
        return winScore + play + 1
    }

    return loseScore + play + 1
}

function getPlay(opponent: string , play: string , strategy: string): number {
    if (strategy == 'RPS') {
        return getInt(play)
    }

    if (strategy == 'LDW') {
        if (play == 'X') {
            return getLosingHand(getInt(opponent))
        }
        if (play == 'Y') {
            return getInt(opponent)
        }
        return getWinningHand(getInt(opponent))
    }
    return -1
}


const file = readFileSync('input.txt', 'utf-8');

let acc: number = 0
file.split('\n').forEach(game => {
    if (game != '') {
        let opponent: string = game.split(' ')[0]
        let play: string = game.split(' ')[1][0]
        let strategy: string = 'LDW'
        let actual_play = getPlay(opponent, play, strategy)
        acc += evaluate(opponent, actual_play)
    }
});
console.log(acc)