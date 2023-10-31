import { Observable } from "./Observable";

export class Model extends Observable { // is abstract class!
  constructor(initialModelData, modelMetadata) {
    super();
    this.data = initialModelData;
    this.metadata = modelMetadata;
  }
}