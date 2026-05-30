/* ========================================
   app.js — Three.js 布料模拟 · 转身新娘画布
   v1.1.0 · Verlet Integration Cloth Physics
   ======================================== */

(function () {
    /* ============================
       DOM References
       ============================ */
    const clothContainer = document.getElementById("cloth-container");
    const clothCanvas = document.getElementById("clothCanvas");
    const heroCard = document.getElementById("heroCard");
    const mainContent = document.getElementById("mainContent");
    const flash = document.querySelector(".transition-flash");

    /* ============================
       Constants
       ============================ */
    const CLOTH_SEGMENTS = 60;         // 60x60 = 3721 vertices
    const CONSTRAINT_ITERS = 3;        // 约束求解迭代次数
    const GRAVITY = -0.0004;           // 重力加速度
    const DAMPING = 0.98;              // 速度阻尼
    const DRAG_RADIUS = 0.22;          // 角落拖拽判定半径 (世界单位)
    const MOUSE_FORCE = 0.18;          // 鼠标施力系数
    const DISPLACE_THRESHOLD = 0.08;   // 顶点位移阈值 (世界单位)
    const TRIGGER_RATIO = 0.40;        // 40% 顶点位移触发

    /* ============================
       State
       ============================ */
    let isDragging = false;
    let dragCorner = null;             // 'bottomLeft' | 'bottomRight' | null
    let mouseWorld = { x: 0, y: 0 };
    let clothSlideDone = false;
    let heroRevealed = false;

    /* ============================
       Three.js Setup
       ============================ */
    const renderer = new THREE.WebGLRenderer({ canvas: clothCanvas, alpha: false, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0a0a, 1);

    const scene = new THREE.Scene();

    /* OrthographicCamera — 布料精确填充视口 */
    const frustumSize = 2.2;
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(
        -frustumSize * aspect / 2, frustumSize * aspect / 2,
        frustumSize / 2, -frustumSize / 2,
        0.1, 100
    );
    camera.position.z = 5;
    camera.lookAt(0, 0, 0);

    /* Subtle ambient light for depth */
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight.position.set(0, 0, 10);
    scene.add(dirLight);

    /* ============================
       Video / Fallback Texture
       ============================ */
    const video = document.createElement("video");
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    video.crossOrigin = "anonymous";
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    /* 尝试加载用户视频，失败则用 fallback canvas */
    video.src = "assets/video/bride-turn.mp4";

    let videoReady = false;
    video.addEventListener("playing", () => { videoReady = true; });
    video.addEventListener("error", () => { videoReady = false; });
    /* 静默尝试播放 */
    video.play().catch(() => { videoReady = false; });

    /* Fallback: 程序化纹理 (白色婚纱渐变 + 微光动画) */
    const fallbackCanvas = document.createElement("canvas");
    fallbackCanvas.width = 512;
    fallbackCanvas.height = 720;
    const fctx = fallbackCanvas.getContext("2d");

    function drawFallbackTexture(time) {
        const w = fallbackCanvas.width;
        const h = fallbackCanvas.height;
        fctx.clearRect(0, 0, w, h);

        /* 暗底 */
        fctx.fillStyle = "#111111";
        fctx.fillRect(0, 0, w, h);

        /* 柔光渐变 */
        const g = fctx.createRadialGradient(w * 0.5, h * 0.35, w * 0.05, w * 0.5, h * 0.45, w * 0.7);
        g.addColorStop(0, "rgba(244, 194, 194, 0.15)");
        g.addColorStop(0.4, "rgba(244, 194, 194, 0.06)");
        g.addColorStop(1, "rgba(18, 18, 18, 0)");
        fctx.fillStyle = g;
        fctx.fillRect(0, 0, w, h);

        /* 微光波动 */
        const shimmer = Math.sin(time * 0.001) * 0.04 + 0.06;
        const g2 = fctx.createRadialGradient(w * 0.5, h * 0.3, w * 0.02, w * 0.5, h * 0.42, w * 0.55);
        g2.addColorStop(0, `rgba(255,255,255,${shimmer + 0.08})`);
        g2.addColorStop(0.5, `rgba(244,194,194,${shimmer})`);
        g2.addColorStop(1, "rgba(18,18,18,0)");
        fctx.fillStyle = g2;
        fctx.fillRect(0, 0, w, h);

        /* 简单婚纱轮廓剪影 (抽象) */
        fctx.fillStyle = "rgba(240,235,228,0.12)";
        fctx.beginPath();
        const cx = w * 0.5;
        fctx.moveTo(cx - 50, h * 0.02);
        fctx.bezierCurveTo(cx - 25, h * 0.08, cx - 15, h * 0.2, cx - 20, h * 0.4);
        fctx.bezierCurveTo(cx - 80, h * 0.35, cx - 120, h * 0.7, cx - 110, h * 0.95);
        fctx.bezierCurveTo(cx - 60, h, cx - 30, h * 0.95, cx - 10, h * 0.8);
        fctx.bezierCurveTo(cx, h * 0.85, cx + 5, h * 0.9, cx + 15, h * 0.82);
        fctx.bezierCurveTo(cx + 35, h * 0.95, cx + 65, h, cx + 115, h * 0.95);
        fctx.bezierCurveTo(cx + 125, h * 0.7, cx + 85, h * 0.35, cx + 25, h * 0.4);
        fctx.bezierCurveTo(cx + 20, h * 0.2, cx + 30, h * 0.08, cx + 55, h * 0.02);
        fctx.closePath();
        fctx.fill();

        /* 头纱 */
        fctx.fillStyle = "rgba(255,255,255,0.06)";
        fctx.beginPath();
        fctx.moveTo(cx, h * 0.02);
        fctx.bezierCurveTo(cx - 90, h * 0.1, cx - 150, h * 0.5, cx - 130, h * 0.85);
        fctx.bezierCurveTo(cx - 80, h * 0.8, cx - 30, h * 0.75, cx, h * 0.7);
        fctx.bezierCurveTo(cx + 30, h * 0.75, cx + 80, h * 0.8, cx + 130, h * 0.85);
        fctx.bezierCurveTo(cx + 150, h * 0.5, cx + 90, h * 0.1, cx, h * 0.02);
        fctx.closePath();
        fctx.fill();
    }

    const fallbackTexture = new THREE.CanvasTexture(fallbackCanvas);
    fallbackTexture.needsUpdate = true;

    /* Video texture (fallback until video plays) */
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBFormat;

    /* ============================
       Cloth Mesh
       ============================ */
    const planeW = frustumSize * aspect;
    const planeH = frustumSize;
    const geometry = new THREE.PlaneGeometry(planeW, planeH, CLOTH_SEGMENTS, CLOTH_SEGMENTS);

    const material = new THREE.MeshStandardMaterial({
        map: fallbackTexture,
        side: THREE.DoubleSide,
        roughness: 0.85,
        metalness: 0.05,
        color: 0xffffff,
    });

    const clothMesh = new THREE.Mesh(geometry, material);
    scene.add(clothMesh);

    /* ============================
       Cloth Physics (Verlet Integration)
       ============================ */
    const posAttr = geometry.attributes.position;
    const vertexCount = posAttr.count;
    const positions = posAttr.array;              // Float32Array, length = vertexCount * 3

    /* 保存原始位置 */
    const restPositions = new Float32Array(positions);
    /* 上一帧位置 (Verlet) */
    const prevPositions = new Float32Array(positions);
    /* 每个顶点的累计位移 */
    const displacement = new Float32Array(vertexCount);

    /* 固定顶点集合 (顶部一行) */
    const pinned = new Set();
    const segCount = CLOTH_SEGMENTS + 1;
    for (let i = 0; i < segCount; i++) {
        pinned.add(i); // 顶行索引 0 ~ segCount-1
    }

    /* ============================
       Constraint Builder
       ============================ */
    const constraints = [];

    function idx(row, col) {
        return row * segCount + col;
    }

    function buildConstraints() {
        constraints.length = 0;
        /* 结构约束 (水平 + 垂直) */
        for (let r = 0; r < segCount; r++) {
            for (let c = 0; c < segCount; c++) {
                if (c < CLOTH_SEGMENTS) {
                    constraints.push({ a: idx(r, c), b: idx(r, c + 1), rest: planeW / CLOTH_SEGMENTS });
                }
                if (r < CLOTH_SEGMENTS) {
                    constraints.push({ a: idx(r, c), b: idx(r + 1, c), rest: planeH / CLOTH_SEGMENTS });
                }
            }
        }
        /* 剪切约束 (对角线) */
        for (let r = 0; r < CLOTH_SEGMENTS; r++) {
            for (let c = 0; c < CLOTH_SEGMENTS; c++) {
                const d = Math.sqrt(
                    (planeW / CLOTH_SEGMENTS) ** 2 + (planeH / CLOTH_SEGMENTS) ** 2
                );
                constraints.push({ a: idx(r, c), b: idx(r + 1, c + 1), rest: d });
                constraints.push({ a: idx(r, c + 1), b: idx(r + 1, c), rest: d });
            }
        }
    }
    buildConstraints();

    /* ============================
       Physics Step
       ============================ */
    function getVertex(i) {
        const i3 = i * 3;
        return { x: positions[i3], y: positions[i3 + 1], z: positions[i3 + 2] };
    }

    function setVertex(i, x, y, z) {
        const i3 = i * 3;
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
    }

    function getPrevVertex(i) {
        const i3 = i * 3;
        return { x: prevPositions[i3], y: prevPositions[i3 + 1], z: prevPositions[i3 + 2] };
    }

    function setPrevVertex(i, x, y, z) {
        const i3 = i * 3;
        prevPositions[i3] = x;
        prevPositions[i3 + 1] = y;
        prevPositions[i3 + 2] = z;
    }

    function physicsStep(dt) {
        /* ---- Verlet Integration ---- */
        for (let i = 0; i < vertexCount; i++) {
            if (pinned.has(i)) continue;

            const cur = getVertex(i);
            const prev = getPrevVertex(i);

            /* 速度 (带阻尼) */
            let vx = (cur.x - prev.x) * DAMPING;
            let vy = (cur.y - prev.y) * DAMPING;
            let vz = (cur.z - prev.z) * DAMPING;

            /* 重力 */
            vy += GRAVITY * dt * dt;

            /* 保存当前位置到 prev */
            setPrevVertex(i, cur.x, cur.y, cur.z);

            /* 更新位置 */
            setVertex(i, cur.x + vx, cur.y + vy, cur.z + vz);
        }

        /* ---- Mouse Force ---- */
        if (isDragging && dragCorner) {
            const cornerIdx = dragCorner === "bottomLeft"
                ? idx(CLOTH_SEGMENTS, 0)           // 左下角
                : idx(CLOTH_SEGMENTS, CLOTH_SEGMENTS); // 右下角

            /* 影响范围: 角落附近的所有顶点 */
            const cornerPos = getVertex(cornerIdx);
            const forceRadius = DRAG_RADIUS * 2.5;

            for (let i = 0; i < vertexCount; i++) {
                if (pinned.has(i)) continue;
                const v = getVertex(i);
                const dx = v.x - cornerPos.x;
                const dy = v.y - cornerPos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < forceRadius) {
                    const influence = 1 - dist / forceRadius;
                    const falloff = influence * influence; /* 二次衰减 */
                    setVertex(i,
                        v.x + (mouseWorld.x - v.x) * MOUSE_FORCE * falloff,
                        v.y + (mouseWorld.y - v.y) * MOUSE_FORCE * falloff,
                        v.z + (0 - v.z) * MOUSE_FORCE * falloff * 0.5
                    );
                }
            }
        }

        /* ---- Satisfy Constraints ---- */
        for (let iter = 0; iter < CONSTRAINT_ITERS; iter++) {
            for (let c = 0; c < constraints.length; c++) {
                const { a, b, rest } = constraints[c];
                if (pinned.has(a) && pinned.has(b)) continue;

                const va = getVertex(a);
                const vb = getVertex(b);
                const dx = vb.x - va.x;
                const dy = vb.y - va.y;
                const dz = vb.z - va.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;
                const diff = (dist - rest) / dist;

                const wa = pinned.has(a) ? 0 : 0.5;
                const wb = pinned.has(b) ? 0 : 0.5;
                const totalW = wa + wb;
                if (totalW < 0.001) continue;

                const corrX = dx * diff;
                const corrY = dy * diff;
                const corrZ = dz * diff;

                setVertex(a, va.x + corrX * (wa / totalW), va.y + corrY * (wa / totalW), va.z + corrZ * (wa / totalW));
                setVertex(b, vb.x - corrX * (wb / totalW), vb.y - corrY * (wb / totalW), vb.z - corrZ * (wb / totalW));
            }
        }

        /* ---- Displacement Tracking ---- */
        let displacedCount = 0;
        for (let i = 0; i < vertexCount; i++) {
            const cur = getVertex(i);
            const i3 = i * 3;
            const rx = restPositions[i3];
            const ry = restPositions[i3 + 1];
            const rz = restPositions[i3 + 2];
            const dx = cur.x - rx;
            const dy = cur.y - ry;
            const dz = cur.z - rz;
            const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
            displacement[i] = d;
            if (d > DISPLACE_THRESHOLD) displacedCount++;
        }

        const ratio = displacedCount / vertexCount;

        /* ---- Trigger Slide-Away ---- */
        if (isDragging && ratio > TRIGGER_RATIO && !clothSlideDone) {
            triggerSlideAway();
        }

        /* ---- Update Geometry ---- */
        posAttr.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    /* ============================
       Cloth Slide-Away Animation
       ============================ */
    function triggerSlideAway() {
        clothSlideDone = true;
        isDragging = false;
        dragCorner = null;

        /* Determine slide direction based on drag corner */
        const direction = dragCorner === "bottomLeft" ? -1 : 1;
        /* But we don't know dragCorner at this point since it might be null... */
        /* Use the cloth's current center of mass to determine direction */
        let avgX = 0;
        for (let i = 0; i < vertexCount; i++) {
            avgX += positions[i * 3];
        }
        avgX /= vertexCount;
        const slideDir = avgX > 0 ? 1 : -1;

        /* Animate cloth off-screen */
        const tl = gsap.timeline({
            onComplete: revealHeroCard,
        });

        tl.to(clothMesh.position, {
            x: slideDir * planeW * 1.5,
            duration: 0.9,
            ease: "power3.in",
        }, 0)
        .to(clothMesh.rotation, {
            y: slideDir * 0.6,
            duration: 0.9,
            ease: "power3.in",
        }, 0)
        .to(material, {
            opacity: 0,
            duration: 0.6,
            ease: "power2.in",
        }, 0.3);

        /* Simultaneously fade canvas background */
        gsap.to(renderer, {
            /* We can't tween renderer directly, use a proxy */
            duration: 0,
        });
        /* Fade the container */
        gsap.to(clothContainer, {
            opacity: 0,
            duration: 0.7,
            ease: "power2.in",
            delay: 0.2,
        });
    }

    function revealHeroCard() {
        if (heroRevealed) return;
        heroRevealed = true;

        clothContainer.style.display = "none";
        heroCard.classList.add("visible");

        /* Animate hero card elements */
        gsap.fromTo(".hero-text",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.15 }
        );
        gsap.fromTo(".hero-btn-wrap",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.35 }
        );
    }

    /* ============================
       Mouse & Touch Interaction
       ============================ */
    const raycaster = new THREE.Raycaster();
    const mouseNDC = new THREE.Vector2();

    function screenToWorld(clientX, clientY) {
        mouseNDC.x = (clientX / window.innerWidth) * 2 - 1;
        mouseNDC.y = -(clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouseNDC, camera);
        const intersects = raycaster.intersectObject(clothMesh);

        if (intersects.length > 0) {
            return {
                x: intersects[0].point.x,
                y: intersects[0].point.y,
                hit: true,
            };
        }
        return { x: 0, y: 0, hit: false };
    }

    function getCornerWorldPos(corner) {
        const c = corner === "bottomLeft"
            ? idx(CLOTH_SEGMENTS, 0)
            : idx(CLOTH_SEGMENTS, CLOTH_SEGMENTS);
        return getVertex(c);
    }

    function detectCorner(worldPos) {
        if (!worldPos.hit) return null;
        const bl = getCornerWorldPos("bottomLeft");
        const br = getCornerWorldPos("bottomRight");

        const distBL = Math.sqrt(
            (worldPos.x - bl.x) ** 2 + (worldPos.y - bl.y) ** 2
        );
        const distBR = Math.sqrt(
            (worldPos.x - br.x) ** 2 + (worldPos.y - br.y) ** 2
        );

        if (distBL < DRAG_RADIUS) return "bottomLeft";
        if (distBR < DRAG_RADIUS) return "bottomRight";
        return null;
    }

    function onPointerDown(e) {
        if (clothSlideDone) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const world = screenToWorld(clientX, clientY);
        const corner = detectCorner(world);

        if (corner) {
            isDragging = true;
            dragCorner = corner;
            mouseWorld.x = world.x;
            mouseWorld.y = world.y;
            clothCanvas.style.cursor = "grabbing";
        }
    }

    function onPointerMove(e) {
        if (!isDragging || clothSlideDone) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const world = screenToWorld(clientX, clientY);

        if (world.hit) {
            mouseWorld.x = world.x;
            mouseWorld.y = world.y;
        }
    }

    function onPointerUp() {
        if (!isDragging) return;
        isDragging = false;
        dragCorner = null;
        clothCanvas.style.cursor = "";
    }

    function onPointerHover(e) {
        if (isDragging || clothSlideDone) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const world = screenToWorld(clientX, clientY);
        const corner = detectCorner(world);
        clothCanvas.style.cursor = corner ? "grab" : "";
    }

    /* Event Bindings */
    clothCanvas.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", (e) => {
        onPointerMove(e);
        onPointerHover(e);
    });
    window.addEventListener("mouseup", onPointerUp);

    clothCanvas.addEventListener("touchstart", onPointerDown, { passive: false });
    window.addEventListener("touchmove", (e) => {
        onPointerMove(e);
        onPointerHover(e);
    }, { passive: false });
    window.addEventListener("touchend", onPointerUp);

    /* ============================
       Say Yes Button → Dual Track
       ============================ */
    document.querySelector(".hero-btn-wrap .say-yes-btn").addEventListener("click", () => {
        if (!heroRevealed) return;

        const tl = gsap.timeline({
            onComplete: () => {
                heroCard.style.display = "none";
                mainContent.classList.add("active");
                document.body.style.overflow = "";
                ScrollTrigger.refresh();
            }
        });

        tl.to(flash, { opacity: 1, duration: 0.35, ease: "power2.in" })
          .to(heroCard, { opacity: 0, duration: 0.6, ease: "power2.out" }, "+=0.1")
          .to(flash, { opacity: 0, duration: 0.5, ease: "power2.out" }, "-=0.4");
    });

    /* ============================
       Render Loop
       ============================ */
    let lastTime = performance.now();
    let fallbackTime = 0;

    function animate(time) {
        requestAnimationFrame(animate);

        const dt = Math.min(time - lastTime, 33); // cap at ~30fps for stability
        lastTime = time;

        /* Physics step */
        if (!clothSlideDone) {
            physicsStep(dt);
        }

        /* Texture update */
        if (videoReady) {
            if (material.map !== videoTexture) {
                material.map = videoTexture;
                material.needsUpdate = true;
            }
            videoTexture.needsUpdate = true;
        } else {
            fallbackTime += dt;
            if (Math.floor(fallbackTime) % 80 === 0) { // update every ~80ms
                drawFallbackTexture(fallbackTime);
                fallbackTexture.needsUpdate = true;
            }
        }

        renderer.render(scene, camera);
    }

    /* ============================
       Resize Handler
       ============================ */
    function onResize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        renderer.setSize(w, h);
        const newAspect = w / h;
        camera.left = -frustumSize * newAspect / 2;
        camera.right = frustumSize * newAspect / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;
        camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", onResize);

    /* ============================
       Init
       ============================ */
    function init() {
        drawFallbackTexture(0);
        document.body.style.overflow = "hidden";
        requestAnimationFrame(animate);
    }

    init();
})();
