let mongoose = require("mongoose");

const DB_URL = "mongodb://localhost:27017/cardatabase";

mongoose.connect(DB_URL);

mongoose.connection.on('connected', function() {
    console.log('数据库连接成功');
});

mongoose.connection.on('error', function (err) {
    console.log('数据库连接错误:' + err);
});

mongoose.connection.on('disconnected', function() {
    console.log('数据库连接断开');
});


module.exports = mongoose;
