/**
 * Created by asus on 2017/2/22.
 */
var MongoClient=require("mongodb").MongoClient;
var setting=require("../setting.js");

function _connectDB(callback){
    var url=setting.dburl;
    MongoClient.connect(url,function(err,db){
        callback(err,db);

    });
}
exports.insertOne=function(collectionName,json,callback){
    _connectDB(function(err,db){
        if(err){
            callback(err,null);
            return;
        }
        db.collection(collectionName).insertOne(json,function(err,result){
            if(err){
                callback(err,null);
                return
            }
            callback(null,result);
            db.close();
        })

    });
}
exports.deleteMany=function(collectionName,json,callback) {
    _connectDB(function (err, db) {
        if (err) {
            callback(err, null);
        }
        db.collection(collectionName).deleteMany(json, function (err, results) {
            if (err) {
                callback(err, null);
                return;
            }
            callback(null, results);
            db.close();
        });
    });
}
exports.updateMany=function(collectionName,json1,json2,callback){
        _connectDB(function(err,db){
            if(err){
                callback(err,null);
            }
            db.collection(collectionName).updateMany(json1,json2,function(err,results){
                if(err)
                {
                    callback(err,null);
                }
                callback(null,results);
                db.close();
            });
        });
    }

exports.find=function(collectionName,json,C,D){
    var result=[];

    if(arguments.length==3){
        var callback=C;
        var skipnumber = 0;
        var limit=0;
        var sort = {};
    }
    else if(arguments.length==4){
        var callback = D;
        var args = C;
        //应该省略的条数
        var page=parseInt(args.page);
        var skipnumber = args.pageamount * page || 0;
        //数目限制
        var limit1 = args.pageamount || 0;
        var limit=parseInt(limit1);
        //排序方式
        var sort = args.sort || {};
    }
    else{
        throw new Error("find函数要接受3个或者4个参数");
        return;
    }
    _connectDB(function(err,db){
        if(err){
            callback(err,null);
            return;
        }
        var cursor=db.collection(collectionName).find(json).skip(skipnumber).limit(limit).sort(sort);
        cursor.each(function(err,doc){
            if(err){
                callback(err,null);
                return;
            }
            if(doc!=null)
            {
                result.push(doc);
            }
            else{
                callback(null,result);
            }
        });
    });
}
exports.getAllCount = function (collectionName,json,callback) {
    _connectDB(function (err, db) {
        db.collection(collectionName).count(json).then(function(count) {
            callback(count);
            db.close();
        });
    })
}