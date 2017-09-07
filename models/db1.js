/**
 * Created by Danny on 2015/9/25 9:31.
 */

var MongoClient = require('mongodb').MongoClient;
var settings = require("../settings.js");


function _connectDB(callback) {
    var url = settings.dburl;   //从settings文件中，都数据库地址
    //连接数据库
    MongoClient.connect(url, function (err, db) {
        if (err) {
            callback(err, null);
            return;
        }
        callback(err, db);
    });
}

init();

function init(){

    _connectDB(function(err, db){
        if (err) {
            console.log(err);
            return;
        }
        db.collection('users').createIndex(
            { "username": 1},
            null,
            function(err, results) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log("索引建立成功");
            }
        );
    });
}

//插入数据
exports.insertOne = function (collectionName, json, callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).insertOne(json, function (err, result) {
            callback(err, result);
            db.close();
        })
    })
};

//查找数据，找到所有数据。args是个对象{"pageamount":10,"page":10}
exports.find = function (collectionName, json, C, D) {
    var result = [];    //结果数组
    if (arguments.length == 3) {

        var callback = C;
        var skipnumber = 0;

        var limit = 0;
    } else if (arguments.length == 4) {
        var callback = D;
        var args = C;

        var skipnumber = args.pageamount * args.page || 0;

        var limit = args.pageamount || 0;

        var sort = args.sort || {};
    } else {
        throw new Error("find函数的参数个数，必须是3个，或者4个。");
        return;
    }


    _connectDB(function (err, db) {
        var cursor = db.collection(collectionName).find(json).skip(skipnumber).limit(limit).sort(sort);
        cursor.each(function (err, doc) {
            if (err) {
                callback(err, null);
                db.close(); //关闭数据库
                return;
            }
            if (doc != null) {
                result.push(doc);
            } else {

                callback(null, result);
                db.close();
            }
        });
    });
}

//删除
exports.deleteMany = function (collectionName, json, callback) {
    _connectDB(function (err, db) {

        db.collection(collectionName).deleteMany(
            json,
            function (err, results) {
                callback(err, results);
                db.close();
            }
        );
    });
}

//修改
exports.updateMany = function (collectionName, json1, json2, callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).updateMany(
            json1,
            json2,
            function (err, results) {
                callback(err, results);
                db.close();
            });
    })
}

//得到总数量
exports.getAllCount = function (collectionName,callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).count({}).then(function(count) {
            callback(count);
            db.close();
        });
    })
}