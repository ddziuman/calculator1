import { pipeRegexValues } from "./regex.js";

export const operatorTypes = {
  binary: { title: 'binary', operandLocation: [-1, 1] },
  unaryLeft: { title: 'unaryLeft', operandLocation: [-1] },
  functional: { title: 'functional', operandLocation: null },
};

export const operatorsMap = {
  '+': {
    name: 'Add',
    short: '+',
    type: operatorTypes.binary,
    action: (leftOperand, rightOperand) => leftOperand + rightOperand,
  },
  '-': {
    name: 'Subtract',
    short: '-',
    type: operatorTypes.binary,
    action: (leftOperand, rightOperand) => leftOperand - rightOperand,
  },
  '*': {
    name: 'Times',
    short: '*',
    type: operatorTypes.binary,
    action: (leftOperand, rightOperand) => leftOperand * rightOperand,
  },
  '/': {
    name: 'Divide',
    short: '/',
    type: operatorTypes.binary,
    action: (leftOperand, rightOperand) => leftOperand / rightOperand,
  },
  'sin': {
    name: 'Sine',
    short: 'sin',
    type: operatorTypes.functional,
    action: (arg) => Math.sin(arg),
  },
  'cos': {
    name: 'Cosine',
    short: 'cos',
    type: operatorTypes.functional,
    action: (arg) => Math.cos(arg),
  },
  'test': {
    name: 'Test',
    short: 'tst',
    type: operatorTypes.functional,
    action: (arg) => arg + 5,
  },
  '!': {
    name: 'Factorial',
    short: 'x!',
    type: operatorTypes.unaryLeft,
    action: (leftOperand) => {
      if (leftOperand <= 0) return 1;
      let counter = leftOperand;
      let result = 1;
      while (counter > 0) {
        result *= counter;
        counter--;
      }
      return result;
    },
  },
  '?': {
    name: 'Question',
    short: 'x?',
    type: operatorTypes.unaryLeft,
    action: (leftOperand) => {
      if (leftOperand < 0) return 0;
      else return leftOperand;
    }
  }
};

export const regularOperatorsPriority = [
  ['*','/'],
  ['+','-'],
];

export const unaryLeftOperators = Object.keys(operatorsMap).filter((operatorTitle) => {
  return operatorsMap[operatorTitle].type === operatorTypes.unaryLeft;
});

export const pipedUnaryLeftOperators = pipeRegexValues(unaryLeftOperators);

export function operandIndicesFromOperatorType(operatorIndex, operatorType) {
  return operatorType.operandLocation.map((location) => operatorIndex + location);
}