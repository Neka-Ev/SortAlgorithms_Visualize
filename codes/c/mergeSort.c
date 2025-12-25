// 归并排序 - C 版本
void merge(int arr[], int left, int mid, int right, int temp[]) {
    int i = left, j = mid + 1, k = left;
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) temp[k++] = arr[i++];
        else temp[k++] = arr[j++];
    }
    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];
    for (int p = left; p <= right; ++p) arr[p] = temp[p];
}

void merge_sort(int arr[], int left, int right, int temp[]) {
    if (left >= right) return;
    int mid = (left + right) / 2;
    merge_sort(arr, left, mid, temp);
    merge_sort(arr, mid + 1, right, temp);
    merge(arr, left, mid, right, temp);
}
