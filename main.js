import './normalize.css';
import './style.css';
import './views/ExpressionView.css';
import { ExpressionModel } from './models/ExpressionModel';

import { ExpressionController } from './controllers/ExpressionController';

import { ExpressionInputView } from './views/ExpressionInputView';
import { ExpressionOutputView } from './views/ExpressionOutputView';
import { ExpressionControlView } from './views/ExpressionControlView';

const expressionModel = new ExpressionModel();

const expressionController = new ExpressionController(expressionModel);

const inputView = new ExpressionInputView(expressionModel);
const outputView = new ExpressionOutputView(expressionModel);
const controlView = new ExpressionControlView(expressionModel);