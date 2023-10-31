export class Observable { // the models will inherit the 'Observable' behaviour
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    if (!this.observers.includes(observer))
      this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter((obsr) => obsr !== observer);
  }

  notifyAll() {
    // console.dir(this);
    this.observers.forEach((obsr) => obsr.update(this));
  }
}