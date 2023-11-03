/**
 * Flags in JS:
 *  /i -- case-insensitive search
 * 
 *  /g -- match all occurances (not just the 1 one)
 * 
 *  /u -- enables the full Unicode support (and fixes surrogates pairs too) [+ lookup by unicode props ('/p{type}') a.k.a. punctual symbols / alpha-symbol language]
 * 
 *  /s -- enforces '\n' symbol to be counted as 'any symbol by '.' (DOT) in regex
 * 
 *  /y -- search in the defined position in the text
 * 
 *  /d -- with this flag the resulting array will include extra metadata about the matches
 * (e.g. the 'start' and 'end' indices)
 */


/** Replace string access to the matched substrings:
 * 
 *  &	вставляет всё найденное совпадение
    $`	вставляет часть строки до совпадения
    $'	вставляет часть строки после совпадения
    $n	если n это 1-2 значное число, вставляет содержимое n-й скобочной группы регулярного выражения, больше об этом в главе Скобочные группы
    $<name>	вставляет содержимое скобочной группы с именем name, также изучим в главе Скобочные группы
    $$	вставляет символ "$"
 */


/** Some of (maybe) useful regex unicode symbol categories ('/p{category}' with /u flag enabled):
 *  Ps -- opening brackets?
 *  Pe -- enclosing brackets? 
 */

const expr = '(1 {}[])+ 112)';
// const allBrackets = /[\p{Pe}]/gud;
const roundBrackets = /[()]/gud;
const matches = [...expr.matchAll(roundBrackets)]; // (.matchAll works as RegExp.prototype.exec(), but with all occurances! (iterator))
console.dir(matches, { depth: null });
// console.dir(matches.input);
// console.dir(matches.index);
// console.log(allBrackets.exec());


/**
 * To escape 'special' reserved characters in a regexp, use '\'
 */