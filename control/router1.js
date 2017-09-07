/**
 * Created by asus on 2017/2/15.
 */
//显示首页
var express=require("express");
var db=require("../models/db.js");
var md5=require("../models/md5.js");
var formidable=require("formidable");
var session=require("express-session");
var fs=require("fs");
var path=require("path");
var gm=require("gm");
var ObjectId=require("mongodb").ObjectID;
var captchapng = require('captchapng');
var nodemailer = require('nodemailer');


var config = require('../config.js');

exports.get = function (req, res, next) {
    //var date=new Date();
    //req.session.sessionID=md5(date+date.getMilliseconds()+""+md5(Math.random()+"asd123"));
    console.log(req.session);

    res.end(req.session.sessionID);
}
exports.get1 = function (req, res, next) {
    connectsid=req.headers.cookie;
    console.log(connectsid.substr(12,connectsid.length));

    res.end("");
}

exports.doshuoshuo = function (req, res, next) {

    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    //用户名
    var username = req.session.username;

    //得到用户填写的东西
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //得到表单之后做的事情
        db.find("user",{"username":username},function(err,result){
            var date1=parseInt(new Date().getTime());
            //console.log(result[0].limitfabiao[0]);
            //console.log(date1-result[0].limitfabiao[0]);
            if((date1-result[0].limitfabiao[0])<3600000){

                var sysj=parseInt(((3600000-(date1-result[0].limitfabiao[0]))/3600000)*60);
                console.log(sysj);
                res.send(sysj.toString());
                return;
            }else{

               var temp=result[0].limitfabiao;
                temp[0]=temp[1];
                temp[1]=temp[2];
                temp[2]=date1;
                db.updateMany("user",{"username":username},{$set:{"limitfabiao":temp}},function(err,result1){
                    var content = fields.content;
                    var huati=fields.huati;

                    db.insertOne("shuoshuo", {
                        "username": username,
                        "date": new Date(),
                        "content": content,
                        "zan":["haha","xixi"],
                        "huati":huati
                    }, function (err, result2) {
                        if (err) {
                            res.send("-3");
                            return;
                        }
                        res.send("1");
                    });
                })
            }

        });

    });
}
exports.getinfo=function(req,res){
    var username=req.query.username;
   console.log(username);
    if(req.session.login!="1")
    {

        res.send("-1");
        return;
    }
    db.find("user",{"username":username||req.session.username},function(err,result) {
        var avatar = result[0].avatar;
        var json={
            "login": "1",
            "username": req.session.username,
            "avatar":avatar
        };
        res.send(JSON.stringify(json));
    })
}
//exports.showIndex=function(req,res,next){
//
//    res.render("index");
//
//}
//注册页面
//exports.showRegist= function (req,res,next) {
//   res.render("regist");
//
//}
//exports.dotest=function(req,res){
//    console.log("wolaile");
//    res.send("1");
//}
//exports.showtest=function(req,res){
//    res.render("test");
//}
exports.doregist=function(req,res){
    var form=new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        //得到表单之后做的事情
        var username=fields.username;
        var password=fields.password;
        var email=fields.email;
        db.find("user",{"username":username},function(err,result){
            if(err){
               res.send(-2);
                //res.send(JSON.stringify({"flag":'-2'}));
                return;
            }

                if(result.length!=0){
                    res.send("-1");
                    console.log("用户名存在");
                    //res.send(JSON.stringify({"flag":'-1'}));

                    return ;

                  }
                  else{
                    console.log(email);
                    var passwordjiami=md5(md5(password)+"zhengxin");
                    db.insertOne("user",{"uuid":0,"username":username,"password":passwordjiami,"avatar":"/avatar/moren","email":email,"limitfabiao":[100],"dizhi":[{"morendizhi":"wu"}],"diy":[{"diyname":"moren","beizhu":"moren","danjia":-1,"img":"moren", "img":  "" ,
                        "changjingxinxi":  "" ,
                        "diybiaoshi":"" ,
                        "shangpinhao":"",
                        "moxingwenjian":""}],"dingdan":[{"dingdanbiaoshi":"1","chuangjiantime":"1","dingdanzongjia":"1","dingdanshangpins":"1","dingdanzhuangtai":"-1","dingdandizhi":"1","fahuoshijian":"1","wuliuhaoma":"1","wuliuxinxi":"","shouhuoshijian":"","dingdanxinxixiugaijilu":[""]}]},function(err,result){
                        if(err){
                            res.end("-2");
                            //res.send(JSON.stringify({"flag":'-2'}));
                            return;
                        }
                        req.session.username=username;
                        fs.mkdir(__dirname+"/../diyimg/"+req.session.username,function(err){
                            if(err)
                                console.error("出问题了"+err);
                            console.log('创建目录成功');
                            console.log(passwordjiami);

                            res.send('1');
                        });


                    });
            }

        }
        );
    })

}
//exports.showlogin=function(req,res){
//    res.render("login",{
//        "login":req.session.login=="1" ? true:false,
//        "username":req.session.login=="1"?req.session.username:""
//    })
//}
exports.getavatar=function(req,res){
    if (req.session.login != "1") {
        res.end("非法闯入，这个页面要求登陆！");
        return;
    }
    res.json({"avatar":req.session.avatar});
}
exports.autologin=function(req,res){
    if(req.query!=undefined) {
        var username = req.query.username;
        var uuid = req.query.uuid;
        if(username!=undefined&&username!=""&&uuid!=undefined&&uuid!="")
        {
            db.find("user",{"username":username},function(err,result){
                if(err)
                {
                    console.log(err);
                    res.send("-1");
                    return;
                }
                if(result[0])
                {
                    if (result[0] != undefined)
                    {
                          if(result[0].uuid==uuid)
                          {
                              req.session.login=1;
                              req.session.username=username;
                              req.session.avatar=result[0].avatar;
                              res.send("1");
                          }
                          else
                          {
                              res.send("-1");
                          }
                    }
                    else
                    {
                        res.send("-1");
                    }
                }
                else
                {
                    res.send("-1");
                }
            })
        }
        else
        {
            res.send("-1");
        }
    }
    else
    {
        res.send("-1");
    }
}
exports.dologin=function(req,res){
    var form=new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        //得到表单之后做的事情
        var username=fields.username;
        var uuid=fields.uuid;
        var password=fields.password;
        var yanzhengma=fields.yanzhengma;
        if(yanzhengma!=req.session.yanzhengma){
            res.send("-4");
            return;
        }
        db.find("user",{"username":username},function(err,result){
                if(err){
                    res.send("-3");
                    //res.send(JSON.stringify({"flag":'-2'}));
                    return;
                }
            console.log(result.length);
                if(result.length==0){
                    res.send("-1");
                    console.log("用户名不存在");
                    //res.send(JSON.stringify({"flag":'-1'}));

                    return;

                }
                else{

                    var passwordjiami=md5(md5(password)+"zhengxin");
                    if(result[0].password==passwordjiami){


                        db.updateMany("user",{"username":username},{$set:{"uuid":uuid}},function(err,result1){
                            if(err)
                            {
                                console.log(err);
                                res.send("-1");
                                return;
                            }
                            req.session.login="1";
                            req.session.username=username;
                            req.session.avatar=result[0].avatar;
                            var connectsid=req.headers.cookie;
                            console.log(connectsid);
                            //connectsid=connectsid.substr(12,connectsid.length);
                            res.send("1");
                            return;
                        })

                    }
                       else{

                        res.send('-2');

                    }};
                });



    })}
//exports.showshezhi=function(req,res){
//    if(req.session.login!="1")
//    {
//        res.send("非法闯入，请登录");
//        return;
//    }
//       else{res.render("shezhi");}
//}
//exports.doshezhi=function(req,res){
// if(req.session.login!="1"){
//     res.send("非法闯入啦，请登录！");
//     return;
// }
//    var form=new formidable.IncomingForm();
//    form.parse(req,function(err,fields,files){
//
//});}
//exports.showupavatar=function(req,res) {
//    if (req.session.login != "1") {
//        res.send("非法闯入啦，请登录！");
//        return;
//    }
//    res.render("upavatar");
//}
//exports.doupavatar=function(req,res){
//    if(req.session.login!="1"){
//        res.send("非法闯入啦，请登录！");
//        return;
//    }
//    var form=new formidable.IncomingForm();
//    form.uploadDir=__dirname+"/../avatar";
//    form.parse(req,function(err,fields,files) {
//
//          var oldpath=files.pic.path;
//          var extname=path.extname(files.pic.path);
//
//          var newpath=__dirname+"/../avatar/"+req.session.username+extname;
//          fs.rename(oldpath,newpath,function(err){
//                if(err){
//                    throw Error("改名失败");
//                    return;
//                }
//                req.session.avatar=req.session.username+extname;
//              console.log(extname);
//                req.session.avatardir=req.session.username;
//                res.redirect("/showcut");
//
//          });
//    });
//}
//exports.showcut=function(req,res){
//    if(req.session.login!="1"){
//        res.send("非法闯入啦，请登录！");
//        return;
//    }
//      res.render("cut",{"avatar":req.session.avatar});
//}
//exports.docut=function(req,res){
//    if(req.session.login!="1"){
//        res.send("非法闯入啦，请登录！");
//        return;
//    }
//    var form=new formidable.IncomingForm();
//    form.uploadDir=__dirname+"/../avatar";
//    form.parse(req,function(err,fields,files) {
//        if(files!=undefined) {
//            if(files.img!=undefined) {
//                if (fields != undefined) {
//                    if (fields.w != undefined && fields.w != "" && fields.y != "" && fields.h != "" && fields.x != "" && fields.y != undefined && fields.h != undefined && fields.x != undefined) {
//                        if (files.img.path != undefined) {
//                            var oldpath = files.img.path;
//                            var extname = path.extname(files.img.path);
//
//                            var newpath = __dirname + "/../avatar/" + req.session.username + extname;
//                            fs.rename(oldpath, newpath, function (err) {
//                                if (err) {
//                                    throw Error("改名失败");
//                                    return;
//                                }
//                                req.session.avatar = req.session.username + extname;
//                                console.log(extname);
//                                req.session.avatardir = req.session.username;
//                                var w = parseInt(fields.w);
//                                var h = parseInt(fields.h);
//                                var x = parseInt(fields.x);
//                                var y = parseInt(fields.y);
//                                //console.log(w,h,x,y);
//                                gm(__dirname + "/../avatar/" + req.session.avatar).crop(w, h, x, y).resize(100, 100).write(__dirname + "/../avatar/" + req.session.avatar, function (err) {
//                                    if (err) {
//                                        console.log(req.session.avatar);
//                                        res.send("-1");
//                                        console.log(err);
//                                        return;
//                                    }
//                                    //console.log("haha");
//                                    db.updateMany("user", {"username": req.session.username}, {$set: {"avatar": req.session.avatar}}, function (err, results) {
//                                        if (err) {
//                                            throw new Error("修改失败");
//
//                                        }
//                                        res.send('1');
//                                    });
//
//                                });
//
//
//                            });
//
//                        }
//                    }
//
//                }
//            }
//        }
//        else{
//        res.send("-1");
//    }
//})
//}

exports.docut=function(req,res){
    var form=new formidable.IncomingForm();
    form.parse(req,function(err,fields,files){
        if(err) {
            console.log(err);
            res.send("-1");
            return;

        }
        if(fields)
        {
            if(fields.avatar)
            {
                if (fields.avatar != "" && fields.avatar != undefined)
                {
                    var avatar=fields.avatar;

                      db.updateMany("user",{"username":req.session.username},{$set:{"avatar":avatar}},function(err,result){
                          if(err)
                          {
                              console.log(err);
                              res.send("-1");
                              return;
                          }
                          req.session.avatar=avatar;
                          res.send("1");
                      })
                }
                else{
                    res.send("-1");
                }
            }
            else{
                res.send("-1");
            }
        }
        else{
            res.send("-1");
        }
    })
}
exports.tuichu=function(req,res){
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    req.session.username="";
    req.session.login="";
    res.send("1");
}

exports.getallshuoshuo = function(req,res,next) {
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    //这个页面接收一个参数，页面
    if (req.session.login =="1") {

    var page =parseInt(req.query.page);
        var huati=req.query.huati;
        //console.log(page+"hahaahhhahahaahah");


            db.find("shuoshuo", {"huati":huati}, {"pageamount":10,"page":page,"sort":{"date":-1}}, function (err, result) {
                for(var i=0;i<result.length;i++){
                    for(var j=0;j<result[i].zan.length;j++){
                        if(result[i].zan[j]==req.session.username){
                            result[i].yanse="color:orange;";
                        }else{
                            result[i].yanse="";
                        }

                    }
                }
                res.json(result);
            });
        }
else{
     res.send("-1");
}
    };
exports.getallshuoshuo1 = function(req,res,next) {
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }

    //这个页面接收一个参数，页面
    if (req.session.login =="1") {

        var page =parseInt(req.query.page);
        //console.log(page+"hahaahhhahahaahah");
        var  username=req.query.username;

        db.find("shuoshuo", {"username":username}, {"pageamount":10,"page":page,"sort":{"date":-1}}, function (err, result) {
            for(var i=0;i<result.length;i++){
                for(var j=2;j<result[i].zan.length;j++){
                    if(result[i].zan[j]==req.session.username){
                        result[i].yanse="color:orange;";
                    }else{
                        result[i].yanse="";
                    }

                }
            }
            res.json(result);
        });
    }
    else{
        res.send("-1");
    }
};


//列出某个用户的信息
    exports.getuserinfo = function(req,res){
        if(req.session.login!="1"){
            res.send("非法闯入啦，请登录！");
            return;
        }
        //这个页面接收一个参数，页面
        var username = req.query.username;
        db.find("user",{"username":username},function(err,result){
            if(err || result.length == 0){
                console.log("出错啦");
                res.json("");
                return;
            }

            var obj = {
                "username" : result[0].username,
                "avatar" : result[0].avatar,
                "_id" : result[0]._id,
            };
            console.log(obj.username);
            res.json(obj);
        });
    };
exports.getshuoshuoamount=function(req,res){
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    if (req.session.login =="1") {
        var huati=req.query.huati;
        db.getAllCount("shuoshuo",{"huati":huati}, function (count) {

            res.send(count.toString());
        });
    }else{
        res.send("-1");
    }
}
exports.getshuoshuoamount1=function(req,res){
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    var username=req.query.username;
    if (req.session.login =="1") {
        db.getAllCount("shuoshuo",{"username":username},function (count) {

            res.send(count.toString());
        });
    }else{
        res.send("-1");
    }
}
exports.shanchushuoshuo=function(req,res){
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    var id=req.query.id;
    db.deleteMany("shuoshuo",{"_id":ObjectId(id)},function(err,result){
        if(err){
            console.log(err);
            return;
        }
        res.send("1");
    })
}
//exports.showuserindex=function(req,res){
//    if(req.session.login!="1"){
//        res.send("非法闯入啦，请登录！");
//        return;
//    }
//    if(req.session.login=="1"){
//        db.find("user",{"username":req.query.username},function(err,result){
//           var avatar=result[0].avatar;
//            req.session.tempuser=req.query.username;
//   res.render("userindex",{
//       "login":req.session.login=="1" ? true:false,
//       "username":req.session.login=="1"?req.session.username:"",
//       //"shuoshuo":result2,
//       "user":req.query.username,
//       "avatar":avatar
//   });
//
//});}}

exports.dianzan=function(req,res){
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    var id=req.query.id.toString();
    //console.log(id);
    db.find("shuoshuo",{"_id":ObjectId(id) },function(err,result){
        if(err){
            console.log(err);
            return;
        }
        var flag=1;
        for(var i=0;i<result[0].zan.length;i++){
            if(result[0].zan[i]==req.session.username)
            {
                flag=0;
                break;
            }
        }
       //console.log(result[0].zan instanceof Array);
        //console.log(result[0].zan+"asdf");
        if(flag==1){
        var username=req.session.username;
            console.log(username+"我来了");
            var zantemp=result[0].zan;
             zantemp.push(req.session.username);
             db.updateMany("shuoshuo",{"_id":ObjectId(id)},{$set:{"zan":zantemp}},function(err1,result1) {
                 if (err1) {
                     console.log(err1);
                     return;
                 }
                 res.send({"dianzanshu":zantemp.length.toString(),"xinzeng":"1"});//代表点赞成功

             })}else{
            var zantemp1=result[0].zan;
            var username=req.session.username;
            zantemp1.splice(zantemp1.indexOf(req.session.username),1);
            db.updateMany("shuoshuo",{"_id":ObjectId(id)},{$set:{"zan":zantemp1}},function(err1,result1) {
                if (err1) {
                    console.log(err1);
                    return;
                }
                res.send({"dianzanshu":zantemp1.length.toString(),"xinzeng":"-1"});//代表点赞成功

            })

         }})

    }

//exports.huati=function(req,res){
//    if(req.session.login!="1"){
//        res.send("非法闯入啦，请登录！");
//        return;
//    }
//    var huati=req.query.ht;
//
//        res.json({
//           "huati":huati,
//
//        });
//
//
//}
//exports.yanzhengma=function(req,res){
//
//    res.render("yanzhengma");
//}
exports.scyanzhengma=function(req,res){
    var random=(Math.random()*9000+1000);
    //console.log(random);
    var p = new captchapng(80,30,parseInt(random)); // width,height,numeric captcha
    p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
    p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)
    req.session.yanzhengma=parseInt(random).toString();

    var img = p.getBase64();
    var imgbase64 = new Buffer(img,'base64');
    //res.writeHead(200, {
    //    'Content-Type': 'image/png'
    //});
    res.end(imgbase64);
}
//exports.gerenzhongxin=function(req,res){
//    if(req.session.login!="1"){
//        res.send("非法闯入啦，请登录！");
//        return;
//    }
//    db.find("user",{"username":req.session.username},function(err,result) {
//        var avatar = result[0].avatar;
//        res.render("personinfo", {
//            "login": req.session.login == "1" ? true : false,
//            "username": req.session.login == "1" ? req.session.username : "",
//            //"shuoshuo":result2,
//
//            "avatar": avatar
//        });
//    })
//}
exports.dizhiguanli=function(req,res){
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    //username=req.session.username;
    db.find("user",{"username":req.session.username},function(err,result){
        if(err){
            console.log(err);
            return;
        }
             console.log("地址数量:"+result[0].dizhi.length-1);


            //res.render("dizhi",
            //    {
            //        "login": req.session.login == "1" ? true : false,
            //        "username": req.session.login == "1" ? req.session.username : "",
            //        "dizhi": result[0].dizhi,
            //        "houtui":"0"
            //    });

          res.json({"result":result[0].dizhi});

    })
}
//exports.tianjiadizhi=function(req,res){
//    if(req.session.login!="1"){
//        res.send("非法闯入啦，请登录！");
//        return;
//    }
//    console.log(req.query.houtui);
//       res.render("tianjiadizhi",{
//    "login":req.session.login=="1" ? true:false,
//        "username":req.session.login=="1"?req.session.username:"",
//           "houtui":req.query.houtui
//   });
//
//}
exports.adddizhi=function(req,res){
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    console.log("wolaile");
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //得到表单之后做的事情
        if(fields.name!=undefined&&fields.name!=""&&fields.dianhua!=undefined&&fields.dianhua!=""&&fields.pro!=undefined&&fields.pro!=""&&fields.city!=undefined&&fields.city!=""&&fields.area!=undefined&&fields.area!=""&&fields.jutidizhi!=undefined&&fields.jutidizhi!=""&&fields.jutidizhi.length>5) {
            db.find("user", {"username": req.session.username}, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("-1");
                    return;
                }
                var dizhi = result[0].dizhi;
                var completedizhi = "" + fields.pro + fields.city + fields.area + fields.jutidizhi;
                var date = new Date();
                var bs = "biaoshi" + date.getFullYear() + "biaoshi" + date.getMonth() + date.getDay() + date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds();
                console.log("标识:" + bs);
                var newone = {
                    "name": fields.name,
                    "dianhua": fields.dianhua,
                    "pro": fields.pro,
                    "city": fields.city,
                    "area": fields.area,
                    "jutidizhi": fields.jutidizhi,
                    "dizhi": completedizhi,
                    "biaoshi": bs
                };
                dizhi.push(newone);
                db.updateMany("user", {"username": req.session.username}, {$set: {"dizhi": dizhi}}, function (err, result1) {
                    if (err) {
                        console.log(err);
                        res.send("-1");
                        return;
                    }
                    console.log("success");
                    res.send("1");
                });
            });
        }
        else{
            res.send("-1");
        }
            });




}
exports.shanchudizhi=function(req,res){
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    var biaoshi=req.query.biaoshi;
    if(typeof biaoshi=="undefined"||biaoshi.length==0)
    {
        res.send("1");
        return;
    }
    console.log("biaoshi："+biaoshi);
    db.find("user",{"username":req.session.username},function(err,result){
        if(err){
            console.log(err);
            res.send("-1");
            return;
        }
        var flag=1;
        var dizhi=result[0].dizhi;
        console.log("shanchudizhi地址数量："+dizhi.length);
        for(var i=1;i<dizhi.length;i++){
            if(dizhi[i].biaoshi==biaoshi){
                dizhi.splice(i,1);
                flag=0;
                break;
            }
        }
        if(flag==1)
        {
            res.send("-1");
            return;
        }
        console.log("shanchudizhi之后的地址数量："+dizhi.length);
        db.updateMany("user",{"username":req.session.username},{$set:{"dizhi":dizhi}},function(err1,result1){
            if(err1){
                console.log(err1);
                res.send("-1");
                return;
            }
            console.log("chenggongle!");
            res.send("1");
        })
    })
}

exports.xiugaidizhiindex=function(req,res){
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
var biaoshi=req.query.biaoshi;
    if(typeof biaoshi=="undefined"||biaoshi=="")
    {
        res.send("-1");
        return;
    }

    db.find("user",{"username":req.session.username},function(err,result){
        if(err){
            console.log(err);
            res.send("-1");
            return;
        }
        var dizhi=result[0].dizhi;
       var index=-1;
        var flag=1;
        console.log("shanchudizhi地址数量："+dizhi.length);
        for(var i=1;i<dizhi.length;i++){
            if(dizhi[i].biaoshi==biaoshi){
                index=i;
                flag=0;
                break;
            }
        }
        if(flag==1)
        {
            res.send("-1");
            return;
        }

        console.log("修改地址的省份:"+dizhi[index]);
          console.log("修改地址的省份:"+dizhi[index].pro);
        //    res.render("xiugaidizhi",{"login":req.session.login=="1" ? true:false,
        //            "username":req.session.login=="1"?req.session.username:"",
        //"name":dizhi[index].name,
        //    "dianhua":dizhi[index].dianhua,
        //        "pro":dizhi[index].pro,
        //        "city":dizhi[index].city,
        //        "area":dizhi[index].area,
        //        "jutidizhi":dizhi[index].jutidizhi,
        //        "biaoshi":dizhi[index].biaoshi
        //    }
        //        );
        res.json({"result":dizhi[index]});
        })

}
exports.xiugaidizhi=function(req,res){
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //得到表单之后做的事情
        db.find("user",{"username":req.session.username},function(err,result){
            if(err){
                console.log(err);
                res.send("-1")
                return;
            }
            var dizhi=result[0].dizhi;
            var biaoshi=fields.biaoshi;
            var completedizhi=""+fields.pro+fields.city+fields.area+fields.jutidizhi;
            console.log("修改的地址的标识:"+biaoshi);
            var newone={"name":fields.name,"dianhua":fields.dianhua,"pro": fields.pro,"city":fields.city,"area":fields.area,"jutidizhi":fields.jutidizhi,"dizhi":completedizhi,"biaoshi":biaoshi};
            for(var i=1;i<dizhi.length;i++){
                if(dizhi[i].biaoshi==biaoshi){
                    console.log("把之前的删掉");
                    dizhi.splice(i,1,newone);
                    break;
                }
            }



            db.updateMany("user",{"username":req.session.username},{$set:{"dizhi":dizhi}},function(err,result1){
                if(err){
                    console.log(err);
                    res.send("-1");
                    return;
                }
                console.log("success");
                res.send("1");
            });
        });
    });
}
var morendizhixiugai=0;
exports.morendizhi=function(req,res){
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
       var biaoshi=req.query.biaoshi;
    db.find("user",{"username":req.session.username},function(err,result){
        if(err){
            console.log(err);
            res.send("-1");
            return;
        }
        var dizhi=result[0].dizhi;
        for(var i=1;i<dizhi.length;i++){
            if(dizhi[i].biaoshi==biaoshi){
               var json=dizhi[i];
                dizhi.splice(i,1);
                dizhi.splice(1,0,json);
                break;
            }
        }



        db.updateMany("user",{"username":req.session.username},{$set:{"dizhi":dizhi}},function(err,result1){
            if(err){
                console.log(err);
                res.send("-1");
                return;
            }
            morendizhixiugai=1;
            console.log("success");
            res.send("1");
        });
    });
}
exports.testusername=function(req,res){

    var username=req.query.username;
    db.getAllCount("user",{"username":username},function(count){
        if(count!=0){
            res.send("-1");
        }
        else{
            res.send("1");
        }
    })
}
var transporter = nodemailer.createTransport({
    //https://github.com/andris9/nodemailer-wellknown#supported-services 支持列表
    service: 'qq',
    port: 465, // SMTP 端口
    secureConnection: true, // 使用 SSL
    auth: {
        user:'2218706808@qq.com',
        //这里密码不是qq密码，是你设置的smtp密码
        pass:'jmkjtgalmucxecaa'
        //lgzgwetildwldigd
        //jyjzqnfmanrzdjbd
    }
});
//var mailOptions = {
//    from: '2218706808@qq.com', // 发件地址
//    to: '396848385@qq.com', // 收件列表
//    subject: 'Hello sir', // 标题
//    //text和html两者只支持一种
//    text: 'Hello world ?', // 标题
//    //html: '<b>Hello world ?</b>' // html 内容
//};

exports.mimazhaohui=function(req,res){

    var username=req.query.username;
    var email=req.query.email;
    db.find("user",{"username":username},function(err,result){
        if(err){
            console.log(err);
            res.send("-1");
            return;
        }
      if(result[0].username!=""){
        if(result[0].email==email){
            var randommima=parseInt(100000+Math.random()*500000);
            var newmima=randommima+"";
            var html="尊敬的"+username+"您好，您现在的临时密码为"+newmima+",请尽快登录后修改密码";
            transporter.sendMail({
                from: '2218706808@qq.com', // 发件地址
                to:email, // 收件列表
                subject: '密码找回', // 标题
                //text和html两者只支持一种
                text:html, // 标题
                //html: '<b>Hello world ?</b>' // html 内容
            }, function(error, info){
                if(error){
                   console.log(error);
                    return;
                }
                var  newmima1=md5(md5(newmima)+"zhengxin");
                db.updateMany("user",{"username":username},{$set:{"password":newmima1}},function(err,result){
                    console.log('Message sent: ' + info.response);
                    res.send("1");
                });

            });

        }else{
            res.send("-3");
        }}else{
          res.send("-2")
      }
    })


}
exports.testemail=function(req,res) {

    var username=req.query.username;
    var email=req.query.email;
    db.find("user",{"username":username},function(err,result){
        if(err){
            console.log(err);
            res.send("-1");
            return;
        }
        if(result[0].email==email){
            res.send("1");
        }
        else{
            res.send("-1");
        }
    });
}
//exports.findmima=function(req,res) {
//
//
//  res.render("findmimaindex",{
//      "login":req.session.login=="1" ? true:false,
//      "username":req.session.login=="1"?req.session.username:"",
//  })
//}
//exports.gouwuche=function(req,res){
//    if(req.session.login!="1"){
//        res.send("非法闯入啦，请登录！");
//        return;
//    }
//    res.render("gouwucheindex");
//}
//exports.dodiy=function(req,res){
//    if(req.session.login!="1"){
//        res.send("非法闯入啦，请登录！");
//        return;
//    }
//    res.render("dodiy",{"username":req.session.username,
//        "login":req.session.login
//    });
//}
exports.adddiy=function(req,res){
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    var form=new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req,function(err,fields,files) {
        if(fields) {
            if (fields.jiepingpic != undefined&&files.jiepingpic!=""&&fields.changjingxinxi!= undefined&&fields.changjingxinxi!="") {

                if (fields.diyname != undefined && fields.beizhu != undefined && fields.diyname.length < 15 && fields.beizhu.length < 30&&fields.shangpinhao!=undefined&&fields.shangpinhao!="") {
                    //得到表单之后做的事情
                    //console.log(files.img);
                    var shangpinhao=fields.shangpinhao;
                    //var oldpath = files.jieping.path;
                    //var extname = path.extname(files.jieping.path);
                    var img=fields.jiepingpic;
                    var changjingxinxi=fields.changjingxinxi;
                    //var oldpath1 = files.wenlipic.path;
                    //var extname1 = path.extname(files.wenlipic.path);

                    var date = new Date();
                    var bs =req.session.username+date.getFullYear() + date.getMonth() + date.getDay() + date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds();
                    //var bs1="wenli"+date.getFullYear() + date.getMonth() + date.getDay() + date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds();
                    //var newpath=__dirname+"/../diyimg/"+req.session.username+"/"+bs+extname;
                    //var newpath = __dirname + "/../diyimg/" + req.session.username + "/" + bs + extname;
                    //var newpath1 = __dirname + "/../diyimg/" + req.session.username + "/" + bs1 +extname1;
                    db.find("shangpin", {"shangpinhao": shangpinhao}, function (err, result1) {
                        if (err) {
                            console.log(err);
                            res.send("-1");
                            return;
                        }
                        //fs.rename(oldpath, newpath, function (err) {
                        //    if (err) {
                        //        console.log(err);
                        //        res.send("-1");
                        //        return;
                        //    }
                        //req.session.avatar=req.session.username+extname;
                        //console.log(extname);
                        //req.session.avatardir=req.session.username;
                        //res.redirect("/showcut");
                        //gm(newpath).resize(100, 100).write(newpath, function (err) {
                        //    if (err) {
                        //        console.log(req.session.avatar);
                        //        res.send("-1");
                        //        console.log(err);
                        //        return;
                        //    }
                        //    fs.rename(oldpath1, newpath1, function (err) {
                        //        if (err) {
                        //            console.log(err);
                        //            res.send("-1");
                        //            return;
                        //        }

                        db.find("user", {"username": req.session.username}, function (err, result) {
                                if (err) {
                                    console.log(err);
                                    res.send("-1");
                                    return
                                }

                                if (result1.length > 0&&result1.length==1) {

                                    if (result.length > 0) {
                                        var diy = result[0].diy;
                                        diy.push({
                                            "diybiaoshi": bs,
                                            "diyname": fields.diyname,
                                            "beizhu": fields.beizhu,
                                            "danjia": result1[0].shangpindanjia,
                                            "img": img,
                                            "changjingxinxi": changjingxinxi,
                                            "shangpinhao": shangpinhao,
                                            "moxingwenjian": result1[0].path3darray
                                        });
                                        db.updateMany("user", {"username": req.session.username}, {$set: {"diy": diy}}, function (err, result2) {
                                                if (err) {
                                                    console.log(err);
                                                    res.send("-1");
                                                    return
                                                }
                                                res.send("1");
                                            }
                                        )
                                    }

                                    else {
                                        res.send("-1");
                                    }
                                } else {
                                    res.send("-1");
                                }

                            }
                        )
                    })


                   }
              else{
            res.send("-1");
               }
                }
                   else{
                    res.send("-1");
                }
            }
             else
           {
            res.send("-1");
           }
})
}
exports.getgouwuche=function(req,res){
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    db.find("user",{"username":req.session.username},function(err,result){
       if(err)
       {
           console.log(err);
           res.send("-1");
           return;
       }
        if(result.length>0) {
            console.log("购物车" + result[0].username);
            var diy = result[0].diy;
            //console.log(diy[2].danjia);
            for (var i = 1; i < diy.length; i++) {
                diy[i].username = req.session.username;
            }
            res.send(diy);
        }
        else{
            res.send("-1");
        }
    })

}
exports.checkbox=function(req,res){
    res.render("testcheckbox");
}
var arraydingdan=new Array();
var zongjiadingdan;
var dizhidingdan=new Array();
exports.createdingdan=function(req,res){
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    console.log(arraydingdan.length);
    dizhidingdan=[];
    arraydingdan=[];
    console.log(arraydingdan.length);
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //得到表单之后做的事情
        if(fields.shangpins!=undefined&&fields.shangpins!="") {
            var shangpins = eval(fields.shangpins);
            if(shangpins.length==0)
            {
                res.send("-1");
                return;
            }
            db.find("user", {"username": req.session.username}, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("-1");
                    return;
                }
              if(result.length>0) {
                  var diy = result[0].diy;
                  //console.log("此用户已有diy数量为"+diy.length);

                  //console.log("前台传来的数组长度为"+shangpins.length);
                  for (var i = 0; i < shangpins.length; i++) {
                      for (var j = 1; j < diy.length; j++) {
                          if (parseInt(shangpins[i].shuliang) > 9999999) {
                              res.send("-1");
                              return;
                          }
                          //console.log("前台的img值为"+shangpins[i].img);
                          //console.log("前台的数量值为"+shangpins[i].shuliang);
                          //console.log("后台的img值的形式为"+diy[1].img);
                          if (diy[j].diybiaoshi == shangpins[i].diybiaoshi) {
                              diy[j].shuliang = shangpins[i].shuliang;
                              //console.log("相等时的序号:"+j);
                              arraydingdan.push(diy[j]);
                          }
                      }
                  }
                  dizhidingdan = result[0].dizhi;
                  zongjiadingdan = fields.zongjia;
                  res.send("1");

              }
            })
        }
        else{
            res.send("-1");
        }
        })



}
exports.getzongjia=function(req,res) {
    if (req.session.login != "1") {
        res.send("非法闯入啦，请登录！");
        return;
    }
    res.json({"zongjia":zongjiadingdan});
}
exports.showdingdan=function(req,res) {
    if (req.session.login != "1") {
        res.send("非法闯入啦，请登录！");
        return;
    }

        db.find("user", {"username": req.session.username}, function (err, result) {
            if (err) {
                console.log(err);
                res.send("-1");
                return;
            }
            res.json({
                "username":req.session.username,

                "shangpins":arraydingdan

            })
        })



}
var arraydingdan1=new Array();
var zongjiadingdan1;
var dizhidingdan1=new Array();
var dizhijson={};
exports.goumai=function(req,res){
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    //console.log(arraydingdan1.length);
    dizhidingdan1=[];
    arraydingdan1=[];
    //console.log(arraydingdan1.length);
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        //得到表单之后做的事情
        if(fields.shangpins!=undefined&&fields.shangpins!=""&&fields.dizhibiaoshi!=undefined&&fields.dizhibiaoshi!="") {
            var shangpins = eval(fields.shangpins);
            if(shangpins.length==0)
            {
                res.send("-1");
                return;
            }
        db.find("user", {"username": req.session.username}, function (err, result) {
            if (err) {
                console.log(err);
                res.send("-1");
                return;
            }
            console.log("进来啦");
            var diy = result[0].diy;
            //console.log("此用户已有diy数量为"+diy.length);
            var flag1=0;
            //console.log("前台传来的数组长度为"+shangpins.length);
            for (var i = 0; i < shangpins.length; i++) {
                for (var j = 1; j < diy.length; j++) {
                    //console.log("前台的img值为"+shangpins[i].img);
                    //console.log("前台的数量值为"+shangpins[i].shuliang);
                    //console.log("后台的img值的形式为"+diy[1].img);
                    if (diy[j].diybiaoshi == shangpins[i].diybiaoshi) {
                        flag1=1;
                        diy[j].shuliang = shangpins[i].shuliang;
                        //console.log("相等时的序号:"+j);
                        arraydingdan1.push(diy[j]);
                    }
                }
                if(flag1!=1)
                {
                    res.send("-1");
                    return;
                }
                flag1=0;
            }
          if(arraydingdan1.length!=arraydingdan.length)
          {
              res.send("-1");
              return;
          }
            db.find("user", {"username": req.session.username}, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("-1");
                    return;
                }
                var dizhi = result[0].dizhi;
                var flag=0;
                for (var i = 0; i < dizhi.length; i++) {
                    if (dizhi[i].biaoshi == fields.dizhibiaoshi) {
                        dizhijson = dizhi[i];
                        flag=1;
                        break;
                    }
                }
                if(flag!=1)
                {
                    res.send("-1");
                    return;
                }
                dizhijson.dizhi = "" + dizhijson.pro + dizhijson.city + dizhijson.area + dizhijson.jutidizhi;
                zongjiadingdan1 = fields.zongjia;
                var xiugaitime1 = new Date();

                var time = "" + xiugaitime1.getFullYear() + "年" + (xiugaitime1.getMonth() + 1) + "月" + xiugaitime1.getDate() + "日" + xiugaitime1.getHours() + "时" + xiugaitime1.getMinutes() + "分" + xiugaitime1.getSeconds() + "秒";
                var str = "";
                for (var i = 0; i < req.session.username.length; i++) {
                    str = str + req.session.username.charAt(i).charCodeAt();
                }
                var dingdanbiaoshi = str + xiugaitime1.getFullYear() + xiugaitime1.getMonth() + xiugaitime1.getDay() + xiugaitime1.getHours() + xiugaitime1.getMinutes() + xiugaitime1.getSeconds() + xiugaitime1.getMilliseconds();
                db.insertOne("dingdans", {
                    "dingdanbiaoshi": dingdanbiaoshi,
                    "date": xiugaitime1,
                    "chuangjiantime": time,
                    "dingdanowner": req.session.username,
                    "dingdanzongjia": fields.zongjia,
                    "dingdanshangpins": JSON.stringify(arraydingdan1),
                    "dingdanzhuangtai": "1",
                    "dingdandizhi": dizhijson,
                    "fahuoshijian": "",
                    "wuliuhaoma": "",
                    "wuliuxinxi": "",
                    "shouhuoshijian": "",
                    "dingdanxinxixiugaijilu": [""]
                }, function (err, result) {
                    if (err) {

                        console.log(err);
                        res.send("-1");
                        return;
                    }
                    console.log("订单创建成功啦");
                    db.find("user", {"username": req.session.username}, function (err, result1) {
                        if (err) {
                            console.log(err);
                            db.deleteMany("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, function (err, result2) {
                                if (err) {
                                    console.log(err);
                                    res.send("-1");
                                    return;
                                }
                                res.send("-1");
                                return;
                            })

                        }
                        var dingdan = result1[0].dingdan;
                        console.log(dingdan.length);
                        var newdingdan = {
                            "dingdanbiaoshi": dingdanbiaoshi,
                            "date": xiugaitime1,
                            "chuangjiantime": time,
                            "dingdanzongjia": fields.zongjia,
                            "dingdanshangpins": JSON.stringify(arraydingdan1),
                            "dingdanzhuangtai": "1",
                            "dingdandizhi": dizhijson,
                            "fahuoshijian": "",
                            "wuliuhaoma": "",
                            "wuliuxinxi": "",
                            "shouhuoshijian": ""
                        };
                        dingdan.push(newdingdan);
                        console.log(dingdan.length);
                        db.updateMany("user", {"username": req.session.username}, {$set: {"dingdan": dingdan}}, function (err, result2) {
                            if (err) {
                                console.log(err);
                                res.send("-1");
                                return;
                            }
                            res.send("1");
                        })

                    })

                })


            })


        })
    }
        else{
            res.send("-1");
        }
    })



}
//getdingdanshangpin，getdingdanzongjia和getdingdaninfo三个方法都是对用户刚购买完成
//后的对应的这个订单的相关信息。对应的页面是dingdanindex.html.
exports.getdingdanshangpin=function(req,res) {
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    db.find("user",{"username":req.session.username},function(err,result){
        if(err)
        {
            console.log(err);
            res.send("出错了");
            return;
        }
        var dingdan=result[0].dingdan;
        var thelatestdingdan=dingdan[dingdan.length-1];
        var dingdanshangpins=eval(thelatestdingdan.dingdanshangpins);
        res.json({"shangpins":dingdanshangpins,
            "username":req.session.username});
    })
}
exports.getdingdanzongjia=function(req,res) {
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    db.find("user",{"username":req.session.username},function(err,result){
        if(err)
        {
            console.log(err);
            res.send("出错了");
            return;
        }
        var dingdan=result[0].dingdan;
        var thelatestdingdan=dingdan[dingdan.length-1];
        var dingdanshangpins=eval(thelatestdingdan.dingdanshangpins);
        res.json({"zongjia":thelatestdingdan.dingdanzongjia}
        );
    })
}
exports.getdingdaninfo=function(req,res) {
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    db.find("user",{"username":req.session.username},function(err,result){
        if(err)
        {
            console.log(err);
            res.send("出错了");
            return;
        }
        var dingdan=result[0].dingdan;
        var thelatestdingdan=dingdan[dingdan.length-1];
        var dingdanshangpins=eval(thelatestdingdan.dingdanshangpins);
        res.json({"dindanhao":thelatestdingdan.dingdanbiaoshi,
            "chuangjiantime":thelatestdingdan.chuangjiantime,}
        );
    })
}




//getdingdantishixinxi,wodedingdan,getdingdans和dingdanxiangqing都是为
//展示一个用户的各个订单相关情况的方法。对应的页面是wodedingdan.html.
exports.getdingdantishixinxi=function(req,res) {
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    db.find("user",{"username":req.session.username},function(err,result){
        if(err)
        {
            console.log(err);
            res.send("出错了");
            return;
        }
        var dingdan=result[0].dingdan;
        var thelatestdingdan=dingdan[dingdan.length-1];
        var dingdanshangpins=eval(thelatestdingdan.dingdanshangpins);
        res.json({"dingdanzhuangtai":thelatestdingdan.dingdanzhuangtai}
        );
    })
}
//exports.aftersuccesspay=function(req,res) {
//    if(req.session.login!="1"){
//        res.send("非法闯入啦，请登录！");
//        return;
//    }
//    db.find("user",{"username":req.session.username},function(err,result){
//        if(err)
//        {
//            console.log(err);
//            res.send("出错了");
//            return;
//        }
//        var dingdan=result[0].dingdan;
//        var thelatestdingdan=dingdan[dingdan.length-1];
//        var dingdanshangpins=eval(thelatestdingdan.dingdanshangpins);
//        res.render("aftersuccesspay",{
//            "login":1,
//            "username":req.session.username,
//            "dizhi":thelatestdingdan.dingdandizhi,
//            "dingdanshangpins":dingdanshangpins,
//            "dindanhao":thelatestdingdan.dingdanbiaoshi,
//            "chuangjiantime":thelatestdingdan.chuangjiantime,
//            "fahuoshijian":thelatestdingdan.fahuoshijian,
//            "zongjia":thelatestdingdan.dingdanzongjia,
//            "dingdanzhuangtai":thelatestdingdan.dingdanzhuangtai
//        });
//    })
//
//}


//wodedingdan方法是返回该用户所有订单
exports.wodedingdan=function(req,res) {
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;

    }

    db.find("user",{"username":req.session.username},function(err,result)
    {

    if(err)
    {
    console.log(err);
        return;
    }
        var dingdans=result[0].dingdan;
        for(var i=0;i<dingdans.length;i++)
        {
            dingdans[i].dingdanshangpins=eval(dingdans[i].dingdanshangpins);
        }
          console.log(dingdans);
            res.json({
                "dingdan":dingdans
            })




});
}
var duiyingzhuangtaii=["订单","待发货订单","待收货订单","待评价订单","退款订单","待付款订单"];
//getdingdans和wodedingdan不同之处在于，getdingdans是返回指定状态的那些订单。
exports.getdingdans=function(req,res) {
    if (req.session.login != "1") {
        res.send("非法闯入啦，请登录！");
        return;
    }
    console.log("1");
    if(req.query.type!=undefined&&req.query.type!="") {
        var type = req.query.type;

        console.log(type);
        var dingdanarray = [{"moren": "haha"}];
        db.find("user", {"username": req.session.username}, function (err, result) {
            if (err) {
                console.log(err);
                res.send("出错了");
                return;
            }
            if (result.length != 0) {
                var dingdans = result[0].dingdan;
                if (type == "0") {
                    for (var i = 1; i < dingdans.length; i++) {
                        dingdans[i].dingdanshangpins = eval(dingdans[i].dingdanshangpins);
                    }
                    if(dingdans.length==1)
                    {
                        res.send("没有该类订单");
                        return;
                    }
                    //res.render("wodedingdan",{
                    //
                    //    "login":"1",
                    //    "username":req.session.username,
                    //    "dingdan":dingdans,
                    //    "active":duiyingzhuangtaii[0]
                    //})
                    var json = {"dingdan": dingdans};
                    res.json(json);

                }
                else {
                    for (var i = 1; i < dingdans.length; i++) {
                        if (dingdans[i].dingdanzhuangtai == type) {
                            dingdanarray.push(dingdans[i]);
                        }
                    }
                    for (var i = 1; i < dingdanarray.length; i++) {
                        dingdanarray[i].dingdanshangpins = eval(dingdans[i].dingdanshangpins);
                    }
                    if (type == "3") {
                        console.log("满足待收货的订单的数量" + (dingdanarray.length - 1));
                    }
                    //res.render("wodedingdan",{
                    //
                    //    "login":"1",
                    //    "username":req.session.username,
                    //    "dingdan":dingdanarray,
                    //    "active":duiyingzhuangtaii[parseInt(type)]
                    //})
                    if(dingdanarray.length==1)
                    {
                        res.send("没有该类订单");
                        return;
                    }
                    var json = {"dingdan": dingdanarray};
                    res.json(json);
                }
            }
        })
    }

}
exports.dingdanxiangqing=function(req,res) {
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    var dingdanbiaoshi=req.query.dingdanbiaoshi;
    db.find("user",{"username":req.session.username},function(err,result){
        if(err)
        {
            console.log(err);
            res.send("出错了");
            return;
        }
        var thelatestdingdan;
        var dingdan=result[0].dingdan;
        for(var i=1;i<dingdan.length;i++)
        {
            if(dingdan[i].dingdanbiaoshi==dingdanbiaoshi)
            {
                thelatestdingdan=dingdan[i];
            }
        }

        var dingdanshangpins=eval(thelatestdingdan.dingdanshangpins);
        res.render("aftersuccesspay",{
            "login":1,
            "username":req.session.username,
            "dizhi":thelatestdingdan.dingdandizhi,
            "dingdanshangpins":dingdanshangpins,
            "dindanhao":thelatestdingdan.dingdanbiaoshi,
            "chuangjiantime":thelatestdingdan.chuangjiantime,
            "fahuoshijian":thelatestdingdan.fahuoshijian,
            "zongjia":thelatestdingdan.dingdanzongjia,
            "dingdanzhuangtai":thelatestdingdan.dingdanzhuangtai
        });
    })

}
exports.querenshouhuo=function(req,res) {
    if(req.session.login!="1"){
        res.send("非法闯入啦，请登录！");
        return;
    }
    if(req.query.dingdanbiaoshi!=undefined&&req.query.dingdanbiaoshi!="")
    {
        var dingdanbiaoshi=req.query.dingdanbiaoshi;
        db.find("dingdans",{"dingdanbiaoshi":dingdanbiaoshi},function(err,result){
            if(err)
            {
                console.log(err);
                res.send("-1");
                return;
            }
            if(result.length!=0)
            {
                if(result[0].dingdanzhuangtai=="2")
                {

                    var xiugaitime1=new Date();
                    var shouhuoshijian=xiugaitime1.getFullYear()+"年"+(xiugaitime1.getMonth()+1)+"月"+xiugaitime1.getDate()+"日"+xiugaitime1.getHours()+"时"+xiugaitime1.getMinutes()+"分"+xiugaitime1.getSeconds()+"秒";
                    db.updateMany("dingdans",{"dingdanbiaoshi":dingdanbiaoshi},{$set:{"dingdanzhuangtai":"3","shouhuoshijian":shouhuoshijian}},function(err,result){
                        if(err)
                        {
                            console.log(err);
                            res.send("-1");
                            return;
                        }
                        db.find("user",{"username":req.session.username},function(err,result1){
                            if(err)
                            {

                                console.log(err);
                                db.updateMany("dingdans",{"dingdanbiaoshi":dingdanbiaoshi},{$set:{"dingdanzhuangtai":"2","shouhuoshijian":""}},function(err,result) {
                                    if (err) {
                                        console.log(err);
                                        res.send("-1");
                                        return;
                                    }
                                    res.send("-1");
                                    return;
                                })
                            }
                            if(result1.length!=0)
                            {
                                var dingdans=result1[0].dingdan;
                                var j=-1;
                                for(var i=0;i<dingdans.length;i++)
                                {
                                    if(dingdans[i].dingdanbiaoshi==dingdanbiaoshi)
                                    {
                                        j=i;
                                        break;
                                    }
                                }
                                if(j==-1)
                                {
                                    res.send("-1");
                                    return;
                                }
                                dingdans[j].dingdanzhuangtai="3";
                                dingdans[j].shouhuoshijian=shouhuoshijian;
                                db.updateMany("user",{"username":req.session.username},{$set:{"dingan":dingdans}},function(err,result2){
                                    if(err)
                                    {

                                        console.log(err);
                                        db.updateMany("dingdans",{"dingdanbiaoshi":dingdanbiaoshi},{$set:{"dingdanzhuangtai":"2","shouhuoshijian":""}},function(err,result) {
                                            if (err) {
                                                console.log(err);
                                                res.send("-1");
                                                return;
                                            }
                                            res.send("-1");
                                            return;
                                        })
                                    }
                                    res.send("1");

                                })

                            }
                            else
                            {
                                res.send("-1");
                                return;
                            }

                        })
                    })
                }
                else
                {
                    res.send("-1");
                    return;
                }

            }
            else
            {
                res.send("-1");
                return;
            }
        })
    }
    else
    {
        res.send("-1");
    }
}




exports.checksprepeatname=function(req,res) {



      db.find("shangpin",{"shangpinname":req.query.shangpinname},function(err,result){

          if(result[0]==undefined||result[0]=='')
          {
                  res.send("1");
          }
          else{
              res.send("-1");
          }
      })

}

exports.addshangpin=function(req,res) {
   var filearray=[];
    var file3darray=[];
    var patharray=[];
    var path3darray=[];
    var moxingnamearraytemp=[];

    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.uploadDir=__dirname+"/../shangpin";
    form.parse(req, function (err, fields, files) {

            var shangpinpics1 = files.shangpinpics0;
            var shangpinpics2 = files.shangpinpics1;
            var shangpinpics3 = files.shangpinpics2;
            var shangpinpics4 = files.shangpinpics3;
            var shangpinpics5 = files.shangpinpics4;
            var shangpinpics6 = files.shangpinpics5;

        var moxingwenjian1 = files.moxingwenjian0;
        moxingnamearraytemp[0]=files.moxingwenjian0.name;
        var moxingwenjian2 = files.moxingwenjian1;
        if(files.moxingwenjian1!=undefined) {
            moxingnamearraytemp[1] = files.moxingwenjian2.name;
        }

        filearray.push(shangpinpics1);
        filearray.push(shangpinpics2);
        filearray.push(shangpinpics3);
        filearray.push(shangpinpics4);
        filearray.push(shangpinpics5);
        filearray.push(shangpinpics6);

        file3darray.push(moxingwenjian1);
        file3darray.push(moxingwenjian2);

        var shangpinname =  fields.shangpinname;
        var shangpindanjia =  fields.shangpindanjia;
        var shangpinjieshao =  fields.shangpinjieshao;
        var piccount =  fields.piccount;
        var moxingwenjiancount =  fields.moxingwenjiancount;
        var youfei=fields.youfei;
        var tuijianji=fields.tuijianji;
        var shangpintype=fields.shangpintype;
        var person="Administrator";
        var time=new Date();
        var xiugaitime1=new Date();
        var tianjiatime=xiugaitime1.getFullYear()+"年"+(xiugaitime1.getMonth()+1)+"月"+xiugaitime1.getDate()+"日"+xiugaitime1.getHours()+"时"+xiugaitime1.getMinutes()+"分"+xiugaitime1.getSeconds()+"秒";
        var shangpinhao = "" + time.getFullYear() + time.getMonth() + time.getDay() + time.getHours() + time.getMinutes() + time.getSeconds() + time.getMilliseconds()+parseInt(Math.random()*1000)+parseInt(Math.random()*100)+"";
        var lujing3d="/shangpin/"+shangpinhao+"/moxingwenjian/";
        iterator(0);
        function iterator(i){


            console.log("商品号:"+shangpinhao);
            console.log(i);
            if(i==piccount)
            {
                res.send("1");
                return;
            }
            var oldpath=filearray[i].path;
            var extname=path.extname(filearray[i].path);
            var shijianchuo2d=new Date();
            shijianchuo2d="2d"+shijianchuo2d+""+(parseInt(Math.random()*1000));
            var newpath=__dirname+"/../shangpin/"+shangpinhao+"/"+shijianchuo2d.getTime()+extname;
            var path1="/shangpin/"+shangpinhao+"/"+shijianchuo2d.getTime()+extname+"";

            patharray.push(path1);
            if(i==0) {
                db.find("shangpin", {"shangpinname":shangpinname}, function (err, result) {
                    if (err) {
                        console.log("查找出错");
                        console.log(err);
                        res.send("-1");
                        return;
                    }
                    if (result[0] == undefined || result[0] == ""||result.length==0) {


                        fs.mkdir(__dirname + "/../shangpin/" + shangpinhao, function (err) {
                            if (err) {
                                console.log(err);
                                res.send("-1");
                                return;
                            }
                            fs.mkdir(__dirname + "/../shangpin/" + shangpinhao+"/moxingwenjian", function (err) {
                                if (err) {
                                    console.log(err);
                                    res.send("-1");
                                    return;
                                }
                            fs.rename(oldpath, newpath, function (err) {
                                if (err) {
                                    console.log(err);
                                    throw Error("改名失败");
                                    res.send("-1");
                                    return;
                                }

                                gm(newpath).resize(200, 200).write(newpath, function (err) {
                                    if (err) {
                                        res.send("-1");
                                        console.log("resize不成功");
                                        console.log(err);
                                        return;
                                    }


                                    if (i == piccount - 1) {

                                        iterator1(0);
                                        function iterator1(j) {
                                            if (j == parseInt(moxingwenjiancount)) {
                                                db.insertOne("shangpin", {
                                                    "shangpinname": shangpinname,
                                                    "shangpindanjia": shangpindanjia,
                                                    "shangpinjieshao": shangpinjieshao,
                                                    "tianjiashijian": tianjiatime,
                                                    "shangpinpinglun": {},
                                                    "tianjiaren": person,
                                                    "shangpinhao": shangpinhao,
                                                    "shangpinpiccount": piccount,
                                                    "moxingwenjiancount": moxingwenjiancount,
                                                    "youfei": youfei,
                                                    "shangpintype": shangpintype,
                                                    "patharray": patharray,
                                                    "path3darray": path3darray,
                                                    "tuijianji": tuijianji,
                                                    "goumaicishu": 0,
                                                    "lastxiugaitime": tianjiatime,
                                                    "moxingnamearray":moxingnamearraytemp,
                                                    "shangpinzhuangtai":"1",
                                                    "lujing3d":lujing3d

                                                }, function (err, results) {
                                                    if (err) {
                                                        res.send("-1");
                                                        console.log(err);
                                                        console.log("inserOne不成功");
                                                        return;
                                                    }
                                                    iterator(i + 1);
                                                })
                                            }
                                            else {
                                                var oldpath1 = file3darray[j].path;
                                                var extname1 = path.extname(file3darray[j].path);
                                                var shijianchuo3d=new Date();
                                                shijianchuo3d="mx"+shijianchuo3d+""+(parseInt(Math.random()*1000));
                                                var newpath1 = __dirname + "/../shangpin/" + shangpinhao + "/moxingwenjian/" + shijianchuo3d  + extname1;
                                                var path11 = "/shangpin/" + shangpinhao + "/moxingwenjian/" + shijianchuo3d+ extname1;
                                                path3darray.push(path11);
                                                fs.rename(oldpath1, newpath1, function (err) {
                                                    if (err) {
                                                        console.log(err);
                                                        throw Error("改名失败");
                                                        res.send("-1");
                                                        return;

                                                    } else {
                                                        iterator1(j + 1);
                                                    }
                                                })
                                            }
                                        }

                                    } else {

                                        iterator(i + 1);
                                    }
                                })


                            });
                        })
                            })

                    }
                    else {
                        res.send("-1");
                    }
                });
            }
            else
            {
                fs.rename(oldpath, newpath, function (err) {
                    if (err) {
                        console.log(err);
                        throw Error("改名失败");
                        res.send("-1");
                        return;
                    }

                        gm(newpath).resize(200, 200).write(newpath, function (err) {
                            if (err) {
                                res.send("-1");
                                console.log("resize不成功");
                                console.log(err);
                                return;
                            }
                            if (i == piccount - 1) {
                                iterator1(0);
                                function iterator1(j) {
                                    if (j == parseInt(moxingwenjiancount)) {
                                        db.insertOne("shangpin", {
                                            "shangpinname": shangpinname,
                                            "shangpindanjia": shangpindanjia,
                                            "shangpinjieshao": shangpinjieshao,
                                            "tianjiashijian": tianjiatime,
                                            "shangpinpinglun": {},
                                            "tianjiaren": person,
                                            "shangpinhao": shangpinhao,
                                            "shangpinpiccount": piccount,
                                            "moxingwenjiancount": moxingwenjiancount,
                                            "youfei": youfei,
                                            "shangpintype": shangpintype,
                                            "patharray": patharray,
                                            "path3darray": path3darray,
                                            "tuijianji": tuijianji,
                                            "goumaicishu": 0,
                                            "lastxiugaitime": tianjiatime,
                                            "moxingnamearray":moxingnamearraytemp,
                                            "shangpinzhuangtai":"1",
                                            "lujing3d":lujing3d

                                        }, function (err, results) {
                                            if (err) {
                                                res.send("-1");
                                                console.log(err);
                                                console.log("inserOne不成功");
                                                return;
                                            }
                                            iterator(i + 1);
                                        })
                                    }
                                    else {
                                        var oldpath1 = file3darray[j].path;
                                        var extname1 = path.extname(file3darray[j].path);
                                        var shijianchuo3d=new Date();
                                        shijianchuo3d="mx"+shijianchuo3d+""+(parseInt(Math.random()*1000));
                                        var newpath1 = __dirname + "/../shangpin/" + shangpinhao + "/moxingwenjian" + "/" + shijianchuo3d+ extname1;
                                        var path11 = "/shangpin/" + shangpinhao + "/moxingwenjian" + "/" + shijianchuo3d + extname1 + "";
                                        path3darray.push(path11);
                                        fs.rename(oldpath1, newpath1, function (err) {
                                            if (err) {
                                                console.log(err);
                                                throw Error("改名失败");
                                                res.send("-1");
                                                return;

                                            } else {
                                                iterator1(j + 1);
                                            }
                                        })
                                    }
                                }

                            }
                            else {
                                iterator(i + 1);
                            }
                        })


                    });

            }
        }


})
}
exports.getshangpins= function(req,res) {
    db.find("shangpin",{"shangpinzhuangtai":"2"},function(err,result)
    {
         var json={"result":result};
        res.json(json);

    })

}
exports.getkefuxiugaishangpin= function(req,res) {
    var shangpinhao = req.query.shangpinhao;
    if (shangpinhao != undefined && shangpinhao != '' && (shangpinhao.indexOf("2017") != -1 || shangpinhao.indexOf("2018") != -1 || shangpinhao.indexOf("2026") != -1 || shangpinhao.indexOf("2019") != -1 || shangpinhao.indexOf("2020") != -1 || shangpinhao.indexOf("2021") != -1 || shangpinhao.indexOf("2022") != -1 || shangpinhao.indexOf("2023") != -1 || shangpinhao.indexOf("2024") != -1 || shangpinhao.indexOf("2025") != -1) && shangpinhao.length > 9) {
        {
            db.find("shangpin", {"shangpinhao": shangpinhao}, function (err, result) {
                if(err)
                {
                    console.log(err);
                    res.send("-1");
                    return;
                }
                if(result.length>0) {
                    console.log("对应的商品为:" + result[0]);
                    res.render("kefuxiugaishangpin", {"shangpin": result[0]});
                }
                else{
                    res.send("-1");
                }

            })
        }

    }
}
    exports.scshangpinpic = function (req, res) {
        var shangpinpicpath = req.query.shangpinpicpath;
        var shangpinpicpath1 = __dirname + "/.." + shangpinpicpath;
        console.log(shangpinpicpath);
        fs.unlink(shangpinpicpath1, function (err, result) {
            if (err) {
                console.log(err);
                res.send("-1");
                return;
            }
            db.find("shangpin", {"shangpinhao": req.query.shangpinhao}, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("-1");
                    return;
                }
                var shangpin = result[0];
                var piccount = shangpin.shangpinpiccount - 1;
                var patharray = shangpin.patharray;
                console.log("删除前的长度："+patharray.length);
                for (var i = 0; i < patharray.length; i++) {
                    if (patharray[i] == shangpinpicpath) {
                        patharray.splice(i,1);
                        console.log("jinlaile");

                    }
                }
                console.log("删除后的长度："+patharray.length);
                db.updateMany("shangpin", {"shangpinhao": req.query.shangpinhao}, {
                    $set: {
                        "patharray": patharray,
                        "shangpinpiccount": piccount
                    }
                }, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send("-1");
                        return;
                    }
                    res.send("1");
                })
            })

        });

    }
    exports.kefuxiugaioneshangpin = function (req, res) {
        var filearray=[];
        var file3darray=[];
        var moxingnamearraytemp=[];
        var form = new formidable.IncomingForm();
        form.keepExtensions = true;
        form.uploadDir = __dirname + "/../shangpin";
        form.parse(req, function (err, fields, files) {
            var shangpinhao = fields.shangpinhao;
            console.log("修改商品:"+shangpinhao);
            if (shangpinhao != undefined && shangpinhao != '') {
                var shangpinpics1 = files.shangpinpics0;
                var shangpinpics2 = files.shangpinpics1;
                var shangpinpics3 = files.shangpinpics2;
                var shangpinpics4 = files.shangpinpics3;
                var shangpinpics5 = files.shangpinpics4;
                var shangpinpics6 = files.shangpinpics5;
                if(files.moxingwenjian0!=undefined&&files.moxingwenjian0!="") {
                    var moxingwenjian1 = files.moxingwenjian0;

                    moxingnamearraytemp[0] = files.moxingwenjian0.name;
                }
                if(files.moxingwenjian1!=undefined&&files.moxingwenjian1!="")
                {
                var moxingwenjian2 = files.moxingwenjian1;
                moxingnamearraytemp[1] = files.moxingwenjian2.name;
                }
                filearray.push(shangpinpics1);
                filearray.push(shangpinpics2);
                filearray.push(shangpinpics3);
                filearray.push(shangpinpics4);
                filearray.push(shangpinpics5);
                filearray.push(shangpinpics6);

                file3darray.push(moxingwenjian1);
                file3darray.push(moxingwenjian2);




                console.log("修改商品:"+filearray.length);
                var shangpinname = fields.shangpinname;
                var shangpindanjia = fields.shangpindanjia;
                var shangpinjieshao = fields.shangpinjieshao;
                var piccount = fields.piccount;
                var moxingwenjiancount1=fields.moxingwenjiancount;
                var youfei = fields.youfei;
                var tuijianji = fields.tuijianji;
                var shangpintype = fields.shangpintype;
                var person = "Administrator";
                db.find("shangpin", {"shangpinhao": shangpinhao}, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send("-1");
                        return;
                    }
                    if(result.length>0) {
                        var patharray = result[0].patharray;
                        var count = patharray.length;
                        var path3darray = result[0].path3darray;
                        var count3d = path3darray.length;
                        var xiugaitime1 = new Date();
                        var moxingnamearray = result[0].moxingnamearray;
                        var flag3d = 0;
                        var time = xiugaitime1.getFullYear() + "年" + (xiugaitime1.getMonth() + 1) + "月" + xiugaitime1.getDate() + "日" + xiugaitime1.getHours() + "时" + xiugaitime1.getMinutes() + "分" + xiugaitime1.getSeconds() + "秒";
                        iterator(0);
                        function iterator(i) {

                            console.log("修改:" + i);
                            if ((i == parseInt(piccount) && flag3d == parseInt(moxingwenjiancount1)) || (i == parseInt(piccount) + 1 && flag3d == parseInt(moxingwenjiancount1))) {
                                res.send("1");
                                return;
                            } else if (i != parseInt(piccount)) {
                                var oldpath = filearray[i].path;
                                console.log(oldpath);
                                var extname = path.extname(filearray[i].path);
                                var shijianchuo2d = new Date();
                                shijianchuo2d = "2d" + shijianchuo2d + "" + (parseInt(Math.random() * 1000));
                                var newpath = __dirname + "/../shangpin/" + shangpinhao + "/" + shijianchuo2d + extname;
                                var path1 = "/shangpin/" + shangpinhao + "/" + shijianchuo2d + extname + "";
                                patharray.push(path1);
                                fs.rename(oldpath, newpath, function (err) {
                                    if (err) {
                                        console.log(err);
                                        throw Error("改名失败");
                                        res.send("-1");
                                        return;
                                    }

                                    gm(newpath).resize(200, 200).write(newpath, function (err) {
                                        if (err) {
                                            res.send("-1");
                                            console.log("resize不成功");
                                            console.log(err);
                                            return;
                                        }
                                        if (i == parseInt(piccount) - 1) {

                                            iterator1(0);
                                            function iterator1(j) {
                                                if (j == parseInt(moxingwenjiancount1)) {
                                                    db.updateMany("shangpin", {"shangpinhao": shangpinhao}, {
                                                        $set: {
                                                            "shangpinname": shangpinname,
                                                            "shangpindanjia": shangpindanjia,
                                                            "shangpinjieshao": shangpinjieshao,
                                                            "tianjiaren": person,
                                                            "shangpinpiccount": patharray.length,
                                                            "moxingwenjiancount": path3darray.length,
                                                            "youfei": youfei,
                                                            "shangpintype": shangpintype,
                                                            "patharray": patharray,
                                                            "path3darray": path3darray,
                                                            "tuijianji": tuijianji,
                                                            "lastxiugaitime": time,
                                                            "moxingnamearray": moxingnamearray,

                                                        }
                                                    }, function (err, results) {
                                                        if (err) {
                                                            res.send("-1");
                                                            console.log(err);
                                                            console.log("inserOne不成功");
                                                            return;
                                                        }
                                                        iterator(i + 1);
                                                    });
                                                }
                                                else {
                                                    var oldpath1 = file3darray[j].path;
                                                    var extname1 = path.extname(file3darray[j].path);
                                                    var shijianchuo3d = new Date();
                                                    shijianchuo3d = "mx" + shijianchuo3d + "" + (parseInt(Math.random() * 1000));
                                                    var newpath1 = __dirname + "/../shangpin/" + shangpinhao + "/moxingwenjian" + "/" + shijianchuo3d + extname1;
                                                    var path11 = "/shangpin/" + shangpinhao + "/moxingwenjian" + "/" + shijianchuo3d + extname1;
                                                    moxingnamearray.push(moxingnamearraytemp[j]);
                                                    path3darray.push(path11);
                                                    fs.rename(oldpath1, newpath1, function (err) {
                                                        if (err) {
                                                            console.log(err);
                                                            throw Error("改名失败");
                                                            res.send("-1");
                                                            return;

                                                        } else {
                                                            flag3d++;
                                                            iterator1(j + 1);
                                                        }
                                                    })
                                                }
                                            }


                                        } else {
                                            iterator(i + 1);
                                        }
                                    })


                                });
                            }
                            else if (i == parseInt(piccount) && i == 0) {

                                iterator1(0);
                                function iterator1(j) {
                                    if (j == parseInt(moxingwenjiancount1)) {
                                        db.updateMany("shangpin", {"shangpinhao": shangpinhao}, {
                                            $set: {
                                                "shangpinname": shangpinname,
                                                "shangpindanjia": shangpindanjia,
                                                "shangpinjieshao": shangpinjieshao,
                                                "tianjiaren": person,
                                                "shangpinpiccount": patharray.length,
                                                "moxingwenjiancount": path3darray.length,
                                                "youfei": youfei,
                                                "shangpintype": shangpintype,
                                                "patharray": patharray,
                                                "path3darray": path3darray,
                                                "tuijianji": tuijianji,
                                                "lastxiugaitime": time,
                                                "moxingnamearray": moxingnamearray,

                                            }
                                        }, function (err, results) {
                                            if (err) {
                                                res.send("-1");
                                                cosole.log(err);
                                                console.log("inserOne不成功");
                                                return;
                                            }
                                            iterator(i + 1);
                                        });
                                    }
                                    else {
                                        var oldpath1 = file3darray[j].path;
                                        var extname1 = path.extname(file3darray[j].path);
                                        var shijianchuo3d = new Date();
                                        shijianchuo3d = "mx" + shijianchuo3d + "" + (parseInt(Math.random() * 1000));
                                        var newpath1 = __dirname + "/../shangpin/" + shangpinhao + "/moxingwenjian" + "/" + shijianchuo3d + extname1;
                                        var path11 = "/shangpin/" + shangpinhao + "/moxingwenjian" + "/" + shijianchuo3d + extname1;
                                        moxingnamearray.push(moxingnamearraytemp[j]);
                                        path3darray.push(path11);
                                        fs.rename(oldpath1, newpath1, function (err) {
                                            if (err) {
                                                console.log(err);
                                                throw Error("改名失败");
                                                res.send("-1");
                                                return;

                                            } else {
                                                flag3d++;
                                                iterator1(j + 1);
                                            }
                                        })
                                    }
                                }
                            }

                        }
                    }
                })
            }
            else {
                res.send("-1");
                return;
            }

        })

    }
exports.getshangpinbyshangpinhao = function (req, res) {
    if(req.query!=undefined)
    {
        var shangpinhao = req.query.shangpinhao;
        if (shangpinhao != undefined && shangpinhao != "" && shangpinhao.length > 10) {
            db.find("shangpin", {"shangpinhao": shangpinhao}, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("-1");
                    return;
                }
                var json = {"shangpin": result[0]};
                res.json(json);
            })
        }
        else {
            res.send("-1");
        }
    }
    else {
        res.send("-1");
    }
}



exports.admin=function(req,res) {
   res.render("kefuindex");
}



//客服管理订单的所有方法。
//客服管理者登录的标志为rootlogin，如果是商家用户则为shangjialogin，普通用户为login；
exports.kefugetalldingdans=function(req,res) {


    db.find("dingdans",{},function(err,result){
        if(err)
        {
            console.log(err);
            res.send("-1");
            return;
        }
        var dingdans=result[0].dingdan;
        for(var i=0;i<dingdans.length;i++)
        {
            dingdans[i].dingdanshangpins=eval(dingdans[i].dingdanshangpins);
        }
        res.render("",{
            "dingdan":dingdans
        })
    })
}
exports.kefugetdingdanindex=function(req,res) {
    db.find("dingdans", {"dingdanzhuangtai":"1"}, function (err, result) {
        if (err) {
            console.log(err);
            res.send("-1");
            return;
        }
        //console.log(result);

        for(var i=0;i<result.length;i++)
        {
            result[i].dingdanshangpins=eval(result[i].dingdanshangpins);
        }
        res.render("kefudingdanindex", {"dingdan": result,"active":"1"});

    })
}
exports.kefugetonetypedingdans=function(req,res) {

    if(req.query!=undefined)
    {
        if(req.query.type!=undefined)
        {
            var type = req.query.type;
            if(type!="1"||type!="2"||type!="3"||type!="4" ||type!="5"|| type!= "6")
            {
                if (type != "" && type != undefined)
                {

                    db.find("dingdans", {"dingdanzhuangtai": type}, function (err, result) {
                        if (err) {
                            console.log(err);
                            res.send("-1");
                            return;
                        }
                        for(var i=0;i<result.length;i++)
                        {
                            result[i].dingdanshangpins=eval(result[i].dingdanshangpins);
                        }
                        res.render("kefudingdanindex", {"dingdan": result,"active":type});

                    })
                }
            }
        }
    }
}
//"待付款订单" "待发货订单","待收货订单","待评价订单","已完成订单""退款订单","垃圾订单"订单状态依次对应为0,1,2,3,4,5,6
var dingdanzhuangtaiarr=["","待发货","待用户收货","待用户评价","已完成订单","用户退款订单","垃圾订单"];
exports.kefuxiugaidingdanzhuangtai=function(req,res) {

    if(req.query!=undefined)
    {
        if (req.query.targetzhuangtai != undefined && req.query.targetzhuangtai != "" && req.query.dingdanbiaoshi != undefined && req.query.dingdanbiaoshi != ""&&req.query.username!= undefined && req.query.username!= ""&&req.query.prezhuangtai!= undefined && req.query.prezhuangtai!= "")
        {
            var targetzhuangtai = req.query.targetzhuangtai;
            var dingdanbiaoshi = req.query.dingdanbiaoshi;
            var prezhuangtai=req.query.prezhuangtai;
            var username=req.query.username;
            if (targetzhuangtai != "2" || targetzhuangtai != "3" || targetzhuangtai != "4" || targetzhuangtai != "5"|| targetzhuangtai != "6")
            {

                if(username!="") {
                    var xiugaitime1=new Date();
                    var xiugaitime=xiugaitime1.getFullYear()+"年"+(xiugaitime1.getMonth()+1)+"月"+xiugaitime1.getDate()+"日"+xiugaitime1.getHours()+"时"+xiugaitime1.getMinutes()+"分"+xiugaitime1.getSeconds()+"秒";
                    if(prezhuangtai=="1"){

                    }
                    db.updateMany("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, {$set: {"dingdanzhuangtai": targetzhuangtai}}, function (err, result) {
                        if (err) {
                            console.log(err);
                            res.send("-1");
                            return;
                        }

                        db.find("user", {"username": username}, function (err, result) {
                            if (err) {
                                console.log(err);

                                db.updateMany("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, {$set: {"dingdanzhuangtai": prezhuangtai}}, function (err, result) {
                                    if(err)
                                    {
                                        console.log(err);
                                        res.send("-1");
                                        return;
                                    }
                                    res.send("-1");
                                    return;
                                })
                            }
                            if (result) {
                                if (result.length != 0) {
                                    var dingdan = result[0].dingdan;
                                    var index=-1;
                                    for(var j=0;j<dingdan.length;j++)
                                    {
                                        if(dingdan[j].dingdanbiaoshi==dingdanbiaoshi)
                                        {
                                            index=j;
                                        }
                                    }
                                    dingdan[index].dingdanzhuangtai = targetzhuangtai;
                                    db.updateMany("user", {"username": username}, {$set: {"dingdan": dingdan}}, function (err, result) {
                                        if (err) {
                                            console.log(err);
                                            db.updateMany("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, {$set: {"dingdanzhuangtai": prezhuangtai}}, function (err, result) {
                                                if(err)
                                                {
                                                    console.log(err);
                                                    res.send("-1");
                                                    return;
                                                }
                                                res.send("-1");
                                                return;
                                            })
                                        }
                                        db.find("dingdans",{"dingdanbiaoshi":dingdanbiaoshi},function(err,result4){
                                            if(err)
                                            {
                                                console.log(err);
                                                res.send("-1");
                                                return;
                                            }
                                            var dingdanxinxixiugaijilu = result4[0].dingdanxinxixiugaijilu;
                                            var str=""+ xiugaitime+ ":   " ;

                                            str=str+"1.操作订单使订单状态从:"+dingdanzhuangtaiarr[parseInt(prezhuangtai)]+",变为:" + dingdanzhuangtaiarr[parseInt(targetzhuangtai)];

                                            dingdanxinxixiugaijilu.push(str);
                                            db.updateMany("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, {$set: {"dingdanxinxixiugaijilu": dingdanxinxixiugaijilu}}, function (err, result) {
                                                if (err) {
                                                    console.log(err);
                                                    res.send("-1");
                                                    return;
                                                }
                                                dingdan[index].dingdanxinxixiugaijilu = dingdanxinxixiugaijilu;
                                                db.updateMany("user", {"username": username}, {$set: {"dingdan": dingdan}}, function (err, result) {
                                                    if (err) {
                                                        console.log(err);
                                                        res.send("-1");
                                                        return;
                                                    }
                                                    res.send("1");
                                                })
                                            })
                                        })

                                    })

                                }
                                else {
                                    res.send("-1");
                                }
                            }
                            else {
                                res.send("-1");
                            }

                        })


                    })
                }


            }
            else {
                res.send("-1");
            }


        }
        else {
            res.send("-1");
        }

    }
    else {
        res.send("-1");
    }

}
exports.fahuoindex=function(req,res) {


      if(req.query)
      {

          if(true)
          {

              var dingdanbiaoshi=req.query.dingdanbiaoshi;
              console.log(dingdanbiaoshi);
              db.find("dingdans",{"dingdanbiaoshi":dingdanbiaoshi},function(err,result){
                  if(err)
                  {
                      console.log(err);
                      res.send("-1");
                      return;
                  }
                  if(result.length>0) {
                      console.log(result[0]);
                      result[0].dingdanshangpins = eval(result[0].dingdanshangpins);
                      res.render("fahuoindex",{
                          "dingdan":result[0]
                      })
                  }
                  else
                  {
                      res.send("-1");
                  }

              })
          }
      }
}
exports.fahuo=function(req,res) {
    if(req.query!=undefined)
    {
        if (req.query.dingdanbiaoshi != undefined && req.query.dingdanbiaoshi != ""&&req.query.username!= undefined && req.query.username!= ""&&req.query.wuliuhaoma!= undefined && req.query.wuliuhaoma!= "")
        {
            var wuliuhaoma=req.query.wuliuhaoma;
            var dingdanbiaoshi = req.query.dingdanbiaoshi;
            var username=req.query.username;
                if(username!="") {

                    var xiugaitime1=new Date();
                    var fahuoshijian=xiugaitime1.getFullYear()+"年"+(xiugaitime1.getMonth()+1)+"月"+xiugaitime1.getDate()+"日"+xiugaitime1.getHours()+"时"+xiugaitime1.getMinutes()+"分"+xiugaitime1.getSeconds()+"秒";
                    db.updateMany("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, {$set: {"dingdanzhuangtai": "2","wuliuhaoma":wuliuhaoma,"fahuoshijian":fahuoshijian}}, function (err, result1) {
                        if (err) {
                            console.log(err);
                            res.send("-1");
                            return;
                        }

                        db.find("user", {"username": username}, function (err, result) {
                            if (err) {
                                console.log(err);

                                db.updateMany("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, {$set: {"dingdanzhuangtai":"1","wuliuhaoma":"","fahuoshijian":""}}, function (err, result2) {
                                    if(err)
                                    {
                                        console.log(err);
                                        res.send("-1");
                                        return;
                                    }
                                    res.send("-1");
                                    return;
                                })
                            }
                            if (result) {
                                if (result.length != 0) {
                                    var dingdan = result[0].dingdan;
                                    var index=-1;
                                    for(var j=0;j<dingdan.length;j++)
                                    {
                                        if(dingdan[j].dingdanbiaoshi==dingdanbiaoshi)
                                        {
                                            index=j;
                                            break;
                                        }
                                    }
                                    dingdan[index].dingdanzhuangtai = "2";
                                    dingdan[index].wuliuhaoma=wuliuhaoma;
                                    dingdan[index].fahuoshijian=fahuoshijian;
                                    db.updateMany("user", {"username": username}, {$set: {"dingdan": dingdan}}, function (err, result) {
                                        if (err) {
                                            console.log(err);
                                            db.updateMany("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, {$set: {"dingdanzhuangtai": "1","wuliuhaoma":"","fahuoshijian":""}}, function (err, result) {
                                                if(err)
                                                {
                                                    console.log(err);
                                                    res.send("-1");
                                                    return;
                                                }
                                                res.send("-1");
                                                return;
                                            })
                                        }
                                        res.send("1");
                                    })

                                }
                                else {
                                    res.send("-1");
                                }
                            }
                            else {
                                res.send("-1");
                            }

                        })


                    })
                }



            else {
                res.send("-1");
            }


        }
        else {
            res.send("-1");
        }

    }
    else {
        res.send("-1");
    }
}
exports.kefudingdanxiangqing=function(req,res) {
    if(req.query!=undefined)
    {
        if (req.query.dingdanbiaoshi != undefined && req.query.dingdanbiaoshi != "")
        {
             var dingdanbiaoshi=req.query.dingdanbiaoshi;
            db.find("dingdans",{"dingdanbiaoshi":dingdanbiaoshi},function(err,result){
                if(err)
                {
                    console.log(err);
                    res.send("-1");
                    return;
                }
                if(result)
                {
                    if(result.length!=0)
                    {
                        result[0].dingdanshangpins = eval(result[0].dingdanshangpins);
                        res.render("kefudingdanxiangqing",{
                            "dingdan":result[0]
                        })
                    }else {
                        res.send("-1");
                    }
                }else {
                    res.send("-1");
                }
            })
        }
    }
}
exports.kefuxiugaionedingdanindex=function(req,res) {
    if(req.query!=undefined)
    {
        if (req.query.dingdanbiaoshi != undefined && req.query.dingdanbiaoshi != "")
        {
            var dingdanbiaoshi=req.query.dingdanbiaoshi;
            db.find("dingdans",{"dingdanbiaoshi":dingdanbiaoshi},function(err,result){
                if(err)
                {
                    console.log(err);
                    res.send("-1");
                    return;
                }
                if(result)
                {
                    if(result.length!=0)
                    {
                        result[0].dingdanshangpins = eval(result[0].dingdanshangpins);
                        res.render("kefuxiugaionedingdanindex",{
                            "dingdan":result[0]
                        })
                    }else {
                        res.send("-1");
                    }
                }else {
                    res.send("-1");
                }
            })
        }
        else {
            res.send("-1");
        }
    }
    else {
        res.send("-1");
    }
}
exports.kefuxiugaionedingdan=function(req,res) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
        if(err)
        {
            console.log(err);
            res.send("-1");
            return;
        }
        if(fields)
        {
            console.log(fields.paramcount);
            console.log(fields.username);
            console.log(fields.dingdanbiaoshi);
            console.log(fields.wuliuhaoma);
            console.log(fields);
            if(fields.paramcount!=undefined&&fields.username!=undefined&&fields.dingdanbiaoshi!=undefined&&fields.wuliuhaoma!=undefined)
            {

                if(fields.paramcount!=""&&fields.dingdanbiaoshi!=""&&fields.username!="")
                {
                    var paramcount=parseInt(fields.paramcount);


                    var xiugaitime1=new Date();
                    var xiugaitime=xiugaitime1.getFullYear()+"年"+(xiugaitime1.getMonth()+1)+"月"+xiugaitime1.getDate()+"日"+xiugaitime1.getHours()+"时"+xiugaitime1.getMinutes()+"分"+xiugaitime1.getSeconds()+"秒";
                    if(paramcount==1)
                    {
                        console.log("jinlaile2");
                            var wuliuhaoma=fields.wuliuhaoma;
                        var dingdanbiaoshi=fields.dingdanbiaoshi;
                            var username=fields.username;

                              var prewuliuhaoma;

                        db.find("dingdans",{"dingdanbiaoshi":dingdanbiaoshi},function(err,result3){
                            if(err)
                            {
                                console.log(err);
                                res.send("-1");
                                return;

                            }
                            prewuliuhaoma=result3[0].wuliuhaoma;
                            if(wuliuhaoma!=prewuliuhaoma) {


                                db.updateMany("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, {$set: {"wuliuhaoma": wuliuhaoma,}}, function (err, result1) {
                                    if (err) {
                                        console.log(err);
                                        res.send("-1");
                                        return;
                                    }

                                    db.find("user", {"username": username}, function (err, result) {
                                        if (err) {
                                            console.log(err);
                                            db.updateMany("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, {$set: {"wuliuhaoma": prewuliuhaoma}}, function (err, result2) {
                                                if (err) {
                                                    console.log(err);
                                                    res.send("-1");
                                                    return;
                                                }
                                                res.send("-1");
                                                return;
                                            })
                                        }
                                        if (result) {
                                            if (result.length != 0) {
                                                var dingdan = result[0].dingdan;
                                                var index=-1;
                                                for(var j=0;j<dingdan.length;j++)
                                                {
                                                    if(dingdan[j].dingdanbiaoshi==dingdanbiaoshi)
                                                    {
                                                        index=j;
                                                    }
                                                }
                                                dingdan[index].wuliuhaoma = wuliuhaoma;
                                                db.updateMany("user", {"username": username}, {$set: {"dingdan": dingdan}}, function (err, result) {
                                                    if (err) {
                                                        console.log(err);

                                                        db.updateMany("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, {$set: {"wuliuhaoma": prewuliuhaoma}}, function (err, result) {
                                                            if (err) {
                                                                console.log(err);
                                                                res.send("-1");
                                                                return;
                                                            }
                                                            res.send("-1");
                                                            return;
                                                        })

                                                    }
                                                    db.find("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, function (err, result4) {
                                                        if (err) {
                                                            console.log(err);
                                                            res.send("-1");
                                                            return;

                                                        }
                                                        var dingdanxinxixiugaijilu = result4[0].dingdanxinxixiugaijilu;
                                                        dingdanxinxixiugaijilu.push("" + xiugaitime + " :1.将订单的物流单号:" + prewuliuhaoma + ",修改为:" + wuliuhaoma);
                                                        db.updateMany("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, {$set: {"dingdanxinxixiugaijilu": dingdanxinxixiugaijilu}}, function (err, result) {
                                                            if (err) {
                                                                console.log(err);
                                                                res.send("-1");
                                                                return;
                                                            }
                                                            dingdan[index].dingdanxinxixiugaijilu = dingdanxinxixiugaijilu;
                                                            db.updateMany("user", {"username": username}, {$set: {"dingdan": dingdan}}, function (err, result) {
                                                                if (err) {
                                                                    console.log(err);
                                                                    res.send("-1");
                                                                    return;
                                                                }
                                                                res.send("1");
                                                            })
                                                        })
                                                    })
                                                })

                                            }
                                            else {
                                                res.send("-1");
                                            }
                                        }
                                        else {
                                            res.send("-1");
                                        }

                                    })


                                })
                            }
                            else {
                                res.send("1");
                            }

                        })
                    }
                    else
                    {

                        var wuliuhaoma=fields.wuliuhaoma;
                        var shouhuoren=fields.shouhuoren;
                        var shouhuorendianhua=fields.shouhuorendianhua;
                        var shouhuorendizhi=fields.shouhuorendizhi;
                        var dingdanbiaoshi=fields.dingdanbiaoshi;
                        var username=fields.username;

                        var prewuliuhaoma;


                        db.find("dingdans",{"dingdanbiaoshi":dingdanbiaoshi},function(err,result3) {
                            if (err) {
                                console.log(err);
                                res.send("-1");
                                return;

                            }

                            var dingdandizhi = result3[0].dingdandizhi;

                            var predingdandizhi = {};
                            predingdandizhi.name=result3[0].dingdandizhi.name;
                            predingdandizhi.dizhi=result3[0].dingdandizhi.dizhi;
                            predingdandizhi.dianhua=result3[0].dingdandizhi.dianhua;
                            predingdandizhi.biaoshi=result3[0].dingdandizhi.biaoshi;
                            prewuliuhaoma = result3[0].wuliuhaoma;
                            dingdandizhi.name = shouhuoren;
                            dingdandizhi.dianhua = shouhuorendianhua;
                            dingdandizhi.dizhi = shouhuorendizhi;
                            console.log("predingdandizhi.name:"+predingdandizhi.name);
                            console.log("shouhuoren:"+shouhuoren);
                            var wuliuisxiugai = 0;
                            var dianhuaisxiugai = 0;
                            var nameisxiugai = 0;
                            var dizhiisxiugai = 0;

                            if (predingdandizhi.dizhi!= dingdandizhi.dizhi) {
                                dizhiisxiugai = 1;
                            }
                            if (predingdandizhi.dianhua!=shouhuorendianhua) {
                                dianhuaisxiugai = 1;
                            }
                            if (predingdandizhi.name!=shouhuoren) {
                                console.log("nameisxiugai=1");
                                nameisxiugai = 1;
                                console.log(nameisxiugai);
                            }
                             if (prewuliuhaoma != wuliuhaoma) {
                                wuliuisxiugai = 1;
                            }

                            if (dizhiisxiugai ==1 || wuliuisxiugai ==1 || dianhuaisxiugai ==1 || nameisxiugai==1)
                            {

                                db.updateMany("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, {
                                    $set: {
                                        "wuliuhaoma": wuliuhaoma,
                                        "dingdandizhi": dingdandizhi
                                    }
                                }, function (err, result1) {
                                    if (err) {
                                        console.log(err);
                                        res.send("-1");
                                        return;
                                    }

                                    db.find("user", {"username": username}, function (err, result) {
                                        if (err) {
                                            console.log(err);
                                            db.updateMany("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, {
                                                $set: {
                                                    "wuliuhaoma": prewuliuhaoma,
                                                    "dingdandizhi": predingdandizhi
                                                }
                                            }, function (err, result2) {
                                                if (err) {
                                                    console.log(err);
                                                    res.send("-1");
                                                    return;
                                                }
                                                res.send("-1");
                                                return;
                                            })
                                        }
                                        if (result) {
                                            if (result.length != 0) {
                                                console.log("jinlaile5");
                                                var dingdan = result[0].dingdan;
                                                var index=-1;
                                                for(var j=0;j<dingdan.length;j++)
                                                {
                                                    if(dingdan[j].dingdanbiaoshi==dingdanbiaoshi)
                                                    {
                                                        index=j;
                                                    }
                                                }
                                                dingdan[index].wuliuhaoma = wuliuhaoma;
                                                dingdan[index].dingdandizhi.name = shouhuoren;
                                                dingdan[index].dingdandizhi.dizhi =shouhuorendizhi;
                                                dingdan[index].dingdandizhi.dianhua = shouhuorendianhua;
                                                db.updateMany("user", {"username": username}, {$set: {"dingdan": dingdan}}, function (err, result) {
                                                    if (err) {
                                                        console.log(err);

                                                        db.updateMany("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, {
                                                            $set: {
                                                                "wuliuhaoma": prewuliuhaoma,
                                                                "dingdandizhi": predingdandizhi
                                                            }
                                                        }, function (err, result) {
                                                            if (err) {
                                                                console.log(err);
                                                                res.send("-1");
                                                                return;
                                                            }
                                                            res.send("-1");
                                                            return;
                                                        })

                                                    }
                                                    db.find("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, function (err, result4) {
                                                        if (err) {
                                                            console.log(err);
                                                            res.send("-1");
                                                            return;

                                                        }

                                                        var dingdanxinxixiugaijilu = result4[0].dingdanxinxixiugaijilu;
                                                        var str=""+ xiugaitime+ ":   " ;
                                                        var xuhao=1;
                                                        if(wuliuisxiugai==1) {
                                                            str = str +xuhao+".将订单的物流单号:" + prewuliuhaoma + ",修改为:" + wuliuhaoma;
                                                            xuhao++;
                                                        }
                                                        if(nameisxiugai==1){
                                                            str=str+" "+xuhao+".将收货人:" + predingdandizhi.name + ",修改为:" + shouhuoren;
                                                            xuhao++;
                                                        }
                                                        if(dianhuaisxiugai==1){
                                                            str=str+" "+xuhao+".将收货人电话:" + predingdandizhi.dianhua + ",修改为:" + shouhuorendianhua;
                                                            xuhao++;
                                                        }
                                                        if(dizhiisxiugai==1){
                                                            str=str+" "+xuhao+".将收货人地址:"+ predingdandizhi.dizhi + ",修改为:" + shouhuorendizhi;
                                                        }
                                                        dingdanxinxixiugaijilu.push(str);

                                                        db.updateMany("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, {$set: {"dingdanxinxixiugaijilu": dingdanxinxixiugaijilu}}, function (err, result) {
                                                            if (err) {
                                                                console.log(err);
                                                                res.send("-1");
                                                                return;
                                                            }
                                                            dingdan[index].dingdanxinxixiugaijilu = dingdanxinxixiugaijilu;


                                                            db.updateMany("user", {"username": username}, {$set: {"dingdan": dingdan}}, function (err, result) {
                                                                if (err) {
                                                                    console.log(err);
                                                                    res.send("-1");
                                                                    return;
                                                                }

                                                                res.send("1");
                                                            })
                                                        })
                                                    })
                                                })

                                            }
                                            else {
                                                res.send("-1");
                                            }
                                        }
                                        else {
                                            res.send("-1");
                                        }

                                    })


                                })
                        }else{

                                res.send("1");
                            }

                        })





                    }


                }
            }
        }
    })
}
//客服删除一个订单后，用户那边也应该有相应的结果告知。
exports.kefudeleteonedingdan=function(req,res) {
    if(req.query!=undefined)
    {
        if (req.query.dingdanbiaoshi != undefined && req.query.dingdanbiaoshi != "")
        {
            var dingdanbiaoshi=req.query.dingdanbiaoshi;
            db.find("dingdans",{"dingdanbiaoshi":dingdanbiaoshi,"dingdanzhuangtai":"6"},function(err,result){
                if(err)
                {
                    console.log(err);
                    res.send("-1");
                    return;
                }
                if(result.length!=0)
                {
                    db.deleteMany("dingdans", {"dingdanbiaoshi": dingdanbiaoshi}, function (err, result) {
                        if (err) {
                            console.log(err);
                            res.send("-1");
                            return;
                        }
                        res.send("1");
                    })
                }
                else {
                    res.send("-1");
                }
            })
        }
        else {
            res.send("-1");
        }
    }
    else {
        res.send("-1");
    }
}

exports.getdingdanbydingdanhao=function(req,res) {

    if(req.query!=undefined)
    {

        if (req.query.dingdanbiaoshi != undefined && req.query.dingdanbiaoshi != "")
        {
            var dingdanbiaoshi=req.query.dingdanbiaoshi;
            db.find("dingdans",{"dingdanbiaoshi":dingdanbiaoshi},function(err,result){
                if(err)
                {
                    console.log(err);
                    res.send("-1");
                    return;
                }

                if(result.length!=0)
                {
                    res.send("1");
                }
                else {
                    res.send("-1");
                }
            })
        }
        else {
            res.send("-1");
        }
    }
    else {
        res.send("-1");
    }
}
exports.getdingdanbydingdanhao1=function(req,res) {

    if(req.query!=undefined)
    {

        if (req.query.dingdanbiaoshi != undefined && req.query.dingdanbiaoshi != "")
        {
            var dingdanbiaoshi=req.query.dingdanbiaoshi;
            console.log(dingdanbiaoshi);
            db.find("dingdans",{"dingdanbiaoshi":dingdanbiaoshi},function(err,result){
                if(err)
                {
                    console.log(err);
                    res.send("-1");
                    return;
                }
                if(result.length!=0)
                {
                    result[0].dingdanshangpins=eval(result[0].dingdanshangpins);
                    res.render("kefudingdanindex",{
                        "dingdan":result,
                        "active":"100"
                    });
                }
                else {
                    res.send("-1");
                }
            })
        }
        else {
            res.send("-1");
        }
    }
    else {
        res.send("-1");
    }
}
//客服商品功能
exports.kefushangpinindex=function(req,res) {
    db.find("shangpin", {"shangpinzhuangtai":"1"}, function (err, result) {

        res.render("kefushangpinindex", {"shangpins":result,"active": "1"});

    })


}
exports.kefugetonetypeshangpins=function(req,res) {
    if(req.query!=undefined)
    {
        if (req.query.type != undefined && req.query.type != "") {
            var type=req.query.type;
            if(type=="1"||type=="2"||type=="3") {
                db.find("shangpin", {"shangpinzhuangtai": type+""}, function (err, result) {
                    if(err)
                    {
                        console.log(err);
                        res.send("-1");
                        return;
                    }
                        res.render("kefushangpinindex", {"shangpins": result, "active": type});
                })
            } else{
                res.send("-1");
            }
        } else{
            res.send("-1");
        }
    } else{
        res.send("-1");
    }


}
exports.kefuaddshangpinindex= function(req,res) {
    res.render("kefuaddshangpin");
}
exports.kefushangpinxiangqingindex= function(req,res) {
    if(req.query!=undefined)
    {
        if (req.query.shangpinhao != undefined && req.query.shangpinhao != "") {
            var shangpinhao=req.query.shangpinhao;
                db.find("shangpin", {"shangpinhao": shangpinhao}, function (err, result) {
                    if(err)
                    {
                        console.log(err);
                        res.send("-1");
                        return;
                    }
                    if(result.length!=0)
                    {
                        res.render("kefushangpinxiangqing",{"shangpin":result[0]});
                    }
                    else{
                        res.send("-1");
                    }
                })

        }
    } else{
        res.send("-1");
    }

}

exports.kefushangpinshenhe= function(req,res) {
    if(req.query!=undefined)
    {
        if (req.query.shangpinhao != undefined && req.query.shangpinhao != "") {
            var shangpinhao=req.query.shangpinhao;
            db.updateMany("shangpin", {"shangpinhao": shangpinhao},{$set:{"shangpinzhuangtai":"2"}},function (err, result) {
                if(err)
                {
                    console.log(err);
                    res.send("-1");
                    return;
                }
                    res.send("1");

            })

        }
    } else{
        res.send("-1");
    }

}

exports.kefushangpindelete= function(req,res) {
    if(req.query!=undefined)
    {
        if (req.query.shangpinhao != undefined && req.query.shangpinhao != "") {
            var shangpinhao=req.query.shangpinhao;
            db.updateMany("shangpin", {"shangpinhao": shangpinhao},{$set:{"shangpinzhuangtai":"3"}},function (err, result) {
                if(err)
                {
                    console.log(err);
                    res.send("-1");
                    return;
                }
                res.send("1");

            })

        }
    } else{
        res.send("-1");
    }

}

exports.kefuxiugaioneshangpinindex= function(req,res) {
    if(req.query!=undefined)
    {
        if (req.query.shangpinhao != undefined && req.query.shangpinhao != "") {
            var shangpinhao=req.query.shangpinhao;
            db.find("shangpin", {"shangpinhao": shangpinhao},function (err, result) {
                if(err)
                {
                    console.log(err);
                    res.send("-1");
                    return;
                }
               if(result.length!=0)
               {
                   res.render("kefuxiugaioneshangpinindex",{"shangpin":result[0]});
               }
            })

        }
    } else{
        res.send("-1");
    }

}
exports.scshangpin3dpic= function(req,res) {
    if(req.query!=undefined)
    {
        if (req.query.shangpinhao != undefined && req.query.shangpinhao != ""&&req.query.shangpin3dpicpath != undefined && req.query.shangpin3dpicpath != "") {
            var shangpinhao = req.query.shangpinhao;
            var shangpin3dpicpath=req.query.shangpin3dpicpath+"";
            var shangpin3dpicpath1 = __dirname + "/.." +shangpin3dpicpath;
            console.log(shangpin3dpicpath);
            console.log(shangpin3dpicpath1);
            fs.unlink(shangpin3dpicpath1, function (err, result) {
                if (err) {
                    console.log(err);
                    res.send("-1");
                    return;
                }
                db.find("shangpin", {"shangpinhao": shangpinhao}, function (err, result) {
                    if (err) {
                        console.log(err);
                        res.send("-1");
                        return;
                    }
                    var shangpin = result[0];
                    var moxingwenjiancount = parseInt(shangpin.moxingwenjiancount) - 1;
                    var path3darray = shangpin.path3darray;
                    var moxingnamearray = shangpin.moxingnamearray;
                    console.log("删除前的长度："+path3darray.length);
                    for (var i = 0; i < path3darray.length; i++) {
                        if (path3darray[i] == shangpin3dpicpath) {
                            path3darray.splice(i,1);
                            console.log("jinlaile");
                            moxingnamearray.splice(i,1);
                        }
                    }
                    console.log("删除后的长度："+path3darray.length);
                    db.updateMany("shangpin", {"shangpinhao": req.query.shangpinhao}, {
                        $set: {
                            "path3darray": path3darray,
                            "moxingwenjiancount": moxingwenjiancount,
                            "moxingnamearray":moxingnamearray
                        }
                    }, function (err, result) {
                        if (err) {
                            console.log(err);
                            res.send("-1");
                            return;
                        }
                        res.send("1");
                    })
                })

            });
        }
        else
        {
            res.send("-1");
        }

    }
    else
    {
        res.send("-1");
    }


}

exports.getshangpinbyshangpinhao=function(req,res) {
    console.log("jinlaile");
    if(req.query!=undefined)
    {

        if (req.query.shangpinhao != undefined && req.query.shangpinhao != "")
        {
            var shangpinhao=req.query.shangpinhao;
            db.find("shangpin",{"shangpinhao":shangpinhao},function(err,result){
                if(err)
                {
                    console.log(err);
                    res.send("-1");
                    return;
                }

                if(result.length!=0)
                {
                    res.send("1");
                }
                else {
                    res.send("-1");
                }
            })
        }
        else {
            res.send("-1");
        }
    }
    else {
        res.send("-1");
    }
}
exports.getshangpinbyshangpinhao1=function(req,res) {

    if(req.query!=undefined)
    {

        if (req.query.shangpinhao != undefined && req.query.shangpinhao != "")
        {
            var shangpinhao=req.query.shangpinhao;
            db.find("shangpin",{"shangpinhao":shangpinhao},function(err,result){
                if(err)
                {
                    console.log(err);
                    res.send("-1");
                    return;
                }

                if(result.length!=0)
                {
                    res.render("kefushangpinindex",{
                        "shangpins":result,
                        "active":"100"
                    });
                }
                else {
                    res.send("-1");
                }
            })
        }
        else {
            res.send("-1");
        }
    }
    else {
        res.send("-1");
    }
}
exports.kefurealdeleteshangpin=function(req,res) {

    if(req.query!=undefined)
    {

        if (req.query.shangpinhao != undefined && req.query.shangpinhao != "")
        {
            var shangpinhao=req.query.shangpinhao;
            db.find("shangpin",{"shangpinhao":shangpinhao},function(err,result){
                if(err)
                {
                    console.log(err);
                    res.send("-1");
                    return;
                }

                if(result.length!=0&&result[0].shangpinzhuangtai=="3")
                {
                    db.deleteMany("shangpin",{"shangpinhao":shangpinhao},function(err,result){
                        if(err)
                        {
                            console.log(err);
                            res.send("-1");
                            return;
                        }
                        res.send("1");
                    })
                }
                else {
                    res.send("-1");
                }
            })
        }
        else {
            res.send("-1");
        }
    }
    else {
        res.send("-1");
    }
}







exports.piliangcaozuozizhi=function(req,res) {
    //db.find("dingdans",{},function(err,result){
    //    var dingdans=result;
    //
    //    iterator(0);
    //    function iterator(i)
    //    {
    //        if(i==dingdans.length)
    //        {
    //            res.send("1");
    //            return;
    //        }
    //        dingdans[i].dingdandizhi.dizhi=""+dingdans[i].dingdandizhi.pro+ dingdans[i].dingdandizhi.city+ dingdans[i].dingdandizhi.area+ dingdans[i].dingdandizhi.jutidizhi;
    //        db.updateMany("dingdans",{"dingdanbiaoshi":dingdans[i].dingdanbiaoshi},{$set:{"dingdandizhi": dingdans[i].dingdandizhi,"dingdanxinxixiugaijilu":[""]}},function(err,result){
    //             iterator(i+1);
    //        })
    //
    //    }
    //
    //
    //
    //
    //})
    db.find("dingdans",{},function(err,result){
        var dingdans=result;
        iterator(0);
        function iterator(i)
        {
            if(i==dingdans.length)
            {
                res.send("1");
                return;
            }
            db.updateMany("dingdans",{"dingdanbiaoshi":dingdans[i].dingdanbiaoshi},{$set:{"dingdanxinxixiugaijilu":[""]}},function(err,result){
                iterator(i+1);
            })

        }
    })
}
