import { View } from "../abstract/View";
import { ExpressionEvents } from '../models/ExpressionModel';

export class ExpressionOutputView extends View {
  constructor(expressionModel) {
    const viewParent = document.getElementById('expressionOutput');
    const viewParams = {
      cachedResult: expressionModel.data.cachedResult
    };
    
    super(viewParent, viewParams);

    expressionModel.subscribe(
      ExpressionEvents.computationDone, 
      this.onComputationDone.bind(this)
    );
  }

  onComputationDone(result) {
    this.viewParams.cachedResult = result;
    this.updateTemplatedElement('expressionResult');
  }

  formatTemplateString() {
    return `<span id="expressionResult">{id=expressionResult;prop=innerHTML;data=cachedResult}</span>`;
  }
}