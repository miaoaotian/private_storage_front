<template>
    <div>
        <div class="path">
            <p>
                <span @click="handlePathClick(0)"><strong>全部音频文件</strong></span>
                <span v-for="(path,index) in paths" :key="index" @click="handlePathClick(path.id)">
                    ><strong>{{ path.name }}</strong>
                </span>
            </p>
        </div>
        <div class="file-list">
            <el-table v-if="files.length > 0" ref="multipleTable" :data="files"
                @selection-change="handleSelectionChange" style="width: 100%;max-height:72vh;overflow-y:scroll" :highlight-selection-row="true"
                @cell-mouse-enter="enter" @cell-mouse-leave="leave">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="name" :label="fileNameNums">
                    <template slot-scope="scope">
                        <div class="inputWithBtn" v-if="isRename && temp === scope.row.fileId">
                            <input type="text" v-model="newFolderName">
                            <button class="cy-btn" @click="changeName"><i class="el-icon-check"></i></button>
                            <button class="cy-btn" @click="canelChangeName"><i class="el-icon-close"></i></button>
                        </div>
                        <div v-else class="icon-name">
                            <Icon :fileType="scope.row.type" :cover="scope.row.cover" />
                            <a class="file_a" href="javascript:void(0);" @click="handleLinkClick(scope.row)">
                                {{ scope.row.name }}
                            </a>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="updateTime" sortable label="更新时间">
                    <template slot-scope="scope">
                        <div v-if="nowRow && nowRow.fileId === scope.row.fileId" class="icons">
                            <span @click="beforeChangeName"><i class="el-icon-edit"></i></span>
                            <span @click="Share"><i class="el-icon-share"></i></span>
                            <span @click="Delete"><i class="el-icon-delete"></i></span>
                            <span @click="Download(scope.row)"><i class="el-icon-download"></i></span>
                        </div>
                        <div v-else>{{ scope.row.updateTime }}</div>
                    </template>
                </el-table-column>
                <el-table-column prop="size" label="大小">
                    <template slot-scope="scope">
                        {{ scope.row.size | sizeFormat }}
                    </template>
                </el-table-column>
            </el-table>
            <div v-else class="nofiles">
                <div class="nofiles-top">
                    <img style="width:150px" src="../assets/nofiles.png" alt="">
                    <p style="font-size:12px;color:#818999">暂无文件，请上传第一个文件吧</p>
                </div>
                <div class="nofiles-bottom">
                    <div class="box1">
                        <img style="width: 80px;" src="../assets/icon-image/file.png" alt="">
                        <p>上传文件</p>
                    </div>
                    <div class="box2">
                        <img style="width: 80px;" src="../assets/icon-image/folder.png">
                        <p>新增文件夹</p>
                    </div>
                </div>
            </div>
            
        </div>
        <el-dialog
            style="margin-top: -100px;"
            :visible.sync="fileVisible"
            width="70%"
            :before-close="CloseFile"
            center>
            <div class="preview-container">
                <FilePreview v-if="selectedFile" :url="selectedFile.url" :type="selectedFile.type" />
              </div>
            </el-dialog>
    </div>
</template>

<script>
import axios from 'axios';
import FilePreview from '../components/FilePreview.vue';
import { SelectBus } from './../js/SelectBus.js'
const config = {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
}
export default {
    components: {
        FilePreview,
    },
    data() {
        return {
            files: [],
            multipleSelection: [],
            fileNameNums: "文件名",
            isRename: false,
            nowRow: null,
            temp: 0,
            paths: [],
            selectedFile: null,
            fileVisible: false,
        }
    },
    methods: {
        enter(row, column) {
            this.nowRow = row;
        },
        leave(row, column) {
            this.nowRow = null;
        },
        handleLinkClick(row) {
                let url = 'http://localhost:8080/uploads/' + row.userId + '/';
                if (row.type === 1) {
                    const prename = row.name.replace(/\.[^/.]+$/, "");
                    url = url + '/' + prename + '/index.m3u8';
                } else {
                    url = url + row.name;
                }
                this.selectedFile = {
                    url: url,
                    type: row.type
                }
                this.fileVisible = true;
            
        },
        CloseFile() {
            this.selectedFile = null;
            this.fileVisible = false;
        },
        handlePathClick(id) {
            this.getPath(id); 
            this.getFilesByIdAndCategory();
        },
        getPath(id) {
            axios.get('http://localhost:8080/getPath?id=' + id, config)
                .then(res => {
                    if (res.data.code === 200) {
                        this.paths = res.data.data;
                        console.log(res.data.data);
                        console.log(this.paths);

                    } else {
                        this.$message.error('获取路径列表失败');
                    }
                }).catch(err => {
                    this.$message.error('网络问题，请联系管理员');
                });
        },
        beforeChangeName() { this.isRename = true; this.temp = this.nowRow.fileId; },
        canelChangeName() { this.isRename = false; this.temp = 0; },
        changeName() {
            const fileId = this.nowRow.fileId;
            const newName = this.newFolderName;
            const formData = new FormData();
            formData.append('fileId', fileId);
            formData.append('newName', newName);
            axios.post('http://localhost:8080/changeName', formData, config)
                .then(res => {
                    if (res.data.code === 200) {
                        this.$message.success('修改成功');
                        this.isRename = false;
                        this.newFolderName = '';
                        this.temp = 0;
                        this.getFilesByIdAndCategory();
                    } else {
                        this.$message.error('修改失败');
                    }
                }).catch(err => {
                    this.$message.error('网络问题，请联系管理员');
                });
        },
        Share() {

        },
        Delete() {
            this.temp = this.nowRow.fileId;
            this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.deleteFiles();
                this.temp = 0;
            }).catch(() => {
                this.$message.info('已取消删除');
            });

        },
        deleteFiles() {
            const ids = [];
            if (this.multipleSelection.length === 0) {
                ids.push(this.temp);

            } else {
                ids = this.multipleSelection.map(item => item.fileId);
            }
            const formData = new FormData();
            formData.append('ids', ids);
            axios.post('http://localhost:8080/deleteFile', formData, config)
                .then(res => {
                    if (res.data.code === 200) {
                        this.$message.success('删除成功');
                        this.multipleSelection = [];
                        this.getFilesByIdAndCategory();
                    } else {

                        this.$message.error('删除失败');
                    }
                })
                .catch(err => {
                    this.$message.error('网络问题，请联系管理员');
                })
        },
        Download(row) {
            console.log(row.fileId);
            let configs = {
                responseType: 'blob',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Access-Control-Expose-Headers': 'Content-Disposition'
                }
            };
            let id = row.fileId;
            axios.get("http://localhost:8080/download?id="+id, configs)
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const contentDisposition = response.headers['content-disposition'];
                let filename = "defaultName.ext";  // 默认文件名
                if (contentDisposition) {
                    const filenameRegex = /filename\*=UTF-8''([^;]+)/; // 更新正则表达式以匹配RFC 5987格式
                    let matches = filenameRegex.exec(contentDisposition);
                    if (matches != null && matches[1]) { 
                        filename = decodeURIComponent(matches[1].replace(/['"]/g, '')); // 解码文件名并移除任何引号
                    }
                }

                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);  // 使用解码的文件名
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);

            }).catch(err => {
                this.$message.error('网络问题，请联系管理员');
            });
        },
        getFilesByIdAndCategory() {
            const category = 3;
            const formData = new FormData();
            formData.append('category', category);
            axios.post('http://localhost:8080/getFileByIdAndCategory', formData, config)
                .then(res => {
                    if (res.data.code === 200) {
                        this.files = res.data.data.map(file => ({
                            fileId: file.id,
                            name: file.name,
                            size: file.size,
                            userId: file.userId,
                            updateTime: file.lastUpdateTime,
                            createTime: file.createTime,
                            path: file.path,
                            cover: file.cover,
                            type: file.type,
                        }));
                    } else {
                        this.$message.error('获取文件列表失败');
                    }
                }).catch(err => {
                    this.$message.error('网络问题，请联系管理员');
                });
        },        
        handleSelectionChange(val) {
            this.multipleSelection = val;
            this.fileNameNums = val.length > 0 ? `已选中${val.length}个文件/文件夹` : "文件名";
            const selected = this.$refs.multipleTable.selection;
            SelectBus.$emit('fileSelection', selected);
        }
    },
    mounted() {
        this.getFilesByIdAndCategory();
    },
    filters: {
        sizeFormat(limit) {
            if (limit == null || limit === '') {
                return '';
            }
            var size = "";
            if (limit < 0.1 * 1024) {                            //小于0.1KB，则转化成B
                size = limit.toFixed(2) + "B"
            } else if (limit < 0.1 * 1024 * 1024) {            //小于0.1MB，则转化成KB
                size = (limit / 1024).toFixed(2) + "KB"
            } else if (limit < 0.1 * 1024 * 1024 * 1024) {        //小于0.1GB，则转化成MB
                size = (limit / (1024 * 1024)).toFixed(2) + "MB"
            } else {                                            //其他转化成GB
                size = (limit / (1024 * 1024 * 1024)).toFixed(2) + "GB"
            }
            var sizeStr = size + "";                        //转成字符串
            var index = sizeStr.indexOf(".");                    //获取小数点处的索引
            var dou = sizeStr.substr(index + 1, 2)            //获取小数点后两位的值
            if (dou == "00") {                                //判断后两位是否为00，如果是则删除00               
                return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
            }
            return size;
        }
    },
}
</script>

<style lang="scss" scoped>
.button-area {
    div {
        display: flex;
        align-items: center;

        ::v-deep .el-button {
            border-radius: 20px;
        }
    }

    .button-area-2 {
        border-radius: 20px;
        width: 300px;
        display: flex;
        justify-content: center;
        align-items: center;

        background-color: #F1FBFF;

        .small-button {
            border: 0;
            color: #06A7FF;
            margin: 7px;
            cursor: pointer;
            background-color: transparent;
            border-right: #06a7ff 1px solid;
        }

        .small-button:nth-last-child(1) {
            border: 0;
        }
    }

    .add-folder {
        margin-left: 5px;
        color: #06A7FF;
        background-color: #F0FAFF;
        border: #06A7FF 1px solid;
    }
}

.inputWithBtn {
    display: flex;
    justify-content: center;

    .cy-btn {
        width: 24px;
        height: 24px;
        position: relative;
        margin-left: 3px;
        border-radius: 3px;
        color: white;
        background-color: #06A7FF;
        border: white;
        cursor: pointer;

        i {
            font-size: large;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }

    input {
        border-color: #06a7ff;
        border-radius: 5px;
    }
}

.file-list {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .nofiles {
        margin-top: 100px;
    }

    .nofiles-top {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .nofiles-bottom {
        color: #495366;
        font-size: 12px;
        display: flex;
        justify-content: center;

        .box1 {
            background-color: #F7F9FD;
            cursor: pointer;
            width: 80px;

            display: inline-block;
            margin: 5px;

            p {
                margin-left: 10px;
                margin-top: 0;
                padding-top: 0;
            }
        }

        .box2 {
            background-color: #F7F9FD;
            cursor: pointer;
            width: 80px;
            display: inline-block;
            margin: 5px;

            p {
                margin-left: 10px;
                margin-top: 0;
                padding-top: 0;
            }
        }
    }
}

.icon-name {
    display: flex;
    align-items: center;
}

.icons {
    color: #06a7ff;
    font-size: 13px;

    span {
        margin: 5px;
        cursor: pointer;
    }
}

.file_a {
    text-decoration: none;
    color: #495366;
}

.file_a:hover {
    color: #06A7FF;
}

.path p {
    margin: 0;
    margin-top: 10px;

}

.path span {
    cursor: pointer;
    color: #06A7FF;
}

.path span:hover {
    text-decoration: underline;
}
.preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    overflow-y: scroll;
    video {
        max-width: 100%;
        max-height: 80vh;
    }
}
</style>