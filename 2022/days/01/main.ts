import {readFileSync} from 'fs';

var calorie_list : number[] = []
var current_sum: number = 0

const calories = readFileSync('input.txt','utf-8');

calories.split('\n').forEach(calorie => {
    if (calorie == ''){
        calorie_list[calorie_list.length] = current_sum;
        current_sum = 0;
    }
    else{
        current_sum += Number(calorie);
    }
});

calorie_list.sort((n1,n2)=> n1 - n2).reverse()
console.log(calorie_list[0],calorie_list.slice(0,3).reduce((prev,next) => prev + next))