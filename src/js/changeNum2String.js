// 将后端传过来的数据中的文件类型的数字转换成字符串的
function fileType(num) {
    switch (num) {
        case 0:
            return 'folder';
        case 1:
            return 'video';
        case 2:
            return 'music';
        case 3:
            return 'code'
        case 4:
            return 'pdf'
        case 5:
            return 'excel'
        case 6:
            return 'txt'
        case 7:
            return 'word'
        case 8:
            return 'image'
        case 9:
            return 'zip'
        case 10:
            return "others"
        default:
            return '';
    }
}
export { fileType };