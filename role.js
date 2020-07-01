// 定义role 的schema

//引入db
let mongoose = require('./db.js')


let Schema = mongoose.Schema

let RoleSchema = new Schema({
    menus: { type: Array }, // 权限
    name: { type: String },// 角色名称
    create_time: { 
        type: String,
        default: new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000)
    },
    auth_time: {
        type: String,
        default: ''
    },
    auth_name: {
        type: String,
        default: ''
    }
})

module.exports = mongoose.model('Role', RoleSchema)