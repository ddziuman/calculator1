import {
  operatorsMap,
  regularOperatorsPriority,
  pipedUnaryLeftOperators,
  operandIndicesFromOperatorType,
} from "../config/operators.js";

import { joinPiped, removeSpaces, matchAll } from "../config/regex.js";
import { ExpressionEvents } from "../models/ExpressionModel.js";

export class ExpressionController {
  constructor(expressionModel) {
    this.regex = {
      // TODO: 1) here replace the A-Za-z in 'func' to the supported functions later on
      //       2) operands/prefixes/postfixes can be either a constant or a special constant symbol (PI, E, etc.)
      unaryLeftOperators: new RegExp(`(?<operator>${pipedUnaryLeftOperators})`, 'dgu'),
      unaryLeftExpressions: new RegExp(`(?<operand>\\d+(?:.\\.\\d+)?)(?<unaryLeftOperators>(?:${pipedUnaryLeftOperators})+)`, 'dgu'),
      deepestBracketExpressions: new RegExp(`(?<prefixCoeff>\\d+(?:\\.\\d+)?)?(?<func>[A-Za-z]*)\\((?<expr>[^()]+)\\)(?<unaryLeftOperators>(?:${pipedUnaryLeftOperators})*)(?<postfixCoeff>\\d+(?:\\.\\d+)?)?`, 'dgu'),
      numbersRequireSignSquash: /(?<signOperators>[-+]{2,})\d+(?:\.\d+)?/dgu,
      operands: new RegExp(`(?<!${joinPiped('\\d', pipedUnaryLeftOperators)})(?<operand>[+-]?\\d+(?:\\.\\d+)?)`, 'dgu'),
    };

    this.replacements = {
      empty: '',
      multiply: '*',
      initialSquashingPlus: '+',
      invertingSquashingMinus: '-',
      invertSign: function (previousSign) {
        return (
          previousSign === this.initialSquashingPlus ?
          this.invertingSquashingMinus :
          this.initialSquashingPlus
        );
      }
    };

    expressionModel.subscribe(
      ExpressionEvents.computationRequired, 
      this.onComputationRequired.bind(this)
    );

    expressionModel.subscribe(
      ExpressionEvents.validationRequired,
      this.onValidationRequired.bind(this)
    );
  }
    
  onValidationRequired(expressionData) {
    // TODO: implement!
  }

  onComputationRequired(expressionData) {
    const initialExpr = expressionData.expression;

    if (expressionData.errors.length > 0 || !initialExpr) return NaN;

    const nospaceExpr = removeSpaces(initialExpr);
    let openingExpr = nospaceExpr;

    // The general flow of the algorithm from here:
    // 1. Solve each unary-left operator + operand (numeric unsigned+unary-left operators like '!')
    // 2. Match the deepest bracketed sub-expressions (both functional and regular)
    // 3. For each bracketed sub-expression, compute its result:
      // 3.1. Solve its inners
      // 3.2. Then solve the possible unary operators for the expression result from brackets
      // 3.3  Then apply numeric coeffs if any (both from left and right)
      // 3.4. Multiply (append '*' to result) to the next subexpr (if matches are 'adjacent')
      // 3.5. Replace the part of outer expression with the result (and apply index shift...)
    // 4. Match any other deepest bracketed sub-expressions and repeat from (2), if any
    // 5. Solve the regular subexpression that is left (no brackets '()', no unary ('!'))
    // 6. Return the final result
    
    console.log('"openingExpr" before the main algorithm: ');
    console.log(openingExpr);
    openingExpr = this.matchComputeUnaryLeftSubexpressions(openingExpr);
    console.log('"openingExpr" after computing all unary-left-subexpressions: ');
    console.log(openingExpr);
    openingExpr = this.matchComputeBracketedSubexpressions(openingExpr);
    console.log("'openingExpr' after solving all bracketed subexpressions: ");
    console.log(openingExpr);
    const exprResult = this.computeRegularSubexpression(openingExpr);
    console.log('"the last regular expression result after everything is done: ');
    console.dir(exprResult);
    expressionData.cachedResult = exprResult;
  }

  matchComputeUnaryLeftSubexpressions(expression) {
    const unaryLeftExpressions = matchAll(expression, this.regex.unaryLeftExpressions);
    const openingExpression = this.resolveRegexExpressionMatches(
      expression, 
      unaryLeftExpressions, 
      this.resolveUnaryLeftMatch
      );
    return openingExpression;
  }

  matchComputeBracketedSubexpressions(expression) {
    // The algorithm of solving inner subexpressions with '()':
    // 1. Take each ()-deepest-subexpression
    // 1.1. Define whether it's 'regular' or functional'
    // 1.2. Obtain expr. result string:
    //   1.2.1. If regular, obtain result with 'this.computeRegularSubexpression';
    //          else obtain 'result' with 'this.computeFunctionalSubexpression';
    //   1.2.2  If any 'unaryLeftOperators' are defined, 
    //          apply them using 'this.computeUnaryLeftSubexpression' on result
    //   1.2.3. If 'prefixCoeff' is defined, multiply result by it
    //   1.2.4. If 'postfixCoeff' is defined, multiply result by it
    //   1.2.5. If enclosing index of current deepest-subexpr. === opening index of next deepest-subexpr,
    //          concat the '*' symbol to the final 'result'
    // 1.3. Replace the substring of 'openingExpr' in ['exprBoundaries - exprIndexShift'] with the result
    // 1.4. Update the value of 'exprIndexShift' for next matches within one regex iteration:
    // 1.4.1. Compute the 'totalSymbolsReplaced' = 'expr.length - result.length'
    // 1.4.2. Update the 'exprIndexShift' += 'totalSymbolsReplaced'
    // 2. After replacement, define the next ()-deepest-subexpressions (if any -- repeat from 1)
    let deepestExpressions = matchAll(expression, this.regex.deepestBracketExpressions);
    let openingExpression = expression;
    while (deepestExpressions.length > 0) {
      openingExpression = this.resolveRegexExpressionMatches(
        openingExpression, 
        deepestExpressions, 
        this.resolveBracketMatch
        );
      deepestExpressions = matchAll(openingExpression, this.regex.deepestBracketExpressions);
    }
    return openingExpression;
  }
  
  resolveUnaryLeftMatch(unaryLeftMatch) {
    const { operand, unaryLeftOperators } = unaryLeftMatch.groups;
    const result = this.computeUnaryLeftSubexpression(operand, unaryLeftOperators);
    return result;
  }

  resolveBracketMatch(bracketMatch) {
    const { func, expr, prefixCoeff, postfixCoeff, unaryLeftOperators } = bracketMatch.groups;
    const funcCallback = operatorsMap[func]?.action;
    let result = funcCallback ? 
    this.computeFunctionalSubexpression(expr, funcCallback) :
    this.computeRegularSubexpression(expr);
    if (unaryLeftOperators)
    result = this.computeUnaryLeftSubexpression(result, unaryLeftOperators);
    if (prefixCoeff) result *= +prefixCoeff;
    if (postfixCoeff) result *= +postfixCoeff;
    return result;
  }

  resolveRegexExpressionMatches(expression, exprMatches, matchCallback) {
    // indexes found by Regex always 'shift' back by a variable number when each expr.
    let exprIndexShift = 0;
    let openingExpression = expression;
    for (const [matchIndex, match] of Object.entries(exprMatches)) {
      let subexprResult = matchCallback.call(this, match);
      const subexprIndices = match.indices[0];
      const [exprStartIndex, exprEndPlusIndex] = subexprIndices
      .map((index) => index - exprIndexShift);
      const nextMatchStartIndex = exprMatches[+matchIndex + 1]?.index - exprIndexShift;
      if (exprEndPlusIndex === nextMatchStartIndex) {
        subexprResult += this.replacements.multiply;
      }
      const exprLength = exprEndPlusIndex - exprStartIndex;
      const resultStr = String(subexprResult);
      const resultLength = resultStr.length;
      const totalReplacingSymbols = exprLength - resultLength;
      
      const emptySeparator = this.replacements.empty;
      openingExpression = openingExpression.split(emptySeparator);
      openingExpression.splice(exprStartIndex, exprLength, resultStr);
      openingExpression = openingExpression.join(emptySeparator);
      
      exprIndexShift += totalReplacingSymbols;
    }
    return openingExpression;
  }

  computeFunctionalSubexpression(argumentsExpr, callback) { // <func>(argumentsExpr = '...')
    // 1. .split(',') the expression by the function's arguments
    // 2. Map each argument of 'argumentExpr'
    //    with its result using 'this.computeRegularSubexpression'
    // 3. Obtain the function result using 'callback' and arguments from (2)
    const argumentValues = argumentsExpr
      .split(',')
      .map((arg) => this.computeRegularSubexpression(arg));
    return callback(...argumentValues);
  }

  computeRegularSubexpression(expression) { // expression = '...' from (...)
    console.log('expression from "computeRegularSubexpression:"');
    console.log(expression);
    
    // Here we have pure operands + operators, NO brackets '()' and NO functions 'sin','cos',etc.
    // 1. Squash the signs of operands where needed ([+-]{2,})

    const squashingOperands = matchAll(expression, this.regex.numbersRequireSignSquash);
    console.dir({ squashingOperands }, { depth: null });
    let matchesIndexShift = 0;
    const squashedSignLength = 1; // a.k.a. 'result.length' from above
    let squashedExpression = expression;
    for (const match of squashingOperands) {
      const { signOperators } = match.groups;
      const signsIndices = match.indices.groups.signOperators;
      const [signsStartIndex, signsEndPlusIndex] = signsIndices
        .map((index) => index - matchesIndexShift);
      const signsLength = signsEndPlusIndex - signsStartIndex;
      const squashedSign = this.squashSignOperators(signOperators);
      const totalReplacingSymbols = signsLength - squashedSignLength;
      
      squashedExpression = squashedExpression.split('');
      squashedExpression.splice(signsStartIndex, signsLength, squashedSign);
      squashedExpression = squashedExpression.join('');
      
      matchesIndexShift += totalReplacingSymbols;
    }

    // 2. Now we left with '-1 + 2 * -3 / -4 * +2.12 + 4.5 / +3-5' kind of thing
    // So we have to create an operator-operand array to start computing taking into
    // account the PRECEDENCE of operators.
    
    const operandsOperatorsArray = [];
    const operandMatches = matchAll(squashedExpression, this.regex.operands);
    let previousOperandEndPlus = 0;
    for (const match of operandMatches) {
      const operand = Number(match.groups.operand);
      const [operandStart, operandEndPlus] = match.indices.groups.operand;
      operandsOperatorsArray.push(
        squashedExpression.slice(previousOperandEndPlus, operandStart),
        operand
      );
      previousOperandEndPlus = operandEndPlus;
    }
    // Also append last operator if 'previousOperandEndPlus' < expression.length
    if (previousOperandEndPlus < squashedExpression.length) {
      operandsOperatorsArray.push(
        squashedExpression.slice(previousOperandEndPlus)
      );
    }
    // And also shift the array by 1, if the 1 element wasn't an operator:
    if (operandsOperatorsArray[0] === this.replacements.empty)
      operandsOperatorsArray.shift();
    
    //  3. Now we left with the most useful, structured array of operators and operands.
    //     Then compute the result, operator by operator

    console.log('the formed "operandsOperatorsArray" of regular subexpression:');
    console.log(operandsOperatorsArray);
    for (const priorityLevel of regularOperatorsPriority) {
      for (const operator of priorityLevel) {
        const { type, action } = operatorsMap[operator];
        const operatorIndices = operandsOperatorsArray.reduce((indices, token, index) => {
          if (token === operator) {
            indices.push(index);
          }
          return indices;
        }, []);
        let operatorIndexShift = 0;
        for (let i = 0; i < operatorIndices.length; i++) {
          const operatorIndex = operatorIndices[i] - operatorIndexShift;
          const operandIndices = operandIndicesFromOperatorType(operatorIndex, type);
          const operands = operandIndices.map(
            (operandIndex) => Number(operandsOperatorsArray[operandIndex])
          );
          const operandsLength = operands.length;
          const operatorResult = action(...operands);
          const operandOperatorsRemoved = operandsLength + 1;
          const leftmostIndex = 
            operatorIndex < operandIndices[0] ? 
            operatorIndex : operandIndices[0];
          operandsOperatorsArray.splice(leftmostIndex, operandOperatorsRemoved, operatorResult);
          operatorIndexShift += operandsLength;
        }
      }
    }
    
    const subexpressionResult = operandsOperatorsArray[0];
    return subexpressionResult;
  }

  computeUnaryLeftSubexpression(operand, unaryLeftOperators) {
    // '23' as operand, '!!?' as unaryLeftOperators, for example
    const operandValue = Number(operand);
    let result = operandValue;
    const matchedUnaryLeftOperators = matchAll(
      unaryLeftOperators, 
      this.regex.unaryLeftOperators
    );
    for (const match of matchedUnaryLeftOperators) {
      const operator = match.groups.operator;
      const callback = operatorsMap[operator]?.action;
      result = callback(result);
    }
    return result;
  }

  squashSignOperators(signOperators) { // {2,}
    let squashingSign = this.replacements.initialSquashingPlus;
    for (const nextSign of signOperators.split('')) {
      if (nextSign === this.replacements.invertingSquashingMinus) {
        squashingSign = this.replacements.invertSign(squashingSign);
      }
    }
    return squashingSign;
  }
}

// Testing:

// const model = {
//   data: {
//     expression: '-(1*-3+-sin(2))',
//     failedExpressions: [],
//     passedExpressions: [
//       'sin(1+2)+(3+4)',  == 3.909297...
//       '3sin(1+2)3sin(3+4)5', == 4.1721279... 
//       'sin(1 + (2 + 3*sin(4 + 5)))', == -0.8888195...
//       '2.1231(1+2)4.1232 - sin(-(1) + (2cos(1) + 3*sin(4 + 5)3) - test(1+2(3+2)))',
//       '-2(1+2)-4',
//       '3!(1+2)',
//       '6(1+2)!24',
//       '3!4!2!',
//       '-2(1+2)!4',
//       '3!!+3!!?',
//       '3!sin(4)?3!',
//       '-+-+-+-+-1',
//       '-(1*-3+-sin(2))',
//     ],
//   },
// };