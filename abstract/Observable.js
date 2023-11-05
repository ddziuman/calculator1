export class Observable { // the models will inherit the 'Observable' behaviour
  constructor(argsCallback) {
    this.observers = [];
    this.argsCallback = argsCallback;
  }

  subscribe(observer) {
    if (!this.observers.includes(observer))
      this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter((obsr) => obsr !== observer);
  }

  notifyAll() {
    this.observers.forEach((obsr) => obsr(this.argsCallback()));
  }
}