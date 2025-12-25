// 归并排序生成器 (基于 C++ 逻辑)
function* mergeSortGen(arr) {
  let a = arr.slice();
  let tmp = new Array(a.length).fill(0);
  let steps = [];

  // 递归函数（非生成器，负责执行排序逻辑和记录步骤）
  function mergeSort(arr, l, r, tmp) {
    // Line 1: 分治/终止条件
    steps.push({ array: arr.slice(), line: 1, highlight: [l, r] });
    if (l >= r) return;

    // Line 2: 计算中点
    let m = Math.floor((l + r) / 2);
    steps.push({ array: arr.slice(), line: 2, highlight: [m] });

    // Line 1: 递归处理左侧
    mergeSort(arr, l, m, tmp);

    // Line 1: 递归处理右侧
    mergeSort(arr, m + 1, r, tmp);

    // Line 3: 调用 Merge
    steps.push({ array: arr.slice(), line: 3, highlight: [l, m, r] });
    merge(arr, l, m, r, tmp);
  }

  function merge(arr, l, m, r, tmp) {
    // Line 4: 初始化指针
    let i = l, j = m + 1, k = l;
    steps.push({ array: arr.slice(), line: 4, highlight: [i, j] });

    // Line 5: 比较并合并
    while (i <= m && j <= r) {
      steps.push({ array: arr.slice(), tmp: tmp.slice(), line: 5, highlight: [i, j] });
      if (arr[i] <= arr[j]) {
        tmp[k++] = arr[i++];
      } else {
        tmp[k++] = arr[j++];
      }
    }

    // Line 6: 复制剩余元素 (左侧)
    while (i <= m) {
      steps.push({ array: arr.slice(), tmp: tmp.slice(), line: 6, highlight: [i] });
      tmp[k++] = arr[i++];
    }

    // Line 6: 复制剩余元素 (右侧)
    while (j <= r) {
      steps.push({ array: arr.slice(), tmp: tmp.slice(), line: 6, highlight: [j] });
      tmp[k++] = arr[j++];
    }

    // Line 7: 结果回写
    for (let p = l; p <= r; ++p) {
      arr[p] = tmp[p];
      steps.push({ array: arr.slice(), tmp: tmp.slice(), line: 7, highlight: [p] });
    }
  }

  // 开始排序并记录步骤
  mergeSort(a, 0, a.length - 1, tmp);

  // 结束状态
  steps.push({ array: a.slice(), highlight: [] });

  // 迭代返回每一步
  for (let step of steps) yield step;
}

module.exports = mergeSortGen;
