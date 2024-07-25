<template>
    <div style="height:100%">
        <div class="recycle-empty" v-if="files.length === 0">
            <img src="../assets/recycle_empty.png" alt="" width="170px">
            <h4>您的回收站为空奥~</h4>
            <p>回收站内容可保存十天，若想延长时间，请联系管理员</p>
        </div>
        <div v-else>
            <div class="btn-area">
                <el-button type="primary" @click="refresh"><i class="el-icon-refresh-right"></i>还原</el-button>
                <el-button type="danger" @click="Delete"><i class="el-icon-delete"></i>彻底删除</el-button>
            </div>
            <el-table :data="files" style="width: 100%;max-height:72vh;overflow-y:scroll" ref="multipleTable"
                @selection-change="handleSelectionChange" :highlight-selection-row="true" @cell-mouse-enter="enter"
                @cell-mouse-leave="leave">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="name" :label="fileNameNums">
                    <template slot-scope="scope">
                        <div class="icon-name">
                            <Icon :fileType="scope.row.type" :cover="scope.row.cover" />
                            <p>{{ scope.row.name }}</p>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column prop="updateTime" label="进入回收站时间">
                    <template slot-scope="scope">
                        <div v-if="nowRow && nowRow.fileId === scope.row.fileId" class="icons">
                            <span @click="refresh"><i class="el-icon-refresh-right"></i>复原</span>
                            <span @click="Delete"><i class="el-icon-delete"></i>彻底删除</span>
                        </div>
                        <div v-else>{{ scope.row.updateTime }}</div>
                    </template>
                </el-table-column>
                <el-table-column label="有效时间">
                    <span>10天</span>
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
    data() {
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
            axios.get('http://localhost:8080/getFileInRecycle', config)
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
        refresh() {
            let ids = [];
            if (this.multipleSelection.length === 0) {
                ids.push(this.nowRow.fileId);

            } else {
                const selected = this.$refs.multipleTable.selection;
                ids = selected.map(item => item.fileId);
            }
            const formData = new FormData();
            formData.append('ids', ids);
            axios.post('http://localhost:8080/refresh', formData, config)
                .then(res => {
                    if (res.data.code === 200) {
                        this.$message.success('恢复成功');
                        this.multipleSelection = [];
                        this.getFiles();
                    } else {

                        this.$message.error('恢复失败');
                    }
                })
                .catch(err => {
                    this.$message.error('网络问题，请联系管理员');
                })
        },
        Delete() {
            let ids = [];
            if (this.multipleSelection.length === 0) {
                ids.push(this.nowRow.fileId);

            } else {
                const selected = this.$refs.multipleTable.selection;
                ids = selected.map(item => item.fileId);
            }
            const formData = new FormData();
            formData.append('ids', ids);
            axios.post('http://localhost:8080/deleteFile2', formData, config)
                .then(res => {
                    if (res.data.code === 200) {
                        this.$message.success('删除成功');
                        this.multipleSelection = [];
                        this.getFiles();
                    } else {

                        this.$message.error('删除失败');
                    }
                })
                .catch(err => {
                    this.$message.error('网络问题，请联系管理员');
                })
        },
    },
    mounted() {
        this.getFiles();
    }
}
</script>

<style lang="scss" scoped>
.recycle-empty {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    p {
        color: #06A7FF;
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

.btn-area {
    display: flex;
    justify-content: flex-start;
}
</style>
