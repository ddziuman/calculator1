export class Model { // is abstract class!
  constructor(initialModelData, observables) {
    this.data = initialModelData;
    this.observables = observables;
  }

  subscribe(event, observer) {
    const observable = this.observables[event];
    if (!observable) return;
    observable.subscribe(observer);
  }

  unsubscribe(event, observer) {
    const observable = this.observables[event];
    if (!observable) return;
    observable.unsubscribe(observer);
  }

  emit(event) {
    const observable = this.observables[event];
    observable.notifyAll();
  }
}