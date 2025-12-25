// 对比模式逻辑（模块 2）
// 依赖：window.algorithms 已在 renderer.js 中暴露

const compareAlgorithms = window.algorithms;

// 对比模式 DOM
const compareAlgo1Select = document.getElementById('compare-algo-1');
const compareAlgo2Select = document.getElementById('compare-algo-2');
const compareStartBtn = document.getElementById('compare-start-btn');
const comparePauseBtn = document.getElementById('compare-pause-btn');
const compareSpeedSlider = document.getElementById('compare-speed-slider');
const compareSpeedValue = document.getElementById('compare-speed-value');
const compareSizeSlider = document.getElementById('compare-size');
const compareSizeInput = document.getElementById('compare-size-input');
const compareVisualization1 = document.getElementById('compare-visualization-1');
const compareVisualization2 = document.getElementById('compare-visualization-2');
const compareTime1 = document.getElementById('compare-time-1');
const compareTime2 = document.getElementById('compare-time-2');
const compareComplexity1 = document.getElementById('compare-complexity-1');
const compareComplexity2 = document.getElementById('compare-complexity-2');
const compareManualInputBtn = document.getElementById('compare-manual-input-btn');
const compareManualModal = document.getElementById('compare-manual-modal');
const compareManualText = document.getElementById('compare-manual-text');
const compareManualError = document.getElementById('compare-manual-error');
const compareManualRandomRadio = document.getElementById('compare-manual-random');
const compareManualConfirmBtn = document.getElementById('compare-manual-confirm-btn');
const compareManualCancelBtn = document.getElementById('compare-manual-cancel-btn');
const compareManualClearBtn = document.getElementById('compare-manual-clear-btn');
const compareResetInSortBtn = document.getElementById('compare-reset-in-sort-btn');
const compareRandomBtn = document.getElementById('compare-random-btn');

let lastCompareManualText = '';

// 状态变量
let compareArray1 = [];
let compareArray2 = [];
let compareGen1 = null;
let compareGen2 = null;
let compareRunning = false;
let comparePaused = false;
let compareAnimationDelay = parseInt((compareSpeedSlider && compareSpeedSlider.value) || 40);
let compareStartTime1 = null;
let compareStartTime2 = null;
let compareLastValidSize = compareSizeSlider ? parseInt(compareSizeSlider.value) || 20 : 20;

const COMPARE_MIN_SIZE = 5;
const COMPARE_MAX_SIZE = 100;

// 算法时间复杂度映射
const compareAlgorithmComplexity = {
  bubbleSort: 'O(n²)',
  selectionSort: 'O(n²)',
  mergeSort: 'O(n log n)',
  quickSort: 'O(n log n)'
};

// 渲染对比模式中的数组到指定容器
function renderArrayTo(container, data, highlight = []) {
  if (!container) return;
  container.innerHTML = '';

  const n = data.length || 1;
  const containerWidth = container.clientWidth || 400;
  const barWidth = Math.max(2, Math.floor(containerWidth / (n * 1.2)));

  const style = window.getComputedStyle(container);
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const paddingBottom = parseFloat(style.paddingBottom) || 0;
  const availableHeight = (container.clientHeight || 220) - paddingTop - paddingBottom;
  const MAX_BAR_HEIGHT = Math.max(80, availableHeight);
  const maxValue = data.length ? Math.max(...data) : 1;
  const showValues = data.length <= 30;

  data.forEach((value, idx) => {
    const bar = document.createElement('div');
    bar.className = 'bar';

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

    container.appendChild(bar);
  });
}

// 速度滑块
if (compareSpeedSlider && compareSpeedValue) {
  compareSpeedSlider.oninput = () => {
    compareAnimationDelay = parseInt(compareSpeedSlider.value);
    compareSpeedValue.textContent = `${compareAnimationDelay} ms`;
  };
  compareAnimationDelay = parseInt(compareSpeedSlider.value);
  compareSpeedValue.textContent = `${compareAnimationDelay} ms`;
}

// 更新复杂度显示
function updateCompareComplexity() {
  if (compareAlgo1Select && compareComplexity1) {
    const algo1 = compareAlgo1Select.value;
    compareComplexity1.textContent = compareAlgorithmComplexity[algo1] || '-';
  }
  if (compareAlgo2Select && compareComplexity2) {
    const algo2 = compareAlgo2Select.value;
    compareComplexity2.textContent = compareAlgorithmComplexity[algo2] || '-';
  }
}

// 更新时间显示
function updateCompareTime(elapsed1, elapsed2) {
  if (compareTime1) {
    if (elapsed1 !== null) {
      compareTime1.textContent = `${elapsed1.toFixed(2)} ms`;
    } else {
      compareTime1.textContent = '-';
    }
  }
  if (compareTime2) {
    if (elapsed2 !== null) {
      compareTime2.textContent = `${elapsed2.toFixed(2)} ms`;
    } else {
      compareTime2.textContent = '-';
    }
  }
}

// 数组规模
if (compareSizeSlider && compareSizeInput) {
  const clampCompareSize = (v) => {
    if (Number.isNaN(v)) v = compareLastValidSize;
    v = Math.max(COMPARE_MIN_SIZE, Math.min(COMPARE_MAX_SIZE, v));
    return v;
  };

  const syncCompareSize = (v) => {
    compareLastValidSize = v;
    compareSizeSlider.value = String(v);
    compareSizeInput.value = String(v);
    if (!compareRunning) {
      const baseArray = generateCompareBaseArray(v);
      compareArray1 = baseArray.slice();
      compareArray2 = baseArray.slice();
      renderArrayTo(compareVisualization1, compareArray1);
      renderArrayTo(compareVisualization2, compareArray2);
    }
  };

  syncCompareSize(compareLastValidSize);

  compareSizeSlider.oninput = () => {
    let v = clampCompareSize(parseInt(compareSizeSlider.value));
    syncCompareSize(v);
  };

  compareSizeInput.onchange = () => {
    let v = clampCompareSize(parseInt(compareSizeInput.value));
    syncCompareSize(v);
  };
}

// 生成基础数组
function generateCompareBaseArray(size) {
  const n = typeof size === 'number' ? size : parseInt(compareSizeSlider.value) || 20;
  const clamped = Math.max(COMPARE_MIN_SIZE, Math.min(COMPARE_MAX_SIZE, n));
  return Array.from({ length: clamped }, () => Math.floor(Math.random() * 400) + 20);
}

// 重置对比状态
function resetCompareState() {
  compareRunning = false;
  comparePaused = false;
  compareGen1 = null;
  compareGen2 = null;
  if (comparePauseBtn) {
    comparePauseBtn.disabled = true;
    comparePauseBtn.textContent = '暂停对比';
  }
  if (compareResetInSortBtn) compareResetInSortBtn.disabled = true;
}

// 开始对比排序
async function startCompareSort() {
  if (!compareAlgo1Select || !compareAlgo2Select ||
      !compareVisualization1 || !compareVisualization2) return;
  if (compareRunning) return;

  const baseArray = generateCompareBaseArray();
  compareArray1 = baseArray.slice();
  compareArray2 = baseArray.slice();

  const algo1 = compareAlgo1Select.value;
  const algo2 = compareAlgo2Select.value;

  // 更新复杂度显示
  updateCompareComplexity();

  // 重置时间
  compareStartTime1 = performance.now();
  compareStartTime2 = performance.now();
  updateCompareTime(0, 0);

  compareGen1 = compareAlgorithms[algo1](compareArray1.slice());
  compareGen2 = compareAlgorithms[algo2](compareArray2.slice());
  compareRunning = true;
  comparePaused = false;
  if (comparePauseBtn) {
    comparePauseBtn.disabled = false;
    comparePauseBtn.textContent = '暂停对比';
  }
  if (compareResetInSortBtn) compareResetInSortBtn.disabled = false;

  let done1 = false;
  let done2 = false;
  let elapsed1 = null;
  let elapsed2 = null;

  while (compareRunning) {
    while (comparePaused && compareRunning) {
      await new Promise(r => setTimeout(r, 80));
    }
    if (!compareRunning) break;
    const step1 = compareGen1 && !done1 ? compareGen1.next() : { done: true };
    const step2 = compareGen2 && !done2 ? compareGen2.next() : { done: true };

    if (step1 && !step1.done && step1.value) {
      compareArray1 = step1.value.array;
      renderArrayTo(compareVisualization1, compareArray1, step1.value.highlight || []);
    } else if (step1 && step1.done && !done1) {
      done1 = true;
      elapsed1 = performance.now() - compareStartTime1;
      updateCompareTime(elapsed1, elapsed2);
    }

    if (step2 && !step2.done && step2.value) {
      compareArray2 = step2.value.array;
      renderArrayTo(compareVisualization2, compareArray2, step2.value.highlight || []);
    } else if (step2 && step2.done && !done2) {
      done2 = true;
      elapsed2 = performance.now() - compareStartTime2;
      updateCompareTime(elapsed1, elapsed2);
    }

    if (done1 && done2) {
      compareRunning = false;
      if (comparePauseBtn) {
        comparePauseBtn.disabled = true;
        comparePauseBtn.textContent = '暂停对比';
      }
      if (compareResetInSortBtn) compareResetInSortBtn.disabled = false;
      break;
    }

    await new Promise(r => setTimeout(r, compareAnimationDelay));
  }
}

if (compareStartBtn) {
  compareStartBtn.onclick = () => {
    if (!compareRunning) {
      startCompareSort();
    }
  };
}

if (compareResetInSortBtn) {
  compareResetInSortBtn.onclick = () => {
    compareRunning = !compareRunning;

    comparePaused = false;
    resetCompareState();
    if (compareStartBtn) compareStartBtn.disabled = false;
    const baseArray = generateCompareBaseArray();
    compareArray1 = baseArray.slice();
    compareArray2 = baseArray.slice();
    renderArrayTo(compareVisualization1, compareArray1);
    renderArrayTo(compareVisualization2, compareArray2);
  };
}

if (compareRandomBtn) {
  compareRandomBtn.onclick = () => {
    if (compareRunning) return;
    const baseArray = generateCompareBaseArray(compareLastValidSize);
    compareArray1 = baseArray.slice();
    compareArray2 = baseArray.slice();
    renderArrayTo(compareVisualization1, compareArray1);
    renderArrayTo(compareVisualization2, compareArray2);
  };
}

if (comparePauseBtn) {
  comparePauseBtn.onclick = () => {
    if (!compareRunning) return;
    comparePaused = !comparePaused;
    comparePauseBtn.textContent = comparePaused ? '继续对比' : '暂停对比';
  };
}

function shuffleArr(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

if (compareManualInputBtn && compareManualModal) {
  compareManualInputBtn.onclick = () => {
    if (compareRunning) {
      const ok = window.confirm('当前正在对比，手动录入将中断本次对比，是否继续？');
      if (!ok) return;
      compareRunning = false;
      comparePaused = false;
      resetCompareState();
    }
    compareManualText.value = lastCompareManualText;
    compareManualError.textContent = '';
    compareManualModal.classList.remove('hidden');
  };
}

if (compareManualClearBtn) {
  compareManualClearBtn.onclick = () => {
    compareManualText.value = '';
    compareManualError.textContent = '';
    lastCompareManualText = '';
  };
}

if (compareManualConfirmBtn && compareManualModal) {
  compareManualConfirmBtn.onclick = () => {
    const raw = compareManualText.value;
    const trimmed = raw.trim();
    if (!trimmed) {
      compareManualError.textContent = '请输入至少一个数字。';
      return;
    }
    const tokens = raw.split(/[^-\d\.]+/).filter(Boolean);
    const numbers = [];
    for (const t of tokens) {
      const n = Number(t);
      if (!Number.isFinite(n)) {
        compareManualError.textContent = `检测到非法数字 "${t}"，请只输入数字。`;
        return;
      }
      if (n < 1 || n > 1000) {
        compareManualError.textContent = `数字需在 1–1000 之间，发现超出范围的值：${n}`;
        return;
      }
      numbers.push(n);
    }
    if (numbers.length < 2 || numbers.length > COMPARE_MAX_SIZE) {
      compareManualError.textContent = `请输入 2-${COMPARE_MAX_SIZE} 个数字。`;
      return;
    }

    const useRandomOrder = compareManualRandomRadio ? compareManualRandomRadio.checked : false;
    const resultArray = useRandomOrder ? shuffleArr(numbers) : numbers;

    lastCompareManualText = raw;
    compareLastValidSize = resultArray.length;
    if (compareSizeSlider) compareSizeSlider.value = String(resultArray.length);
    if (compareSizeInput) compareSizeInput.value = String(resultArray.length);
    compareArray1 = resultArray.slice();
    compareArray2 = resultArray.slice();
    renderArrayTo(compareVisualization1, compareArray1);
    renderArrayTo(compareVisualization2, compareArray2);
    resetCompareState();
    compareManualModal.classList.add('hidden');
  };
}

if (compareManualCancelBtn && compareManualModal) {
  compareManualCancelBtn.onclick = () => {
    compareManualModal.classList.add('hidden');
  };
}

if (compareAlgo1Select && compareAlgo2Select) {
    compareAlgo1Select.onchange = () => {
        updateCompareComplexity();
    };
    compareAlgo2Select.onchange = () => {
        updateCompareComplexity();
    }
}

// 初始化对比模式的初始数组展示和复杂度显示
if (compareVisualization1 && compareVisualization2) {
  const baseArray = generateCompareBaseArray();
  compareArray1 = baseArray.slice();
  compareArray2 = baseArray.slice();

  renderArrayTo(compareVisualization1, compareArray1);
  renderArrayTo(compareVisualization2, compareArray2);
  updateCompareComplexity(); // 初始化复杂度显示
}
