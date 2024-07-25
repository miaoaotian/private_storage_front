<template>
    <transition name="slide-fade">
      <el-card v-if="visible" class="chat-ai-component animate__animated animate__fadeInDown">
        <div slot="header" class="clearfix">
          <span>喵傲天(调用gpt-4o-mini版)</span>
          <el-button style="float: right; padding: 3px 0" type="text" @click="closeChat">关闭</el-button>
        </div>
        <div class="chat-container">
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="{'user-message': message.role === 'user', 'ai-message': message.role === 'assistant'}"
            class="message-wrapper"
          >
            <el-card
              :class="{'message-card': true, 'user-message-card': message.role === 'user', 'ai-message-card': message.role === 'assistant'}"
            >
              <pre v-html="formatMessage(message.content)" class="pre-sty"></pre>
            </el-card>
          </div>
        </div>        
        <div class="foot">
            <el-input type="text" v-model="userInput" placeholder="输入信息..."></el-input>
            <el-button type="primary" @click="sendMessage">发送</el-button>
        </div>
      </el-card>
    </transition>
  </template>
  
  <script>
  import axios from 'axios';
    const config = {
      headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
  }
  export default {
    props: ['visible'],
    data() {
      return {
        userInput: '',
        messages: [],
        error: null
      };
    },
    methods: {
      async sendMessage() {
        if (!this.userInput.trim()) return;
        this.messages.push({ role: 'user', content: this.userInput });
          axios.post('http://localhost:8080/api/ask', {input: this.userInput }, config)
          .then(result => {
            if(result.data.code === 200) {
              this.messages.push({ role: 'assistant', content: result.data.data });
            } else {
              this.messages.push({ role: 'assistant', content: result.data.data });
            }
          }) .catch(err => {
            this.messages.push({ role: 'assistant', content: '网络异常请联系管理员' });
          })
          this.userInput = '';
      },
      closeChat() {
        this.$emit('update:showChat', false);
      },
      formatMessage(content) {
        return content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
    }
  };
  </script>
  
  <style scoped>
  @import 'animate.css';
  
  .chat-ai-component {
    max-width: 600px;
    height: 80vh;
    margin: 0 auto;
    text-align: center;
    position: absolute;
    top: 10%;
    left: 0;
    right: 0;
    background: white;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    overflow-y: hidden;
    z-index: 1000;
  }
  
  .chat-container {
    max-height: 60vh;
    overflow-y: auto;
    margin-bottom: 20px;
  }
  .chat-container ::-webkit-scrollbar {
    display: none; /* Chrome Safari */
  }
  
  .message-wrapper {
    display: flex;
    justify-content: flex-start;
  }
  .message-wrapper pre {
    background: none;
    border: none;
    white-space: pre-wrap; /* 允许自动换行 */
    word-wrap: break-word; /* 长单词或URL也能换行 */
    margin: 0; /* 调整间距以适应设计 */
    padding: 0; /* 根据需要调整 */
  }
  
  
  .user-message {
    justify-content: flex-end;
  }
  
  .ai-message {
    justify-content: flex-start;
  }
  
  .message-card {
    display: inline-block;
    padding: 10px;
    border-radius: 10px;
    margin-bottom: 10px;
    max-width: 70%;
    word-wrap: break-word;
  }
  pre {
    text-align: left;
  }
  .user-message-card {
    background-color: #dcf8c6;
  }
  
  .ai-message-card {
    background-color: #eceff1;
  }
  
  
  
  
  .slide-fade-enter-active {
    animation: fadeInDown 1s;
  }
  .slide-fade-leave-active {
    animation: fadeOutUp 0.5s;
  }
  @keyframes fadeOutUp {
    from {
      transform: translateY(0);
    }
    to {
      transform: translateY(-100%);
    }
  }
  .foot {
    width: 80%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 20px;
    position: absolute;
    bottom: 50px;
  }
  </style>
  