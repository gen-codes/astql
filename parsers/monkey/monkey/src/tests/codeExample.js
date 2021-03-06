export default `let version = 1 + (50 / 2) - (8 * 3);

let name = "The Monkey programming language";

let isMonkeyFastNow = true;

let people = [{"name": "Anna", "age": 24}, {"name": "Bob", "age": 99}];

let getName = fn(person) { person["name"]; };
getName(people[0]);
getName(people[1]);

puts(len(people))

let fibonacci = fn(x) {
  if (x == 0) {
    0
  } else {
    if (x == 1) {
      return 1;
    } else {
      fibonacci(x - 1) + fibonacci(x - 2);
    }
  }
};


let newAdder = fn(a, b) {
    fn(c) { a + b + c };
};

let adder = newAdder(1, 2);

adder(8);
`;
