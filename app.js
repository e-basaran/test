const promptDeck = [
  {
    title: "Sketch the first scene of your idea.",
    body:
      "Describe what is happening, what is felt, and what you want the viewer to remember. Keep it to three sentences.",
    tag: "Mode: Narrative",
    energy: "Energy: Clear",
    mood: "Steady / Bright",
  },
  {
    title: "Map your smallest meaningful win.",
    body:
      "Choose one deliverable, one decision, and one way to celebrate it today.",
    tag: "Mode: Momentum",
    energy: "Energy: Warm",
    mood: "Focused / Warm",
  },
  {
    title: "Design a gentle handoff for future you.",
    body:
      "Write a short note that explains where to begin next time. Include the first action step.",
    tag: "Mode: Clarity",
    energy: "Energy: Soft",
    mood: "Clear / Calm",
  },
  {
    title: "Gather three signals from the world.",
    body:
      "Pick one texture, one color, and one sound that match your project. Sketch how each might translate.",
    tag: "Mode: Sensory",
    energy: "Energy: Curious",
    mood: "Open / Curious",
  },
];

const promptTitle = document.getElementById("promptTitle");
const promptBody = document.getElementById("promptBody");
const promptTag = document.getElementById("promptTag");
const promptEnergy = document.getElementById("promptEnergy");
const studioMood = document.getElementById("studioMood");
const promptCard = document.getElementById("promptCard");

const timerDisplay = document.getElementById("timerDisplay");
const timerToggle = document.getElementById("timerToggle");
const timerReset = document.getElementById("timerReset");
const durationSlider = document.getElementById("duration");
const durationValue = document.getElementById("durationValue");
const focusLength = document.getElementById("focusLength");

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskStatus = document.getElementById("taskStatus");

const studioNotes = document.getElementById("studioNotes");
const saveNotes = document.getElementById("saveNotes");
const clearNotes = document.getElementById("clearNotes");
const noteStatus = document.getElementById("noteStatus");

const newPrompt = document.getElementById("newPrompt");
const startFocus = document.getElementById("startFocus");
const saveSnapshot = document.getElementById("saveSnapshot");
const exportSnapshot = document.getElementById("exportSnapshot");
const copySnapshot = document.getElementById("copySnapshot");
const snapshotCard = document.getElementById("snapshotCard");
const toast = document.getElementById("toast");

const palettes = Array.from(document.querySelectorAll(".palette"));
const contrastToggle = document.getElementById("contrastToggle");
const startBreath = document.getElementById("startBreath");
const breathInstruction = document.getElementById("breathInstruction");

let timerId = null;
let remainingSeconds = 25 * 60;
let tasks = [];

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
};

const updateTimerDisplay = () => {
  timerDisplay.textContent = formatTime(remainingSeconds);
  focusLength.textContent = formatTime(remainingSeconds);
};

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
};

const setPrompt = (prompt) => {
  promptTitle.textContent = prompt.title;
  promptBody.textContent = prompt.body;
  promptTag.textContent = prompt.tag;
  promptEnergy.textContent = prompt.energy;
  studioMood.textContent = prompt.mood;
  promptCard.animate(
    [{ transform: "translateY(0)" }, { transform: "translateY(-8px)" }],
    {
      duration: 300,
      direction: "alternate",
      easing: "ease-in-out",
    }
  );
};

const randomPrompt = () =>
  promptDeck[Math.floor(Math.random() * promptDeck.length)];

const startTimer = () => {
  if (timerId) return;
  timerToggle.textContent = "Pause";
  timerId = setInterval(() => {
    remainingSeconds = Math.max(0, remainingSeconds - 1);
    updateTimerDisplay();
    if (remainingSeconds === 0) {
      clearInterval(timerId);
      timerId = null;
      timerToggle.textContent = "Start";
      showToast("Focus session complete. Take a breath.");
    }
  }, 1000);
};

const pauseTimer = () => {
  clearInterval(timerId);
  timerId = null;
  timerToggle.textContent = "Start";
};

const resetTimer = () => {
  const duration = Number(durationSlider.value);
  remainingSeconds = duration * 60;
  updateTimerDisplay();
  pauseTimer();
};

const saveLocal = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const loadLocal = (key, fallback) => {
  const item = localStorage.getItem(key);
  if (!item) return fallback;
  try {
    return JSON.parse(item);
  } catch (error) {
    return fallback;
  }
};

const renderTasks = () => {
  taskList.innerHTML = "";
  if (tasks.length === 0) {
    taskList.innerHTML = `<li class="status-text">No tasks yet. Add one above.</li>`;
    return;
  }
  tasks.forEach((task) => {
    const listItem = document.createElement("li");
    listItem.className = "task-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.id = `task-${task.id}`;

    const label = document.createElement("label");
    label.setAttribute("for", checkbox.id);
    label.textContent = task.label;

    const removeButton = document.createElement("button");
    removeButton.className = "ghost-button";
    removeButton.type = "button";
    removeButton.textContent = "Remove";

    checkbox.addEventListener("change", () => {
      task.done = checkbox.checked;
      saveLocal("tasks", tasks);
      taskStatus.textContent = "Task updated.";
    });

    removeButton.addEventListener("click", () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveLocal("tasks", tasks);
      renderTasks();
      taskStatus.textContent = "Task removed.";
    });

    listItem.append(checkbox, label, removeButton);
    taskList.appendChild(listItem);
  });
};

const saveNotesToLocal = () => {
  saveLocal("notes", studioNotes.value.trim());
  noteStatus.textContent = "Notes saved.";
  showToast("Studio notes saved.");
};

const clearNotesLocal = () => {
  studioNotes.value = "";
  saveNotesToLocal();
  noteStatus.textContent = "Notes cleared.";
};

const loadSaved = () => {
  tasks = loadLocal("tasks", []);
  renderTasks();

  studioNotes.value = loadLocal("notes", "");

  const savedPrompt = loadLocal("prompt", null);
  if (savedPrompt) {
    setPrompt(savedPrompt);
  }

  const savedTheme = loadLocal("theme", "aurora");
  document.body.dataset.theme = savedTheme;
  palettes.forEach((palette) => {
    palette.setAttribute(
      "aria-checked",
      palette.dataset.theme === savedTheme ? "true" : "false"
    );
  });

  const savedContrast = loadLocal("contrast", false);
  if (savedContrast) {
    document.body.classList.add("high-contrast");
  }
  contrastToggle.textContent = savedContrast ? "Standard contrast" : "High contrast";

  const savedSnapshot = loadLocal("snapshot", null);
  if (savedSnapshot) {
    snapshotCard.innerHTML = savedSnapshot;
  }
};

const buildSnapshotText = () => {
  const taskSummary = tasks.length
    ? tasks.map((task) => `${task.done ? "[x]" : "[ ]"} ${task.label}`).join("\n")
    : "No tasks yet.";

  return `Signal Garden Snapshot\n\nPrompt: ${promptTitle.textContent}\n${promptBody.textContent}\n${promptTag.textContent} | ${promptEnergy.textContent}\nMood: ${studioMood.textContent}\n\nTasks:\n${taskSummary}\n\nNotes:\n${studioNotes.value.trim() || "No notes yet."}`;
};

const updateSnapshot = () => {
  const snapshotText = buildSnapshotText();
  snapshotCard.innerHTML = `
    <p class="snapshot-title">${promptTitle.textContent}</p>
    <p class="snapshot-body">${promptBody.textContent}</p>
    <p class="snapshot-body">Tasks: ${tasks.length}</p>
    <p class="snapshot-body">Notes: ${studioNotes.value.trim() ? "Saved" : "None"}</p>
  `;
  saveLocal("snapshot", snapshotCard.innerHTML);
  saveLocal("snapshotText", snapshotText);
};

newPrompt.addEventListener("click", () => {
  const prompt = randomPrompt();
  setPrompt(prompt);
  saveLocal("prompt", prompt);
  showToast("New studio prompt ready.");
});

startFocus.addEventListener("click", () => {
  startTimer();
  showToast("Focus session started.");
});

timerToggle.addEventListener("click", () => {
  if (timerId) {
    pauseTimer();
    showToast("Timer paused.");
  } else {
    startTimer();
    showToast("Timer running.");
  }
});

timerReset.addEventListener("click", () => {
  resetTimer();
  showToast("Timer reset.");
});

durationSlider.addEventListener("input", (event) => {
  const duration = Number(event.target.value);
  durationValue.textContent = `${duration} min`;
  remainingSeconds = duration * 60;
  updateTimerDisplay();
});

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = taskInput.value.trim();
  if (!value) return;
  const newTask = {
    id: Date.now(),
    label: value,
    done: false,
  };
  tasks.unshift(newTask);
  taskInput.value = "";
  saveLocal("tasks", tasks);
  renderTasks();
  taskStatus.textContent = "Task planted.";
  showToast("Task planted.");
});

saveNotes.addEventListener("click", saveNotesToLocal);

clearNotes.addEventListener("click", () => {
  clearNotesLocal();
  showToast("Notes cleared.");
});

saveSnapshot.addEventListener("click", () => {
  updateSnapshot();
  showToast("Snapshot saved.");
});

exportSnapshot.addEventListener("click", () => {
  updateSnapshot();
  const snapshotText = loadLocal("snapshotText", buildSnapshotText());
  const blob = new Blob([snapshotText], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "signal-garden-snapshot.txt";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Snapshot exported.");
});

copySnapshot.addEventListener("click", async () => {
  updateSnapshot();
  const snapshotText = loadLocal("snapshotText", buildSnapshotText());
  try {
    await navigator.clipboard.writeText(snapshotText);
    showToast("Snapshot copied.");
  } catch (error) {
    showToast("Copy failed. Try export instead.");
  }
});

palettes.forEach((palette) => {
  palette.addEventListener("click", () => {
    const theme = palette.dataset.theme;
    document.body.dataset.theme = theme;
    palettes.forEach((button) =>
      button.setAttribute(
        "aria-checked",
        button.dataset.theme === theme ? "true" : "false"
      )
    );
    saveLocal("theme", theme);
  });
});

contrastToggle.addEventListener("click", () => {
  document.body.classList.toggle("high-contrast");
  const isHighContrast = document.body.classList.contains("high-contrast");
  saveLocal("contrast", isHighContrast);
  contrastToggle.textContent = isHighContrast ? "Standard contrast" : "High contrast";
});

const breathSequence = [
  "Inhale for 4",
  "Hold for 4",
  "Exhale for 6",
  "Repeat once more",
];

startBreath.addEventListener("click", () => {
  let index = 0;
  breathInstruction.textContent = breathSequence[index];
  const interval = setInterval(() => {
    index += 1;
    if (index >= breathSequence.length) {
      clearInterval(interval);
      breathInstruction.textContent = "Reset complete. Notice your posture.";
      showToast("Reset complete.");
      return;
    }
    breathInstruction.textContent = breathSequence[index];
  }, 4000);
});

window.addEventListener("load", () => {
  const prompt = randomPrompt();
  setPrompt(prompt);
  updateTimerDisplay();
  loadSaved();
  renderTasks();
});
