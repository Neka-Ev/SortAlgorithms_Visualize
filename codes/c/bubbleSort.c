// 冒泡排序 - C 版本
void bubble_sort(int arr[], int n) {
    for (int i = 0; i < n - 1; ++i) {
        for (int j = 0; j < n - 1 - i; ++j) {
            if (arr[j] > arr[j + 1]) {
                int tmp = arr[j]; // 交换 arr[j] 和 arr[j + 1]
                arr[j] = arr[j + 1];
                arr[j + 1] = tmp;
            }
        }
    }
}
