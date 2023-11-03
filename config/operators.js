import { pipeRegexValues } from "./regex.js";

export const operatorTypes = {
  binary: { title: 'binary', operandLocation: [-1, 1] },
  unaryLeft: { title: 'unaryLeft', operandLocation: [-1] },
  functional: { title: 'functional', operandLocation: null },
};

export const operatorsMap = {
  '+': {
    type: operatorTypes.binary,
    action: (leftOperand, rightOperand) => leftOperand + rightOperand,
  },
  '-': {
    type: operatorTypes.binary,
    action: (leftOperand, rightOperand) => leftOperand - rightOperand,
  },
  '*': {
    type: operatorTypes.binary,
    action: (leftOperand, rightOperand) => leftOperand * rightOperand,
  },
  '/': {
    type: operatorTypes.binary,
    action: (leftOperand, rightOperand) => leftOperand / rightOperand,
  },
  'sin': {
    type: operatorTypes.functional,
    action: (arg) => Math.sin(arg),
  },
  'cos': {
    type: operatorTypes.functional,
    action: (arg) => Math.cos(arg),
  },
  'test': {
    type: operatorTypes.functional,
    action: (arg) => arg + 5,
  },
  '!': {
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