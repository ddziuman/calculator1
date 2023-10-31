export class Observer { // the Views which depend on observables will implement 'Observer's update
  constructor() {}

  update(newObservableState) {
    throw new Error('update() method has to be implemented!');
  }
}