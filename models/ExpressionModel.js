import { Model } from '../abstract/Model';
import { Observable } from '../abstract/Observable';

export const ExpressionEvents = {
  change: 'change',
  validationRequired: 'validationRequired',
  validationDone: 'validationDone',
  computationRequired: 'computationRequired',
  computationDone: 'computationDone',
};
/** an example of a function from a model in MVC: wthell is AjaxRequest.send() if no backend yet?
 * del: function (id) {
    delete this.data[id];
    AjaxRequest.send('/events/delete/' + id);
  },
 */
// никаких прямых импортов controller-а!

export class ExpressionModel extends Model {
  constructor() {
    const data = {
      expression: '',
      errors: [],
      cachedResult: 0,
    };

    const observables = {
      [ExpressionEvents.change]: new Observable(
        () => this.data.expression
      ),
      [ExpressionEvents.computationRequired]: new Observable(
        () => this.data
      ),
      [ExpressionEvents.computationDone]: new Observable(
        () => this.data.cachedResult
      ),
      [ExpressionEvents.validationRequired]: new Observable(
        () => this.data
      ),
      [ExpressionEvents.validationDone]: new Observable(
        () => this.data.errors
      ),
    };

    super(data, observables);
  }

  getExpression() {
    return this.data.expression;
  }

  computeExpression() {
    this.emit(ExpressionEvents.computationRequired);
    this.emit(ExpressionEvents.computationDone);
  }

  setExpression(expression) {
    this.data.expression = expression;
    this.emit(ExpressionEvents.change);
  }
}