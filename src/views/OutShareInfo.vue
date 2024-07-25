<template v-if="iscreated">
  <div class="main-layout">
    <div class="header">
        <div class="out-share-title" @click="goTo">
            <span><i class="el-icon-upload"></i></span>
            <span>私人云盘</span>
        </div>
        <div class="user-info">
            <div v-if="auth === '0'">
                <span @click="goTo">未登录!!!，前去登录</span>
            </div>
            <div v-else class="user-section">
                <span class="el-dropdown-link">
                    欢迎，{{ userInfo.username }}
                </span>
                <el-dropdown>
                    <!-- <avatar :avatarSrc="userInfo.avatarSrc" width="60" size="large"></avatar> -->
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item>修改头像</el-dropdown-item>
                        <el-dropdown-item>修改密码</el-dropdown-item>
                        <el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
    </div>
    <div class="container">
        <div class="all-info">
            <div class="all-info-top">
                <div class="all-info-top-left">
                    <Icon :fileType="fileInfo.type" :cover="fileInfo.cover" />
                    <p>{{ fileInfo.name }}</p>
                </div>
                <div class="all-info-top-right">
                    <el-button v-if="auth === '1'" @click="beforeChangeParent"><i class="el-icon-copy-document"></i>保存到自己网盘</el-button>
                    <el-button v-if="auth === '2'" @click="canelShare"><i class="el-icon-circle-close"></i>取消分享</el-button>
                    <el-button><i class="el-icon-download"></i>下载</el-button>
                </div>
            </div>
            <div class="all-info-mid">
                <p><i style="margin-right: 5px;" class="el-icon-pie-chart"></i><span>{{share.createTime}}</span><span style="margin-left:20px">过期时间：{{share.expireTime}}</span></p>
                <div>
                    <!-- <avatar :avatarSrc="people.avatar" width="20" size="large"></avatar> -->
                    <span>{{people.username}}</span>
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
                    @selection-change="handleSelectionChange" style="width: 100%;max-height:60vh;overflow-y:scroll"
                    :highlight-selection-row="true" @cell-mouse-enter="enter" @cell-mouse-leave="leave">
                    <el-table-column type="selection" width="55"></el-table-column>
                    <el-table-column prop="name" :label="fileNameNums">
                        <template slot-scope="scope">
                            <div class="icon-name">
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
            </div>
        </div>
    </div>
    <el-dialog title="保存到自己网盘" :visible.sync="changeParentDialog" width="50%">
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
import Avatar from '../components/Avatar.vue';
const config = {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
}
export default {
    components: {
        Avatar,
    },
    data() {
        return {
            iscreated: false,
            share: null,
            auth: 0,
            userInfo: {
                avatarSrc: '',
                username: '',
            },
            fileInfo: null,
            people: null,
            files: [],
            multipleSelection: [],
            fileNameNums: "文件名",
            nowFolder: 0,
            nowRow: null,
            temp: 0,
            paths: [],
            changeParentDialog: false,
            nowFolderTemp: 0, //用于修改文件路径的暂时性的
            folders: [], //用于修改文件路径的文件夹列表
            pathsTemp: [], //用于修改文件路径的临时路径
            //暂时不采用了，因为目前的是只保存那一个文件/文件夹的
            //idsTemp: [], //用于修改文件路径的临时id
        }
    },
    methods: {
        goTo() {
            if(this.auth === '0') {
                this.$router.push('/login');
            } else {
                this.$router.push('/');
            }
        },
        async getUserInfo() {
            axios.get('http://localhost:8080/userInfo', config)
                .then(res => {
                    const data = res.data.data;
                    const msg = res.data.msg;
                    const code = res.data.code;
                    if (code === 200) {
                        this.userInfo.username = data.username;
                        this.userInfo.avatarSrc = 'http://localhost:8080/avatars/' + data.avatar;
                    } else {
                        this.$message.error(msg);
                    }
                }).catch(err => {
                    this.$message.error('网络异常，暂时无法获取用户信息，请联系管理员');
                });
        },
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('tokenExpiration');
            localStorage.setItem('auth',0);
            this.$router.push('/login');
        },
        getFiles() {
            const userId = this.share.userId;
            const fileId = this.nowFolder;
            axios.get(`http://localhost:8080/share/getFiles?userId=${userId}&fileId=${fileId}`, config)
            .then(res => {
                if (res.data.code === 200) {
                    this.files = res.data.data.map(item => ({
                        fileId: item.id,
                        name: item.name,
                        size: item.size,
                        cover: item.cover,
                        createTime: item.createTime,
                        updateTime: item.lastUpdateTime,
                        path: item.path,
                        type: item.type,
                    }));
                    console.log(this.files);
                }
            }).catch(err => {

            });
        },
        getFilesByIdAndCategory() {
            const userId = this.share.userId;
            const fileId = this.nowFolder;
            const formData = new FormData();
            formData.append('fileId', fileId);
            formData.append('userId', userId);
            axios.post('http://localhost:8080/share/getFileByIdAndCategory', formData)
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
                this.$message.warning('文件外部分享文件预览更新中，敬请期待');
            }
        },
        handlePathClick(id) {
            if(id === 0) {
                this.nowFolder = this.share.fileId;
                this.getPath(id);
                this.getFiles();
                return ;
            }
            this.nowFolder = id;
            this.getPath(id);
            this.getFilesByIdAndCategory();
        },
        getPath(id) {
            if(id === 0) {
                this.paths = [];
                return ;
            }
            axios.get('http://localhost:8080/share/getPath?id=' + id)
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
            axios.get("http://localhost:8080/share/download?id=" + id)
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
        handleSelectionChange(val) {
            this.multipleSelection = val;
            this.fileNameNums = val.length > 0 ? `已选中${val.length}个文件/文件夹` : "文件名";
        },
        canelShare() {
            const shareId = this.nowRow.shareId;
            axios.delete(`http://localhost:8080/cancelShare?shareId=${this.share.id}`, config)
            .then(res => {
                if (res.data.code === 200) {
                    this.$message.success("取消分享成功");
                    this.getFiles();
                } else {
                    this.$message.error("取消分享失败");
                }
            })
            .catch(err => {
                this.$message.error("网络异常，请联系管理员");
            });
        },


        //下面方法都是用来处理文件修改路径的
        beforeChangeParent() {
            // let ids = [];
            // ids = this.files.map(item => item.fileId);
            // this.idsTemp = ids;
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
            // this.idsTemp = [];
        },
        ChangeFolder() {
            // let ids = this.idsTemp;
            let id = this.share.fileId;
            let tarId = this.nowFolderTemp;
            const formData = new FormData();
            formData.append('id', id);
            formData.append('tarId', tarId);
            axios.post('http://localhost:8080/share/changeFolder', formData, config)
            .then(res => {
                if (res.data.code === 200) {
                    this.$message.success('修改成功');
                    this.closeChangeFolder();
                    this.getFiles();
                    this.paths = []
                } else {
                    this.$message.error(res.data.msg);
                }
            }).catch(err => {
                this.$message.error('网络问题，请联系管理员');
            });
        }
    },
    created() {
        const savedShare = localStorage.getItem('share');
        const savedAuth = localStorage.getItem('auth');
        const savedFileInfo = localStorage.getItem('fileInfo');
        const savedPeople = localStorage.getItem('sharePeo');
        if (savedShare && savedAuth && savedFileInfo && savedPeople) {
            this.share = JSON.parse(savedShare);
            this.fileInfo = JSON.parse(savedFileInfo);
            this.auth = savedAuth;
            this.people = JSON.parse(savedPeople);
            this.people.avatar = "http://localhost:8080/avatars/" + this.people.avatar;
        }
        if(this.auth !== '0') {
            this.getUserInfo();
        }
        this.nowFolder = this.share.fileId;
        this.getFiles();
        this.iscreated = true;
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
.main-layout {
    display: flex;
    flex-direction: column;
}
.header {
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    color: #1296db;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    .out-share-title {
        color: #06a7ff;
        cursor: pointer;
        font-size: 28px; 
        margin-bottom: 20px; 
    }
    .user-info {
        .user-section {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
    }
}
.container {
    height: calc(100vh - 70px);
    display: flex;
    background-color: #CCCED2;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    .all-info {
        width: 70%;
        height: 90%;
        border-radius: 15px;
        padding: 10px;
        background-color: white;
        display: flex;
        flex-direction: column;
        .all-info-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            .all-info-top-left {
                display: flex;
                align-items: center;
                gap: 5px;

            }
        }
        .all-info-mid {
            display: flex;
            justify-content: start;
            flex-direction: column;
            color: #7f8081;
            div {
                display: flex;
                gap: 5px;
                align-items: center;
            }
        }
    }
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
.all-folder {
    margin-top: 20px;
    height: 400px;
    overflow-y: scroll;
}
</style>