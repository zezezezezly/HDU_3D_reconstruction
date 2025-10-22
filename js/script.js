// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 平滑滚动到锚点
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 初始化3D模型
    init3DModel();

    // 表单提交处理
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('感谢您的留言！在实际应用中，您的信息将被发送到我们的服务器。');
            this.reset();
        });
    }
});

// 滚动时导航栏效果
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    } else {
        header.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
    }
});

// 初始化3D模型
function init3DModel() {
    const modelViewer = document.getElementById('model-viewer');
    if (!modelViewer) return;

    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // 创建相机
    const camera = new THREE.PerspectiveCamera(75, modelViewer.clientWidth / modelViewer.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(modelViewer.clientWidth, modelViewer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    modelViewer.innerHTML = '';
    modelViewer.appendChild(renderer.domElement);

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // 添加控制器
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // 默认设置
    controls.enableRotate = true;   // 启用旋转
    controls.enablePan = true;      // 启用平移
    controls.enableZoom = true;     // 启用缩放

    // 加载3D模型
    const loader = new THREE.OBJLoader();
    
    // 显示加载提示
    const loadingContainer = document.createElement('div');
    loadingContainer.className = 'model-loading';
    
    const loadingSpinner = document.createElement('div');
    loadingSpinner.className = 'model-loading-spinner';
    
    const loadingText = document.createElement('div');
    loadingText.innerText = '3D模型加载中...';
    
    loadingContainer.appendChild(loadingSpinner);
    loadingContainer.appendChild(loadingText);
    modelViewer.appendChild(loadingContainer);

    loader.load(
        'models/interior.obj',
        function (object) {
            // 移除加载提示
            modelViewer.removeChild(loadingContainer);
            
            // 将模型添加到场景中
            scene.add(object);
            
            // 调整模型位置和大小
            object.scale.set(0.01, 0.01, 0.01);
            object.position.set(0, -1, 0);
            
            // 为模型添加材质
            object.traverse(function (child) {
                if (child.isMesh) {
                    child.material = new THREE.MeshPhongMaterial({
                        color: 0xaaaaaa,
                        specular: 0x111111,
                        shininess: 50
                    });
                }
            });
        },
        function (xhr) {
            // 加载进度
            const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
            loadingText.innerText = `3D模型加载中... ${percent}%`;
        },
        function (error) {
            // 加载失败
            console.error('加载3D模型时出错:', error);
            loadingText.innerText = '模型加载失败，请检查文件';
        }
    );

    // 窗口大小调整
    window.addEventListener('resize', function() {
        camera.aspect = modelViewer.clientWidth / modelViewer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(modelViewer.clientWidth, modelViewer.clientHeight);
    });

    // 添加模型控制事件监听器
    let dragModeEnabled = false;
    
    const dragBtn = document.getElementById('drag-btn');
    if (dragBtn) {
        dragBtn.addEventListener('click', function() {
            // 切换拖拽模式
            dragModeEnabled = !dragModeEnabled;
            
            if (dragModeEnabled) {
                // 进入拖拽模式：左键用于平移，禁用旋转
                dragBtn.textContent = '旋转模式';
                dragBtn.style.background = '#e74c3c';
                controls.enableRotate = false;  // 禁用旋转
                controls.enablePan = true;      // 保持平移启用
                controls.mouseButtons = {
                    LEFT: THREE.MOUSE.PAN,      // 左键平移
                    MIDDLE: THREE.MOUSE.DOLLY,  // 中键缩放
                    RIGHT: THREE.MOUSE.ROTATE   // 右键旋转
                };
                alert('已进入拖拽模式！按住左键可以拖拽模型。');
            } else {
                // 恢复旋转模式：左键用于旋转
                dragBtn.textContent = '拖拽模式';
                dragBtn.style.background = '#3498db';
                controls.enableRotate = true;   // 启用旋转
                controls.enablePan = true;      // 保持平移启用
                controls.mouseButtons = {
                    LEFT: THREE.MOUSE.ROTATE,   // 左键旋转
                    MIDDLE: THREE.MOUSE.DOLLY,  // 中键缩放
                    RIGHT: THREE.MOUSE.PAN      // 右键平移
                };
                alert('已恢复旋转模式！按住左键可以旋转视角。');
            }
        });
    }
    
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            // 重置相机位置和控制器
            controls.reset();
        });
    }

    // 渲染循环
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    
    animate();
}