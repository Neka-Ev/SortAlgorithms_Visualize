module.exports = function* selectionSort(arr) {
  let a = arr.slice();
  let n = a.length;
  
  for (let i = 0; i < n - 1; i++) {
    yield { array: a.slice(), line: 0, highlight: [i] }; // line 0: 外层循环
    let minIdx = i;
    yield { array: a.slice(), line: 1, highlight: [i] }; // line 1: minIdx = i
    
    for (let j = i + 1; j < n; j++) {
      yield { array: a.slice(), line: 2, highlight: [i, j, minIdx] }; // line 2: 内层循环
      
      yield { array: a.slice(), line: 3, highlight: [j, minIdx] }; // line 3: 比较条件
      if (a[j] < a[minIdx]) {
        minIdx = j;
        yield { array: a.slice(), line: 4, highlight: [i, j, minIdx] }; // line 4: 更新 minIdx
      }
      yield { array: a.slice(), highlight: [i, j, minIdx] };
    }
    
    // 交换
    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
    }
    yield { array: a.slice(), line: 5, highlight: [i, minIdx] }; // line 5: 交换
  }
  yield { array: a.slice(), highlight: [] };
};