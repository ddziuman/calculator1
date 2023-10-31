import { View } from "../abstract/View";

export class ExpressionOutputView extends View {
  constructor(expressionModel) {
    const viewParent = document.getElementById('expressionOutput');

    super(viewParent, {}, expressionModel);

    expressionModel.subscribe(this);
  }

  formatTemplateString() {
    return `<span id="expressionResult">{expressionResult:innerHTML:data.cachedResult}</span>`;
  }
}