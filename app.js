/* 自定义 */

// 加载项目核心入口文件
let express = require('express')

//加载body-parser模块
let bodyParser = require('body-parser')

//加载数据库
let User = require('./user.js')
let Category = require('./category.js')

//创建项目
let app = express()

//定义public地址
app.use('/public', express.static(__dirname + '/public'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

//搭建后台路由
app.post('/login', (req, res) => {
  //接收表单提交的数据
  let username = req.body.username || ''
  let password = req.body.password || ''
  //拼接数据
  let loginData = {username, password}

  // console.log(loginData)

  //从数据库中查找数据
  User.findOne(loginData, {username: 1, password: 1}, (err, result) => {
    if (err) {
      console.log(err)
    } else {
      if (result) {
        res.json({ status: 0, result})
        return
      } else {  
        res.json({ status: 1, msg: '用户名或密码错误'})
      }
    }
  })
})

//处理添加分类的数据
app.post('/manage/category/add', (req, res) => {
  //接收数据
  let {categoryName} = req.body
  console.log(categoryName)
  //添加数据库
  Category.create({categoryName}, (err, doc) => {
    if (!err) {
      res.json({
        status: 0,
        doc
      })
    }
  })
})

//设置监听
const PROT = 8080
app.listen(PROT)

console.log(`后台正在监听${PROT}端口...`)

//导出
module.exports = app
