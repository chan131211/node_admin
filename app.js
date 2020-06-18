/* 自定义 */

// 加载项目核心入口文件
let express = require('express')

//加载body-parser模块
let bodyParser = require('body-parser')

//加载数据库
let User = require('./user.js')
let Category = require('./category.js')
let Product = require('./product.js')

//加载fs
let fs = require('fs')

//加载multiparty
let multiparty = require('multiparty')
const { url } = require('inspector')

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
  let {name, parentId} = req.body
  //添加数据库
  Category.create({name, parentId}, (err, res2) => {
    if (!err) {
      res.json({
        status: 0,
        data: res2
      })
    }
  })
})

//处理获取分类列表
app.get('/manage/category/list', (req, res) => {
  //获取传递过来的parentId
  let {parentId} = req.query

  //根据parentId查询分类
  Category.find({parentId}, (err, res2) => {
    if (!err) {
      res.json({
        status: 0,
        data: res2
      })
    }
  })
})

//处理更新分类名称
app.post('/manage/category/update', (req, res) => {
  //接收传递过来的数据
  let { _id, name } = req.body
  Category.updateOne({ _id }, { $set: { name } }, err => {
    if (err) {
      res.json({
        status: 1,
        mes: '更新分类失败'
      })
    } else {
      res.json({
        status: 0,
        mes: '更新分类成功'
      })

    }
  })
})

//处理获取所有分类列表
app.get('/manage/category/all', (req, res) => {
  Category.find({}, (err, result) => {
    if (!err) {
      res.json({
        status: 0,
        data: result
      })
    }
  })
})

//删除分类
app.get('/manage/category/del', (req, res) => {
  //接收get提交的_id
  let { _id } = req.query
  Category.deleteOne({ _id }, (err, result) => {
    if (!err) {   
        res.json({
          status: 0,
          mes: '删除分类成功'
        })
    }
  })
})

//处理文件上传
app.post('/manage/img/upload', (req, res) => {
  let form = new multiparty.Form()

  //设置上传文件路径
  form.uploadDir = __dirname + '/public/images/'

  //解析上传文件
  form.parse(req, (err, fields, files) => {

    //获取文件name path
    let name = files.image[0].originalFilename
    let url = files.image[0].path
    url = "http://localhost:" + PROT + "/public/images/" + url.substr(url.lastIndexOf('\\') + 1) 

    if (!err) {
      let status = 0
      let data = { name, url }
      res.json({ status, data })
    } else {
      let status = 1
      let data = { mes: '上传文件失败'}
      res.json({ status, data})
    }
  })
})

//删除文件
app.post('/manage/img/del', (req, res) => {
  const name = req.body.name
  const url = 'public/images/'

  fs.readdirSync(url).map(file => {
    if (file === name) {
      fs.unlink(url+name, err => {
        if(err) {
          res.json({ status: 1 })
        }else {
          res.json({ statue: 0 })
        }
      })
    }
  })
})

//处理添加商品
app.post('/manage/product/add', (req, res) => {
  //接收提交的数据
  let { product } = req.body
  product.price = product.price * 1
  product.status = 1
  Product.create(product, (err, result) => {
    if (!err) {
      res.json({
        status: 0,
        data: result
      })
    }else {
      res.json({
        status: 1,
        result
      })
    }
  })
})

//处理获取商品
app.get('/manage/product/list', (req, res) => {
  Product.find({}, (err, result) => {
    if (!err) {
      res.json({
        status: 0,
        data: result
      })
    }
  })
})

//根据name查找商品
app.post('/manage/product/check', (req, res) => {
  //获取提交的name
  const name = req.body.name
  Product.findOne({ name }, (err, result) => {
    if (!err) {
      res.json({
        status: 0,
        result: result === null ? false : true
      })
    } else {
      res.json({
        status: 1
      })
    } 
  })
})

//修改商品状态
app.post('/manage/product/status', (req, res) => {
  let {_id, status} = req.body
  status = parseInt(status)
  if (status === 0) {
    status = 1
  }else {
    status = 0
  }
  Product.updateOne({ _id }, {$set: { status }}, (err, result) => {
    if (!err) {
        res.json({
          status: 0
        })
    }
  })
}) 

//删除商品
app.get('/manage/product/del', (req, res) => {
  //获取提交的_id
  const _id = req.query._id
  Product.deleteOne({ _id }, (err, result) => {
    if (!err) {
        res.json({
          status: 0,
          mes: '删除商品成功'
        })
      } else { 
        res.json({
          status: 1,
          mes: '删除商品失败'
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
