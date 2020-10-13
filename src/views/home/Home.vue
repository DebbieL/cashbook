<template>
  <div id="home">
    <el-container>
      <el-header>
        <i class="el-icon-notebook-1"></i>
        <span>记账本</span>
      </el-header>
      <el-main>
        <div class="summary">
          <div class="date">
            <el-form :inline="true" :model="searchFormData" ref="search-form">
              <el-form-item label="年">
                <el-select v-model="searchFormData.year" placeholder="请选择年" @change="searchFormData.month = ''">
                  <el-option
                    v-for="item in years"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="月">
                <el-select v-model="searchFormData.month" placeholder="请选择月">
                  <el-option
                    v-for="item in months"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="info" @click="onQuery">查询</el-button>
                <el-button type="info" @click="resetForm">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <div class="account">
            <div class="out">
              <span>总支出：</span>
              <span>{{ totalOut }}</span>
              <span>￥</span>
            </div>
            <div class="in">
              <span>总收入：</span>
              <span>{{ totalIn }}</span>
              <span>￥</span>
            </div>
          </div>
        </div>
        <div class="detail-form">
          <el-button class="create-record" icon="el-icon-edit" @click="dialogVisibility = true">记一笔</el-button>
          <el-table :data="tableData" height="900" border style="width: 100%">
            <el-table-column prop="time" label="账单时间" width="200"></el-table-column>
            <el-table-column prop="type" label="账单类型" width="200"></el-table-column>
            <el-table-column prop="category" label="账单分类" width="200"></el-table-column>
            <el-table-column prop="amount" label="账单金额"></el-table-column>
          </el-table>

          <el-dialog title="记一笔" :visible.sync="dialogVisibility" width="20%" center>
            <el-form label-position="left" label-width="80px" :model="formData" :rules="rules" ref="note-form">
              <el-form-item label="账单类型" prop="type">
                <el-radio-group v-model="formData.type" @change="formData.category = ''; formData.amount = ''">
                  <el-radio label="1">收入</el-radio>
                  <el-radio label="0">支出</el-radio>
                </el-radio-group>               
              </el-form-item>
              <el-form-item label="账单分类" prop="category">
                <el-select v-model="formData.category" placeholder="请选择账单类型" @change="formData.amount = ''">
                  <el-option
                    v-for="item in typeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="账单金额" prop="amount">
                <el-input v-model.number="formData.amount">
                   <template slot="append">元</template>
                </el-input>
              </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="dialogVisibility = false">取 消</el-button>
              <el-button type="primary" @click="createAccount">确 定</el-button>
            </span>
          </el-dialog>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { Bill, Categories, Years, Months } from './data';
export default {
  name: 'Home',
  components: {
  },
  data() {
    return {
      bill: {},
      date: '',
      dialogVisibility: false,
      searchFormData: {
        year: '',
        month: ''
      },
      years: Years,
      months: Months,
      formData: {
        type: '1',
        category: '',
        amount: ''
      },
      rules: {
        type: [
          { required: true, message: '请选择账单类型', trigger: 'change' }
        ],
        category: [
          { required: true, message: '请选择账单分类', trigger: 'change' }
        ],
        amount: [
          { required: true, message: '请输入账单金额', trigger: 'blur' },
          { type: 'number', message: '账单金额必须为数字值', trigger: 'blur'}
        ]
      },
      allTypeOptions: Categories,
      typeOptions: [],
      tableData: []
    }
  },
  computed: {
    totalOut() {
      let totalOut = 0;
      this.tableData.forEach(item => {
        if(item.type == '支出') {
          totalOut += parseFloat(item.amount.slice(1))
        }
      })
      return totalOut;
    },
    totalIn() {
      let totalIn = 0;
      this.tableData.forEach(item => {
        if(item.type == '收入') {
          totalIn += parseFloat(item.amount.slice(1))
        }
      })
      return totalIn;
    }
  },
  watch: {
    'formData.type': {
      immediate: true,
      deep: true,
      handler(val) {
        if(val == 0) {
          this.typeOptions = Categories.filter(c => c.type == '0');
        } else {
          this.typeOptions = Categories.filter(c => c.type == '1');
        }
      }
    }
  },
  created() {
    if(!window.localStorage.getItem('bill')) {
      window.localStorage.setItem('bill', JSON.stringify(Bill));
    }
    this.bill = JSON.parse(window.localStorage.getItem('bill'));
    this.getTableData(this.bill);
  },
  methods: {
    getTableData(bill) {
      this.tableData = [];
      for(const item of bill) {
        const time = this.getTime(Number(item.time));
        const type = item.type == '1' ? '收入' : '支出';
        const category = this.allTypeOptions.find(element => element.value == item.category).label;
        const amount = item.type == '1' ? '+' + item.amount : '-' + item.amount;
        this.tableData.unshift({
          time,
          type,
          category,
          amount
        })
      }
    },
    getTime(time) {
      let now;
      if(time == undefined) {
        now = new Date();
      } else {
        now = new Date(time);
      }                                                                                               
      let year = now.getFullYear(); 
      let month = now.getMonth();
      let date = now.getDate();
      month = month + 1;
      if (month < 10) month = "0" + month;
      if (date < 10) date = "0" + date;
      let h = now.getHours();
      h = h < 10 ? ('0' + h) : h;
      let minute = now.getMinutes();
      let second = now.getSeconds();
      minute = minute < 10 ? ('0' + minute) : minute;
      second = second < 10 ? ('0' + second) : second;
      return year + "-" + month + "-" + date+ " "+ h + ':' + minute + ':' + second ;
    },
    createAccount() {
      this.$refs['note-form'].validate((valid) => {
        if (valid) {         
          const record = {
            ...this.formData,
            time: Date.now()   
          };
          this.bill.push(record);
          window.localStorage.setItem('bill', JSON.stringify(this.bill));
          this.getTableData(this.bill);
        } else {
          alert('填写错误！');
          return false;
        }
      });
      this.dialogVisibility = false;
    },
    onQuery() {
      const bill = [];
      for(const item of this.bill) {
        let time = new Date(Number(item.time));
        let year = time.getFullYear(); 
        let month = time.getMonth();
        month = month + 1;
        if(year == this.searchFormData.year && month == this.searchFormData.month) {
          bill.push(item);
        }
      }
      this.getTableData(bill);
    },
    resetForm() {
      this.searchFormData.year = '';
      this.searchFormData.month = '';
      this.getTableData(this.bill);
    }
  }
}
</script>

<style> 
  #home {
    height: 100%;
    overflow: hidden;
  }
  .el-container {
    height: 100%;
  }
  .el-header {
    background-color: #000000;
    color: #ffffff;
    line-height: 60px;

    font-size: 30px;
    font-weight: 700;
  }
  
  .el-main {
    background-color: #EBEEF5;
    color: #333;
    height: 100%;
    padding: 0;
    overflow: hidden;
  }

  .el-main .summary {
    width: 100%;
    height: 80px;
    background-color: #909399;
    font-size: 18px;
    color: #ffffff;

    padding: 0 10px;
    display: flex;
    align-items: center;
  }

  .el-main .summary .date {
    flex: 2;
  }

  .el-main .summary .account {
    flex: 1;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  .el-main .detail-form {
    margin-top: 10px;
    padding: 20px;
    border: 5px solid #C0C4CC;
  }

  .el-main .detail-form .create-record {
    background-color: #303133;
    color: #ffffff;
    margin-bottom: 10px;
  }
</style>