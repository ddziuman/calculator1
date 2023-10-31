import { View } from "../abstract/View";

export class ExpressionInputView extends View {
  constructor(expressionModel) {
    const viewParent = document.getElementById('expressionRow');
    const viewParams = {
      errorTooltipClassList: 'tooltip no-visibility', // | 'tooltip'
      errorListItems: '',
    };

    super(viewParent, viewParams, expressionModel);

    const expressionInput = this.templatedElements['expressionInput'].self;
    expressionInput.setAttribute(
      'style', 'height:'.concat(expressionInput.scrollHeight, 'px;overflow-y:hidden;')
    );
    expressionInput.addEventListener('input', function () {
      expressionModel.setExpression(this.value);
    });

    expressionModel.subscribe(this);
  }

  update(updatedExpressionModel) {
    const errorList = updatedExpressionModel.data.errors;
    
    // view-params updated:
    this.viewParams = {
      errorTooltipClassList: errorList.length > 0 ? 'tooltip' : 'tooltip no-visibility',
      errorListItems: errorList.map((errorString) => `<li>${errorString}</li>`).join('\n'),
    };

    // JS-dependant logic could not be passed as model-params or view-params in template:
    const expressionInput = this.templatedElements['expressionInput'].self;
    expressionInput.style.height = 0;
    expressionInput.style.height = expressionInput.scrollHeight + 'px';
    super.update(updatedExpressionModel);
  }

  // template includes both 'model' params and 'view' params'
  // values of 'view params' are COMPUTED due to some logic from values of 'model' params
  formatTemplateString() {
    // const { errorTooltipClassList, errorListItems } = this.viewParams;
    // console.log('errTooltipClassList: ', errorTooltipClassList);
    return (
    `<textarea id="expressionInput" rows="1" autofocus>{expressionInput:value:data.expression}</textarea>
     <div id="expressionErrorTooltip" class="{expressionErrorTooltip:class:errorTooltipClassList}">
      <img src="/warning-icon.svg" alt="[Error alert!]" id="warningIcon"/>
      <div class="tooltip-content flex-container no-visibility">
        <ul id="expressionErrorsList">
          {expressionErrorsList:innerHTML:errorListItems}
        </ul>
      </div> 
    </div>`
    );
  }
}