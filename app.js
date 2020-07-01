/* 自定义 */

// 加载项目核心入口文件
let express = require('express')

//加载body-parser模块
let bodyParser = require('body-parser')

//加载数据库
let User = require('./user.js')
let Category = require('./category.js')
let Product = require('./product.js')
let Role = require('./role.js')

//加载fs
let fs = require('fs')

//加载multiparty
let multiparty = require('multiparty')

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
  User.findOne(loginData, {username: 1, password: 1, roleId: 1}, (err, result) => {
    if (err) {
      res.json({status: 2})
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
  //获取前台提交的数据
  let pageNum = parseInt(req.query.pageNum) || 1
  let pageSize = parseInt(req.query.pageSize)

  //跳过数据的条数
  let skip = (pageNum - 1) * pageSize
  Product.count({}, (err, count) => {
    if (!err) {
      Product.find({})
      .skip(skip)
      .limit(pageSize)
      .sort({ _id: -1})
      .exec((err, result) => {
        try {
          if (!err && result) {
            return res.json({
              status: 0,
              data: {
                pageNum,
                total: count,
                pages: Math.ceil(count / pageSize),
                pageSize,
                list: result
              }
            })
          }
        } catch(e) {
          return res.json({
            status: 1,
            mes: '获取数据失败'
          })
        }
      })
    }
  })
})

//根据name查找商品是否同名
app.post('/manage/product/check', (req, res) => {
  //获取提交的name
  const name = req.body.name
  Product.findOne({ name }, (err, result) => {
    if (!err) {
      let status = result != null ? 1 : 0
      res.json({ status })
    } else {
      res.json({ 
        status: 2,
        mes: '查询失败'
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

//更新商品信息
app.post('/manage/product/update', (req, res) => {
  const { product, _id } = req.body
  Product.updateOne({ _id }, {$set: product}, (err, result) => {
    if (!err) {
      res.json({
        status: 0
      })
    } else {
      res.json({
        status: 1
      })
    }
  })
})

//删除商品
app.post('/manage/product/del', (req, res) => {
  //获取提交的_id
  const { _id, images } = req.body
  const url = 'public/images/'
  Product.deleteOne({ _id }, (err, result) => {
    if (!err) {
        images.map(image => {
          fs.readdirSync(url).map(file => {
            if(file === image) {
              fs.unlink(url+image, err => {})
            }
          })
        })
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

// 根据_id获取更新的商品信息
app.get('/manage/product/listone', (req, res) => {
  const { _id } = req.query
  Product.find({ _id}, (err, result) => {
    if (!err) {
      let imagesArr = []
      let path = '/public/images/'
      let images = result[0].images
      images.forEach(image => {
        let url = "http://localhost:" + PROT + path + image
        imagesArr.push(url)
      })
      result[0].images = imagesArr
      res.json({
        status: 0,
        data: result
      })
    }
  })
})

//搜索框查询商品
app.post('/manage/product/search', (req, res) => {
  const { search, value } = req.body
  let condition = ''
  if( search === '0') {
    condition = { name: {$regex: value}}
  } else {
    condition = { desc: {$regex: value}}
  }
  Product.find(condition, (err, result) => {
    if (!err) {
      res.json({
        status: 0,
        data: result
      })
    }
  })
})

//添加角色
app.post('/manage/role/add', (req, res) => {
  //获取数据
  const { name } = req.body
  Role.create({ name})
  .then(role => {
    res.json({
      status: 0,
      data: role
    })
  }).catch(error => {
    res.json({
      status: 1,
      mes: '添加角色失败'
    })
  })
})

//获取所有角色
app.get('/manage/role/list', (req, res) => {
  Role.find({})
  .then(role => {
    res.json({
      status: 0,
      data: role
    })
  }).catch(error => {
    res.json({
      status: 1,
      mes: '获取角色失败'
    })
  })
})

//更新角色权限
app.post('/manage/role/update', (req, res) => {
  const { _id, auth_name, menus } = req.body.role
  let auth_time = new Date(new Date().getTime() + + new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000)
  Role.updateOne({ _id }, {$set: { menus, auth_name, auth_time}})
  .then( result => {
    res.json({
      status: 0,
      data: result
    })
  }).catch( error =>{
    res.json({
      status: 1,
      mes: '修改角色权限失败'
    })
  })
  
})

//根据_id查找角色权限
app.get('/manage/role/check', (req, res) => {
  const { _id } = req.query
  Role.findOne({ _id }, { menus: 1 }, (err, result) => {
    if (!err) {
      res.json({
        status: 0,
        data: result
      })
    }
  })
})

//添加用户
app.post('/manage/user/add', (req, res) => {
  //获取表单提交的数据
  let { username, password, roleId, create_name } = req.body.user

  User.create({ username, password, roleId, create_name }, (err, result) => {
    if (!err) {
      res.json({
        status: 0,
        mes: '添加用户成功',
        data: result
      })
    } else {
      res.json({
        status: 1,
        mes: '添加用户失败'
      })
    }
  })
})

//获取所有用户
app.post('/manage/user/list', (req, res) => {
  User.find({}, (err, result) => {
    if (!err) {
      res.json({
        status: 0,
        data: result
      })
    }
  })
})

//更新用户
app.post('/manage/user/update', (req, res) => {
  const {_id, password, roleId, update_name} = req.body.user
  console.log(_id)
  let update_time = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000)
  User.updateOne({ _id }, {$set: { password, roleId, update_name, update_time}})
  .then(result => { 
    res.json({
      status: 0,
      mes: '更新用户成功'
    })
  }).catch( error => {
    res.json({
      status: 1,
      mes: '更新用户失败'
    })
  })
})

//查找同名用户
app.post('/manage/user/check', (req, res) => {
  const username = req.body.username
  User.findOne({ username })
  .then( result => {
    let arr = Object.keys(result)
    if (arr.length > 0) {
      res.json({ status: 0 })
    } else {
      res.json({ status: 1 })
    }
  }).catch(error => {
    res.json({ status: 2 })
  })
})

//删除用户
app.get('/manage/user/delete', (req, res) => {
  const { _id } = req.query
  User.deleteOne({ _id })
  .then(result => {
    res.json({
      status: 0,
      mes: '删除用户成功'
    })
  }).catch( error => {
    res.json({
      status: 1,
      mes: '删除用户失败'
    })
  })
})

//设置监听
const PROT = 8080
app.listen(PROT)

console.log(`后台正在监听${PROT}端口...`)

//导出
module.exports = app
