const operatorTypes = {
  binary: { title: 'binary', operandLocation: [-1, 1] },
  unaryLeft: { title: 'unaryLeft', operandLocation: [-1] },
  unaryRight: { title: 'unaryRight', operandLocation: [1] },
  functional: { title: 'functional', operandLocation: null },
};


export class TrueExpressionController {
  constructor() {
    this.regex = {
      spaces: /\s+/g,
      // TODO: 1) here replace the A-Za-z in 'func' to the supported functions later on
      //       2) prefix/postfix can be either a constant or a special constant symbol (PI, E, etc.)
      coeffedDeepestExpressions: /(?<prefixCoeff>\d+(?:\.\d+)?)?(?<func>[A-Za-z]*)\((?<expr>[^()]+)\)(?<postfixCoeff>\d+(?:\.\d+)?)?/dgu,
      validNumber: /^\d+(?:\.\d+)?$/,
      numbersRequireSignSquash: /(?<signOperators>[-+]){2,}\d+(?:\.\d+)?/dgu,
    };

    this.templateRegex = {
      operands: {
        template: '(?<!\\d${unaryLeftOperators})(?<operand>[+-]?\\d+(?:\\.\\d+)?)',
        flags: 'dgu',
      },
    };

    this.replacements = {
      empty: '',
      multiply: '*',
      initialSquashingPlus: '+',
      invertingSquashingMinus: '-',
      prependingPipe: '|',
      invertSign: function (previousSign) {
        return (
          previousSign === this.initialSquashingPlus ?
          this.invertingSquashingMinus :
          this.initialSquashingPlus
        );
      }
    };
  }

  compute(expressionModel) {
    if (expressionModel.data.errors.length > 0) return NaN;

    const initialExpr = expressionModel.data.expression;
    // console.log(initialExpr);
    const nospaceExpr = this.removeSpaces(initialExpr);
    // console.log(nospaceExpr);

    
    const operators = expressionModel.metadata.operators;
    let openingExpr = nospaceExpr;
    let deepestExpressions = this.matchDeepestExpressions(openingExpr);
    while (deepestExpressions.length > 0) {
      // indexes we found always 'shift' back by a variable number when each expr. gets solved
      let exprIndexShift = 0;

      // 1. Take each ()-deepest-subexpression
        // 1.1. Define whether it's 'regular' or functional'
        // 1.2. Obtain expr. result string:
        //   1.2.1. If regular, obtain result with 'this.computeRegularSubexpression';
        //          else obtain 'result' with 'this.computeFunctionalSubexpression';
        //   1.2.2. If 'prefixCoeff' is defined, multiply result by it
        //   1.2.3. If 'postfixCoeff' is defined, multiply result by it
        //   1.2.4. If enclosing index of current deepest-subexpr. === opening index of next deepest-subexpr,
        //          concat the '*' symbol to the final 'result'
        // 1.3. Replace the substring of 'openingExpr' in ['exprBoundaries - exprIndexShift'] with the result
        // 1.4. Update the value of 'exprIndexShift' for next matches within one regex iteration:
          // 1.4.1. Compute the 'totalSymbolsReplaced' = 'expr.length - result.length'
          // 1.4.2. Update the 'exprIndexShift' += 'totalSymbolsReplaced'
      // 2. After replacement, define the next ()-deepest-subexpressions (if any -- repeat from 1)
      // console.dir(deepestExpressions, { depth: null });
      for (const [matchIndex, match] of Object.entries(deepestExpressions)) {
        // console.log('singular match: ');
        // console.dir(match, { depth: null });
        console.log('singluar match: ');
        console.log(match);
        const { func, expr, prefixCoeff, postfixCoeff } = match.groups;
        const funcCallback = operators[func]?.cb;
        let result = funcCallback ? 
          this.computeFunctionalSubexpression(expressionModel, expr, funcCallback) :
          this.computeRegularSubexpression(expressionModel, expr);
        if (prefixCoeff) result *= +prefixCoeff;
        if (postfixCoeff) result *= +postfixCoeff;
        console.log('result of subexpression after applying coeffs: ');
        console.log(result);
        const subexprIndices = match.indices[0];
        const [exprStartIndex, exprEndPlusIndex] = subexprIndices
          .map((index) => index - exprIndexShift);
        const nextMatchStartIndex = deepestExpressions[+matchIndex + 1]?.index - exprIndexShift;
        if (exprEndPlusIndex === nextMatchStartIndex) {
          result += this.replacements.multiply;
        }
        const exprLength = exprEndPlusIndex - exprStartIndex;
        const resultStr = String(result);
        const resultLength = resultStr.length;
        const totalReplacingSymbols = exprLength - resultLength;
        console.log({ totalReplacingSymbols });
        console.log('openingExpr right before replacing the subexpression: ');
        console.log(openingExpr);

        openingExpr = openingExpr.split('');
        openingExpr.splice(exprStartIndex, exprLength, resultStr);
        openingExpr = openingExpr.join('');

        console.log('"openingExpr" after the subexpression replacing: ');
        console.log(openingExpr);
        
        exprIndexShift += totalReplacingSymbols;
      }
      deepestExpressions = this.matchDeepestExpressions(openingExpr);
    }
    console.log("'openingExpr' after solving functions and brackets: ");
    console.log(openingExpr);
    const exprResult = this.computeRegularSubexpression(expressionModel, openingExpr);
    return exprResult;
  }

  computeFunctionalSubexpression(expressionModel, argumentsExpr, callback) { // <func>(...)
    // 1. .split(',') the expression by the function's arguments
    // 2. Map each argument of 'argumentExpr'
    //    3.1. With its result using 'this.computeRegularSubexpression'
    // 3. Obtain the function result using 'cb' from (1) and arguments from (3)
    const argumentValues = argumentsExpr
      .split(',')
      .map((arg) => this.computeRegularSubexpression(expressionModel, arg));
    return callback(...argumentValues);
  }

  computeRegularSubexpression(expressionModel, expression) { // expression = '...' from (...)
    console.log('expression from "computeRegularSubexpression:"');
    console.log(expression);
    const operators = expressionModel.metadata.operators;
    // TODO: think!
    // Here we have pure operands + operators, NO brackets '()' and NO functions 'sin','cos',etc.
    // 1. Squash the signs of operands where needed ([+-]{2,})

    const squashingOperands = this.matchSquashingOperands(expression);
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

    // 2. Now we left with '-1 + 2 * -3 / -4 * +2.12 + 4.5 / +3!-5!' kind of thing
    // So we have to create an operator-operand array to start computing taking into
    // account the PRECEDENCE of operators.

    const unaryLeftOperators =
      Object.keys(operators).filter(
        operatorKey => operators[operatorKey].type === operatorTypes.unaryLeft
    );
    const pipedUnaryOperators = unaryLeftOperators.join('|');

    const operandsRegex = this.fillOperandsRegex(pipedUnaryOperators);
    
    const operandsOperatorsArray = [];
    const operandMatches = [...expression.matchAll(operandsRegex)];
    let previousOperandEndPlus = 0;
    for (const match of operandMatches) {
      const operand = Number(match.groups.operand);
      const [operandStart, operandEndPlus] = match.indices.groups.operand;
      // const operatorsBetween = expression.slice(previousOperandEndPlus, operandStart);
      // pipedUnaryOperators; think!!!
      operandsOperatorsArray.push(
        expression.slice(previousOperandEndPlus, operandStart), //TODO: split the slice to fix factorials prooblem
        operand
      );
      previousOperandEndPlus = operandEndPlus;
    }
    // Also append endingOperator if 'previousOperandEndPlus' !== expression.length
    if (previousOperandEndPlus < expression.length) {
      operandsOperatorsArray.push(
        expression.slice(previousOperandEndPlus)
      );
    }
    // And also shift the array by 1, if the 1 element is actually NOT the operator:
    if (operandsOperatorsArray[0] === this.replacements.empty)
      operandsOperatorsArray.shift();
    
    //  3. Now we left with the most useful, structured array of operators and operands.
    //     We are left to compute the result now, operator by operator


    console.log(operandsOperatorsArray);
    const operatorsPriority = expressionModel.metadata.operatorsPriority.slice(1);
    for (const priorityLevel of operatorsPriority) {
      for (const operator of priorityLevel) {
        const { type, cb } = operators[operator];
        const operatorIndices = operandsOperatorsArray.reduce((indices, token, index) => {
          if (token === operator) {
            indices.push(index);
          }
          return indices;
        }, []);
        let operatorIndexShift = 0;
        for (let i = 0; i < operatorIndices.length; i++) {
          const operatorIndex = operatorIndices[i] - operatorIndexShift;
          const operandIndices = this.operandIndicesFromType(operatorIndex, type);
          const operands = operandIndices.map(
            (operandIndex) => Number(operandsOperatorsArray[operandIndex])
          );
          const operandsLength = operands.length;
          const operatorResult = cb(...operands);
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

  matchDeepestExpressions(expr) {
    return [...expr.matchAll(this.regex.coeffedDeepestExpressions)];
  }

  matchSquashingOperands(expr) {
    return [...expr.matchAll(this.regex.numbersRequireSignSquash)];
  }

  removeSpaces(expr) {
    return expr.replace(this.regex.spaces, this.replacements.empty);
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

  fillOperandsRegex(pipedUnaryOperators) {
    if (pipedUnaryOperators.length > 0) {
      pipedUnaryOperators = this.replacements.prependingPipe + pipedUnaryOperators;
    }
    const unaryOperatorsParam = '${unaryLeftOperators}';
    const { template, flags } = this.templateRegex.operands;
    const filledTemplate = template.replace(unaryOperatorsParam, pipedUnaryOperators);
    console.dir({ template, filledTemplate });
    return new RegExp(filledTemplate, flags);
  }

  operandIndicesFromType(operatorIndex, operatorType) {
    return operatorType.operandLocation.map((location) => operatorIndex + location);
  }
}

// 1. Solve each unary operator + operand (numeric unsigned+unary-left operators)
// 2. Open each brackets
// 3. For each sub-regular-expression first solve each unary operator+operand (numeric+operator)
// 4. Then solve the possible unary operators for the expression result from brackets
// 5. then do everything else ('*' next subexpr (if needed), multiply to coeffs (if any), etc.)

const model = {
  data: {//                              8 (sin(1+2))       4 (0.95)
    //  the number of symbols removed = [expr.length] - [result.length] = 4
    //  nextShift = nextShift + <number of symbols removed>

    expression: '-2(1+2)-4',// (compare current-end-next-start)             [[same as with brackets]]
    didntworkExpressions: ['3!!+3!!?', '3!4!', '3!(1+2)', '6(1+2)!24', '-2(1+2)!4'],
    passedExpression: [
      'sin(1+2)+(3+4)',
      '3sin(1+2)3sin(3+4)5', 
      'sin(1 + (2 + 3*sin(4 + 5)))',
      '2.1231(1+2)4.1232 - sin(-(1) + (2cos(1) + 3*sin(4 + 5)3) - test(1+2(3+2)))'
    ],
    errors: [],
  },
  metadata: {
    operators: {
      '+': {
        cb: (a, b) => a + b,
        type: operatorTypes.binary,
      },
      '-': {
        cb: (a, b) => a - b,
        type: operatorTypes.binary,
      },
      '*': {
        cb: (a, b) => a * b,
        type: operatorTypes.binary,
      },
      '/': {
        cb: (a, b) => a / b,
        type: operatorTypes.binary,
      },
      '!': {
        cb: (a) => {
          if (a <= 0) return 1;
          let counter = a;
          let result = 1;
          while (counter > 0) {
            result *= counter;
            counter--;
          }
          return result;
        },
        type: operatorTypes.unaryLeft,
      },
      'sin': {
        cb: (a) => Math.sin(a),
        type: operatorTypes.functional,
      },
      'cos': {
        cb: (a) => Math.cos(a),
        type: operatorTypes.functional,
      },
      'test': {
        cb: (a) => a + 5,
        type: operatorTypes.functional,
      },
    },
    operatorsPriority: [['(', ')'], ['sin', 'cos', 'test'], ['!'], ['*', '/'], ['+', '-']],
  },
};

const controller = new TrueExpressionController();
const computedResult = controller.compute(model);
console.log(computedResult);