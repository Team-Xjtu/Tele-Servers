/**
 * Created by xungong on 2017/7/16.
 */

    var scene;
    var camera;
    var webGLRenderer;

    var index = 1;

    var orbitControls;
    var clock;

    var canvas = document.getElementById("canvid1");
    var back;
    var mesh;
    var isDiy = false;

    function createThree(fileUrl,id,imageUrl) {
        var content = document.getElementById(id);
        var width = content.offsetWidth/index;
        var height = content.offsetHeight/index;
        console.log(width+","+height);
        threeStart(width,height,content);
        if(imageUrl == ""){
            loadModelDiy(fileUrl);
        }else{
            loadModel(fileUrl,imageUrl);
        }
        initThree(id,width,height);
        render();
    }

    function threeStart(width,height,content) {
        initScene();
        initCamera(width,height,content);
        initLight();
    }

    function initScene() {
        scene = new THREE.Scene();
    }
    //相机参数
    function initCamera(width,height,content) {
        camera = new THREE.PerspectiveCamera(60, width / height, 10, 10000);
        camera.position.x = 0;
        camera.position.y = 0;
        camera.position.z = 1000;
        camera.lookAt(scene.position);
        var axes = new THREE.AxisHelper(1000);
        scene.add(axes);
        orbitControls = new THREE.OrbitControls(camera,content);
        clock = new THREE.Clock();
    }

    function initThree(id,width,height) {
        webGLRenderer = new THREE.WebGLRenderer();
        webGLRenderer.setClearColor(new THREE.Color(0xFFFFFF, 1.0));
        webGLRenderer.setSize(width, height);
        webGLRenderer.shadowMapenabled = true;
        document.getElementById(id).appendChild(webGLRenderer.domElement);
    }

    function initLight() {
        var spotLightFront = new THREE.PointLight(0xFFFFFF);
        spotLightFront.position.set(0, 5000, 3000);
        spotLightFront.intensity = 2;
        scene.add(spotLightFront);
        var spotLightBack= new THREE.PointLight(0xeeeeee);
        spotLightBack.position.set(0, 5000, -3000);
        spotLightBack.intensity = 2;
        scene.add(spotLightBack);
    }

    var onProgress = function(xhr) {
        if(xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete,2) + '% downloaded');
        }
    };

    var onError = function(xhr) {

    };

    function loadModelDiy(fileUrl) {
        var loader = new THREE.JSONLoader();
        loader.load(fileUrl, function (geometry, material) {
            console.log("材质图片的个数："+material.length);
            document.querySelector("#materialCount").innerHTML = material.length + " 个";
            var options = '';
            for(var i = 0; i < material.length; i++){
                options = options + '<option>'+(i+1)+'</option>'
            }
            $("#materialIndex").append(options);
            mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xEEEEEE}));
            mesh.rotation.y = -1 * Math.PI;
            scene.add(mesh);
        }, onProgress,onError);
    }

    function loadModel(fileUrl,imageUrl) {
        var loader = new THREE.JSONLoader();
        loader.load(fileUrl, function (geometry, material) {
            document.querySelector("#materialCount").innerHTML = material.length + " 个";
            var mats = [];
            for(var i = 0; i < material.length; i++){
                if(i !== (material.length-1)){
                    var texture = THREE.ImageUtils.loadTexture(imageUrl[i]);
                    var side = new THREE.MeshPhongMaterial();
                    side.map = texture;
                    mats.push(side);
                }else{
                    mats.push(new THREE.MeshBasicMaterial({color: 0xFF0000}));
                }
            }
            //mats.push(new THREE.MeshBasicMaterial({color: 0xBCEE68}));
            // var texture1 = THREE.ImageUtils.loadTexture("images/Iphone5_specular.png");
            // var side = new THREE.MeshPhongMaterial();
            // side.map = texture1;
            // mats.push(side);
            //
            // //mats.push(new THREE.MeshBasicMaterial({color: 0xB03060}));
            // var texture2 = THREE.ImageUtils.loadTexture("images/Iphone5_Screen.png");
            // var front = new THREE.MeshPhongMaterial();
            // front.map = texture2;
            // mats.push(front);

            // var texture3;
            // // mats.push(new THREE.MeshBasicMaterial({color: 0xB03060}));
            // if(imageUrl == ""){
            //     texture3 = new THREE.Texture(canvas);
            // }else{
            //     texture3 = THREE.ImageUtils.loadTexture(imageUrl);
            // }
            // back = new THREE.MeshPhongMaterial();
            // back.map = texture3;
            // mats.push(back);
            //mats.push(new THREE.MeshBasicMaterial({color: 0xFF0000}));
            //
            //         for (var x = 0; x < mats.length; x++) {
            //             if(mats[x].color.r == "1" && mats[x].color.g == "0" && mats[x].color.b == "0"){
            //                 var texture = new THREE.Texture(canvas);
            //                 back = new THREE.MeshPhongMaterial();
            //                 back.map = texture;
            //                 mats[x] = back;
            //             }
            //         }
            //faceMaterial = new THREE.MeshFaceMaterial(mats);
            mesh = new THREE.Mesh(geometry, mats);
            // mesh.rotation.y = -1 * Math.PI;
            scene.add(mesh);
        }, onProgress,onError);
    }

    function render() {

        if (mesh && isDiy) {
            //back.map.needsUpdate = true;
            mesh.material.needsUpdate = true;
        }
        //if (isDiy) {
            var delta = clock.getDelta();
            orbitControls.update(delta);
        //}
        requestAnimationFrame(render);
        webGLRenderer.render(scene, camera);

    }

    function save() {
        download();
    }

    function download() {
        var type = 'png';
        var imgdata = canvas.toDataURL(type);
        //将mime-type改为image/octet-stream,强制让浏览器下载
        var fixtype = function (type) {
            type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
            var r = type.match(/png|jpeg|bmp|gif/)[0];
            return 'image/' + r;
        };
        imgdata = imgdata.replace(fixtype(type), 'image/octet-stream');
        //将图片保存到本地
        var saveFile = function (data, filename) {
            var link = document.createElement('a');
            link.href = data;
            link.download = filename;
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            link.dispatchEvent(event);
        };
        var filename = 'a.' + type;
        saveFile(imgdata, filename);
    }

    function addFont() {
        var content = $("input[name='text']").val();
        var size = $("input[name='sizeVal']").val();
        var height = $("input[name='heightVal']").val();
        var font = $("select[name='font']").val();
        var color = $("input[name='colorVal']").val();
        if(content == ""){
            alert("输入文字");
        }
        if(size == ""){
            size = 1;
        }
        add3Dfont(scene,content,size,height,font,color);
    }

    function clearFont(){
        $("input[name='text']").val("");
        if(text){
            scene.remove(text);
            texts = [];
            noText = false;
        }else{
            alert("没有文字");
        }
    }
