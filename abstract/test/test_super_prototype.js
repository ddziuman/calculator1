// class A {
//   constructor(a, b, c) {
//     this.a = a;
//     this.b = b;
//     this.c = c;
//     this.methodFromOutside();
//   }
// };

// class B extends A {
//   constructor(d, e) {
//     super(1, d, e);
//   }

//   methodFromOutside() {
//     console.log('why?');
//   }
// }

// const test = new B(7, 8);

// const a = '1';
// const b = '*'
// const c = '/';

// const isDigitRegex = /[0-9.]/;

// const aTest = a.match(isDigitRegex);
// const bTest = b.match(isDigitRegex);
// const cTest = c.match(isDigitRegex);
// console.dir({ aTest, bTest, cTest });

const array = [1, '+', 2, '-', 3];
array.splice(0, 3, 3);
console.log(array);

const test = 1.999999999999999;
console.log(test);