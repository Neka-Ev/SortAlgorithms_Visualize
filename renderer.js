// 导入 fs 模块，用于同步读取本地文件
const fs = require('fs');
const path = require('path');
const {webFrame} = require('electron');
webFrame.setZoomFactor(1.25);

const algorithms = {
  bubbleSort: require('./js/algorithms/bubbleSort.js'),
  selectionSort: require('./js/algorithms/selectionSort.js'),
  mergeSort: require('./js/algorithms/mergeSort.js'),
  quickSort: require('./js/algorithms/quickSort.js')
};
// 暴露给对比模式使用
window.algorithms = algorithms;

// 伪代码 / 多语言代码文件路径
const codeFiles = {
  bubbleSort: {
    pseudo: './codes/pseudo/bubbleSort.txt',
    c: './codes/c/bubbleSort.c',
    cpp: './codes/cpp/bubbleSort.cpp',
    python: './codes/python/bubbleSort.py',
    java: './codes/java/BubbleSort.java'
  },
  selectionSort: {
    pseudo: './codes/pseudo/selectionSort.txt',
    c: './codes/c/selectionSort.c',
    cpp: './codes/cpp/selectionSort.cpp',
    python: './codes/python/selectionSort.py',
    java: './codes/java/SelectionSort.java'
  },
  mergeSort: {
    pseudo: './codes/pseudo/mergeSort.txt',
    c: './codes/c/mergeSort.c',
    cpp: './codes/cpp/mergeSort.cpp',
    python: './codes/python/mergeSort.py',
    java: './codes/java/MergeSort.java'
  },
  quickSort: {
    pseudo: './codes/pseudo/quickSort.txt',
    c: './codes/c/quickSort.c',
    cpp: './codes/cpp/quickSort.cpp',
    python: './codes/python/quickSort.py',
    java: './codes/java/QuickSort.java'
  }
};

const codeLineMapping = require('./js/renderers/codelineMap.js');

// --- DOM 元素获取 ---
// 主模式切换
const tabSingle = document.getElementById('tab-single');
const tabCompare = document.getElementById('tab-compare');
const singleModeView = document.getElementById('single-mode-view');
const compareModeView = document.getElementById('compare-mode-view');

// 单算法模式 DOM
const visualization = document.getElementById('visualization');
const pseudocode = document.getElementById('pseudocode');
const algorithmSelect = document.getElementById('algorithm-select');
const startBtn = document.getElementById('start-btn');
const resetInSortBtn = document.getElementById('reset-in-sort-btn');
const resetBtn = document.getElementById('reset-btn');
const speedSlider = document.getElementById('speed-slider');
const speedValueDisplay = document.getElementById('speed-value');
const codeBlock = document.getElementById('code-block');
const languageSelect = document.getElementById('language-select');
const pauseResumeBtn = document.getElementById('pause-resume-btn');

// 新增控件
const arraySizeInput = document.getElementById('array-size');
const arraySizeNumberInput = document.getElementById('array-size-input');
const arraySizeValueDisplay = document.getElementById('array-size-value');
const modeToggleBtn = document.getElementById('mode-toggle');
const nextStepBtn = document.getElementById('next-step-btn');
const manualInputBtn = document.getElementById('manual-input-btn');

// 手动录入弹窗相关
const manualInputModal = document.getElementById('manual-input-modal');
const manualInputTip = document.getElementById('manual-input-tip');
const manualInputText = document.getElementById('manual-input-text');
const manualInputError = document.getElementById('manual-input-error');
const manualInputConfirmBtn = document.getElementById('manual-input-confirm-btn');
const manualInputCancelBtn = document.getElementById('manual-input-cancel-btn');
const manualInputOrderRadio = document.getElementById('manual-input-order');
const manualInputRandomRadio = document.getElementById('manual-input-random');
const manualInputClearBtn = document.getElementById('manual-input-clear-btn');

let lastManualInputText = '';

// --- 状态变量 ---
let array = [];
let originalArray = null; // 保存本次排序开始时的原始数组
let sorting = false;
let paused = false;
let animationDelay = parseInt((speedSlider && speedSlider.value) || 40);
let codeLines = [];
let currentHighlightLine = -1;
let currentAlgorithm = algorithmSelect ? algorithmSelect.value : 'bubbleSort';
let mode = 'auto';
let currentGenerator = null;
let autoLoopRunning = false;
let cancelAutoLoop = false;
let lastValidArraySize = arraySizeInput ? parseInt(arraySizeInput.value) || 50 : 50;
let currentLanguage = languageSelect ? languageSelect.value : 'pseudo';
let mainMode = 'single'; // 'single' | 'compare'

// 音频反馈相关
let audioCtx = null;
let toneGain = null;
let lastToneAt = 0;

function ensureAudioContext() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  toneGain = audioCtx.createGain();
  toneGain.gain.value = 0.15;
  toneGain.connect(audioCtx.destination);
}

function playValueTone(value, maxValue) {
  if (!value || !maxValue) return;
  const now = performance.now();
  if (now - lastToneAt < 40) return; // 限制播放频率
  ensureAudioContext();
  lastToneAt = now;
  const osc = audioCtx.createOscillator();
  const norm = Math.max(0, Math.min(1, value / maxValue));
  const freq = 180 + norm * 880; // 频率范围约 180-1060 Hz
  osc.frequency.value = freq;
  osc.type = 'sine';
  osc.connect(toneGain);
  const t0 = audioCtx.currentTime;
  const t1 = t0 + 0.12;
  toneGain.gain.setTargetAtTime(0.2, t0, 0.005);
  toneGain.gain.setTargetAtTime(0.001, t1 - 0.04, 0.03);
  osc.start(t0);
  osc.stop(t1);
}

function generateArray(size) {
  const targetSize = typeof size === 'number' ? size : lastValidArraySize;
  array = Array.from({ length: targetSize }, () => Math.floor(Math.random() * 400) + 20);
  renderArray();
}

function resetSortState(restoreOriginal = false) {
  if (restoreOriginal && originalArray && Array.isArray(originalArray)) {
    console.log('restoreOriginal:', restoreOriginal);
    array = originalArray.slice();
    renderArray();
    if (arraySizeInput) arraySizeInput.value = String(array.length);
    if (arraySizeNumberInput) arraySizeNumberInput.value = String(array.length);
    if (arraySizeValueDisplay) arraySizeValueDisplay.textContent = String(array.length);
  }
  sorting = false;
  paused = false;
  currentGenerator = null;
  autoLoopRunning = false;
  cancelAutoLoop = false;
  pauseResumeBtn.disabled = true;
  pauseResumeBtn.textContent = '暂停';
  // startBtn.disabled = false;
  resetBtn.disabled = false;
  if (arraySizeInput) arraySizeInput.disabled = false;
  if (manualInputBtn) manualInputBtn.disabled = false;
  highlightPseudocodeLine(-1);
}

function executeOneStep() {
  if (!currentGenerator) return;
  const { value: step, done } = currentGenerator.next();
  if (done || !step) {
    // 结束时清除高亮并解锁按钮，禁用开始排序按钮，保留当前（已排序）数组
    renderArray([]);
    resetSortState(false);
    return;
  }
  array = step.array;
  renderArray(step.highlight || []);
  if (step.line !== undefined) {
    highlightPseudocodeLine(step.line);
  }
}

async function visualizeSortAuto() {
  if (!currentGenerator) return;
  autoLoopRunning = true;
  cancelAutoLoop = false;
  while (!cancelAutoLoop && mode === 'auto') {
    while (paused) {
      await new Promise(r => setTimeout(r, 100));
      if (cancelAutoLoop || mode !== 'auto') break;
    }
    if (cancelAutoLoop || mode !== 'auto') break;
    const prevGenerator = currentGenerator;
    executeOneStep();
    if (!currentGenerator || currentGenerator !== prevGenerator || !sorting) break;
    await new Promise(r => setTimeout(r, animationDelay));
  }
  autoLoopRunning = false;
}

async function startSort() {
  if (sorting) return;
  currentAlgorithm = algorithmSelect.value;
  sorting = true;
  paused = false;
  cancelAutoLoop = false;

  originalArray = array.slice(); // 记录排序开始时的初始数组
  currentGenerator = algorithms[currentAlgorithm](array.slice());
  startBtn.disabled = true;
  resetBtn.disabled = true;
  if (arraySizeInput) arraySizeInput.disabled = true;
  if (manualInputBtn) manualInputBtn.disabled = true;
  if (resetInSortBtn) resetInSortBtn.disabled = false;
  if (mode === 'auto') {
    pauseResumeBtn.disabled = false;
    pauseResumeBtn.textContent = '暂停';
    await visualizeSortAuto();
  } else {
    pauseResumeBtn.disabled = true;
  }
}

// --- 核心功能函数 ---

/**
 * 渲染柱状图
 */
function renderArray(highlight = []) {
  if (!visualization) return;

  visualization.innerHTML = '';

  const n = array.length || 1;
  const containerWidth = visualization.clientWidth || 600;
  const barWidth = Math.max(2, Math.floor(containerWidth / (n * 1.2)));

  const style = window.getComputedStyle(visualization);
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const paddingBottom = parseFloat(style.paddingBottom) || 0;
  const availableHeight = (visualization.clientHeight || 260) - paddingTop - paddingBottom;
  const MAX_BAR_HEIGHT = Math.max(80, availableHeight);
  const maxValue = array.length ? Math.max(...array) : 1;
  const showValues = array.length <= 40;

  const highlightedIndex = highlight && highlight.length ? highlight[0] : null;

  array.forEach((value, idx) => {
    const bar = document.createElement('div');
    bar.className = 'bar';

    // 按最大值等比缩放高度
    const scaledHeight = (value / maxValue) * MAX_BAR_HEIGHT;
    bar.style.height = scaledHeight + 'px';
    bar.style.width = barWidth + 'px';

    bar.classList.add(highlight.includes(idx) ? 'bar-highlight' : 'bar-default');

    if (showValues) {
      const label = document.createElement('div');
      label.className = 'bar-value';
      label.textContent = String(value);
      bar.appendChild(label);
    }

    visualization.appendChild(bar);

    if (highlightedIndex === idx) {
      playValueTone(value, maxValue);
    }
  });
}

/**
 * ** 联动函数 **
 */
function highlightPseudocodeLine(pseudoLineIndex) {
  // 清除之前的高亮
  if (currentHighlightLine >= 0 && currentHighlightLine < codeLines.length) {
    codeLines[currentHighlightLine].classList.remove('code-highlight');
  }

  let targetLineIndex = -1;

  // 如果是伪代码模式，直接使用行号
  if (currentLanguage === 'pseudo') {
    targetLineIndex = pseudoLineIndex;
  } else {
    // 其他语言需要通过映射转换行号
    const mapping = codeLineMapping[currentAlgorithm];
    if (mapping && mapping[currentLanguage]) {
      targetLineIndex = mapping[currentLanguage][pseudoLineIndex];
    }
  }

  if (targetLineIndex !== undefined && targetLineIndex >= 0 && targetLineIndex < codeLines.length) {
    const lineEl = codeLines[targetLineIndex];
    lineEl.classList.add('code-highlight');
    currentHighlightLine = targetLineIndex;

    // 滚动代码窗口以确保高亮行可见
    if (pseudocode) {
      const containerRect = pseudocode.getBoundingClientRect();
      const lineRect = lineEl.getBoundingClientRect();

      // 计算行相对于容器可视区域的位置
      const relativeTop = lineRect.top - containerRect.top;
      const relativeBottom = lineRect.bottom - containerRect.top;

      // 检查是否在视口内
      const isAbove = relativeTop < 0;
      const isBelow = relativeBottom > pseudocode.clientHeight;

      if (isAbove || isBelow) {
        // 如果不在视口内，则滚动使其居中显示
        // scrollTop：当前 scrollTop + 相对位置 - 容器高度的一半 + 行高度的一半
        pseudocode.scrollTop += relativeTop - pseudocode.clientHeight / 2 + lineEl.offsetHeight / 2;
      }
    }
  } else {
    currentHighlightLine = -1;
  }
}



/**
 * ** 伪代码加载函数 **
 */
function showPseudocode(algorithm) {
  if (!codeBlock) {
    console.error('DOM 错误：未找到 #code-block 元素。');
    return;
  }

  const langMap = codeFiles[algorithm];
  const relPath = langMap ? (langMap[currentLanguage] || langMap.pseudo) : null;
  if (!relPath) {
    codeBlock.textContent = `未找到 ${algorithm} 的 ${currentLanguage} 代码文件。`;
    codeLines = [];
    return;
  }

  try {
    const filePath = path.join(__dirname, relPath);
    const text = fs.readFileSync(filePath, 'utf8');

    // 1. 填充原始代码文本
    codeBlock.textContent = text;

    // 清除上一次 highlight.js 的状态
    codeBlock.classList.remove('hljs');
    if (codeBlock.dataset && codeBlock.dataset.highlighted) {
      delete codeBlock.dataset.highlighted;
    }

    // 2. 由 highlight.js 生成带 span 的高亮 HTML
    if (typeof hljs !== 'undefined') {
      hljs.highlightElement(codeBlock);
    }

    // 3. 对所有语言都按行拆分，以支持逐行联动
    const highlightedHTML = codeBlock.innerHTML;
    const rawLines = highlightedHTML.split('\n');

    codeBlock.innerHTML = '';
    codeLines = rawLines.map((lineHTML) => {
      const lineElement = document.createElement('span');
      lineElement.innerHTML = lineHTML || '&nbsp;';
      lineElement.style.display = 'block';
      codeBlock.appendChild(lineElement);
      return lineElement;
    });

    highlightPseudocodeLine(-1);

  } catch (error) {
    console.error(`加载代码文件失败: ${relPath}`, error);
    codeBlock.textContent = `加载代码 ${algorithm} (${currentLanguage}) 失败。请检查文件路径和内容。`;
    codeLines = [];
  }
}

/**
 * ** 暂停/继续功能 **
 */
function togglePause() {
    if (!sorting) return; // 只有在排序进行时才允许操作

    paused = !paused;
    if (paused) {
        pauseResumeBtn.textContent = '继续';
        console.log("排序已暂停");
    } else {
        pauseResumeBtn.textContent = '暂停';
        console.log("排序已继续");
    }
}

// --- 事件监听器 ---

// 主模式切换（算法演示 / 对比演示）
if (tabSingle && tabCompare && singleModeView && compareModeView) {
  tabSingle.onclick = () => {
    if (mainMode === 'single') return;
    mainMode = 'single';
    tabSingle.classList.add('active');
    tabCompare.classList.remove('active');
    singleModeView.classList.remove('hidden');
    compareModeView.classList.add('hidden');
  };

  tabCompare.onclick = () => {
    if (mainMode === 'compare') return;
    mainMode = 'compare';
    tabCompare.classList.add('active');
    tabSingle.classList.remove('active');
    singleModeView.classList.add('hidden');
    compareModeView.classList.remove('hidden');
  };
}

algorithmSelect.onchange = () => {
  currentAlgorithm = algorithmSelect.value;
  showPseudocode(currentAlgorithm);
};

if (languageSelect) {
  languageSelect.onchange = () => {
    currentLanguage = languageSelect.value;
    if (currentAlgorithm) {
      showPseudocode(currentAlgorithm);
    }
  };
}

startBtn.onclick = async () => {
  if (!sorting) {
    await startSort();
  }
};

resetBtn.onclick = () => {
  if (!sorting) {
      generateArray();
      resetSortState(false);
      startBtn.disabled = false;  // 随机生成后启用开始按钮
  }
};

if (arraySizeInput && arraySizeNumberInput) {
  const clampSize = (v) => {
    if (Number.isNaN(v)) v = lastValidArraySize;
    v = Math.max(2, Math.min(200, v));
    return v;
  };

  const syncAll = (v) => {
    lastValidArraySize = v;
    arraySizeInput.value = String(v);
    arraySizeNumberInput.value = String(v);
    if (arraySizeValueDisplay) arraySizeValueDisplay.textContent = String(v);
    if (!sorting) {
      generateArray(v);
    }
  };

  // 初始化显示
  syncAll(lastValidArraySize);

  arraySizeInput.oninput = () => {
    let v = clampSize(parseInt(arraySizeInput.value));
    syncAll(v);
  };

  arraySizeNumberInput.onchange = () => {
    let v = clampSize(parseInt(arraySizeNumberInput.value));
    syncAll(v);
  };
}

function updateModeToggleVisual() {
  if (!modeToggleBtn) return;
  const iconSpan = modeToggleBtn.querySelector('.mode-icon');
  const textSpan = modeToggleBtn.querySelector('.mode-text');
  if (mode === 'auto') {
    modeToggleBtn.classList.remove('manual-mode');
    if (iconSpan) iconSpan.textContent = '⏩';
    if (textSpan) textSpan.textContent = '自动模式';
  } else {
    modeToggleBtn.classList.add('manual-mode');
    if (iconSpan) iconSpan.textContent = '✋';
    if (textSpan) textSpan.textContent = '手动模式';
  }
}

// 初始化时更新一次
updateModeToggleVisual();

// 模式切换逻辑
if (modeToggleBtn) {
  modeToggleBtn.onclick = () => {
    const newMode = mode === 'auto' ? 'manual' : 'auto';
    if (newMode === mode) return;
    mode = newMode;
    updateModeToggleVisual();
    if (mode === 'manual') {
      cancelAutoLoop = true;
      paused = false;
      pauseResumeBtn.disabled = true;
      pauseResumeBtn.textContent = '暂停';
      if (nextStepBtn) nextStepBtn.style.display = 'inline-block';
    } else {
      if (nextStepBtn) nextStepBtn.style.display = 'none';
      if (sorting && currentGenerator && !autoLoopRunning) {
        pauseResumeBtn.disabled = false;
        visualizeSortAuto();
      }
    }
  };
}

if (resetInSortBtn) {
  resetInSortBtn.onclick = () => {
    if(sorting) {
      cancelAutoLoop = true;         // 停止自动循环，不在排序时不置位
    }
    resetSortState(true);          // 恢复到本次排序的初始数组
    startBtn.disabled = false;    // 重置后启用开始按钮
    resetInSortBtn.disabled = true; // 重置按钮禁用，直到下次开始排序
  };
}

if (nextStepBtn) {
  nextStepBtn.onclick = () => {
    if (mode !== 'manual' || !sorting || !currentGenerator) return;
    executeOneStep();
  };
}

if (manualInputBtn && manualInputModal) {
  manualInputBtn.onclick = () => {
    manualInputText.value = lastManualInputText;
    manualInputError.textContent = '';
    manualInputTip.textContent = '请输入希望排序的数字序列（2-200个），可以使用逗号、空格或换行分隔。';
    manualInputModal.classList.remove('hidden');
  };
}

if (manualInputClearBtn) {
  manualInputClearBtn.onclick = () => {
    manualInputText.value = '';
    manualInputError.textContent = '';
    lastManualInputText = '';
  };
}

if (manualInputConfirmBtn && manualInputModal) {
  manualInputConfirmBtn.onclick = () => {
    const raw = manualInputText.value;
    const trimmed = raw.trim();
    if (!trimmed) {
      manualInputError.textContent = '请输入至少一个数字。';
      return;
    }
    const tokens = raw.split(/[^-\d\.]+/).filter(Boolean);
    const numbers = [];
    for (const t of tokens) {
      const n = Number(t);
      // 保留原输入
      if (!Number.isFinite(n)) {
        manualInputError.textContent = `检测到非法数字 "${t}"，请只输入数字。`;
        return;
      }
      if (n < 1 || n > 1000) {
        manualInputError.textContent = `数字需在 1–1000 之间，发现超出范围的值：${n}`;
        return;
      }
      numbers.push(n);
    }
    if (numbers.length < 2 || numbers.length > 200) {
      manualInputError.textContent = '请输入 2-200 个数字。';
      return;
    }

    const useRandomOrder = manualInputRandomRadio ? manualInputRandomRadio.checked : false;
    const resultArray = useRandomOrder ? shuffleArray(numbers) : numbers;

    lastManualInputText = raw;
    lastValidArraySize = resultArray.length;
    if (arraySizeInput) arraySizeInput.value = String(resultArray.length);
    if (arraySizeNumberInput) arraySizeNumberInput.value = String(resultArray.length);
    if (arraySizeValueDisplay) arraySizeValueDisplay.textContent = String(resultArray.length);
    array = resultArray.slice();
    renderArray();
    resetSortState();
    manualInputModal.classList.add('hidden');
  };
}

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 手动输入取消按钮事件监听器
if (manualInputCancelBtn && manualInputModal) {
  manualInputCancelBtn.onclick = () => {
    manualInputModal.classList.add('hidden');
  };
}

// 速度滑块事件监听器
if (speedSlider) {
    speedSlider.oninput = () => {
        animationDelay = parseInt(speedSlider.value);
        if (speedValueDisplay) {
            speedValueDisplay.textContent = `${animationDelay} ms`;
        }
    };
}

// 暂停/继续 按钮事件监听器
if (pauseResumeBtn) {
    pauseResumeBtn.onclick = togglePause;
}

// --- 初始化 ---
generateArray();
showPseudocode(currentAlgorithm);
