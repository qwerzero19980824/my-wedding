/* ========================================
   app.js — Three.js 布料模拟 · 转身新娘画布
   v1.1.1 · 掀开桌布物理手感
   ======================================== */

(function () {
    /* ============================
       DOM References
       ============================ */
    const clothContainer = document.getElementById("cloth-container");
    const clothCanvas = document.getElementById("clothCanvas");
    const clothHint = document.querySelector(".cloth-hint");
    const heroCard = document.getElementById("heroCard");
    const mainContent = document.getElementById("mainContent");
    const flash = document.querySelector(".transition-flash");

    /* ============================
       Physics Constants
       ============================ */
    const CLOTH_SEGMENTS = 50;         // 50×50 = 2601 vertices, 移动端友好
    const CONSTRAINT_ITERS = 1;        // 单次迭代 = 柔软布料手感
    const GRAVITY = -9.8;              // 标准重力加速度
    const FIXED_DT = 1 / 60;           // 固定时间步 60fps
    const DAMPING = 0.965;             // 速度阻尼 (越高越"丝滑")
    const CORNER_GRAB_RADIUS = 0.35;   // 角落抓取判定半径 (世界单位)
    const MOUSE_FORCE = 0.55;          // 鼠标拉力系数 (越大越跟手)
    const FORCE_RADIUS = 0.6;          // 力场影响半径
    const DISPLACE_THRESHOLD = 0.05;   // 顶点位移阈值
    const TRIGGER_RATIO = 0.40;        // 40% 顶点被位移 → 触发滑出

    /* ============================
       State
       ============================ */
    let isDragging = false;
    let dragCorner = null;             // 'bottomLeft' | 'bottomRight' | null
    let savedDragCorner = null;        // 滑出前保存角落 (供方向计算)
    let mouseWorld = { x: 0, y: 0 };
    let clothSlideDone = false;
    let heroRevealed = false;

    /* ============================
       Three.js Setup
       ============================ */
    const renderer = new THREE.WebGLRenderer({
        canvas: clothCanvas,
        alpha: false,
        antialias: true,
        powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0a0a, 1);

    const scene = new THREE.Scene();

    /* OrthographicCamera —— 布料精确填充视口 */
    const frustumSize = 2.2;
    let aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(
        -frustumSize * aspect / 2, frustumSize * aspect / 2,
        frustumSize / 2, -frustumSize / 2,
        0.1, 100
    );
    camera.position.z = 5;
    camera.lookAt(0, 0, 0);

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
    video.src = "assets/video/bride-turn.mp4";

    let videoReady = false;
    video.addEventListener("playing", () => { videoReady = true; });
    video.addEventListener("error", () => { videoReady = false; });
    video.play().catch(() => { videoReady = false; });

    /* Fallback: 程序化纹理 Canvas */
    const fallbackCanvas = document.createElement("canvas");
    fallbackCanvas.width = 512;
    fallbackCanvas.height = 720;
    const fctx = fallbackCanvas.getContext("2d");
    let fallbackFrame = 0;

    function drawFallbackTexture() {
        const w = fallbackCanvas.width;
        const h = fallbackCanvas.height;
        fctx.clearRect(0, 0, w, h);

        /* 暗底 */
        fctx.fillStyle = "#111111";
        fctx.fillRect(0, 0, w, h);

        /* 柔光中心渐变 */
        const g = fctx.createRadialGradient(w * 0.5, h * 0.35, w * 0.04, w * 0.5, h * 0.45, w * 0.72);
        g.addColorStop(0, "rgba(244, 194, 194, 0.18)");
        g.addColorStop(0.4, "rgba(244, 194, 194, 0.07)");
        g.addColorStop(1, "rgba(18, 18, 18, 0)");
        fctx.fillStyle = g;
        fctx.fillRect(0, 0, w, h);

        /* 微光呼吸 */
        const breath = Math.sin(fallbackFrame * 0.04) * 0.05 + 0.08;
        const g2 = fctx.createRadialGradient(w * 0.5, h * 0.3, w * 0.02, w * 0.5, h * 0.42, w * 0.58);
        g2.addColorStop(0, `rgba(255,255,255,${breath + 0.1})`);
        g2.addColorStop(0.5, `rgba(244,194,194,${breath})`);
        g2.addColorStop(1, "rgba(18,18,18,0)");
        fctx.fillStyle = g2;
        fctx.fillRect(0, 0, w, h);

        /* 抽象婚纱剪影 */
        const cx = w * 0.5;
        fctx.fillStyle = "rgba(240,235,228,0.13)";
        fctx.beginPath();
        fctx.moveTo(cx - 48, h * 0.02);
        fctx.bezierCurveTo(cx - 22, h * 0.08, cx - 14, h * 0.2, cx - 18, h * 0.38);
        fctx.bezierCurveTo(cx - 75, h * 0.33, cx - 115, h * 0.68, cx - 105, h * 0.94);
        fctx.bezierCurveTo(cx - 55, h * 0.99, cx - 25, h * 0.94, cx - 8, h * 0.78);
        fctx.bezierCurveTo(cx, h * 0.83, cx + 5, h * 0.88, cx + 14, h * 0.8);
        fctx.bezierCurveTo(cx + 32, h * 0.94, cx + 60, h * 0.99, cx + 110, h * 0.94);
        fctx.bezierCurveTo(cx + 120, h * 0.68, cx + 80, h * 0.33, cx + 22, h * 0.38);
        fctx.bezierCurveTo(cx + 18, h * 0.2, cx + 26, h * 0.08, cx + 52, h * 0.02);
        fctx.closePath();
        fctx.fill();

        /* 头纱薄纱 */
        fctx.fillStyle = "rgba(255,255,255,0.06)";
        fctx.beginPath();
        fctx.moveTo(cx, h * 0.02);
        fctx.bezierCurveTo(cx - 85, h * 0.1, cx - 140, h * 0.48, cx - 125, h * 0.84);
        fctx.bezierCurveTo(cx - 75, h * 0.78, cx - 28, h * 0.73, cx, h * 0.68);
        fctx.bezierCurveTo(cx + 28, h * 0.73, cx + 75, h * 0.78, cx + 125, h * 0.84);
        fctx.bezierCurveTo(cx + 140, h * 0.48, cx + 85, h * 0.1, cx, h * 0.02);
        fctx.closePath();
        fctx.fill();

        fallbackFrame++;
    }

    const fallbackTexture = new THREE.CanvasTexture(fallbackCanvas);
    fallbackTexture.minFilter = THREE.LinearFilter;
    fallbackTexture.magFilter = THREE.LinearFilter;
    fallbackTexture.needsUpdate = true;

    /* Video texture */
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    /* 不设置 format, 使用默认值 (r160+ 兼容) */

    /* ============================
       Cloth Mesh
       ============================ */
    const planeW = frustumSize * aspect;
    const planeH = frustumSize;
    const geometry = new THREE.PlaneGeometry(planeW, planeH, CLOTH_SEGMENTS, CLOTH_SEGMENTS);

    /* MeshBasicMaterial: 自发光, 不受灯光影响, 视频纹理清晰可见 */
    const material = new THREE.MeshBasicMaterial({
        map: fallbackTexture,
        side: THREE.DoubleSide,
        color: 0xffffff,
        transparent: true,
        opacity: 1,
    });

    const clothMesh = new THREE.Mesh(geometry, material);
    scene.add(clothMesh);

    /* ============================
       Cloth Physics (Verlet Integration)
       ============================ */
    const posAttr = geometry.attributes.position;
    const vertexCount = posAttr.count;
    const positions = posAttr.array; // Float32Array, len = vertexCount * 3
    const segCount = CLOTH_SEGMENTS + 1;

    /* 保存原始位置 (用于位移追踪) */
    const restPositions = new Float32Array(positions);
    /* 上一帧位置 (Verlet 积分) */
    const prevPositions = new Float32Array(positions);

    /* 固定顶部一行顶点 (布料悬挂点) */
    const pinned = new Set();
    for (let i = 0; i < segCount; i++) {
        pinned.add(i);
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
        const cellW = planeW / CLOTH_SEGMENTS;
        const cellH = planeH / CLOTH_SEGMENTS;
        const diag = Math.sqrt(cellW * cellW + cellH * cellH);

        for (let r = 0; r < segCount; r++) {
            for (let c = 0; c < segCount; c++) {
                if (c < CLOTH_SEGMENTS) {
                    constraints.push({ a: idx(r, c), b: idx(r, c + 1), rest: cellW });
                }
                if (r < CLOTH_SEGMENTS) {
                    constraints.push({ a: idx(r, c), b: idx(r + 1, c), rest: cellH });
                }
            }
        }
        for (let r = 0; r < CLOTH_SEGMENTS; r++) {
            for (let c = 0; c < CLOTH_SEGMENTS; c++) {
                constraints.push({ a: idx(r, c), b: idx(r + 1, c + 1), rest: diag });
                constraints.push({ a: idx(r, c + 1), b: idx(r + 1, c), rest: diag });
            }
        }
    }
    buildConstraints();

    /* ============================
       Vertex Helpers (inline for speed)
       ============================ */
    function getV(i) {
        const i3 = i * 3;
        return { x: positions[i3], y: positions[i3 + 1], z: positions[i3 + 2] };
    }
    function setV(i, x, y, z) {
        const i3 = i * 3;
        positions[i3] = x; positions[i3 + 1] = y; positions[i3 + 2] = z;
    }
    function getP(i) {
        const i3 = i * 3;
        return { x: prevPositions[i3], y: prevPositions[i3 + 1], z: prevPositions[i3 + 2] };
    }
    function setP(i, x, y, z) {
        const i3 = i * 3;
        prevPositions[i3] = x; prevPositions[i3 + 1] = y; prevPositions[i3 + 2] = z;
    }

    /* ============================
       Physics Step (Verlet Integration)
       ============================ */
    function physicsStep() {
        const dt2 = FIXED_DT * FIXED_DT;

        /* ---- 1. Verlet Integration ---- */
        for (let i = 0; i < vertexCount; i++) {
            if (pinned.has(i)) continue;

            const cur = getV(i);
            const prev = getP(i);

            let vx = (cur.x - prev.x) * DAMPING;
            let vy = (cur.y - prev.y) * DAMPING;
            let vz = (cur.z - prev.z) * DAMPING;

            vy += GRAVITY * dt2;

            setP(i, cur.x, cur.y, cur.z);
            setV(i, cur.x + vx, cur.y + vy, cur.z + vz);
        }

        /* ---- 2. Mouse Drag Force ---- */
        if (isDragging && dragCorner) {
            const cornerIdx = dragCorner === "bottomLeft"
                ? idx(CLOTH_SEGMENTS, 0)
                : idx(CLOTH_SEGMENTS, CLOTH_SEGMENTS);

            const cp = getV(cornerIdx);

            /* 先让角落顶点紧跟鼠标 */
            setV(cornerIdx,
                cp.x + (mouseWorld.x - cp.x) * MOUSE_FORCE,
                cp.y + (mouseWorld.y - cp.y) * MOUSE_FORCE,
                cp.z + (0 - cp.z) * MOUSE_FORCE * 0.5
            );

            /* 力场扩散到周围顶点 (从角落位置向四周衰减) */
            for (let i = 0; i < vertexCount; i++) {
                if (pinned.has(i) || i === cornerIdx) continue;
                const v = getV(i);
                const dx = v.x - cp.x;
                const dy = v.y - cp.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < FORCE_RADIUS && d > 0.001) {
                    /* 二次方衰减: 越近越跟手 */
                    const t = 1 - d / FORCE_RADIUS;
                    const influence = t * t * MOUSE_FORCE * 0.7;
                    setV(i,
                        v.x + (mouseWorld.x - v.x) * influence,
                        v.y + (mouseWorld.y - v.y) * influence,
                        v.z + (0 - v.z) * influence * 0.4
                    );
                }
            }
        }

        /* ---- 3. Satisfy Constraints (柔软布料: 1 次迭代) ---- */
        for (let iter = 0; iter < CONSTRAINT_ITERS; iter++) {
            for (let c = 0; c < constraints.length; c++) {
                const { a, b, rest } = constraints[c];
                if (pinned.has(a) && pinned.has(b)) continue;

                const va = getV(a);
                const vb = getV(b);
                const dx = vb.x - va.x;
                const dy = vb.y - va.y;
                const dz = vb.z - va.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001;
                const correction = (dist - rest) / dist;

                const wa = pinned.has(a) ? 0 : 0.5;
                const wb = pinned.has(b) ? 0 : 0.5;
                const tw = wa + wb;
                if (tw < 0.0001) continue;

                const cx = dx * correction;
                const cy = dy * correction;
                const cz = dz * correction;

                setV(a, va.x + cx * (wa / tw), va.y + cy * (wa / tw), va.z + cz * (wa / tw));
                setV(b, vb.x - cx * (wb / tw), vb.y - cy * (wb / tw), vb.z - cz * (wb / tw));
            }
        }

        /* ---- 4. Displacement Tracking ---- */
        let displacedCount = 0;
        for (let i = 0; i < vertexCount; i++) {
            const v = getV(i);
            const i3 = i * 3;
            const dx = v.x - restPositions[i3];
            const dy = v.y - restPositions[i3 + 1];
            const dz = v.z - restPositions[i3 + 2];
            if (Math.sqrt(dx * dx + dy * dy + dz * dz) > DISPLACE_THRESHOLD) {
                displacedCount++;
            }
        }

        const ratio = displacedCount / vertexCount;

        /* ---- 5. Trigger Slide-Away ---- */
        if (isDragging && ratio > TRIGGER_RATIO && !clothSlideDone) {
            savedDragCorner = dragCorner; /* 保存角落用于滑出方向 */
            triggerSlideAway();
        }

        /* ---- 6. Update GPU Geometry ---- */
        posAttr.needsUpdate = true;
        geometry.computeVertexNormals();
    }

    /* ============================
       Cloth Slide-Away Animation
       ============================ */
    function triggerSlideAway() {
        clothSlideDone = true;
        isDragging = false;

        const slideDir = savedDragCorner === "bottomLeft" ? -1 : 1;

        /* 隐藏拖拽提示 */
        if (clothHint) {
            gsap.to(clothHint, { opacity: 0, duration: 0.3 });
        }

        const tl = gsap.timeline({ onComplete: revealHeroCard });

        /* 布料沿掀开方向滑出 + 旋转 + 淡出 */
        tl.to(clothMesh.position, {
            x: slideDir * planeW * 1.5,
            duration: 0.9,
            ease: "power3.in",
        }, 0)
        .to(clothMesh.rotation, {
            y: slideDir * 0.55,
            z: slideDir * 0.12,
            duration: 0.9,
            ease: "power3.in",
        }, 0)
        .to(material, {
            opacity: 0,
            duration: 0.55,
            ease: "power2.in",
        }, 0.35);

        /* 画布容器同步淡出 */
        gsap.to(clothContainer, {
            opacity: 0,
            duration: 0.65,
            ease: "power2.in",
            delay: 0.25,
        });
    }

    function revealHeroCard() {
        if (heroRevealed) return;
        heroRevealed = true;

        clothContainer.style.display = "none";
        heroCard.classList.add("visible");

        gsap.fromTo(".hero-text",
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.12 }
        );
        gsap.fromTo(".hero-btn-wrap",
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.32 }
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
        const hits = raycaster.intersectObject(clothMesh);
        if (hits.length > 0) {
            return { x: hits[0].point.x, y: hits[0].point.y, hit: true };
        }
        return { x: 0, y: 0, hit: false };
    }

    function getCornerPos(cornerName) {
        const i = cornerName === "bottomLeft"
            ? idx(CLOTH_SEGMENTS, 0)
            : idx(CLOTH_SEGMENTS, CLOTH_SEGMENTS);
        return getV(i);
    }

    function detectCorner(world) {
        if (!world.hit) return null;
        const bl = getCornerPos("bottomLeft");
        const br = getCornerPos("bottomRight");
        const dBL = Math.hypot(world.x - bl.x, world.y - bl.y);
        const dBR = Math.hypot(world.x - br.x, world.y - br.y);
        if (dBL < CORNER_GRAB_RADIUS) return "bottomLeft";
        if (dBR < CORNER_GRAB_RADIUS) return "bottomRight";
        return null;
    }

    function onPointerDown(e) {
        if (clothSlideDone) return;
        e.preventDefault();

        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        const world = screenToWorld(cx, cy);
        const corner = detectCorner(world);

        if (corner) {
            isDragging = true;
            dragCorner = corner;
            mouseWorld.x = world.x;
            mouseWorld.y = world.y;
            clothCanvas.style.cursor = "grabbing";
            /* 拖拽开始时隐藏提示 */
            if (clothHint) {
                gsap.to(clothHint, { opacity: 0, duration: 0.25 });
            }
        }
    }

    function onPointerMove(e) {
        if (clothSlideDone) return;
        e.preventDefault();

        const cx = e.touches ? e.touches[0].clientX : e.clientX;
        const cy = e.touches ? e.touches[0].clientY : e.clientY;
        const world = screenToWorld(cx, cy);

        if (isDragging) {
            /* 拖拽中: 更新鼠标世界坐标 */
            if (world.hit) {
                mouseWorld.x = world.x;
                mouseWorld.y = world.y;
            }
        } else {
            /* 未拖拽: 悬停检测角落 */
            const corner = detectCorner(world);
            clothCanvas.style.cursor = corner ? "grab" : "default";
        }
    }

    function onPointerUp() {
        if (!isDragging) return;
        isDragging = false;
        dragCorner = null;
        clothCanvas.style.cursor = "default";
        /* 松手后如果未触发滑出, 重新显示提示 */
        if (!clothSlideDone && clothHint) {
            gsap.to(clothHint, { opacity: 1, duration: 0.5, delay: 0.3 });
        }
    }

    /* Event Bindings */
    clothCanvas.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    clothCanvas.addEventListener("touchstart", onPointerDown, { passive: false });
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);
    window.addEventListener("touchcancel", onPointerUp);

    /* ============================
       Say Yes Button → Dual Track Page
       ============================ */
    const sayYesBtn = document.querySelector(".hero-btn-wrap .say-yes-btn");
    if (sayYesBtn) {
        sayYesBtn.addEventListener("click", () => {
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
    }

    /* ============================
       Render Loop (固定步长物理)
       ============================ */
    let accumulator = 0;
    let lastTime = performance.now();

    function animate(time) {
        requestAnimationFrame(animate);

        let rawDt = time - lastTime;
        lastTime = time;
        /* 防止切后台后的大帧跳 */
        if (rawDt > 200) rawDt = 200;

        accumulator += rawDt;

        /* 固定步长物理更新 */
        const stepMs = FIXED_DT * 1000; // ≈16.67ms
        while (accumulator >= stepMs && !clothSlideDone) {
            physicsStep();
            accumulator -= stepMs;
        }
        /* 滑出后不累积 */
        if (clothSlideDone) {
            accumulator = 0;
        }

        /* 纹理更新 */
        if (videoReady) {
            if (material.map !== videoTexture) {
                material.map = videoTexture;
                material.needsUpdate = true;
            }
            if (video.readyState >= video.HAVE_CURRENT_DATA) {
                videoTexture.needsUpdate = true;
            }
        } else {
            /* 每 3 帧更新 fallback 纹理 (~20fps) */
            if (fallbackFrame % 3 === 0) {
                drawFallbackTexture();
                fallbackTexture.needsUpdate = true;
            }
            fallbackFrame++;
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
        aspect = w / h;
        camera.left = -frustumSize * aspect / 2;
        camera.right = frustumSize * aspect / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;
        camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", onResize);

    /* ============================
       Init
       ============================ */
    function init() {
        drawFallbackTexture();
        fallbackTexture.needsUpdate = true;
        document.body.style.overflow = "hidden";
        requestAnimationFrame(animate);
    }

    init();
})();
