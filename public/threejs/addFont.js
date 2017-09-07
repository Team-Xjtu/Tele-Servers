    var content = document.getElementById("content");
    var width = content.offsetWidth;
    var height = content.offsetHeight;
    var plane;
    var text;
    var texts = [];
    var mouse = new THREE.Vector2(), offset = new THREE.Vector3(), SELECTED;
    function add3Dfont(scene,content,size,height,font,color){

        if(text){
            scene.remove(text);
            texts = [];
        }

        var controls = new function () {

            this.x = 0;
            this.y = 0;
            this.z = 30;
            this.size = size*10;
            this.height = height*10;
            this.font = font;
            this.weight = "bold";

            this.asGeom = function () {

                var fontJsonUrl = 'font/'+controls.font+'.json';
                var loader = new THREE.FontLoader();
                loader.load(fontJsonUrl,function(response){
                    var fontUrl = response;
                    var textGeometry = new THREE.TextGeometry(content,{
                        "font" : fontUrl,
                        "size" : controls.size,
                        "height" : controls.height
                    });
                    text = createMesh(textGeometry);
                    text.position.x = controls.x;
                    text.position.y = controls.y;
                    text.position.z = controls.z;
                    scene.add(text);
                    texts.push(text);
                    alert("添加成功");
                });

            };
            //参数x，y
            this.initMove = function() {
                plane = new THREE.Mesh(
                    new THREE.PlaneGeometry( 450, 950, 10, 10 ),
                    new THREE.MeshBasicMaterial(
                        {   color: 0x00FFFF,
                            opacity: 0.1,
                            transparent: true,
                            wireframe: true
                        }
                    )
                );
                //参数z
                plane.position.z = 30;
                plane.visible = true;
                scene.add( plane );
            };

        };

        controls.asGeom();
        controls.initMove();

        noText = true;

        function createMesh(geom) {

            var meshMaterial = new THREE.MeshLambertMaterial({
                color: color
            });

            var plane = new THREE.Mesh(geom, meshMaterial);

            return plane;
        }
    }

    var vector = new THREE.Vector3();
    var raycaster = new THREE.Raycaster();

    //当鼠标移动时触发的事件
    function onDocumentMouseMove( event ) {
        //阻止本来的默认事件，比如浏览器的默认右键事件是弹出浏览器的选项
        event.preventDefault();

        mouse.x = ( event.touches[0].clientX / width ) * 2 - 1;
        mouse.y = - ( event.touches[0].clientY / height ) * 2 + 1;

        //新建一个三维变换半单位向量 假设z方向就是0.5,这样我左右移的时候，还会有前后移的效果
        //var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
        vector.x = mouse.x;
        vector.y = mouse.y;
        vector.z = 0.5;

        //屏幕和场景转换工具根据照相机，把这个向量从屏幕转化为场景中的向量
        vector.unproject(camera);

        //vector.sub( camera.position ).normalize()变换过后的向量vector减去相机的位置向量后标准化
        //新建一条从相机的位置到vector向量的一道光线
        //var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
        raycaster.ray.origin = camera.position;
        raycaster.ray.direction = vector.sub( camera.position ).normalize();
        SELECTED = texts[0];
        //是否有东西被选中
        if ( SELECTED ) {
            //有的话取到这条光线射到的物体所在水平面上所有相交元素的集合,所以这样就可以限制每次拖动距离不能超出水平面panel
            var intersects = raycaster.intersectObject( plane );
            //这个鼠标点中的点的位置减去偏移向量，新位置赋值给选中物体
            if(intersects.length > 0){
                SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );
            }
        }else{
            return;
        }
    }
