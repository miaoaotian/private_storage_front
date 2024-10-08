<template>
    <div class="container" :class="{ 'sign-up-mode': signUpMode }">
        <div class="forms-container">
            <div class="signin-signup">
                <!-- 登录表单 -->
                <form class="sign-in-form" @submit.prevent="login">
                    <h2 class="title">登录</h2>
                    <div class="input-field">
                        <i class="el-icon-user"></i>
                        <input type="text" placeholder="邮箱" v-model="loginForm.email" required>
                    </div>
                    <div class="input-field">
                        <i class="el-icon-lock"></i>
                        <input type="password" placeholder="密码" v-model="loginForm.password" required>
                    </div>
                    <div style="display:flex;align-items: center;justify-content: space-between;max-width: 380px;">
                        <div class="input-field" style="flex: 1 0 auto;max-width: calc(100% - 65px);">
                            <i class="el-icon-picture"></i>
                            <input type="text" placeholder="请输入验证码" v-model="loginForm.verification" required>
                        </div>
                        <img height="55" width="110" :src="verificationImage" alt="图形验证码" @click="getVerificationCode" class="captcha-image">
                    </div>
                    
                    <button type="submit" class="btn solid" :disabled="!checked">登录</button>
                    <label class="checkbox-container">
                        <input type="checkbox" v-model="checked">
                        我已阅读并同意
                        <span class="checkmark"></span>
                        <a @click="dialogVisible1 = true">服务条款</a>
                    </label>
                </form>

                <!-- 注册表单 -->
                <form class="sign-up-form" @submit.prevent="register">
                    <h2 class="title">注册</h2>
                    <div class="input-field">
                        <i class="el-icon-info"></i>
                        <input type="text" placeholder="用户名" v-model="registerForm.username" required>
                    </div>
                    <div class="input-field">
                        <i class="el-icon-message"></i>
                        <input type="email" placeholder="邮箱" v-model="registerForm.email" required>
                    </div>
                    <div style="display:flex;align-items: center;justify-content: space-between;max-width: 380px;">
                        <div class="input-field" style="flex: 1 0 auto;max-width: calc(100% - 65px);">
                            <i class="el-icon-s-promotion"></i>
                            <input type="text" placeholder="邮箱验证码" v-model="registerForm.emailVerification" required>
                        </div>
                        <button class="with-input" :disabled="disableSendButton" @click="sendVerificationCode">
                            {{ disableSendButton ? `${countdown} 秒后重试` : '发送验证码' }}
                          </button>
                    </div>
                    
                    <div class="input-field">
                        <i class="el-icon-lock"></i>
                        <input type="password" placeholder="密码" v-model="registerForm.password" required>
                    </div>
                    <div class="input-field">
                        <i class="el-icon-lock"></i>
                        <input type="password" placeholder="确认密码" v-model="confirmPassword" @input="validateConfirmPassword" required>
                        <p v-if="confirmPassword && !validateConfirmPassword()" style="color: red;">密码不一致</p>
                    </div>
                    <button type="submit" class="btn" :disabled="isSubmitting">注册</button>
                </form>
            </div>
        </div>
        <div class="panels-container">
            <div class="panel left-panel">
                <div class="content">
                    <h3>加入我们</h3>
                    <p>加入我们，成为本站的一份子。</p>
                    <button class="btn transparent" @click="toggleSignUp(true)">去注册</button>
                </div>
                <img src="../assets/log.svg" class="image" alt="" />
            </div>
            <div class="panel right-panel">
                <div class="content">
                    <h3>已有帐号？</h3>
                    <p>立即登录已有帐号，享受独家权益。</p>
                    <button class="btn transparent" @click="toggleSignUp(false)">去登录</button>
                </div>
                <img src="../assets/register.svg" class="image" alt="" />
            </div>
        </div>
        <!-- 服务条款对话框 -->
        <el-dialog v-cloak title="服务条款" :visible.sync="dialogVisible1" width="560px" :close-on-click-modal="false">
            <div class="dialog-content">
                <p>1. 尊敬的用户，欢迎使用我们的产品，本产品由开发是为了满足用户对快速网盘的需求。</p>
                <p>2. 其他服务条款内容...</p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="dialogVisible1 = false">关闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'login',
    data() {
        return {
            signUpMode: false,
            loginForm: {
                email: '',
                password: '',
                verification: '',
                captchaUUID: '',
            },
            checked: false,
            registerForm: {
                username: '',
                email: '',
                emailVerification: '',
                password: ''
            },
            confirmPassword: '',
            isSubmitting: false,
            disableSendButton: false,
            timer: null,
            countdown: 60,
            dialogVisible1: false,
            verificationImage: ''
        };
    },
    methods: {
        login() {
            axios.post('http://localhost:8080/login', this.loginForm)
                .then((response) => {
                    if (response.data.code == 200) {
                        localStorage.setItem('token', response.data.data.token);
                        localStorage.setItem('tokenExpiration', response.data.data.tokenExpiration);
                        this.$message.success('登录成功');
                        this.$router.push('/');
                    } else {
                        this.$message.error(response.data.msg);
                    }
                })
                .catch(error => {
                    this.$message.error('登录失败，请重试');
                });
        },
        getVerificationCode() {
            axios.get('http://localhost:8080/captchaImage')
                .then(response => {
                    const data = response.data.data;
                    this.verificationImage = 'data:image/jpeg;base64,' + data.imageBase64;
                    this.loginForm.captchaUUID = data.uuid;
                })
                .catch(error => {
                    this.$message.error('获取验证码错误');
                });
        },
        sendVerificationCode() {
            if (!this.disableSendButton) {
                this.disableSendButton = true;
                axios.get(`http://localhost:8080/sendEmail?email=${this.registerForm.email}`)
                    .then(response => {
                        this.$message.success('验证码已发送，请检查您的邮箱');
                        this.timer = setInterval(() => {
                            if (this.countdown > 0) {
                                this.countdown -= 1;
                            } else {
                                this.disableSendButton = false;
                                clearInterval(this.timer);
                            }
                        }, 1000);
                    })
                    .catch(error => {
                        this.$message.error('验证码发送失败，请重试');
                        this.disableSendButton = false;
                    });
            }
        },
        validateConfirmPassword() {
            return this.registerForm.password === this.confirmPassword;
        },
        register() {
            if (!this.validateConfirmPassword()) {
                this.$message.error('两次输入的密码不一致');
                return;
            }
            this.isSubmitting = true;
            axios.post('http://localhost:8080/register', this.registerForm)
                .then(response => {
                    if (response.data.code === 200) {
                        this.$message.success('注册成功');
                        this.$router.push('/login');
                    } else {
                        this.$message.error(response.data.message);
                    }
                })
                .catch(error => {
                    this.$message.error('注册失败，请重试');
                })
                .finally(() => {
                    this.isSubmitting = false;
                });
        },
        toggleSignUp(mode) {
            this.signUpMode = mode;
        }
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    },
    mounted() {
        this.getVerificationCode();
    }
};
</script>
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700;800&display=swap");

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body,
input {
    font-family: "Poppins", sans-serif;
}

.container {
    position: relative;
    width: 100%;
    background-color: #fff;
    min-height: 100vh;
    overflow: hidden;
}

.forms-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
}

.signin-signup {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    left: 75%;
    width: 50%;
    transition: 1s 0.7s ease-in-out;
    display: grid;
    grid-template-columns: 1fr;
    z-index: 5;
}

form {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0rem 5rem;
    transition: all 0.2s 0.7s;
    overflow: hidden;
    grid-column: 1 / 2;
    grid-row: 1 / 2;
}

form.sign-up-form {
    opacity: 0;
    z-index: 1;
}

form.sign-in-form {
    z-index: 2;
}

.title {
    font-size: 2.2rem;
    color: #444;
    margin-bottom: 10px;
}

.input-field {
    max-width: 380px;
    width: 100%;
    background-color: #f0f0f0;
    margin: 10px 0;
    height: 55px;
    border-radius: 55px;
    display: grid;
    grid-template-columns: 15% 85%;
    padding: 0 0.4rem;
    position: relative;
}

.input-field i {
    text-align: center;
    line-height: 55px;
    color: #acacac;
    transition: 0.5s;
    font-size: 1.1rem;
}

.input-field input {
    background: none;
    outline: none;
    border: none;
    line-height: 1;
    font-weight: 600;
    font-size: 1.1rem;
    color: #333;
}

.input-field input::placeholder {
    color: #aaa;
    font-weight: 500;
}

.social-text {
    padding: 0.7rem 0;
    font-size: 1rem;
}

.social-media {
    display: flex;
    justify-content: center;
}

.social-icon {
    height: 46px;
    width: 46px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 0.45rem;
    color: #333;
    border-radius: 50%;
    border: 1px solid #333;
    text-decoration: none;
    font-size: 1.1rem;
    transition: 0.3s;
}

.social-icon:hover {
    color: #4481eb;
    border-color: #4481eb;
}

.btn {
    width: 150px;
    background-color: #5995fd;
    border: none;
    outline: none;
    height: 49px;
    border-radius: 49px;
    color: #fff;
    text-transform: uppercase;
    font-weight: 600;
    margin: 10px 0;
    cursor: pointer;
    transition: 0.5s;
}

.btn:hover {
    background-color: #4d84e2;
}
.with-input {
    background-color: #dcdfe1;
    color: white;
    border: none;
    width: 117px;
    height: 60px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.with-input:hover {
    background-color: #d5d8d8;
}

.with-input:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
.panels-container {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
}

.container:before {
    content: "";
    position: absolute;
    height: 2000px;
    width: 2000px;
    top: -10%;
    right: 48%;
    transform: translateY(-50%);
    background-image: linear-gradient(-45deg, #4481eb 0%, #04befe 100%);
    transition: 1.8s ease-in-out;
    border-radius: 50%;
    z-index: 6;
}

.image {
    width: 100%;
    transition: transform 1.1s ease-in-out;
    transition-delay: 0.4s;
}

.panel {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-around;
    text-align: center;
    z-index: 6;
}

.left-panel {
    pointer-events: all;
    padding: 3rem 17% 2rem 12%;
}

.right-panel {
    pointer-events: none;
    padding: 3rem 12% 2rem 17%;
}

.panel .content {
    color: #fff;
    transition: transform 0.9s ease-in-out;
    transition-delay: 0.6s;
}

.panel h3 {
    font-weight: 600;
    line-height: 1;
    font-size: 1.5rem;
}

.panel p {
    font-size: 0.95rem;
    padding: 0.7rem 0;
}

.btn.transparent {
    margin: 0;
    background: none;
    border: 2px solid #fff;
    width: 130px;
    height: 41px;
    font-weight: 600;
    font-size: 0.8rem;
}

.right-panel .image,
.right-panel .content {
    transform: translateX(800px);
}

/* ANIMATION */

.container.sign-up-mode:before {
    transform: translate(100%, -50%);
    right: 52%;
}

.container.sign-up-mode .left-panel .image,
.container.sign-up-mode .left-panel .content {
    transform: translateX(-800px);
}

.container.sign-up-mode .signin-signup {
    left: 25%;
}

.container.sign-up-mode form.sign-up-form {
    opacity: 1;
    z-index: 2;
}

.container.sign-up-mode form.sign-in-form {
    opacity: 0;
    z-index: 1;
}

.container.sign-up-mode .right-panel .image,
.container.sign-up-mode .right-panel .content {
    transform: translateX(0%);
}

.container.sign-up-mode .left-panel {
    pointer-events: none;
}

.container.sign-up-mode .right-panel {
    pointer-events: all;
}

@media (max-width: 870px) {
    .container {
        min-height: 800px;
        height: 100vh;
    }

    .signin-signup {
        width: 100%;
        top: 95%;
        transform: translate(-50%, -100%);
        transition: 1s 0.8s ease-in-out;
    }

    .signin-signup,
    .container.sign-up-mode .signin-signup {
        left: 50%;
    }

    .panels-container {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 2fr 1fr;
    }

    .panel {
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        padding: 2.5rem 8%;
        grid-column: 1 / 2;
    }

    .right-panel {
        grid-row: 3 / 4;
    }

    .left-panel {
        grid-row: 1 / 2;
    }

    .image {
        width: 200px;
        transition: transform 0.9s ease-in-out;
        transition-delay: 0.6s;
    }

    .panel .content {
        padding-right: 15%;
        transition: transform 0.9s ease-in-out;
        transition-delay: 0.8s;
    }

    .panel h3 {
        font-size: 1.2rem;
    }

    .panel p {
        font-size: 0.7rem;
        padding: 0.5rem 0;
    }

    .btn.transparent {
        width: 110px;
        height: 35px;
        font-size: 0.7rem;
    }

    .container:before {
        width: 1500px;
        height: 1500px;
        transform: translateX(-50%);
        left: 30%;
        bottom: 68%;
        right: initial;
        top: initial;
        transition: 2s ease-in-out;
    }

    .container.sign-up-mode:before {
        transform: translate(-50%, 100%);
        bottom: 32%;
        right: initial;
    }

    .container.sign-up-mode .left-panel .image,
    .container.sign-up-mode .left-panel .content {
        transform: translateY(-300px);
    }

    .container.sign-up-mode .right-panel .image,
    .container.sign-up-mode .right-panel .content {
        transform: translateY(0px);
    }

    .right-panel .image,
    .right-panel .content {
        transform: translateY(300px);
    }

    .container.sign-up-mode .signin-signup {
        top: 5%;
        transform: translate(-50%, 0);
    }
}

@media (max-width: 570px) {
    form {
        padding: 0 1.5rem;
    }

    .image {
        display: none;
    }

    .panel .content {
        padding: 0.5rem 1rem;
    }

    .container {
        padding: 1.5rem;
    }

    .container:before {
        bottom: 72%;
        left: 50%;
    }

    .container.sign-up-mode:before {
        bottom: 28%;
        left: 50%;
    }
    .captcha-image {
        width: 55px;
        flex: none;
    }
}
</style>