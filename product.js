// 定义product 的schema

//引入 mongoose
let mongoose = require('./db')

let Schema = mongoose.Schema

let ProductSchema = new Schema({
    name: {
        type: String
    },
    desc: {
        type: String
    },
    price: {
        type: String
    },
    categoryId: {
        type: String
    },
    images: {
        type: Array
    },
    detail: {
        type: String
    },
    status: {
        type: Number
    }
})

//导出
module.exports = mongoose.model('Product', ProductSchema)