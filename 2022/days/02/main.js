"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
function getInt(play) {
    var _a;
    var hands_as_ints = new Map([
        ["A", 0],
        ["B", 1],
        ["C", 2],
        ["X", 0],
        ["Y", 1],
        ["Z", 2]
    ]);
    return (_a = hands_as_ints.get(play)) !== null && _a !== void 0 ? _a : -1;
}
function getWinningHand(opponent) {
    return (opponent + 1) % 3;
}
function getLosingHand(opponent) {
    return (opponent + 2) % 3;
}
function evaluate(opponent, play) {
    if (typeof (opponent) === 'string') {
        opponent = getInt(opponent);
    }
    if (typeof (play) === 'string') {
        play = getInt(play);
    }
    var winScore = 6;
    var drawScore = 3;
    var loseScore = 0;
    // console.log(`${opponent},${play}`)
    if (opponent == play) {
        return drawScore + play + 1;
    }
    if (play == getWinningHand(opponent)) {
        return winScore + play + 1;
    }
    return loseScore + play + 1;
}
function getPlay(opponent, play, strategy) {
    if (strategy == 'RPS') {
        return getInt(play);
    }
    if (strategy == 'LDW') {
        if (play == 'X') {
            return getLosingHand(getInt(opponent));
        }
        if (play == 'Y') {
            return getInt(opponent);
        }
        return getWinningHand(getInt(opponent));
    }
    return -1;
}
var file = (0, fs_1.readFileSync)('input.txt', 'utf-8');
var acc = 0;
file.split('\n').forEach(function (game) {
    if (game != '') {
        var opponent = game.split(' ')[0];
        var play = game.split(' ')[1][0];
        var strategy = 'LDW';
        var actual_play = getPlay(opponent, play, strategy);
        acc += evaluate(opponent, actual_play);
    }
});
console.log(acc);
