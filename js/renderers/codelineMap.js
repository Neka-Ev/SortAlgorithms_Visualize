// 代码行映射：伪代码行号 -> 各语言实际代码行号
const codeLineMapping = {
    bubbleSort: {
        cpp: {
            0: 5,   // 外层循环: for (int i = 0; i < n - 1; ++i)
            1: 6,   // 内层循环: for (int j = 0; j < n - 1 - i; ++j)
            2: 7,   // 比较条件: if (a[j] > a[j + 1])
            3: 8    // 交换: std::swap(a[j], a[j + 1]);
        },
        c: {
            0: 2,
            1: 3,
            2: 4,
            3: 5
        },
        python: {
            0: 3,
            1: 4,
            2: 5,
            3: 6
        },
        java: {
            0: 4,
            1: 5,
            2: 6,
            3: 7
        }
    },
    selectionSort: {
        cpp: {
            0: 5,   // 外层循环
            1: 6,   // minIdx = i
            2: 7,   // 内层循环
            3: 8,   // 比较条件
            4: 9,   // 更新 minIdx
            5: 12   // 交换
        },
        c: {
            0: 2,
            1: 3,
            2: 4,
            3: 5,
            4: 6,
            5: 9
        },
        python: {
            0: 3,
            1: 4,
            2: 5,
            3: 6,
            4: 7,
            5: 9
        },
        java: {
            0: 4,
            1: 5,
            2: 6,
            3: 7,
            4: 8,
            5: 11
        }
    },
    mergeSort: {
        cpp: {
            0: 14,   // 函数定义: void mergeSort(...)
            1: 15,   // 终止条件: if (l >= r) return;
            2: 16,   // 计算中点: int m = (l + r) / 2;
            3: 17,   // 左侧递归: mergeSort(a, l, m, tmp);
            4: 18,   // 右侧递归: mergeSort(a, m + 1, r, tmp);
            5: 19    // 归并: merge(a, l, m, r, tmp);
        },
        c: {
            0: 12,
            1: 13,
            2: 14,
            3: 15,
            4: 16,
            5: 17
        },
        python: {
            0: 2,
            1: 3,
            2: 5,
            3: 6,
            4: 7,
            5: 8
        },
        java: {
            0: 2,
            1: 3,
            2: 4,
            3: 5,
            4: 6,
            5: 7
        }
    },
    quickSort: {
        cpp: {
            0: 16,   // 函数定义: void quickSort(...)
            1: 17,  // if (l >= r) return
            2: 4,   // pivot = a[r]
            3: 5,   // i = l - 1
            4: 6,   // for循环
            5: 7,   // if (arr[j] < pivot)
            6: 8,   // swap(arr[i], arr[j])
            7: 9,  // i++
            8: 12,   // swap(a[i + 1], a[r])
            9: 19,   // quickSort(a, l, p - 1);
            10: 20,   // quickSort(a, p + 1, r);
        },
        c: {
            0: 18,
            1: 19,
            2: 2,
            3: 3,
            4: 4,
            5: 5,
            6: 7,
            7: 12,
            8: 14,
            9: 21,
            10: 22,
        },
        python: {
            0: 1,
            1: 2,
            2: 10,
            3: 11,
            4: 12,
            5: 13,
            6: 15,
            7: 16,
            8: 16,
            9: 5,
            10: 6,
        },
        java: {
            0: 2,
            1: 3,
            2: 10,
            3: 11,
            4: 12,
            5: 13,
            6: 14,
            7: 20,
            8: 23,
            9: 5,
            10: 6,
        }
    }
};

//暴露常量供renderer.js使用
module.exports = codeLineMapping;
