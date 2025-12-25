module.exports = function* bubbleSort(arr) {
  let a = arr.slice();
  let n = a.length;
  
  for (let i = 0; i < n - 1; i++) {
    yield { array: a.slice(), line: 0, highlight: [] }; // line 0: 外层循环
    for (let j = 0; j < n - i - 1; j++) {
      let highlight = [j, j + 1];
      yield { array: a.slice(), line: 1, highlight }; // line 1: 内层循环
      
      yield { array: a.slice(), line: 2, highlight }; // line 2: 比较条件
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        yield { array: a.slice(), line: 3, highlight }; // line 3: 交换
      }
    }
  }
  yield { array: a.slice(), highlight: [] };
};