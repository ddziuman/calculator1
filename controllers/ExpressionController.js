class ExpressionController {
  constructor() {}

  compute(expressionModel) {
    // 0. making sure expression is valid:
    if (expressionModel.data.errors.length > 0) return NaN;
    // console.dir({ initial: expressionModel.expression });
    // 1. remove whitespace characters:
    const nospaceExpression = expressionModel.data.expression.replace(/\s/g, '');
    // console.dir({ nowhitespace: nospaceExpression });
    // 1+2+3;   1-3*2      (1-3)*2
    return this.computeSubExpression(expressionModel, nospaceExpression);
  }

  validate(expressionModel) {
    const invalidParts = [];
    // 1) imbalanced brackets: DONE
    // 2) operands:
    //  2.1) '.'  present, but integer part is missing
    //  2.2) '.' present, but decimal part is missing
    //  2.3) too long (> 320 symbols in general or > 15 symbols in decimal part)
    //  2.4) 'unexpected token' in the operand ('isDigitSymbol' failed on the operand)
    // 3) operators:
    //  3.1) missing operand (to the left / to the right)
    //  3.2) trio+ of sign operators ('+++..' / '---..')
    //  3.3) 'unknown operator' (sequence of operator symbols hasn't been resolved to the operator)
    

    const allSpacesRegex = /\s/g;
    const isDigitRegex = /[0-9.]/;
    const supportedOperators = Object.keys(expressionModel.metadata.operators);

    let expression = expressionModel.data.expression.replace(allSpacesRegex, '');
    const symbols = expression.split(''); // duplicate start (tokenization process)
    const operandOperatorArray = [];
    let singleToken = [];
    let imbalanceCounter = 0;
    for (const symbol of symbols) {
      const tokenLength = singleToken.length;

      // brackets-условие push в operandOoperatorArray:
      if (this.isBracket(symbol)) {
        symbol === '(' ? imbalanceCounter++ : imbalanceCounter--;
        if (tokenLength > 0) {
          operandOperatorArray.push(singleToken.join(''));
          singleToken = [];
        }
        operandOperatorArray.push(symbol);
        continue;
      }
      // main-условие "выхода" (push в operandOperatorArray):
      if (tokenLength > 0 && !this.shareSymbolType(singleToken[tokenLength - 1], symbol)) {
        operandOperatorArray.push(singleToken.join(''));
        singleToken = [];
      }

      singleToken.push(symbol);
    }
    if (singleToken.length > 0) operandOperatorArray.push(singleToken.join(''));


    console.log('after forming the operator-operand array (validation):');
    console.log(operandOperatorArray); // duplicate end

    if (imbalanceCounter !== 0) {
      console.log(`${imbalanceCounter} imbalanced parentheses ['(' ')']`);
      invalidParts.push(`${imbalanceCounter} imbalanced parentheses ['(' ')']`);
    }

    operandOperatorArray.forEach((token, index) => { // duplicate start (squashing operators process)
      const tokenLength = token.length;
      const lastOperatorSymbol = token[tokenLength - 1];
      const squashingNeeded = tokenLength >= 2 && this.isSignOperator(lastOperatorSymbol);
      if (!squashingNeeded) return; // 0 case

      if (token === '--' || token === '++') { // 1 case
        operandOperatorArray[index] = '+';
      } else if (token === '-+' || token === '+-') { // 2 case
        operandOperatorArray[index] = '-';
      } else if (lastOperatorSymbol === '+') { // 3 case
        operandOperatorArray[index] = token.slice(0, -1);
      } else {
        operandOperatorArray[index] = token.slice(0, -1); // 4 case
        operandOperatorArray[index + 1] = '-' + operandOperatorArray[index + 1];
      }
    }); 
    if (operandOperatorArray[0] === '+') { // 5 case:
      operandOperatorArray.shift();
    } else if (operandOperatorArray[0] === '-') {
      operandOperatorArray.shift();
      operandOperatorArray[0] = '-' + operandOperatorArray[0];
    }
    console.log('after squashing the signs of operands (validation): ');
    console.log(operandOperatorArray); // duplicate end
    // ['12.12', '+', '5.002', '*', '-10'] (NOW all signs are squashed and expr. goes to validation)



    // 
    // let imbalanceCounter = 0;
    // for (const symbol of symbols) {
    //   if (symbol === '(') imbalanceCounter++;
    //   else if (symbol === ')') imbalanceCounter--;
    // }
    // if (imbalanceCounter > 0) {
    //   invalidParts.push(`Parentheses ['(' ')'] are imbalanced`);
    // }

    return invalidParts;
  }

  // Example: '--12-1-1-1-1-1-1*100'
  computeSubExpression(expressionModel, expression) { // for recursve resolution of each sub-expression
    if (expression.length === 0) return 0;

    const operators = expressionModel.metadata.operators;
    let bracketIndex;

    // 1. open all '()' brackets, if any:
    while ((bracketIndex = expression.indexOf('(')) !== -1) {
      const [inBracketExpr, enclosingId] = operators['('](expression, bracketIndex);
      const result = this.computeSubExpression(
        expressionModel, 
        inBracketExpr
      );

      const symbols = expression.split('');
      symbols.splice(bracketIndex, enclosingId - bracketIndex + 1, result);
      // 3 edge cases: 
      //  1) when (...)(...) are adjacent, ==> actually transforms to (2): num(...)
      //  2) when 'num(...)' happens
      //  3) when 'operator(...)' happens

      // '1*' needs to be put before (...) -- and it will solve (3)
      // '*1*' needs to be put before (...) -- it will solve (1) and (2)
      let factorOne = '1*';
      if (Number.isFinite(+symbols[bracketIndex - 1])) {
        factorOne = '*' + factorOne;
      }
      // Useful example of problem solved: '--(--(--(--(-+3(+-2(-1)(2+3))))))'

      symbols.splice(bracketIndex, 0, factorOne);
      expression = symbols.join('');
      console.log('expression after opening: ');
      console.log(expression);
    }

    // all brackets are removed by now (and inner ones too)

    // 2. break the expression as string into array of OPERANDS and OPERATORS (tokenize!):
    // ['12.12', '+', '5.002', '*-', '10'] (but operators are not squashed correctly yet)
    const symbolTokens = expression.split('');
    const operandOperatorArray = [];
    let singleToken = [];
    for (const symbol of symbolTokens) {
      // условие "выхода" (пуша в operandOperatorArray):
      const tokenLength = singleToken.length;
      if (tokenLength > 0 && !this.shareSymbolType(singleToken[tokenLength - 1], symbol)) {
        operandOperatorArray.push(singleToken.join(''));
        singleToken = []; // + * ?   ==> [abc]{1,}   [abc]{0,3}   ?: {0,1}
      }
      singleToken.push(symbol);
    }
    if (singleToken.length > 0) operandOperatorArray.push(singleToken.join(''));
    console.log('after forming the operator-operand array:');
    console.log(operandOperatorArray);

    // 3. squash signs of the operands:
    // solve 6 edge cases of squashing:
    // 0) singluar operator of 'x' length: ('-', '**', '*', '/'...) => skip 
    // 1) 2-times sign operators ('--', '++') => change operator to '+'
    // 2) sign operators by one ('-+', '+-') => change operator to '-'
    // 3) non-sign operator and '+' ('*+', '/+') => pop '+' from operator
    // 4) non-sign operator and '-' ('*-', '/-') => pop '-' from operator AND insert it in the start of following operand
    // 5) when first token in expr. is '+'/'-' => pop it from array and (if '-') insert it in the start of first operand
    // warning: '+'/'-' and non-sign operator is considered INVALID in the first place!
    // -1 + -2 + 3
    operandOperatorArray.forEach((token, index) => {
      const tokenLength = token.length;
      const lastOperatorSymbol = token[tokenLength - 1];
      const squashingNeeded = tokenLength >= 2 && this.isSignOperator(lastOperatorSymbol);
      if (!squashingNeeded) return; // 0 case

      if (token === '--' || token === '++') { // 1 case
        operandOperatorArray[index] = '+';
      } else if (token === '-+' || token === '+-') { // 2 case
        operandOperatorArray[index] = '-';
      } else if (lastOperatorSymbol === '+') { // 3 case
        operandOperatorArray[index] = token.slice(0, -1);
      } else {
        operandOperatorArray[index] = token.slice(0, -1); // 4 case
        operandOperatorArray[index + 1] = '-' + operandOperatorArray[index + 1];
      }
    });
    if (operandOperatorArray[0] === '+') { // 5 case:
      operandOperatorArray.shift();
    } else if (operandOperatorArray[0] === '-') {
      operandOperatorArray.shift();
      operandOperatorArray[0] = '-' + operandOperatorArray[0];
    }
    console.log('after squashing the signs of operands: ');
    console.log(operandOperatorArray);


    // ['12.12', '+', '5.002', '*', '-10'] (NOW all signs are squashed and ready to being computed)
    // 4. now actually compute result, operator by operator, sorted by priority:

    const operatorsPriority = expressionModel.metadata.operatorsPriority.slice(1);
    for (const priorityLevel of operatorsPriority) {
      for (const operator of priorityLevel) {
        const operatorIndices = operandOperatorArray.reduce((indices, token, index) => {
          if (token === operator) {
            indices.push(index);
          }
          return indices;
        }, []);
        // index-shift is for operator indices, which get closer each time the operation is done
        let indexShift = 0;
        for (let i = 0; i < operatorIndices.length; i++) { 
          const index = operatorIndices[i] - indexShift;
          const leftOperandIndex = index - 1;
          const rightOperandIndex = index + 1;
          console.log(operandOperatorArray[leftOperandIndex]);
          console.log(operandOperatorArray[rightOperandIndex]);
          const leftOperand = +operandOperatorArray[leftOperandIndex];
          const rightOperand = +operandOperatorArray[rightOperandIndex];
          const result = operators[operator](leftOperand, rightOperand);
          operandOperatorArray.splice(leftOperandIndex, 3, result);
          indexShift += 2;
          console.log('after applying one operator');
          console.log(operandOperatorArray);
        }
      }
    }
    console.log('array after computation done: ');
    console.log(operandOperatorArray);
    console.dir({ result: operandOperatorArray[0] });
    return +operandOperatorArray[0] || 0;
  }

  shareSymbolType(symbol1, symbol2) {
    const isDigitRegex = /[0-9.]/;
    const symbol1Test = symbol1.match(isDigitRegex);
    const symbol2Test = symbol2.match(isDigitRegex);
    return (
      Object.is(symbol1Test, symbol2Test) ||
      Array.isArray(symbol1Test) && Array.isArray(symbol2Test)
    );
  }

  isBracket(symbol) {
    return symbol === '(' || symbol === ')';
  }

  isSignOperator(operator) {
    return operator === '+' || operator === '-';
  }
}

export const expressionController = new ExpressionController();