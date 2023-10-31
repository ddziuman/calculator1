export class View {
  constructor(viewParent, viewParams, model) { // viewParams do not include 'model' params from template
    this.viewParent = viewParent;
    this.viewParams = viewParams;
    // 'formatTemplateString' is abstract
    this.childrenTemplate = this.formatTemplateString();
    View.prototype.update.call(this, model);
  }

  hide() {
    this.viewParent.style.display = 'none';
  }

  show() {
    this.viewParent.style.display = 'block';
  }

  renderTemplate(model) {
    if (!this.templatedElements) {
      // first time -- make everything 'dumb' way using '.innerHTML' here
      const filledTemplate = this.childrenTemplate.replace(
        /{[^}]*}/g, (templateParam) => {
          const modelPropChain = 
            templateParam.slice(1, -1).split(':').at(-1);
          const modelKeys = modelPropChain.split('.');
          let value = modelKeys.reduce(this.resolvePropChain, model);
          // not found in model -- lookup view model chain:
          if (Object.is(value, undefined)) {
            value = modelKeys.reduce(this.resolvePropChain, this.viewParams);
          }
          // not found in view params -- ''
          if (Object.is(value, undefined)) {
            value = '';
          }
          return value;
        }
      );

      this.viewParent.innerHTML = filledTemplate;


      // finally cache in elements::
      this.prepareElements();
    } else {
      // do the 'right' way, using this.templatedElements, without '.innerHTML' change
      for (const propsData of Object.values(this.templatedElements)) {
        const element = propsData.self;
        for (const [elementProp, modelPropChain] of Object.entries(propsData)) {
          const modelKeys = modelPropChain.split('.');
          // modelPropChain
          let value = modelKeys.reduce(this.resolvePropChain, model);
          // not found in model -- lookup view model chain:
          if (Object.is(value, undefined)) {
            value = modelKeys.reduce(this.resolvePropChain, this.viewParams);
          }
          if (Object.is(value, undefined)) {
            value = '';
          }
          element[elementProp] = value;
        }
      }
    }
  }

  resolvePropChain(nextInnerValue, propKey) {
    if (Object.is(nextInnerValue, undefined)/* || Object.is(nextInnerValue, '')*/) return undefined;
    return nextInnerValue = nextInnerValue[propKey];
  }

  prepareElements() {
    const templatedElements = this.templatedElements = {}; // {elementID: { elementProp: <prop>, modelPropChain: <data.something>}-collection

    const templateParams = this.childrenTemplate.match(/{[^}]*}/g);
    // ['{elementId:elementProp:modelField1.modelField2.modelField3}', '{...}', ... ]
    if (Object.is(templateParams, null)) return;
    templateParams.forEach((param) => {
      const [elementId, elementProp, modelPropChain] = param.slice(1, -1).split(':');
      let propsData = templatedElements[elementId];
      if (!propsData) {
        propsData = templatedElements[elementId] = {};
        Object.defineProperty(propsData, 'self', {
          value: document.getElementById(elementId),
          enumerable: false,
        });
      }

      propsData[elementProp] = modelPropChain;
    });
    // templateElements will look like this:
    // {
    //   element1Id: {
    //     self: <instance>
    //     prop1: modelChain1,
    //     prop2: modelChain2, (or viewParamsChain, actually)
    //     ...
    //   },
    //   element2Id: {
    //     self: <instance>
    //     prop3: modelChain3,
    //     prop4: modelChain4,
    //     ...
    //   },
    //   ...
    // }
    
  }

  formatTemplateString() {
    throw new Error('Error! Method is abstract and has to be implemented!');
  }

  update(updatedModel) {
    this.renderTemplate(updatedModel);
  }
}