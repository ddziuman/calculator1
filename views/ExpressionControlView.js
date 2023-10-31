import { View } from "../abstract/View";

export class ExpressionControlView extends View {
  constructor(expressionModel) {
    // this is static view, which just handles events and submits the form
    const viewParent = document.getElementById('inputModeSection');
    const operatorSymbols = Object.keys(expressionModel.metadata.operators);
    const operatorButtonsArr = operatorSymbols.map((symbol) => {
      const buttonTokens = [];
      if (symbol.length > 3) {
        buttonTokens.push(`<button type="button" title="${symbol}">`);
        symbol = symbol.slice(0, 3);
      } else {
        buttonTokens.push(`<button type="button">`);
      }
      buttonTokens.push(symbol, '</button>');
      return buttonTokens.join('');
    });
    const viewParams = {
      operatorButtonsList: operatorButtonsArr.join('\n'),
    };

    super(viewParent, viewParams, expressionModel);

    // other static view settings:
      // for the active mode change (both buttons and divs):
    const modesButtonDivMap = {
      textInputMode: viewParent.querySelector('#textMode'),
      buttonInputMode: viewParent.querySelector('#buttonMode'),
    };
    const initialModeButtonId = 'textInputMode';
    const modeButtons = document.querySelectorAll('.input-mode-button');
    let previousActiveButton = modeButtons.item(initialModeButtonId);
    previousActiveButton.classList.add('active-mode-button');
    let previousActiveDiv = modesButtonDivMap[initialModeButtonId];
    previousActiveDiv.classList.remove('no-display');

    const onModeClick = function () {
      if (this.classList.contains('active-mode-button')) return;

      this.classList.add('active-mode-button');
      previousActiveButton.classList.remove('active-mode-button');
      previousActiveButton = this;

      previousActiveDiv.classList.add('no-display');

      previousActiveDiv = modesButtonDivMap[this.id];
      previousActiveDiv.classList.remove('no-display');
    };
    modeButtons.forEach((button) => button.addEventListener('click', onModeClick));

    // disable submit + caching the result we get (from model's 'cachedResult') + buttons:
    document.getElementById('expressionForm').addEventListener('submit', (ev) => {
      ev.preventDefault();
    })
    
    const menuButtons = viewParent.querySelectorAll('button');
    const eventType = 'click';

    const literalTextHandler = (ev) => {
      expressionModel.setExpression(expressionModel.getExpression() + ev.target.innerText)
    };
    
    let previousSubmittedExpression = null;
    // const functionalTextHandler = (ev) => { TODO: duplicate of 'implement funcional operators'

    // }
    menuButtons.forEach((button) => {
      let handler;
      switch (button.id) {
        case 'backButton':
          handler = () => (
            expressionModel.setExpression(expressionModel.getExpression().slice(0, -1))
          );
          break;
        case 'clearButton':
        case 'clearButtonSmall':
          handler = () => (
            expressionModel.setExpression('')
          );
          break;
        case 'equalsButton':
        case 'computeButton':
          handler = () => {
            if (expressionModel.getExpression() === previousSubmittedExpression) return;
            expressionModel.computeExpression();
            previousSubmittedExpression = expressionModel.getExpression();
          };
          break;
        default:
          handler = literalTextHandler;
      }
      button.addEventListener(eventType, handler);
    });
  }

  formatTemplateString() {
    const { operatorButtonsList } = this.viewParams;
    return (
      `<div id="textMode" class="flex-container no-display">            
         <button type="reset" id="clearButton" class="large-button">Clear</button>
         <button type="submit" id="computeButton" class="large-button">Compute</button>
       </div>
       <div id="buttonMode" class="flex-container no-display">
          <div class="grid-container control-menu" id="controlMenu">
            <button class="control-menu-numpad" type="button" id="oneButton">1</button>
            <button class="control-menu-numpad" type="button" id="twoButton">2</button>
            <button class="control-menu-numpad" type="button" id="threeButton">3</button>
            <button class="control-menu-numpad" type="button" id="fourButton">4</button>
            <button class="control-menu-control" type="button" id="backButton">&lt;—</button>  
            <button class="control-menu-numpad" type="button" id="fiveButton">5</button>
            <button class="control-menu-numpad" type="button" id="sixButton">6</button>
            <button class="control-menu-numpad" type="button" id="sevenButton">7</button>
            <button class="control-menu-numpad" type="button" id="eightButton">8</button>
            <button class="control-menu-control" type="reset" id="clearButtonSmall">C</button>

            <button class="control-menu-numpad" type="button" id="nineButton">9</button>
            <button class="control-menu-numpad" type="button" id="zeroButton">0</button>
            <button class="control-menu-numpad" type="button" id="dotButton">.</button>
            <button class="control-menu-control" type="submit" id="equalsButton">=</button>
          </div>
          <div class="grid-container operators-menu" id="operatorsMenu">
            ${operatorButtonsList}
          </div>
        </div>`
    );
  }
}