<template>
  <div>
    <h4>全部分享文件</h4>
    <div>
        <el-table
            :data="files" style="width: 100%;max-height:72vh;overflow-y:scroll" ref="multipleTable"
            @selection-change="handleSelectionChange" :highlight-selection-row="true"
            @cell-mouse-enter="enter" @cell-mouse-leave="leave">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="name" :label="fileNameNums">
                <template slot-scope="scope">
                    <div class="icon-name">
                        <Icon :fileType="scope.row.type" :cover="scope.row.cover" />
                        <p>{{ scope.row.name }}</p>
                    </div>
                </template>
            </el-table-column>
            <el-table-column prop="createTime" label="分享时间">
                <template slot-scope="scope">
                    <div v-if="nowRow && nowRow.fileId === scope.row.fileId" class="icons">
                        <span @click="copyLink"><i class="el-icon-link"></i>复制链接</span>
                        <span @click="canelShare"><i class="el-icon-circle-close"></i>取消分享</span>
                    </div>
                    <div v-else>{{ scope.row.createTime }}</div>
                </template>
            </el-table-column>
            <el-table-column label="失效时间">
                <template slot-scope="scope">
                    {{ scope.row.expireTime }}
                </template>
            </el-table-column>
            <el-table-column label="类型">
                <template slot-scope="scope">
                    <span>{{ scope.row.validType | validTypeFormat }}</span>
                </template>
            </el-table-column>

        </el-table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { SelectBus } from './../js/SelectBus.js'
const config = {
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
}
export default {
    data () {
        return {
            files: [],
            multipleSelection: [],
            nowRow: null,
            fileNameNums: "文件名",
            temp: 0,
        }
    },
    methods: {
        async getFiles() {
            axios.get('http://localhost:8080/getAllShares', config)
            .then(res => {
                if (res.data.code === 200) {
                    this.files = res.data.data.map(file => ({
                        userId: file.userId,
                        fileId: file.fileId,
                        shareId: file.shareId,
                        name: file.name,
                        createTime: file.createTime,
                        expireTime: file.expireTime,
                        validType: file.validType,
                        type: file.type,
                        code: file.code,
                        cover: file.cover,
                        shareLink: file.shareLink,

                    }));
                }
            }).catch(err => {
                this.$messager.error("网络异常，请联系管理员");
            });
        },
        handleSelectionChange(val) {
            this.multipleSelection = val;
            this.fileNameNums = val.length > 0 ? `已选中${val.length}个文件/文件夹` : "文件名";
            const selected = this.$refs.multipleTable.selection;
            SelectBus.$emit('fileSelection', selected);
        },
        enter(row, column) {
            this.nowRow = row;
        },
        leave(row, column) {
            this.nowRow = null;
        },
        copyLink() {
            const link = this.nowRow.shareLink;
            const code = this.nowRow.code;
            const textToCopy = `链接:${link} 提取码:${code} 复制这段内容后在浏览器中打开`;
            this.$copyText(textToCopy)
            .then(() => {
                this.$message.success("复制成功");
            }).catch(err => {
                this.$message.error("复制失败");
            })
        },
        canelShare() {
            const shareId = this.nowRow.shareId;
            axios.delete(`http://localhost:8080/cancelShare?shareId=${shareId}`, config)
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
    },
    mounted() {
        this.getFiles();
    },
    filters: {
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
}
</script>

<style lang="scss" scoped>
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

.btn-area {
    display: flex;
    justify-content: flex-start;
}
</style>