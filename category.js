//定义categroy的 schema
let mongoose = require('./db.js')

let Schema = mongoose.Schema

let CategorySchema = new Schema({
    categoryName: {
        type: String
    }
}) 

module.exports = mongoose.model('Category', CategorySchema)