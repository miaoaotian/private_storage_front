<template>
  <div class="out-share">
    <div style="width:30vw;height:50vh;">
        <div v-if="share && new Date(share.expireTime) > new Date()">
            <div class="out-share-title" @click="goTo">
                <span><i class="el-icon-upload"></i></span>
                <span>私人云盘</span>
            </div>
            <div class="out-share-content">
                <div class="user_info">
                    <!-- <avatar :avatarSrc="avatarSrc" width="100" size="large"></avatar> -->
                    <div>
                        <div style="display:inline-block"><h4>用户名：</h4><span>{{userInfo.username}}</span></div>
                        <div style="display:inline-block"><h4>个性签名：</h4><span>该用户暂未发布</span></div>
                    </div>
                    <div style="margin-top:20px"><el-button><i class="el-icon-plus"></i>加为好友</el-button></div>
                </div>
                <input type="text" v-model="code" class="big-input" maxlength="4" placeholder="输入四位提取码，大小写敏感哦~">
                <el-button type="primary" width="150px" @click="submit">提取文件</el-button>
            </div>
        </div>
        <div v-else>
            资源已过期，下次早点来
        </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Avatar from '../components/Avatar.vue';

export default {
    components: {
        Avatar,
    },
    data() {
        return {
            share: null,
            userInfo: null,
            fileInfo: null,
            avatarSrc: '',
            code: '',
            auth: 0 // 0为未登录，1为其他人，2为本人
        }
    },
    methods: {
        goTo() {
            if(this.auth === 0) {
                this.$router.push('/login');
            } else {
                this.$router.push('/');
            }
        },
        async getInfoByLink() {
            try {
                const response = await axios.get(`http://localhost:8080/share/${this.$route.params.link}`);
                if (response.data.code === 200) {
                    this.share = response.data.data;
                    console.log(this.share);
                } else {
                    this.$message.error("获取信息失败");
                }
            } catch (err) {
                this.$message.error("网络异常，请联系管理员");
                console.log(err);
            }
        },
        async getUserInfoById() {
            if (!this.share || !this.share.userId) return;
            try {
                const response = await axios.get(`http://localhost:8080/share/getUserInfo?userId=${this.share.userId}`);
                if (response.data.code === 200) {
                    this.userInfo = response.data.data;
                    this.avatarSrc = "http://localhost:8080/avatars/"+this.userInfo.avatar;
                    const token = localStorage.getItem('token');
                    if(!token) {
                        this.auth = 0;
                    } else {
                        const config = {
                            headers: {
                                'Authorization': 'Bearer ' + localStorage.getItem('token')
                            }
                        }
                        axios.get('http://localhost:8080/share/getauth', config)
                        .then(res => {
                            if (res.data.code === 200) {
                                const auth = res.data.data;
                                if(auth === this.share.userId) {
                                    this.auth = 2;
                                } else {
                                    this.auth = 1;
                                }
                            }
                        })
                    }
                } else {
                    this.$message.error("获取用户信息失败");
                }
            } catch (err) {
                this.$message.error("网络异常，请联系管理员");
                console.log(err);
            }
        },
        async getFileInfo() {
            if (!this.share || !this.share.fileId) return;
            try {
                const response = await axios.get(`http://localhost:8080/share/getFileInfo?fileId=${this.share.fileId}`);
                if (response.data.code === 200) {
                    this.fileInfo = response.data.data;
                } else {
                    this.$message.error("获取文件信息失败");
                    console.log(response);
                }
            } catch (err) {
                this.$message.error("网络异常，请联系管理员");
                console.log(err);
            }
        },
        submit() {
            if (!this.code) {
                this.$message.error("提取码不能为空");
                return;
            }
            if (this.code !== this.share.code) {
                this.$message.error("提取码错误");
                return;
            }
            localStorage.setItem('auth', this.auth);
            localStorage.setItem('share', JSON.stringify(this.share) );
            localStorage.setItem('fileInfo', JSON.stringify(this.fileInfo) );
            localStorage.setItem('sharePeo', JSON.stringify(this.userInfo) );
            this.$router.push('/shareInfo');
        }
    },
    watch: {
        share(newShare, oldShare) {
            if (newShare) {
                this.getUserInfoById();
                this.getFileInfo();
            }
        }
    },
    created() {
        this.getInfoByLink(); // 在组件创建时调用getInfoByLink
    }
}
</script>


<style lang="scss" scoped>
.out-share {
    color: #fff; 
    background: fixed url('../assets/outshare.png') no-repeat center/cover; 
    display: flex;
    height: 100vh;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .out-share-title {
        color: #06a7ff;
        cursor: pointer;
        font-size: 28px; 
        margin-bottom: 20px; 
    }

    .out-share-content {
        display: flex;
        flex-direction: column;
        align-items: center; 
        gap: 20px;

        .big-input, .el-button {
            width: 90%;  
            max-width: 500px;  
            height: 50px;
            border-radius: 40px;  
            font-size: 16px;  
        }

        .big-input {
            border: 1px solid #06a7ff;
            padding: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
        }

        .user_info {
            display: flex;
            flex-direction: row;
            align-items: center;  
            gap: 10px; 

            h4, span {
                margin: 0 5px; 
            }
        }
    }
}
</style>
