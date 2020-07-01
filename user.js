//定义user的schema

let mongoose = require('./db.js')

let Schema = mongoose.Schema

let UserSchema = new Schema({

    username: {
        type: String
    },
    password: {
        type: String
    },
    roleId: {
        type: String
    },
    create_time: {
        type: String,
        default: new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60 * 1000 + 8 * 60 * 60 * 1000)
    },
    create_name: {
        type: String,
        default: ''
    },
    update_time: {
        type: String,
        default: ''
    },
    update_name: {
        type: String,
        default: ''
    }
})

module.exports = mongoose.model('User', UserSchema)