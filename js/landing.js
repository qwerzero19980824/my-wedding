/* ========================================
   Landing — 画布拖拽 & 页面过渡
   ======================================== */

(function () {
    const overlay = document.querySelector(".landing-overlay");
    const canvasWrap = document.querySelector(".draggable-canvas-wrap");
    const canvas = document.getElementById("brideCanvas");
    const sayYesBtn = document.querySelector(".say-yes-btn");
    const flash = document.querySelector(".transition-flash");
    const ctx = canvas.getContext("2d");

    /* ======== Bride Silhouette Render ======== */
    let canvasW, canvasH;

    function resizeCanvas() {
        const rect = canvasWrap.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvasW = rect.width;
        canvasH = rect.height;
        canvas.width = canvasW * dpr;
        canvas.height = canvasH * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawBride();
    }

    function drawBride() {
        const w = canvasW;
        const h = canvasH;
        ctx.clearRect(0, 0, w, h);

        /* 暗色背景 */
        ctx.fillStyle = "#111111";
        ctx.fillRect(0, 0, w, h);

        /* 氛围光晕 */
        const glowGrad = ctx.createRadialGradient(w * 0.5, h * 0.32, w * 0.05, w * 0.5, h * 0.4, w * 0.65);
        glowGrad.addColorStop(0, "rgba(244, 194, 194, 0.12)");
        glowGrad.addColorStop(0.5, "rgba(244, 194, 194, 0.03)");
        glowGrad.addColorStop(1, "rgba(18, 18, 18, 0)");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);

        /* 优雅的婚纱剪影绘制 */
        const cx = w * 0.50;
        const topY = h * 0.06;
        const scale = Math.min(w / 320, h / 460);

        ctx.save();
        ctx.translate(cx, topY + h * 0.02);
        ctx.scale(scale, scale);

        /* 上半身 - 紧身胸衣 */
        const bodiceGrad = ctx.createLinearGradient(0, 0, 0, 100);
        bodiceGrad.addColorStop(0, "rgba(255, 255, 255, 0.88)");
        bodiceGrad.addColorStop(0.6, "rgba(245, 240, 235, 0.92)");
        bodiceGrad.addColorStop(1, "rgba(240, 230, 225, 0.85)");
        ctx.fillStyle = bodiceGrad;

        ctx.beginPath();
        ctx.moveTo(-36, 80);   // 左腰
        ctx.bezierCurveTo(-38, 40, -28, 10, -14, -20);  // 左上身
        ctx.bezierCurveTo(-8, -40, -6, -52, 0, -58);     // 左肩-颈部
        ctx.bezierCurveTo(6, -52, 8, -40, 14, -20);      // 右肩
        ctx.bezierCurveTo(28, 10, 38, 40, 36, 80);       // 右上身
        ctx.closePath();
        ctx.fill();

        /* 颈部 */
        ctx.fillStyle = "rgba(255, 250, 248, 0.9)";
        ctx.beginPath();
        ctx.moveTo(-5, -58);
        ctx.bezierCurveTo(-4, -68, -3, -74, 0, -78);
        ctx.bezierCurveTo(3, -74, 4, -68, 5, -58);
        ctx.closePath();
        ctx.fill();

        /* 头部/发髻 */
        ctx.fillStyle = "rgba(245, 240, 235, 0.85)";
        ctx.beginPath();
        ctx.arc(0, -84, 14, 0, Math.PI * 2);
        ctx.fill();

        /* 发髻顶部细节 */
        ctx.fillStyle = "rgba(240, 230, 220, 0.7)";
        ctx.beginPath();
        ctx.arc(0, -92, 8, Math.PI, Math.PI * 2);
        ctx.fill();

        /* 头纱 - 从头部垂下 */
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.beginPath();
        ctx.moveTo(0, -92);
        ctx.bezierCurveTo(-50, -70, -90, 60, -100, 200);
        ctx.bezierCurveTo(-85, 195, -60, 180, -40, 160);
        ctx.bezierCurveTo(-20, 170, 20, 170, 40, 160);
        ctx.bezierCurveTo(60, 180, 85, 195, 100, 200);
        ctx.bezierCurveTo(90, 60, 50, -70, 0, -92);
        ctx.closePath();
        ctx.fill();

        /* 头纱层次 - 外层更透 */
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.beginPath();
        ctx.moveTo(0, -88);
        ctx.bezierCurveTo(-60, -50, -105, 70, -115, 230);
        ctx.bezierCurveTo(-90, 225, -55, 205, -30, 185);
        ctx.bezierCurveTo(-10, 200, 10, 200, 30, 185);
        ctx.bezierCurveTo(55, 205, 90, 225, 115, 230);
        ctx.bezierCurveTo(105, 70, 60, -50, 0, -88);
        ctx.closePath();
        ctx.fill();

        /* 大裙摆 - 蓬松婚纱 */
        const skirtGrad = ctx.createLinearGradient(0, 80, 0, 340);
        skirtGrad.addColorStop(0, "rgba(250, 248, 245, 0.92)");
        skirtGrad.addColorStop(0.3, "rgba(245, 240, 235, 0.88)");
        skirtGrad.addColorStop(0.7, "rgba(235, 228, 220, 0.82)");
        skirtGrad.addColorStop(1, "rgba(225, 218, 210, 0.7)");
        ctx.fillStyle = skirtGrad;

        ctx.beginPath();
        ctx.moveTo(-36, 80);
        /* 左侧裙摆 */
        ctx.bezierCurveTo(-55, 100, -90, 140, -110, 200);
        ctx.bezierCurveTo(-125, 250, -120, 300, -95, 340);
        ctx.bezierCurveTo(-70, 350, -40, 345, -15, 340);
        /* 底部褶皱 */
        ctx.bezierCurveTo(-30, 330, -50, 310, -55, 290);
        ctx.lineTo(-50, 290);
        ctx.bezierCurveTo(-20, 335, 20, 335, 50, 290);
        ctx.lineTo(55, 290);
        ctx.bezierCurveTo(50, 310, 30, 330, 15, 340);
        ctx.bezierCurveTo(40, 345, 70, 350, 95, 340);
        /* 右侧裙摆 */
        ctx.bezierCurveTo(120, 300, 125, 250, 110, 200);
        ctx.bezierCurveTo(90, 140, 55, 100, 36, 80);
        ctx.closePath();
        ctx.fill();

        /* 裙摆层次 - 外层薄纱 */
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        ctx.moveTo(-30, 100);
        ctx.bezierCurveTo(-60, 130, -100, 170, -115, 230);
        ctx.bezierCurveTo(-120, 275, -110, 315, -90, 345);
        ctx.bezierCurveTo(-50, 350, 0, 350, 50, 350);
        ctx.bezierCurveTo(90, 345, 110, 315, 120, 275);
        ctx.bezierCurveTo(115, 230, 100, 170, 60, 130);
        ctx.bezierCurveTo(30, 100, 30, 100, 36, 80);
        ctx.closePath();
        ctx.fill();

        /* 腰部装饰 - 细腰带 */
        ctx.strokeStyle = "rgba(244, 194, 194, 0.4)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-36, 80);
        ctx.bezierCurveTo(-20, 84, 20, 84, 36, 80);
        ctx.stroke();

        ctx.restore();
    }

    /* ======== Drag Mechanic ======== */
    let isDragging = false;
    let startX, startY;
    let wrapStartX, wrapStartY;
    let dragStarted = false;

    function getWrapPos() {
        const style = window.getComputedStyle(canvasWrap);
        const matrix = new DOMMatrixReadOnly(style.transform);
        return { x: matrix.m41, y: matrix.m42 };
    }

    function setWrapPos(x, y) {
        canvasWrap.style.transform = `translate(${x}px, ${y}px)`;
    }

    function getCenter(el) {
        const rect = el.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
    }

    function isNearViewportCenter(el, threshold = 0.22) {
        const center = getCenter(el);
        const vcx = window.innerWidth / 2;
        const vcy = window.innerHeight / 2;
        const maxDist = Math.min(window.innerWidth, window.innerHeight) * threshold;
        const dx = center.x - vcx;
        const dy = center.y - vcy;
        return Math.sqrt(dx * dx + dy * dy) < maxDist;
    }

    /* Mouse Events */
    canvasWrap.addEventListener("mousedown", (e) => {
        if (overlay.classList.contains("transitioning")) return;
        isDragging = true;
        dragStarted = true;
        const pos = getWrapPos();
        wrapStartX = pos.x;
        wrapStartY = pos.y;
        startX = e.clientX;
        startY = e.clientY;
        canvasWrap.style.transition = "none";
        /* 拖拽开始后隐藏提示环 */
        const ring = canvasWrap.querySelector(".canvas-hint-ring");
        if (ring) ring.style.opacity = "0";
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        setWrapPos(wrapStartX + dx, wrapStartY + dy);
    });

    window.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;

        if (dragStarted && isNearViewportCenter(canvasWrap)) {
            triggerTransition();
        }
    });

    /* Touch Events */
    canvasWrap.addEventListener("touchstart", (e) => {
        if (overlay.classList.contains("transitioning")) return;
        if (e.touches.length === 1) {
            isDragging = true;
            dragStarted = true;
            const pos = getWrapPos();
            wrapStartX = pos.x;
            wrapStartY = pos.y;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            canvasWrap.style.transition = "none";
            const ring = canvasWrap.querySelector(".canvas-hint-ring");
            if (ring) ring.style.opacity = "0";
        }
    }, { passive: false });

    window.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;
        setWrapPos(wrapStartX + dx, wrapStartY + dy);
    }, { passive: false });

    window.addEventListener("touchend", () => {
        if (!isDragging) return;
        isDragging = false;

        if (dragStarted && isNearViewportCenter(canvasWrap)) {
            triggerTransition();
        }
    });

    /* ======== Transition ======== */
    let transitioned = false;

    function triggerTransition() {
        if (transitioned) return;
        transitioned = true;
        overlay.classList.add("transitioning");

        /* Flash + overlay fade out */
        const tl = gsap.timeline({
            onComplete: () => {
                overlay.style.display = "none";
                document.body.style.overflow = "";
                /* 触发初始页面的 ScrollTrigger 刷新 */
                ScrollTrigger.refresh();
            }
        });

        tl.to(flash, {
            opacity: 1,
            duration: 0.35,
            ease: "power2.in"
        })
        .to(overlay, {
            opacity: 0,
            duration: 0.7,
            ease: "power2.out"
        }, "+=0.1")
        .to(flash, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.out"
        }, "-=0.5");
    }

    /* ======== SAY YES Button ======== */
    sayYesBtn.addEventListener("click", () => {
        if (transitioned) return;
        triggerTransition();
    });

    /* ======== Init ======== */
    function init() {
        resizeCanvas();
        /* CSS 通过 right/bottom 定位右下角，JS transform 初始为零 */
        setWrapPos(0, 0);
    }

    window.addEventListener("resize", () => {
        resizeCanvas();
        if (!dragStarted) init();
    });

    /* 页面加载时 body 禁止滚动（landing 覆盖期间） */
    document.body.style.overflow = "hidden";

    init();
})();
