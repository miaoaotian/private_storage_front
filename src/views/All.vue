<template>
    <div>
        <div class="button-area">
            <div v-if="multipleSelection.length === 0" class="button-area-1">
                <el-button type="primary" @click="upload"><i
                        class="el-icon-upload2"></i><strong>上传文件</strong></el-button>
                <el-button class="add-folder" @click="newFolder"><i
                        class="el-icon-folder-add"></i><strong>新建文件夹</strong></el-button>
            </div>
            <div v-else class="button-area-2">
                <button class="small-button" ><strong><i class="el-icon-share"></i>分享</strong></button>
                <button class="small-button" @click="deleteFiles"><strong><i
                            class="el-icon-delete"></i>删除</strong></button>
                <button class="small-button"><strong><i class="el-icon-download"></i>下载</strong></button>
                <button class="small-button" @click="beforeChangeParent"><strong><i class="el-icon-share"></i>移动</strong></button>
            </div>
        </div>

        <div class="path">
            <p>
                <span @click="handlePathClick(0)"><strong>全部文件</strong></span>
                <span v-for="(path, index) in paths" :key="index" @click="handlePathClick(path.id)">
                    ><strong>{{ path.name }}</strong>
                </span>
            </p>
        </div>
        <div class="file-list">
            <el-table v-if="files.length > 0" ref="multipleTable" :data="files"
                @selection-change="handleSelectionChange" style="width: 100%;max-height:72vh;overflow-y:scroll"
                :highlight-selection-row="true" @cell-mouse-enter="enter" @cell-mouse-leave="leave">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="name" :label="fileNameNums">
                    <template slot-scope="scope">
                        <div class="inputWithBtn" v-if="scope.$index === 0 && isCreatingFolder">
                            <input type="text" v-model="newFolderName">
                            <button class="cy-btn" @click="confirmFolderCreation"><i class="el-icon-check"></i></button>
                            <button class="cy-btn" @click="cancelFolderCreation"><i class="el-icon-close"></i></button>
                        </div>
                        <div class="inputWithBtn" v-else-if="isRename && temp === scope.row.fileId">
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
                            <span @click="beforeShare"><i class="el-icon-share"></i></span>
                            <span @click="Delete"><i class="el-icon-delete"></i></span>
                            <span @click="Download(scope.row)"><i class="el-icon-download"></i></span>
                            <span @click="beforeChangeParent"><i class="el-icon-rank"></i></span>
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
                    <div class="box1" @click="upload">
                        <img style="width: 80px;" src="../assets/icon-image/file.png" alt="">
                        <p>上传文件</p>
                    </div>
                    <div class="box2" @click="newFolder">
                        <img style="width: 80px;" src="../assets/icon-image/folder.png">
                        <p>新增文件夹</p>
                    </div>
                </div>
            </div>

        </div>
        <el-dialog style="margin-top: -100px;" :visible.sync="fileVisible" width="70%" :before-close="CloseFile" center>
            <div class="preview-container">
                <FilePreview v-if="selectedFile" :url="selectedFile.url" :type="selectedFile.type" />
            </div>
        </el-dialog>
        <el-dialog :title="ShareTarname" :visible.sync="showShareDialog" width="40%">
            <div>
                <br>
                <span>分享期限：</span>
                <el-radio-group v-model="valid_type">
                    <el-radio :label="Number(0)">1天</el-radio>
                    <el-radio :label="Number(1)">7天</el-radio>
                    <el-radio :label="Number(2)">30天</el-radio>
                    <el-radio :label="Number(3)">永久有效</el-radio>
                  </el-radio-group>
                  <br>
                  <br>
                  <span>分享码：</span>
                <el-radio-group v-model="codeType" label="分享码生成">
                    <el-radio label="auto">系统生成</el-radio>
                    <el-radio label="custom">自定义</el-radio>
                </el-radio-group>
                <el-input v-if="codeType === 'custom'" v-model="code" placeholder="请输入四位数字或字母"
                    maxlength="4" show-word-limit>
                </el-input>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="closeShowShare">取消</el-button>
                <el-button type="primary" @click="Share">确认</el-button>
            </div>
        </el-dialog>
        <el-dialog :title="ShareTarname" :visible.sync="ShareCallbackDialog" width="40%" @close="ShareCallbackDialog = false">
            <span>分享链接：</span><p>{{ShareInfo.shareLink}}</p>
            <br>
            <span>分享码：</span><p>{{ShareInfo.code}}</p>
            <br>
            <span>分享期限：</span><p>{{ShareInfo.validType | validTypeFormat}}</p>
            <br>
            <span>分享时间：</span><p>{{ShareInfo.createTime}}</p>
            <br>
            <span>失效时间：</span><p>{{ShareInfo.expireTime}}</p>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="closeShareCallback">关闭</el-button>
            </div>
        </el-dialog>
        <el-dialog title="修改文件路径" :visible.sync="changeParentDialog" width="50%">
            <div class="path">
                <p>
                    <span @click="handlePathClickFolder(0)"><strong>全部文件</strong></span>
                    <span v-for="(path, index) in pathsTemp" :key="index" @click="handlePathClickFolder(path.id)">
                        ><strong>{{ path.name }}</strong>
                    </span>
                </p>
            </div>
            <div class="all-folder">
                <div class="icon-name" v-for="folder in folders" :key="folder.id">
                    <Icon :fileType="folder.type"/>
                            <a class="file_a" href="javascript:void(0);" @click="handleLinkClickFolder(folder)">
                                {{ folder.name }}
                            </a>   
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="closeChangeFolder">取消</el-button>
                <el-button type="primary" @click="ChangeFolder">确认</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import axios from 'axios';
import Bus from '/vue-simple-uploader/js/bus'
import FilePreview from '../components/FilePreview.vue';
import { SelectBus } from './../js/SelectBus.js'
import { SendMsg } from './../js/SendMsg.js'
const config = {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
}
export default {
    name: 'all',
    components: {
        FilePreview,
    },
    data() {
        return {
            files: [],
            multipleSelection: [],
            fileNameNums: "文件名",
            newFolderName: '',
            isCreatingFolder: false,
            isRename: false,
            nowFolder: 0,
            nowRow: null,
            temp: 0,
            paths: [],
            selectedFile: null,
            fileVisible: false,
            showShareDialog: false,
            valid_type: 1,
            codeType: 'auto',
            code: '',
            ShareTar: null,
            ShareTarname: '分享文件：',
            ShareCallbackDialog: false,
            ShareInfo: {
                shareLink: '',
                code: '',
                validType: 0,
                createTime: '',
                expireTime: ''
            },
            changeParentDialog: false,
            nowFolderTemp: 0, //用于修改文件路径的暂时性的
            folders: [], //用于修改文件路径的文件夹列表
            pathsTemp: [], //用于修改文件路径的临时路径
            idsTemp: [], //用于修改文件路径的临时id
        }
    },
    methods: {
        upload() {
            Bus.$emit('openUploader', {
                params: {
                    pid: this.nowFolder,
                }
            });

        },
        newFolder() {
            this.isCreatingFolder = true;
            const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            this.files.unshift({
                name: '',
                updateTime: currentTime,
                size: ''
            });
        },
        enter(row, column) {
            this.nowRow = row;
        },
        leave(row, column) {
            this.nowRow = null;
        },
        handleLinkClick(row) {
            if (row.type === 0) {
                this.nowFolder = row.fileId;
                this.getPath(row.fileId);
                this.getFilesByIdAndCategory();
            } else {
                //TODO
                //处理文件在线预览
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
            }
        },
        CloseFile() {
            this.selectedFile = null;
            this.fileVisible = false;
        },
        handlePathClick(id) {
            this.nowFolder = id;
            this.getPath(id);
            this.getFilesByIdAndCategory();
        },
        getPath(id) {
            axios.get('http://localhost:8080/getPath?id=' + id, config)
                .then(res => {
                    if (res.data.code === 200) {
                        this.paths = res.data.data;

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
        beforeShare() {
            this.ShareTar = this.nowRow;
            this.ShareTarname = this.ShareTarname + this.nowRow.name;
            this.showShareDialog = true;
        },
        Share() {
            const formData = new FormData();
            formData.append('fileId', this.ShareTar.fileId);
            formData.append('userId', this.ShareTar.userId);
            formData.append('code', this.code);
            formData.append('valid_type', this.valid_type);
            axios.post('http://localhost:8080/shareFile', formData, config)
            .then(res => {
                if (res.data.code === 200) {
                    this.ShareInfo = res.data.data;
                    console.log(this.ShareInfo);
                    this.$message.success('分享成功');
                    this.closeShowShare();
                    this.ShareCallbackDialog = true;
                } else {
                    this.$message.error('分享失败');
                }
                
            }).catch(err => {
                this.$message.error('网络问题，请联系管理员');
            });


        },
        closeShowShare() {
            this.showShareDialog = false;
            this.valid_type = 1;
            this.code = '';
            this.codeType = 'auto';
        },
        closeShareCallback() {
            this.ShareCallbackDialog = false;
            this.ShareInfo = {
                shareLink: '',
                code: '',
                validType: 0,
                createTime: '',
                expireTime: ''
            };
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
            let ids = [];
            if (this.multipleSelection.length === 0) {
                ids.push(this.temp);

            } else {
                const selected = this.$refs.multipleTable.selection;
                ids = selected.map(item => item.fileId);
            }
            const formData = new FormData();
            formData.append('ids', ids);
            axios.post('http://localhost:8080/deleteFile', formData, config)
                .then(res => {
                    if (res.data.code === 200) {
                        this.$message.success('删除成功');
                        this.multipleSelection = [];
                        this.getFilesByIdAndCategory();
                        SendMsg.$emit('getUserInfo');
                    } else {

                        this.$message.error('删除失败');
                    }
                })
                .catch(err => {
                    this.$message.error('网络问题，请联系管理员');
                })
        },
        Download(row) {
            if (row.type === 0) {
                this.$message.warning('暂不支持下载文件夹');
                return;
            }
            let configs = {
                responseType: 'blob',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Access-Control-Expose-Headers': 'Content-Disposition'
                }
            };
            let id = row.fileId;
            axios.get("http://localhost:8080/download?id=" + id, configs)
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
            const fileId = this.nowFolder;
            const formData = new FormData();
            formData.append('fileId', fileId);
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
        confirmFolderCreation() {
            if (this.newFolderName.trim() !== '') {
                this.files[0].name = this.newFolderName;
                const folderForm = new FormData();
                folderForm.append('pid', this.nowFolder)
                folderForm.append('folderName', this.newFolderName)
                axios.post('http://localhost:8080/addFolder', folderForm, config)
                    .then(res => {
                        const data = res.data.data;
                        if (res.data.code === 200) {
                            this.$message.success('添加成功');
                            this.isCreatingFolder = false; // 关闭创建状态
                            this.newFolderName = ''; // 清空临时变量
                            this.getFilesByIdAndCategory();
                        } else {
                            this.$message.error('添加失败');
                        }
                    }).catch(err => {
                        this.$message.error('网络问题，请联系管理员');
                    });

            }
        },
        cancelFolderCreation() {
            this.files.shift(); // 移除添加的行
            this.isCreatingFolder = false; // 关闭创建状态
        },
        handleSelectionChange(val) {
            this.multipleSelection = val;
            this.fileNameNums = val.length > 0 ? `已选中${val.length}个文件/文件夹` : "文件名";
            const selected = this.$refs.multipleTable.selection;
            SelectBus.$emit('fileSelection', selected);
        },


        //下面方法都是用来处理文件修改路径的
        beforeChangeParent() {
            let ids = [];
            if (this.multipleSelection.length === 0) {
                ids.push(this.nowRow.fileId);

            } else {
                const selected = this.$refs.multipleTable.selection;
                ids = selected.map(item => item.fileId);
            }
            this.idsTemp = ids;
            this.nowFolderTemp = 0;
            this.getAllFoldersById();
            this.changeParentDialog = true;
            
        },
        getAllFoldersById() {
            const fileId = this.nowFolderTemp;
            axios.get('http://localhost:8080/getAllFoldersById?fileId='+fileId, config)
            .then(res => {
                if (res.data.code === 200) {
                    this.folders = res.data.data;
                    console.log(this.folders);
                } else {
                    this.$message.error('获取文件夹列表失败');
                }
            }).catch(err => {
                this.$message.error('网络问题，请联系管理员');
            });
        },
        handlePathClickFolder(id) {
            this.nowFolderTemp = id;
            this.getPathFolder(id);
            this.getAllFoldersById();
        },
        getPathFolder(id) {
            console.log(typeof(id));
            axios.get('http://localhost:8080/getPath?id=' + id, config)
                .then(res => {
                    if (res.data.code === 200) {
                        this.pathsTemp = res.data.data;
                        console.log(res.data.data);
                        console.log(this.pathsTemp);

                    } else {
                        console.log(res);
                        this.$message.error('获取路径列表失败');
                    }
                }).catch(err => {
                    console.log(err);
                    this.$message.error('网络问题，请联系管理员');
                });
        },
        handleLinkClickFolder(folder) {
            if (folder.type === 0) {
                this.nowFolderTemp = folder.id;
                this.getPathFolder(folder.id);
                this.getAllFoldersById();
            } else {
                return;
            }
        },
        closeChangeFolder() {
            this.changeParentDialog = false;
            this.nowFolderTemp = 0;
            this.folders = [];
            this.pathsTemp = [];
            this.idsTemp = [];
        },
        ChangeFolder() {
            let ids = this.idsTemp;
            let tarId = this.nowFolderTemp;
            const formData = new FormData();
            formData.append('ids', ids);
            formData.append('tarId', tarId);
            axios.post('http://localhost:8080/changeFolder', formData, config)
            .then(res => {
                if (res.data.code === 200) {
                    this.$message.success('修改成功');
                    this.closeChangeFolder();
                    this.getFilesByIdAndCategory();
                } else {
                    this.$message.error(res.data.msg);
                }
            }).catch(err => {
                this.$message.error('网络问题，请联系管理员');
            });
        },
        // 文件名搜索
        fetchSearchResults(query) {
            console.log("触发搜索, 搜索内容为：" + query);
            axios.get('http://localhost:8080/search?query=' + query, config)
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
        }

    },
    mounted() {
        this.getFilesByIdAndCategory();
        Bus.$on('fileSuccess', () => {
            setTimeout(() => {
                this.getFilesByIdAndCategory();
                SendMsg.$emit('getUserInfo');
            }, 200);
        });
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
        },
        validTypeFormat(type) {
            var typeName = "";
            switch (type) {
                case 0:
                    typeName = "1天";
                case 1:
                    typeName = "7天";
                case 2:
                    typeName = "30天";
                case 3:
                    typeName = "永久";
            }
            return typeName;
        }
    },
    created() {
        SendMsg.$on('search', (query) => {
            if(query === '' || query === undefined || query === null) {
                this.getFilesByIdAndCategory();
            } else {
                this.fetchSearchResults(query);
            }
        });
    },
    destroyed() {
        SendMsg.$off('search');
    }
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
.all-folder {
    margin-top: 20px;
    height: 400px;
    overflow-y: scroll;
}
</style>