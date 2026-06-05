// The default snippet shown in the mono specimen editor (CodePreview). Shared by
// the store's persisted `codeSample` (the editable buffer) so both have one
// source of truth.
//
// Front-loaded coding-font sample: real code (operators, brackets, numbers, the
// 0/o/O and l/1/I tests) sits up top so even a short mobile panel shows the
// glyphs that matter; the multi-line comment (for judging italics) moves to the
// end. Still exercises =>, ===, !==, <= that coding fonts are judged on.
export const DEFAULT_CODE = `// glance test: 0 o O / l 1 I / => === !== <= >=
const isMultipleOf = (number, multiple) => {
  if (number === 0) return '0 is a neutral element';
  for (let i = 1; i <= 10; i++) {
    if ((number * i) % multiple === 0) {
      console.log(number * i + ' is a multiple of ' + multiple);
    } else {
      console.log(number * i + ' is not a multiple');
    }
  }
};

let oO0 = 0; // Zero  (tell 0 from o and O)
let l1I = 1; // One   (tell l from 1 and I)

/* a multi-line comment, kept down here so italics still
   get a few lines without burying the code up top */
isMultipleOf(oO0, l1I); // => related to zero
isMultipleOf(l1I, oO0); // => related to one`;
