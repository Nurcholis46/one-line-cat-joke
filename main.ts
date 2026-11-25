import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

// One line: a cat joke with a setup and a turn that lands. Chosen
// against the judge's brief, in its own order:
// 1. It is a one-line joke about cats, with a setup and a turn: the cat
//    knocks the laptop off the desk (setup), stares at the shattered
//    screen, then blames the Wi-Fi (turn).
// 2. It makes you laugh on the first read: the image is instant — a
//    guilty cat caught mid-crime, playing innocent.
// 3. It turns on a surprise: the blame lands on the Wi-Fi, the one
//    thing in the room that cannot defend itself, instead of the cat.
// 4. It says everything in a few words, no padding, no wind-up, and
//    the punchline is the last clause — nothing after it.
// 5. It is retellable: a cat, a laptop, a shattered screen, a shameless
//    excuse — anyone who has lived with a cat has seen this crime.
// Alternatives weighed and set aside: "My cat walked across my
// keyboard and filed a bug report" is clever but has no turn — the
// joke ends where it starts; "My cat sleeps 16 hours a day and still
// acts like I owe it rent" is relatable but the punch is a shrug, not
// a surprise; a knock-knock format needs two lines and breaks the gate.
const text =
  "My cat knocked my laptop off the desk, stared at the shattered screen, and meowed like the Wi-Fi did it.";

// The gate: /output/entry.txt must be UTF-8 text of 1 to 200 characters,
// not only white space. Fail loudly instead of writing an entry the
// judge would refuse. Single line only — no line breaks, no control
// characters (including U+2028/U+2029), no leading or trailing padding.
const codePoints = [...text].length;
if (codePoints < 1 || codePoints > 200 || text.trim().length === 0) {
  throw new Error(
    `entry must be 1-200 characters of non-blank text, got ${codePoints}`,
  );
}
if (/[\r\n]/.test(text)) {
  throw new Error("entry must be a single line");
}
if (/[\u0000-\u001f\u007f\u2028\u2029\ufeff\u200b-\u200d]/.test(text)) {
  throw new Error("entry must not contain control or invisible characters");
}
if (text !== text.trim()) {
  throw new Error("entry must not have leading or trailing whitespace");
}

// The brief's subject test: the joke must be about a cat, so a later
// edit cannot drift into a generic tech joke, and the punch must be
// the last clause — the blame on the Wi-Fi — with nothing after it.
if (!/\bcat\b/i.test(text)) {
  throw new Error("entry must be a joke about a cat");
}
if (!/did it\.$/.test(text)) {
  throw new Error("entry must end on its punchline");
}

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", text, { encoding: "utf8", mode: 0o644 });
// The grader collects outputs as another user: leave the file readable by
// everyone, or the run fails with "<path> is not readable".
chmodSync("/output/entry.txt", 0o644);

// Read it back and prove the file on disk is exactly the line: a write
// that silently truncated, re-encoded or padded the entry would otherwise
// ship a different text to the judge than the one gated above.
const written = readFileSync("/output/entry.txt", "utf8");
if (written !== text) {
  throw new Error("entry file does not match the gated line");
}
if (written.endsWith("\n") || written.endsWith("\r")) {
  throw new Error("entry file must not end with a line break");
}
if (Buffer.byteLength(written, "utf8") !== Buffer.byteLength(text, "utf8")) {
  throw new Error("entry file byte length does not match the gated line");
}
