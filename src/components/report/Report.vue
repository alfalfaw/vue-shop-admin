<template>
  <div class="report">
    <el-card>
      <div ref="chart" class="chart"></div>
    </el-card>
  </div>
</template>

<script>
import echarts from 'echarts'
import _ from 'lodash'
export default {
  name: 'Report',
  data() {
    return {
      // 需要合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  async mounted() {
    const reportChart = echarts.init(this.$refs.chart)

    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message({
        type: 'error',
        message: '获取数据失败'
      })
    }
    const result = _.merge(res.data, this.options)
    reportChart.setOption(result)
  }
}
</script>

<style lang="scss" scoped>
.chart {
  width: 600px;
  height: 400px;
}
</style>
