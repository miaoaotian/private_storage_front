<template>
    <div class="main-layout">
        <!-- 顶部区域 -->
        <div class="navbar">
            <div class="logo-section">
                <img src="../assets/logo.png" alt="logo" width="110pxs">
            </div>
            <div class="chat-section">
                <img src="./../assets/乖巧的猫.svg" alt="" width="70px">
                <span @click="toggleChat" class="chat-toggle">闲来无事,与AI聊会吧</span>
                <img src="./../assets/戴墨镜的小鸟.svg" alt="" width="70px">
            </div>
            <gpt :visible.sync="showChat" @update:showChat="showChat = $event" />
            <div class="user-section">
                <div style="position: relative; display: inline-block;">
                    <span style="color:black;margin-right:20px;cursor:pointer" @click="toggleUploadArea">
                        <i class="el-icon-sort"></i>
                    </span>
                    <div v-show="isVisible" class="upload-area">
                        <h2 class="upload-title">文件上传</h2>
                    </div>
                </div>
                <span class="el-dropdown-link">
                    欢迎，{{ userInfo.username }}
                </span>
                <el-dropdown>
                    <avatar :avatarSrc="userInfo.avatarSrc" width="60" size="large"></avatar>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item @click.native="isAvatarDialogVisible = true">修改头像</el-dropdown-item>
                        <el-dropdown-item @click.native="isPasswordDialogVisible = true">修改密码</el-dropdown-item>
                        <el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
        <el-dialog title="修改头像" :visible.sync="isAvatarDialogVisible">
            <el-form :model="changeAvatar">
                <el-form-item label="上传图片">
                    <el-upload v-if="!changeAvatar.file" action="#" :show-file-list="false" :auto-upload="false"
                        :before-upload="beforeAvatarUpload" :limit="5" accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG"
                        :on-change="handleFileChange">
                        <el-button size="large" type="primary"><i class="el-icon-upload"></i>点击上传</el-button>
                    </el-upload>
                    <!-- 显示已上传的图片 -->
                    <div v-if="changeAvatar.file" style="margin-top: 10px;">
                        <el-image :src="changeAvatar.file.url" style="height: 150px;width:auto" fit="cover"></el-image>
                        <el-button size="mini" @click="removeFile">移除</el-button>
                    </div>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="isAvatarDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitchangeAvatar">提交</el-button>
            </span>
        </el-dialog>

        <!-- 修改密码的对话框 -->
        <el-dialog title="修改密码" :visible.sync="isPasswordDialogVisible">
            <el-form ref="passwordForm" v-model="changePass">
                <el-form-item label="旧密码">
                    <el-input v-model="changePass.oldpass" autocomplete="new-password"></el-input>
                </el-form-item>
                <el-form-item label="新密码">
                    <el-input v-model="changePass.newpass" autocomplete="new-password"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="isPasswordDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitNewPassword">提交</el-button>
            </span>
        </el-dialog>
        <!-- 主内容区域 -->
        <div class="content">
            <!-- 导航栏区域 -->
            <div class="content-left">
                <!-- 主菜单列表 -->
                <div class="menu-list">
                    <div v-for="item in menus" :key="item.menuCode" @click="jump(item)"
                        :class="['menu-item', item.menuCode === currentMenu.menuCode ? 'active' : '']">
                            <i style="font-size: 28px" :class="[item.icon, item.menuCode === currentMenu.menuCode ? 'active' : '']"></i>
                            <div class="text">{{ item.name }}</div>
                    </div>
                </div>

                <!-- 子菜单列表 -->
                <div class="menu-sub-list">
                    <div v-for="sub in currentMenu.children" :key="sub.path" @click="jump(sub)"
                        :class="['menu-item-sub', currentPath === sub.path ? 'active' : '']">
                        <span v-if="sub.icon"><i :class="[sub.icon]"></i></span>
                        <span class="text">{{ sub.name }}</span>
                    </div>
                    <div class="tips" v-if="currentMenu.tips">{{ currentMenu.tips }}</div>

                    <!-- 空间信息 -->
                    <div class="space-info" v-if="userInfo">
                        <div class="percent">
                            <el-progress
                                :percentage="Math.floor((userInfo.useSpace / userInfo.totalSpace) * 10000) / 100"
                                color="#409eff">
                            </el-progress>
                        </div>
                        <div class="space-use">
                            <div class="use">{{ userInfo.useSpace | sizeFormat }} / {{ userInfo.totalSpace |
                                sizeFormat }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="content-mid">
                <router-view></router-view>
            </div>
            <div class="content-right">
                <el-input v-model="searchText" placeholder="输入搜索内容" class="search-input" suffix-icon="el-icon-search">
                    <i slot="suffix" style="color:#06A7FF;cursor: pointer;" @click="search">搜索</i>
                </el-input>
                <div style="padding-left:20px">
                    <p style="font-size:small"><strong>文件详情</strong></p>
                    <div v-if="selectedFiles.length === 0"
                        style="display:flex;flex-direction: column;justify-content: center;align-items: center;height:55vh">
                        <img style="width:200px;" src="../assets/content_right_empty.png" alt="">
                        <p style="display:block;color:#818999;font-size:12px">选中文件/文件夹，查看详情</p>
                    </div>
                    <div v-else>
                        <div v-if="selectedFiles.length === 1" class="file-info">
                            <div class="file-info-1"><strong>文件详细信息</strong><Icon :fileType="selectedFiles[0].type" :cover="selectedFiles[0].cover"></Icon></div>
                            <div v-if="selectedFiles[0].type === 0" class="file-info-2">
                                <strong>文件名称:</strong><p>{{selectedFiles[0].name}}</p>
                                <strong>文件类型:</strong><p>{{selectedFiles[0].type}}</p>
                                <strong>创建时间:</strong><p>{{selectedFiles[0].createTime}}</p>
                                <strong>修改时间:</strong><p>{{selectedFiles[0].updateTime}}</p>
                            </div>
                            <div v-else class="file-info-2">
                                <strong>文件名称:</strong><p>{{selectedFiles[0].name}}</p>
                                <strong>文件大小:</strong><p>{{selectedFiles[0].size | sizeFormat}}</p>
                                <strong>文件类型:</strong><p>{{selectedFiles[0].type}}</p>
                                <strong>创建时间:</strong><p>{{selectedFiles[0].createTime}}</p>
                                <strong>修改时间:</strong><p>{{selectedFiles[0].updateTime}}</p>
                            </div>
                            
                        </div>
                        <div v-else>
                            <span>共选中{{ selectedFiles.length }}个文件/文件夹</span>
                            <img src="../assets/icon-image/folder.png" alt="" width="200px">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div style="z-index: 100;display:flex;align-items:center;position:fixed;right:90px;bottom:40px">
            <el-badge is-dot class="item">
                <span>有事请及时留言</span>
        </el-badge>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import Avatar from '../components/Avatar.vue';
import { SelectBus } from './../js/SelectBus.js'
import { SendMsg } from './../js/SendMsg.js'
import gpt from './../components/Gpt.vue'
export default {
    name: 'MainLayout',
    components: {
        Avatar,
        gpt
    },
    data() {
        return {
            isVisible: false,
            progresses: {},
            userInfo: {
                username: '',
                avatarSrc: '',
                useSpace: 0,
                totalSpace: 0
            },
            isPasswordDialogVisible: false,
            isAvatarDialogVisible: false,
            changePass: {
                oldpass: '',
                newpass: ''
            },
            imageUrl: '',
            changeAvatar: {
                file: null
            },
            menus: [
                {
                    name: '首页',
                    icon: 'el-icon-s-home',
                    path: '/main/all',
                    menuCode: "main",
                    children: [
                        {
                            name: '全部',
                            path: '/main/all',
                            icon: 'el-icon-s-home',
                            category: 'all'
                        },
                        {
                            name: '文档',
                            path: '/main/doc',
                            icon: 'el-icon-document',
                            category: 'doc'
                        },
                        {
                            name: '图片',
                            path: '/main/img',
                            icon: 'el-icon-picture',
                            category: 'img'
                        },
                        {
                            name: '视频',
                            path: '/main/video',
                            icon: 'el-icon-video-camera',
                            category: 'video'
                        },
                        {
                            name: '音频',
                            path: '/main/audio',
                            icon: 'el-icon-microphone',
                            category: 'audio'
                        },
                        {
                            name: '其他',
                            path: '/main/other',
                            icon: 'el-icon-s-help',
                            category: 'other'
                        }
                    ]
                },
                {
                    name: '分享',
                    icon: 'el-icon-share',
                    path: '/share',
                    menuCode: "share",
                    children: [
                        {
                            name: '我的分享',
                            icon: 'el-icon-share',
                            path: '/share',
                        }
                    ]
                },
                {
                    name: '回收站',
                    icon: 'el-icon-delete',
                    path: '/recycle',
                    menuCode: "recycle",
                    tips: "回收站为你保存10天内删除的文件",
                    children: [
                        {
                            name: '回收站',
                            icon: 'el-icon-delete',
                            path: '/recycle',
                        }
                    ]
                }
            ],
            currentMenu: {},
            currentPath: '',
            searchText: '',
            selectedFiles: [],
            showChat: false
        };
    },
    methods: {
        async getUserInfo() {
            const config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }
            axios.get('http://localhost:8080/userInfo', config)
                .then(res => {
                    const data = res.data.data;
                    const msg = res.data.msg;
                    const code = res.data.code;
                    if (code === 200) {
                        this.userInfo.username = data.username;
                        this.userInfo.avatarSrc = 'http://localhost:8080/avatars/' + data.avatar;
                        this.userInfo.totalSpace = data.totalSpace;
                        this.userInfo.useSpace = data.useSpace;
                    } else {
                        this.$message.error(msg);
                    }
                }).catch(err => {
                    this.$message.error('网络异常，暂时无法获取用户信息，请联系管理员');
                });
        },
        toggleUploadArea() {
            this.isVisible = !this.isVisible;
        },
        beforeAvatarUpload(file) {
            const isJPG = file.type === "image/jpeg" || file.type === "image/png";
            // 文件大小判断
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isJPG) {
                this.$message.error("上传头像图片只能是 JPG/PNG 格式!");
            }
            if (!isLt10M) {
                this.$message.error("上传头像图片大小不能超过 10MB!");
            }
            return isJPG && isLt10M;
        },
        handleFileChange(file, fileList) {
            if (fileList.length > 0) {
                const fileReader = new FileReader();
                fileReader.onload = (e) => {
                    this.changeAvatar.file = {
                        raw: fileList[0].raw, // 原始 File 对象
                        url: e.target.result // 图片的 Base64 URL
                    };
                };
                fileReader.readAsDataURL(fileList[0].raw);
            }
        },
        removeFile() { this.changeAvatar.file = null; },
        submitchangeAvatar() {
            const formData = new FormData();
            formData.append('avatar', this.changeAvatar.file.raw);
            const config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }
            axios.post('http://localhost:8080/changeAvatar', formData, config)
                .then(res => {
                    if (res.data.code === 200) {
                        this.$message.success('头像修改成功');
                        this.isAvatarDialogVisible = false;
                        this.changeAvatar.file = null;
                        this.getUserInfo();
                    } else {
                        this.$message.error(res.data.msg);
                    }
                });
        },
        submitNewPassword() {
            const config = {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                }
            }
            axios.post('http://localhost:8080/changepass', this.changePass, config)
                .then(res => {
                    if (res.data.code === 200) {
                        this.$message.success('密码修改成功');
                    } else {
                        this.$message.error(res.data.msg);
                    }
                });
            this.changePass.oldpass = '';
            this.changePass.newpass = '';
            this.isPasswordDialogVisible = false;
        },
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('tokenExpiration');
            localStorage.setItem('auth',0);
            this.$router.push('/login');
        },
        jump(menuItem) {
            this.$router.push(menuItem.path);
            this.updateMenuState(menuItem.path);
        },
        updateMenuState(path) {
            let found = false;
            for (const menu of this.menus) {
                if (menu.children) {
                    for (const sub of menu.children) {
                        if (sub.path === path) {
                            this.currentMenu = menu; // 设置当前一级菜单
                            this.currentPath = sub.path; // 设置当前路径
                            found = true;
                            break;
                        }
                    }
                }
                if (found) break;
                if (menu.path === path) {
                    this.currentMenu = menu; // 对于只有一级的情况
                    this.currentPath = path;
                    break;
                }
            }
        },
        updateFiles(selected) {
            this.selectedFiles = selected;
            console.log(selected);
        },
        search() {
            console.log(this.searchText);
            SendMsg.$emit('search', this.searchText);
        },
        toggleChat() {
            this.showChat = !this.showChat;
        }
    },
    mounted() {
        this.getUserInfo();
        this.updateMenuState(this.$route.path);

    },
    watch: {
        '$route'(to) {
            this.updateMenuState(to.path);
        }
    },
    filters: {
        sizeFormat(limit) {
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
    created() {
        SelectBus.$on('fileSelection',this.updateFiles);
        SendMsg.$on('getUserInfo',this.getUserInfo);
    },
    beforeDestroy() {
        SelectBus.$off('fileSelection',this.updateFiles);
        SendMsg.$off('getUserInfo',this.getUserInfo);
    }
}
</script>

<style lang="scss" scoped>
.main-layout {
    display: flex;
    flex-direction: column;
}

.navbar {
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    color: #1296db;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.logo-section .logo {
    height: 50px;
}

.user-section {
    display: flex;
    align-items: center;
}

.chat-section {

    display: flex;
    justify-content: center;
    align-items: center;
  }
  @font-face {
        font-family: "阿里妈妈方圆体 VF Regular";src: url("//at.alicdn.com/wf/webfont/uW9i7N1fSNkS/BbXoPDnABegz.woff2") format("woff2"),
        url("//at.alicdn.com/wf/webfont/uW9i7N1fSNkS/PLsz0GOHlAgA.woff") format("woff");
        font-display: swap;
    }  
  .chat-toggle {
    font-family: "阿里妈妈方圆体 VF Regular", Arial, sans-serif;
    font-size: 30px;
    margin: 50px auto; /* 设置元素外边距 */
    font-weight: 500; /* 设置字体粗细 */
    text-align: center; /* 设置文字居中 */
    color: #19bced; /* 设置文字颜色 */
    cursor: pointer;
    animation: colorPulse 2s infinite alternate ease-in-out; /* 应用多个动画 */
  }
  @keyframes colorPulse {
    0%, 100% { color: #19bced; } /* 初始和结束颜色 */
    33% { color: #75c8e9; } /* 中间第一个颜色变化 */
    67% { color: #50c2e8; } /* 中间第二个颜色变化 */
}


.el-dropdown-link {
    display: flex;
    margin-right: 20px;
    align-items: center;
    cursor: pointer;
}

/*上传任务栏区域*/
.upload-area {
    position: absolute;
    width: 500px;
    height: 350px;
    left: 0;
    transform: translateX(-70%);
    background: #fff;
    padding: 10px;
    color: black;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease-in-out;
    transform-origin: top center;
    z-index: 10;

    .upload-title {
        color: #19bced;
        padding-bottom: 10px;
        border-bottom: black 1px solid;
    }
}

.upload-area-enter-active,
.upload-area-leave-active {
    transition: opacity 0.5s, transform 0.5s;
}

.upload-area-enter,
.upload-area-leave-to {
    opacity: 0;
    transform: scaleY(0.95);
}

/*下部内容*/
.content {
    display: flex;
}

.content-left {
    border-right: 1px solid #f1f2f4;
    display: flex;

    .menu-list {
        height: calc(100vh - 70px);
        width: 65px;
        box-shadow: 0 3px 10px 0 rgb(0 0 0 / 6%);
        border-right: 1px solid #f1f2f4;
        color: #666666;
        .menu-item {
            text-align: center;
            font-size: 14px;
            font-weight: bold;
            padding: 20px 0px;
            cursor: pointer;

            &:hover {
                background: #f3f3f3;
            }

            .iconfont {
                font-weight: normal;
                font-size: 28px;
            }
        }

        .active {
            background: #eef9fe;
            color: #06a7ff;

            .text {
                color: #06a7ff;
            }
        }
    }

    .menu-sub-list {
        width: 160px;
        padding: 20px 10px 0px;
        position: relative;

        .menu-item-sub {
            text-align: center;
            line-height: 40px;
            border-radius: 5px;
            cursor: pointer;

            &:hover {
                background: #f3f3f3;
            }

            .iconfont {
                font-size: 14px;
                margin-right: 20px;
            }

            .text {
                font-size: 13px;
            }
        }

        .active {
            background: #eef9fe;
            color: #05a1f5;

            .text {
                color: #05a1f5;
            }
        }

        .tips {
            margin-top: 10px;
            color: #888888;
            font-size: 13px;
        }

        .space-info {
            position: absolute;
            bottom: 10px;
            width: 100%;
            padding: 0px 5px;

            .percent {
                padding-right: 10px;
            }

            .space-use {
                margin-top: 5px;
                color: #7e7e7e;
                display: flex;
                justify-content: space-around;

                .use {
                    flex: 1;
                }
            }
        }
    }
}

.content-mid {
    padding: 20px;
    border-right: 1px solid #f1f2f4;
    flex: 4;
}

.content-right {
    padding: 20px;
    flex: 1;
    border-right: 1px solid #f1f2f4;

    ::v-deep .el-input__inner {
        background-color: #F1F3F8;
        border-radius: 20px;
    }

}
.file-info {
    display: flex;
    flex-direction: column;
    .file-info-1 {
        color: #05a1f5;
        display: flex;
        align-items: center;
    }
    .file-info-2 {
        p {
            color: #05a1f5;
        }
        
    }
}
</style>