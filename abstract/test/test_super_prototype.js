import { pipeRegexValues } from "../../config/regex.js";
// sin(sum(1, ))

// log accepts 2 arguments! (log(2, 4) = 2)
// const expr = '(1+2) - sin(-(1) + (2cos(1) + 3*sin(4 + 5)) - test(1+2(3+2)))-l(1)';
// const functionsRegex = /(?<func>[A-Za-z]*)\((?<expr>[^()]+)\)/gd;
// const matches = [...expr.matchAll(functionsRegex)];
// console.dir(matches, { depth: null });

// const numberInteger = '123.2321sin(1, 2)';
// const numberDecimal = '1';
// const invalidNumber = '123..567';

// const numbersRegex = /\d+(?:\.\d+)?/;

// console.log(numberInteger.match(numbersRegex));
// console.log(numberDecimal.match(numbersRegex));
// console.log(invalidNumber.match(numbersRegex));



// const test = `\\`;
// console.dir({ length: test.length });
// const operators = ['+', '-', '*', '/', 'sin', 'cos', 'log', 'log10', 'asin'];
// const escapingOperators = new Set(['+', '*']);
// const escapedOperators = operators.map((operator) => {
//   return escapingOperators.has(operator) ? `\\${operator}` : operator;
// });

// const operatorRegex = new RegExp(`(?:${escapedOperators.join('|')})+`, 'dgu');

// const testStr = '1 + 2 + 3+++4---5/234*23.1123123/3432423';
// console.log(testStr.match(operatorRegex));

// How to dynamically form this pipe?
// const numberOperandsRegex = /(?<!\d|!)(?<operand>[+-]?\d+(?:\.\d+)?)/dgu;

// const testExpr = '-1+2*-3/-4*+2.12+4.5/+3!-5!';

// const matches = [...testExpr.matchAll(numberOperandsRegex)];
// console.dir(matches, { depth: null });

// // const unaryLeftOperators = ['!'];
// // const pipedUnaryLeftOperators = unaryLeftOperators.join('|');
// // console.log(pipedUnaryLeftOperators);

// const str = '123';

// console.log(str.slice(0, 0));

// const numstrPlus = '+123';
// const numstrMinus = '-123';
// const numstrPure = '123';
// const arr = [+numstrPlus, +numstrMinus, +numstrPure];
// console.log(numstrPlus.slice(2));

// function factorial (a) {
//   if (a <= 0) return 1;
//   let counter = a;
//   let result = 1;
//   while (counter > 0) {
//     result *= counter;
//     counter--;
//   }
//   return result;
// }

// const unaryLeftExprsRegex = /(?<operand>\d+(?:\.\d+)?)(?<unaryLeftOperators>(?:\!|\?)+)/dgu;

// const expr = '3!? + 3/2sin(1)! + 30!25.1?';


// const matches = [...expr.matchAll(unaryLeftExprsRegex)];
// console.dir(matches, { depth: null });

// const unaryOperators = ['\\', '!', '?'];
// const regexEscapingChars = ['.', '?', '*', '|', '[', ']', '{', '}', '\\', '$', '^', '-'];


// const pipedUnaryOperators = pipeRegexValues(unaryOperators);
// console.log(pipedUnaryOperators);

const test = ['innerHTML'];
const precedingPropKeys = test.slice(0, -1);
console.log(precedingPropKeys);
console.log(precedingPropKeys.reduce((nextInnerPropValue, propKey) => {
  return nextInnerPropValue;
}, {'ha': 1}));