import { Model } from '../abstract/Model';
import { expressionController } from '../controllers/ExpressionController';

export class ExpressionModel extends Model {
  constructor() {
    const metadata = { // model 'memory' -- independent meta-logic, defined by the model itself
      operators: {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => a / b,
        // 'sin': { TODO: add support of 'functional operators. Divide operators by type for view '()' appearing when needed
        '(': (expr, index) => {
          let imbalanceCounter = 1;
          let enclosingLookupIndex = index + 1;
          const exprLength = expr.length;
          while (enclosingLookupIndex < exprLength) {
            const symbol = expr[enclosingLookupIndex];
            if (symbol === '(') imbalanceCounter++;
            else if (symbol === ')') imbalanceCounter--;

            if (imbalanceCounter === 0) break;
            else enclosingLookupIndex++;
          }

          const inBracketExpr = expr.slice(index + 1, enclosingLookupIndex);
          const isBalanced = imbalanceCounter > 0;
          return [inBracketExpr, enclosingLookupIndex, isBalanced];
        },
        ')': () => {},
      },
      // sub-array -- same priority level (then priority is defined by their order in expression)
      operatorsPriority: [['(', ')'], ['*', '/'], ['+', '-']],
    };

    const data = { // model 'current state' set by Controller actions triggered by View
      expression: '',
      errors: [],
      cachedResult: 0,
    };

    super(data, metadata);
  }

  getExpression() {
    return this.data.expression;
  }

  computeExpression() {
    const data = this.data;
    data.cachedResult = expressionController.compute(this);
    this.notifyAll();
  }

  setExpression(expression) {
    const data = this.data;
    data.expression = expression;
    data.errors = expressionController.validate(this);
    this.notifyAll();
  }
}