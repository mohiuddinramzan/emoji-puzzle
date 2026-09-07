// ইমুজি ধাঁধা — ক্যাটাগরি ও পাজল জেনারেটর
// এই ফাইলটাই একমাত্র জায়গা যেখানে নতুন ক্যাটাগরি/ইমুজি যোগ করতে হবে।

const EMOJI_BANK = {
  flower: { label: "ফুল", items: [
    { e: "🌹", name: "গোলাপ" }, { e: "🌺", name: "জবা" }, { e: "🌸", name: "চেরি ফুল" },
    { e: "🌻", name: "সূর্যমুখী" }, { e: "🌼", name: "ডেইজি" }, { e: "🪷", name: "পদ্ম" },
    { e: "🌷", name: "টিউলিপ" }, { e: "💐", name: "তোড়া" },
  ]},
  fruit: { label: "ফল", items: [
    { e: "🍎", name: "আপেল" }, { e: "🍌", name: "কলা" }, { e: "🍇", name: "আঙুর" },
    { e: "🍓", name: "স্ট্রবেরি" }, { e: "🍉", name: "তরমুজ" }, { e: "🍊", name: "কমলা" },
    { e: "🥝", name: "কিউই" }, { e: "🍑", name: "পীচ" }, { e: "🍍", name: "আনারস" },
  ]},
  animal: { label: "প্রাণী", items: [
    { e: "🐶", name: "কুকুর" }, { e: "🐱", name: "বিড়াল" }, { e: "🐰", name: "খরগোশ" },
    { e: "🦊", name: "শিয়াল" }, { e: "🐻", name: "ভালুক" }, { e: "🐼", name: "পান্ডা" },
    { e: "🐸", name: "ব্যাঙ" }, { e: "🐵", name: "বানর" }, { e: "🦁", name: "সিংহ" },
  ]},
  food: { label: "খাবার", items: [
    { e: "🍕", name: "পিৎজা" }, { e: "🍔", name: "বার্গার" }, { e: "🍟", name: "ফ্রাই" },
    { e: "🌮", name: "টাকো" }, { e: "🍩", name: "ডোনাট" }, { e: "🍪", name: "কুকি" },
    { e: "🧁", name: "কাপকেক" }, { e: "🍦", name: "আইসক্রিম" },
  ]},
};

// প্রতিটি ডিফিকাল্টির নিয়ম — কতগুলো আইটেম, সংখ্যার রেঞ্জ, কী কী অপারেশন চলবে
const DIFFICULTY = {
  easy: {
    label: "সহজ",
    itemCount: 2,           // পাজলে দুই ধরনের ইমুজি থাকবে
    valueRange: [4, 20],    // প্রতিটি ইমুজির একক মান এই রেঞ্জ থেকে
    ops: ["+"],
    optionSpread: 6,
  },
  medium: {
    label: "মাঝারি",
    itemCount: 2,
    valueRange: [8, 45],
    ops: ["+", "-"],
    optionSpread: 12,
  },
  hard: {
    label: "কঠিন",
    itemCount: 3,           // তিন ধরনের ইমুজি, তিনটা ক্লু-সমীকরণ
    valueRange: [5, 60],
    ops: ["+", "-", "×"],
    optionSpread: 20,
  },
};

function pickRandom(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// একটা ইমুজি পুল তৈরি করে — একাধিক ক্যাটাগরি মিশিয়ে (ফুল, ফল, প্রাণী, খাবার)
function buildItemPool() {
  const cats = Object.values(EMOJI_BANK);
  let all = [];
  cats.forEach(c => all = all.concat(c.items));
  return all;
}

// মূল পাজল জেনারেটর
function generatePuzzle(difficultyKey) {
  const diff = DIFFICULTY[difficultyKey];
  const pool = buildItemPool();
  const chosen = pickRandom(pool, diff.itemCount).map(item => ({
    ...item,
    value: randInt(diff.valueRange[0], diff.valueRange[1]),
  }));

  // ক্লু-সমীকরণ: প্রতিটি ইমুজি একা একা দুইবার/তিনবার যোগ হয়ে তার একক মান প্রকাশ করে
  const clues = chosen.map((item, idx) => {
    const count = idx === chosen.length - 1 && diff.itemCount === 3 ? 3 : 2;
    return {
      display: `${item.e} ${"+".repeat(0)}`.trim(),
      emoji: item.e,
      count,
      total: item.value * count,
    };
  });

  // চূড়ান্ত সমীকরণ: সব ইমুজি একবার করে, র‍্যান্ডম অপারেশন সহ (শুধু hard-এ একাধিক অপারেশন)
  // উত্তর যেন কখনও শূন্য বা ঋণাত্মক না হয়, তাই "-" বসাতে গিয়ে ফল ঋণাত্মক হলে "+" দিয়ে সামলানো হয়
  let finalOps = [];
  let answer = chosen[0].value;
  for (let i = 1; i < chosen.length; i++) {
    let op = diff.ops[randInt(0, diff.ops.length - 1)];
    if (op === "-" && answer - chosen[i].value <= 0) op = "+";
    finalOps.push(op);
    if (op === "+") answer += chosen[i].value;
    else if (op === "-") answer -= chosen[i].value;
    else if (op === "×") answer *= chosen[i].value;
  }

  // ৪টা অপশন তৈরি (১টা সঠিক + ৩টা কাছাকাছি ভুল, সবসময় ধনাত্মক)
  const options = new Set([answer]);
  let attempts = 0;
  while (options.size < 4 && attempts < 200) {
    attempts++;
    const spread = Math.max(diff.optionSpread, Math.ceil(answer * 0.15));
    const fake = answer + randInt(-spread, spread);
    if (fake !== answer && fake > 0) options.add(fake);
  }
  // নিরাপত্তা: এখনও ৪টা না হলে ধনাত্মক দিকেই ভরাট করা
  let filler = 1;
  while (options.size < 4) {
    options.add(answer + filler);
    filler++;
  }
  const shuffledOptions = pickRandom([...options], 4);

  return {
    difficulty: difficultyKey,
    items: chosen,
    clues,
    finalOps,
    answer,
    options: shuffledOptions,
  };
}