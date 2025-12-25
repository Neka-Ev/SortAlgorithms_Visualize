// 快速排序生成器 (非递归，已添加索引)
function* quickSortGen(arr) {
    let a = arr.slice();
    // 栈用于存储子数组的边界 [l, r]
    let stack = [[0, a.length - 1]];
    let steps = [];

    // 分区函数（Partition）
    function partition(arr, l, r) {
        // 对应伪代码行 2: pivot = arr[r]
        steps.push({ array: arr.slice(), line: 2, highlight: [r] });
        let pivot = arr[r];

        // 对应伪代码行 3: i = l
        steps.push({ array: arr.slice(), line: 3, highlight: [l] });
        let i = l;

        for (let j = l; j < r; j++) {
            // 对应伪代码行 4: for j = l to r-1 (遍历)
            steps.push({ array: arr.slice(), line: 4, highlight: [j, r] });

            // 对应伪代码行 5: if arr[j] < pivot (比较)
            steps.push({ array: arr.slice(), line: 5, highlight: [j, r] });

            if (arr[j] < pivot) {
                // 对应伪代码行 6: swap arr[i] and arr[j] (交换)
                steps.push({ array: arr.slice(), line: 6, highlight: [i, j] });
                [arr[i], arr[j]] = [arr[j], arr[i]];
                i++;
                // 对应伪代码行 7: i++ (i 指针递增)
                steps.push({ array: arr.slice(), line: 7, highlight: [i - 1] });
            }
            steps.push({ array: arr.slice(), highlight: [i, j, r] });
        }

        // 对应伪代码行 8: swap arr[i] and arr[r] (交换 pivot 到最终位置)
        steps.push({ array: arr.slice(), line: 8, highlight: [i, r] });
        [arr[i], arr[r]] = [arr[r], arr[i]];

        return i; // 返回分区点
    }

    while (stack.length) {
        let [l, r] = stack.pop();

        // 对应伪代码行 8
         steps.push({ array: a.slice(), line:0, highlight: [l, r] });

        // 对应伪代码行 1: if l >= r return
        if (l >= r) {
            steps.push({ array: a.slice(), line: 1, highlight: [l, r] });
            continue;
        }

        let p = partition(a, l, r);

        // 对应伪代码行 9: quickSort(arr, l, i-1) (左侧递归，入栈)
        steps.push({ array: a.slice(), line: 9, highlight: [l, p - 1] });
        stack.push([l, p - 1]);

        // 对应伪代码行 10: quickSort(arr, i+1, r) (右侧递归，入栈)
        steps.push({ array: a.slice(), line: 10, highlight: [p + 1, r] });
        stack.push([p + 1, r]);
    }

    steps.push({ array: a.slice(), highlight: [] });
    for (let step of steps) yield step;
}
module.exports = quickSortGen;
