/**
 * Created by asus on 2017/2/15.
 */
var express=require("express");
var app=express();
var router=require("./control/router.js");
var session=require("express-session");
app.use(express.static("./public"));
app.use("/avatar",express.static("./avatar"));
app.use("/shangpin",express.static("./shangpin"));
app.use("/diyimg",express.static("./diyimg"));
app.use("/views",express.static("./views"));
app.set("view engine","ejs");


app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    //res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// app.get('/getOne3dModel', function(req, res) {
//     res.send({
//         shangpinhao : req.query.shangpinhao
//     });
// });

app.use(session({
    secret:"keyboard cat",
    resave:false,
    saveUninitialized:true
}));

app.get("/",router.admin);
//app.get("/regist",router.showRegist);
app.post("/doregist",router.doregist);
//app.get("/test",router.showtest);
//app.post("/dotest",router.dotest);
//app.get("/login",router.showlogin);
app.get("/get",router.get);
app.get("/get1",router.get1);
app.get("/getinfo",router.getinfo);
app.post("/dologin",router.dologin);
//app.get("/shezhi",router.showshezhi);
//app.post("/doshezhi",router.doshezhi);

//app.get("/upavatar",router.showupavatar);
//app.post("/doupavatar",router.doupavatar);
//app.get("/showcut",router.showcut);
app.post("/docut",router.docut);
app.get("/tuichu",router.tuichu);
app.post("/postshuoshuo",router.doshuoshuo);
app.get("/getallshuoshuo",router.getallshuoshuo);
app.get("/getallshuoshuo1",router.getallshuoshuo1);//列出所有说说Ajax服务
app.get("/getuserinfo",router.getuserinfo);
app.get("/getshuoshuoamount",router.getshuoshuoamount);
app.get("/getshuoshuoamount1",router.getshuoshuoamount1);
app.get("/shanchushuoshuo",router.shanchushuoshuo);
//app.get("/showuserindex",router.showuserindex);
app.get("/dianzan",router.dianzan);
//app.get("/huati",router.huati);
//app.get("/yanzhengma",router.yanzhengma);
app.get("/scyanzhengma",router.scyanzhengma);
//app.get("/gerenzhongxin",router.gerenzhongxin);
app.get("/dizhiguanli",router.dizhiguanli);
//app.get("/tianjiadizhi",router.tianjiadizhi);
app.post("/adddizhi",router.adddizhi);
app.get("/shanchudizhi",router.shanchudizhi);
app.get("/xiugaidizhiindex",router.xiugaidizhiindex);
app.post("/xiugaidizhi",router.xiugaidizhi);
app.get("/morendizhi",router.morendizhi);
app.get("/testusername",router.testusername);
app.get("/testemail",router.testemail);
app.get("/mimazhaohui",router.mimazhaohui);
//app.get("/findmima",router.findmima);
//app.get("/gouwucheindex",router.gouwuche);
//app.get("/dodiy",router.dodiy);
app.post("/adddiy",router.adddiy);
app.get("/getgouwuche",router.getgouwuche);
app.get("/checkbox",router.checkbox);

//管理用户信息
app.get("/userList",router.userList);

//普通用户有关订单的操作
app.post("/createdingdan",router.createdingdan);
app.get("/showdingdan",router.showdingdan);
app.get("/getzongjia",router.getzongjia);
app.get("/getdingdanshangpin",router.getdingdanshangpin);
app.get("/getdingdanzongjia",router.getdingdanzongjia);
app.get("/getdingdaninfo",router.getdingdaninfo);
app.get("/getdingdantishixinxi",router.getdingdantishixinxi);
app.post("/goumai",router.goumai);
//app.get("/aftersuccesspay",router.aftersuccesspay);
app.get("/wodedingdan",router.wodedingdan);
app.get("/getdingdans",router.getdingdans);
app.get("/dingdanxiangqing",router.dingdanxiangqing);
app.get("/querenshouhuo",router.querenshouhuo);



app.get("/checksprepeatname",router.checksprepeatname);
app.post("/addshangpin",router.addshangpin);
app.get("/getshangpins",router.getshangpins);
app.get("/getkefuxiugaishangpin",router.getkefuxiugaishangpin);
app.get("/scshangpinpic",router.scshangpinpic);

app.get("/getshangpinbyshangpinhao",router.getshangpinbyshangpinhao);
app.get("/autologin",router.autologin);
app.get("/getavatar",router.getavatar);

//用户Diy路由
//后台商家获得模型
app.get("/get3dModel",router.get3dModel);
//前台用户获得模型
app.get("/getOne3dModel",router.getOne3dModel);

//客服订单路由
app.get("/kefuxiugaidingdanzhuangtai",router.kefuxiugaidingdanzhuangtai);
app.get("/kefugetonetypedingdans",router.kefugetonetypedingdans);
app.get("/kefugetdingdanindex",router.kefugetdingdanindex);
app.get("/fahuoindex",router.fahuoindex);
app.get("/fahuo",router.fahuo);
app.get("/kefudingdanxiangqing",router.kefudingdanxiangqing);
app.get("/kefuxiugaionedingdanindex",router.kefuxiugaionedingdanindex);
app.post("/kefuxiugaionedingdan",router.kefuxiugaionedingdan);
app.get("/piliangcaozuozizhi",router.piliangcaozuozizhi);//开发测试有些订单属性会改方便批量修改订单属性。
app.get("/kefudeleteonedingdan",router.kefudeleteonedingdan);
app.get("/getdingdanbydingdanhao",router.getdingdanbydingdanhao);
app.get("/getdingdanbydingdanhao1",router.getdingdanbydingdanhao1);
////客服商品路由
app.get("/kefushangpinindex",router.kefushangpinindex);
//按状态查找商品 1：待审核 2：已上线 3：回收站
app.get("/kefugetonetypeshangpins",router.kefugetonetypeshangpins);
//添加商品
app.get("/kefuaddshangpinindex",router.kefuaddshangpinindex);
//商品详情
app.get("/kefushangpinxiangqingindex",router.kefushangpinxiangqingindex);
//3D预览
app.get("/shangpin3Dyulan",router.shangpin3Dyulan);
//商品审核
app.get("/kefushangpinshenhe",router.kefushangpinshenhe);
//商品删除
app.get("/kefushangpindelete",router.kefushangpindelete);
//修改one商品get
app.get("/kefuxiugaioneshangpinindex",router.kefuxiugaioneshangpinindex);
//修改素材，更新路径
app.get("/scshangpin3dpic",router.scshangpin3dpic);
//修改one商品post
app.post("/kefuxiugaioneshangpin",router.kefuxiugaioneshangpin);
//按商品号查找 res.send("1")
app.get("/getshangpinbyshangpinhao",router.getshangpinbyshangpinhao);
//按商品号查找res.render("kefushangpinindex")
app.get("/getshangpinbyshangpinhao1",router.getshangpinbyshangpinhao1);
//彻底删除
app.get("/kefurealdeleteshangpin",router.kefurealdeleteshangpin);
app.listen(3001);