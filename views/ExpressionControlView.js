import { View } from "../abstract/View";
import { operatorsMap, operatorTypes } from "../config/operators";
import { cursorAppendValue, setCursorPosition } from "./common";

export class ExpressionControlView extends View {
  constructor(expressionModel) {
    const viewParent = document.getElementById('inputModeSection');

    const operatorButtonsArr = [];
    for (let [operator, operatorInfo] of Object.entries(operatorsMap)) {
      const { name, short, type } = operatorInfo;
      const typeTitle = type.title;
      const buttonId = `${typeTitle}Operator${name}`;
      const buttonTokens = [];
      buttonTokens.push(
        `<button id="${buttonId}" class="operator-button" type="button" title="${operator}">
          ${short}
        </button>`
      );
      operatorButtonsArr.push(buttonTokens.join(''));
    }

    const operatorButtonsList = operatorButtonsArr.join('\n');

    const viewParams = {
      operatorButtonsList,
    };

    super(viewParent, viewParams);

    // other static view settings:

    // disable submit + caching the result we get (from model's 'cachedResult') + buttons:
    document.getElementById('expressionForm').addEventListener('submit', (ev) => {
      ev.preventDefault();
    });
    
    const cursorMovementTarget = document.getElementById('expressionInput');
    const menuButtons = viewParent.querySelectorAll('button');
    const eventType = 'click';

    const plainTextHandler = (ev, inputElement) => {
      const appendingValue = ev.target.title ? ev.target.title : ev.target.innerText;
      cursorAppendValue(inputElement, appendingValue);
      expressionModel.setExpression(inputElement.value);
    };

    const cursorMovementHandler = (inputElement, shift) => {
      inputElement.selectionEnd = inputElement.selectionStart += shift;
    };

    const functionalHandler = (ev, inputElement) => {
      const appendingValue = ev.target.title ? ev.target.title : ev.target.innerText;
      cursorAppendValue(inputElement, appendingValue + '()');
      expressionModel.setExpression(inputElement.value);
      cursorMovementHandler(inputElement, -1);
    };

    const clearEntryHandler = (inputElement) => {
      const removedCount = 1;
      const currentPos = inputElement.selectionStart;
      const currentValue = inputElement.value;
      const leftSlice = currentValue.slice(0, currentPos - removedCount);
      const rightSlice = currentValue.slice(currentPos);
      expressionModel.setExpression(leftSlice + rightSlice);
      inputElement.selectionEnd = inputElement.selectionStart = currentPos - removedCount;
    };

    let previousSubmittedExpression = null;
    const functionalOperatorRegex = new RegExp(`^${operatorTypes.functional.title}`);

    menuButtons.forEach((button) => {
      let handler;
      const buttonId = button.id;
      if (buttonId === 'clearEntryButton') {
        handler = () => clearEntryHandler(cursorMovementTarget);
      } else if (buttonId === 'clearContentButton') {
        handler = () => (
          expressionModel.setExpression('')
        );
      } else if (buttonId === 'equalsButton') {
        handler = () => {
          if (expressionModel.getExpression() === previousSubmittedExpression) return;
          expressionModel.computeExpression();
          previousSubmittedExpression = expressionModel.getExpression();
        };
      } else if (buttonId === 'cursorLeftButton') {
        handler = () => cursorMovementHandler(cursorMovementTarget, -1);
      } else if (buttonId === 'cursorRightButton') {
        handler = () => cursorMovementHandler(cursorMovementTarget, 1);
      } else if (functionalOperatorRegex.test(buttonId)) {
        handler = (ev) => functionalHandler(ev, cursorMovementTarget);
      } else { // plain text input
        handler = (ev) => plainTextHandler(ev, cursorMovementTarget);
      }

      button.addEventListener(eventType, handler);
      button.addEventListener(eventType, () => cursorMovementTarget.focus());
    });
  }

  formatTemplateString() {
    return (
      `<div class="grid-container control-menu" id="controlMenu">
          <button class="numpad-button" type="button" id="oneButton">1</button>
          <button class="numpad-button" type="button" id="twoButton">2</button>
          <button class="numpad-button" type="button" id="threeButton">3</button>
          <button class="numpad-button" type="button" id="fourButton">4</button>
          <button class="control-button" type="button" id="cursorLeftButton">&lt;=</button>
          <button class="control-button" type="button" id="cursorRightButton">=&gt;</button>

          <button class="numpad-button" type="button" id="fiveButton">5</button>
          <button class="numpad-button" type="button" id="sixButton">6</button>
          <button class="numpad-button" type="button" id="sevenButton">7</button>
          <button class="numpad-button" type="button" id="eightButton">8</button>
          <button class="control-button" type="button" id="openingBracketButton">(</button>
          <button class="control-button" type="button" id="closingBracketButton">)</button>

          <button class="numpad-button" type="button" id="nineButton">9</button>
          <button class="numpad-button" type="button" id="zeroButton">0</button>
          <button class="numpad-button" type="button" id="dotButton">.</button>
          <button class="control-button" type="submit" id="equalsButton">=</button>
          <button class="control-button" type="reset" id="clearContentButton">CC</button>
          <button class="control-button" type="button" id="clearEntryButton">CE</button>

        </div>
        <div class="grid-container operators-menu" id="operatorsMenu">
          {id=operatorsMenu;prop=innerHTML;data=operatorButtonsList}
        </div>`
    );
  }
}