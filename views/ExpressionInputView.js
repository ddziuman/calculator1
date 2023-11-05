import { View } from "../abstract/View";
import { ExpressionEvents } from "../models/ExpressionModel";

export class ExpressionInputView extends View {
  constructor(expressionModel) {
    const viewParent = document.getElementById('expressionRow');
    const viewParams = {
      expression: '',
      errorTooltipClassList: 'tooltip no-visibility', // | 'tooltip'
      errorListItems: '',
    };

    super(viewParent, viewParams);
    console.log(this.templatedElements);
    const expressionInput = this.templatedElements['expressionInput'].self;
    expressionInput.setAttribute(
      'style', 'height:'.concat(expressionInput.scrollHeight, 'px;overflow-y:hidden;')
    );
    expressionInput.addEventListener('input', function () {
      expressionModel.setExpression(this.value);
    });

    expressionModel.subscribe(
      ExpressionEvents.change, 
      this.onChange.bind(this)
    );
    expressionModel.subscribe(
      ExpressionEvents.validationDone, 
      this.onValidated.bind(this)
    );
  }

  onValidated(errors) {
    this.viewParams.errorListItems = errors
      .map((errorString) => `<li>${errorString}</li>`)
      .join('\n');
    this.updateTemplatedElement('expressionErrorsList');
  }

  onChange(expression) {
    const id = 'expressionInput';
    const expressionInput = this.templatedElements[id].self;
    expressionInput.style.height = 0;
    expressionInput.style.height = expressionInput.scrollHeight + 'px';

    this.viewParams.expression = expression;
    console.dir(expression);
    this.updateTemplatedElement(id);
  }

  formatTemplateString() {
    return (
    `<textarea id="expressionInput" rows="1" autofocus>{id=expressionInput;prop=value;data=expression}</textarea>
     <div id="expressionErrorTooltip" class="{id=expressionErrorTooltip;prop=class;data=errorTooltipClassList}">
      <img src="/warning-icon.svg" alt="[Error alert!]" id="warningIcon"/>
      <div class="tooltip-content flex-container no-visibility">
        <ul id="expressionErrorsList">
          {id=expressionErrorsList;prop=innerHTML;data=errorListItems}
        </ul>
      </div> 
    </div>`
    );
  }
}