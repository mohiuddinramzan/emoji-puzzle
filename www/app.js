const state = {
  difficulty: "easy",
  score: 0,
  streak: 0,
  current: null,
};

const el = {
  pickScreen: document.getElementById("pickScreen"),
  puzzleScreen: document.getElementById("puzzleScreen"),
  levelChip: document.getElementById("levelChip"),
  clueBoard: document.getElementById("clueBoard"),
  finalRow: document.getElementById("finalRow"),
  optionsGrid: document.getElementById("optionsGrid"),
  feedback: document.getElementById("feedback"),
  nextBtn: document.getElementById("nextBtn"),
  scoreNum: document.getElementById("scoreNum"),
  streakNum: document.getElementById("streakNum"),
  changeLevelBtn: document.getElementById("changeLevelBtn"),
};

document.querySelectorAll(".level-card").forEach(btn => {
  btn.addEventListener("click", () => {
    state.difficulty = btn.dataset.level;
    startLevel();
  });
});

el.changeLevelBtn.addEventListener("click", () => {
  el.puzzleScreen.classList.add("hidden");
  el.pickScreen.classList.remove("hidden");
});

el.nextBtn.addEventListener("click", () => {
  renderPuzzle();
});

function startLevel() {
  el.pickScreen.classList.add("hidden");
  el.puzzleScreen.classList.remove("hidden");
  el.levelChip.textContent = DIFFICULTY[state.difficulty].label;
  renderPuzzle();
}

function renderPuzzle() {
  const puzzle = generatePuzzle(state.difficulty);
  state.current = puzzle;

  el.feedback.textContent = "";
  el.nextBtn.classList.add("hidden");

  // ক্লু বোর্ড আঁকা
  el.clueBoard.innerHTML = "";
  puzzle.clues.forEach(clue => {
    const row = document.createElement("div");
    row.className = "clue-line";
    let inner = "";
    for (let i = 0; i < clue.count; i++) {
      inner += `<span>${clue.emoji}</span>`;
      if (i < clue.count - 1) inner += `<span class="op-sym">+</span>`;
    }
    inner += `<span class="eq-sym">=</span><span class="clue-total">${clue.total}</span>`;
    row.innerHTML = inner;
    el.clueBoard.appendChild(row);
  });

  // চূড়ান্ত সমীকরণ (উত্তরবিহীন)
  el.finalRow.innerHTML = "";
  puzzle.items.forEach((item, idx) => {
    const span = document.createElement("span");
    span.textContent = item.e;
    el.finalRow.appendChild(span);
    if (idx < puzzle.items.length - 1) {
      const op = document.createElement("span");
      op.className = "op-sym";
      op.textContent = puzzle.finalOps[idx];
      el.finalRow.appendChild(op);
    }
  });
  const eq = document.createElement("span");
  eq.className = "op-sym";
  eq.textContent = "=";
  el.finalRow.appendChild(eq);
  const q = document.createElement("span");
  q.className = "qmark";
  q.textContent = "?";
  el.finalRow.appendChild(q);

  // অপশন বাটন আঁকা
  el.optionsGrid.innerHTML = "";
  puzzle.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => checkAnswer(opt, btn));
    el.optionsGrid.appendChild(btn);
  });
}

function checkAnswer(selected, btn) {
  const correct = state.current.answer;
  const allBtns = el.optionsGrid.querySelectorAll(".option-btn");
  allBtns.forEach(b => (b.disabled = true));

  if (selected === correct) {
    btn.classList.add("correct");
    state.score += 10;
    state.streak += 1;
    el.feedback.textContent = "ঠিক আছে! দারুণ হয়েছে 🎉";
  } else {
    btn.classList.add("wrong");
    allBtns.forEach(b => { if (Number(b.textContent) === correct) b.classList.add("correct"); });
    state.streak = 0;
    el.feedback.textContent = `উত্তর ছিল ${correct}`;
  }

  el.scoreNum.textContent = state.score;
  el.streakNum.textContent = state.streak;
  el.nextBtn.classList.remove("hidden");
}
