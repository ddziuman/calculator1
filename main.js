import './normalize.css';
import './style.css';
import './views/ExpressionView.css';
import { ExpressionModel } from './models/ExpressionModel';

import { ExpressionInputView } from './views/ExpressionInputView';
import { ExpressionOutputView } from './views/ExpressionOutputView';
import { ExpressionControlView } from './views/ExpressionControlView';

const expressionModel = new ExpressionModel();
const inputView = new ExpressionInputView(expressionModel);
const outputView = new ExpressionOutputView(expressionModel);
const controlView = new ExpressionControlView(expressionModel);

// import { ExpressionController } from './controllers/ExpressionController';
// import { ExpressionInputView } from './views/ExpressionInputView';

// const controller = new ExpressionController();



// for the scroll:
// {
//   const tx = document.getElementsByTagName("textarea");
//   for (let i = 0; i < tx.length; i++) {
//     tx[i].setAttribute("style", "height:" + (tx[i].scrollHeight) + "px;overflow-y:hidden;");
//     tx[i].addEventListener("input", OnInput, false);
//   }
  
//   function OnInput() {
//     this.style.height = 0;
//     this.style.height = (this.scrollHeight) + "px";
//   }
// }

// // for the active mode change (both buttons and divs):
// {
//   const modesButtonDivMap = {
//     textInputMode: document.getElementById('textMode'),
//     buttonInputMode: document.getElementById('buttonMode'),
//   };

//   const initialModeButtonId = 'textInputMode';
//   const modeButtons = document.getElementsByClassName('input-mode-button');
//   const textInputModeButton = modeButtons.namedItem(initialModeButtonId);
//   textInputModeButton.classList.add('active-mode-button');
  
//   let previousActiveButton = textInputModeButton;
//   let previousActiveDiv = modesButtonDivMap[initialModeButtonId];
//   previousActiveDiv.classList.remove('no-display');

//   for (let i = 0; i < modeButtons.length; i++) {
//     modeButtons[i].addEventListener('click', onModeClick, false);
//   }

//   function onModeClick() {
//     if (this.classList.contains('active-mode-button')) return;

//     this.classList.add('active-mode-button');
//     previousActiveButton.classList.remove('active-mode-button');
//     previousActiveButton = this;

//     previousActiveDiv.classList.add('no-display');

//     previousActiveDiv = modesButtonDivMap[this.id];
//     previousActiveDiv.classList.remove('no-display');
//   }
// }

// // logic of submit + caching the result we get (from model's 'cachedResult'):
// {
//   const expressionForm = document.getElementById('expressionForm');
//   expressionForm.addEventListener('submit', (ev) => {
//     // TODO: implement
//   });
// }

// // validation of expression (showing / hiding tooltip)
// {
//   const errorTooltip = document.getElementById('expressionErrorTooltip');
//   const errorsList = errorTooltip.querySelector('#expressionErrorsList');
//   // TODO: implement
// }