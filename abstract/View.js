import { commonRegex } from "../config/regex";

export class View {
  constructor(viewParent, viewParams) { // viewParams do not include 'model' params from template
    this.viewParent = viewParent;
    this.viewParams = viewParams;
    this.childrenTemplate = this.formatTemplateString();
    this.templatedElements = {};
    Object.defineProperty(this.templatedElements, 'rendered', {
      value: false,
      enumerable: false,
    });
    this.renderTemplate();
  }

  renderTemplate() {
    if (!this.templatedElements.rendered) {
      // first time render+prepare 'templatedElemenets'
      // -- make everything using '.innerHTML' here, except caching the elements in 'templatedElements'
      const filledTemplate = this.childrenTemplate.replace(
        commonRegex.allTemplateParams, (templateParam) => {
          const paramStructure = templateParam.slice(1, -1); // '{', '}'
          const paramTokens = paramStructure.split(';');
          const [elementId, ...propChains] = paramTokens.map((token) => {
            const [tokenName, tokenValue] = token.split('=');
            return tokenValue;
          });
          const [elementPropChain, dataPropChain] = propChains;

          const [elementPropKeys, dataPropKeys] = propChains.map((chain) => (
            chain.split('.')
          ));

          const templatedElement = 
            this.templatedElements[elementId] = this.templatedElements[elementId] || {};
          templatedElement[elementPropChain] = dataPropKeys;

          let paramValue = this.propChainGet(dataPropKeys, this.viewParams);
          
          if (Object.is(paramValue, undefined)) {
            paramValue = '';
          }

          return paramValue;
        }
      );

      this.viewParent.innerHTML = filledTemplate;

      // cache in the rendered templated elements (if any are params-dependant):
      this.cacheTemplatedElements();
    } else {
      // do the 'right' way, using this.templatedElements, without '.innerHTML' changes
      for (const templatedElementId of Object.keys(this.templatedElements)) {
        this.updateTemplatedElement(templatedElementId);
      }
    }
  }

  updateTemplatedElement(elementId) {
    const elementPropsData = this.templatedElements[elementId];

    for (const elementPropChain of Object.keys(elementPropsData)) {
      this.updateTemplatedElementProp(elementId, elementPropChain, elementPropsData);
    }
  }

  updateTemplatedElementProp(elementId, elementPropChain, elementPropsData = null) {
    if (!elementPropsData) {
      elementPropsData = this.templatedElements[elementId];
    }
    const elementSelf = elementPropsData.self;
    const elementPropKeys = elementPropChain.split('.');
    const dataPropKeys = elementPropsData[elementPropChain];

    const propValue = this.propChainGet(dataPropKeys, this.viewParams);
    this.propChainSet(elementPropKeys, elementSelf, propValue);
  }

  propChainGet(propKeys, propSource) { // 'propSource' is viewParams OR any templated element
    // propsKeys = [], propSource = <div>-element
    return propKeys.reduce((nextInnerPropValue, propKey) => {
      if (!Object.is(nextInnerPropValue, undefined)) {
        nextInnerPropValue = nextInnerPropValue[propKey];
      }
      return nextInnerPropValue;
    }, propSource);
  }

  propChainSet(propKeys, propTarget, value) { // 'propTarget' is any templated element
    const precedingPropKeys = propKeys.slice(0, -1);
    const destinationPropKey = propKeys[propKeys.length - 1];
    const lastPrecedingPropValue = this.propChainGet(precedingPropKeys, propTarget);
    if (Object.is(lastPrecedingPropValue, undefined)) return;
    lastPrecedingPropValue[destinationPropKey] = value;
  }

  cacheTemplatedElements() {
    // templateElements will look like this:
    // {
    //   element1Id: {
    //     self: <instance>
    //     elementPropChain1: ['viewKey2'],
    //     elementPropChain2: ['viewKey1', 'viewKey3']
    //     ...
    //   },
    //   element2Id: {
    //     self: <instance>
    //     elementPropChain3: ['viewKey1'],
    //     elementPropChain4: ['viewKey4', 'viewKey5'],
    //     ...
    //   },
    //   ...
    // }

    const templatedElements = this.templatedElements;
    for (const [elementId, propsData] of Object.entries(templatedElements)) {
      Object.defineProperty(propsData, 'self', {
        value: document.getElementById(elementId),
        enumerable: false,
      });
    }
  }

  formatTemplateString() {
    throw new Error('Error! Method is abstract and has to be implemented!');
  }
}