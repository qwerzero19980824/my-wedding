/* ========================================
   Main — 全局初始化 & 跨模块协调
   ======================================== */

(function () {
    /* ---- 注册 GSAP 插件 ---- */
    gsap.registerPlugin(ScrollTrigger);

    /* ---- 渲染版本标识 ---- */
    function renderVersionBadge() {
        const badge = document.createElement("div");
        badge.className = "version-badge";
        badge.textContent = `v${APP.VERSION}`;
        document.body.appendChild(badge);

        /* 进入亮色区域时切换样式 */
        ScrollTrigger.create({
            trigger: ".meeting-point",
            start: "top 50%",
            end: "bottom 50%",
            onEnter:  () => badge.classList.add("on-light"),
            onLeaveBack: () => badge.classList.remove("on-light"),
        });
    }

    /* ---- 滚动提示自动隐藏 ---- */
    function bindScrollHint() {
        ScrollTrigger.create({
            trigger: ".meeting-point",
            start: "top 80%",
            onEnter: () => gsap.to(".scroll-hint", { opacity: 0, duration: 0.5 }),
            onLeaveBack: () => gsap.to(".scroll-hint", { opacity: 1, duration: 0.5 }),
        });
    }

    /* ---- Init ---- */
    renderVersionBadge();
    bindScrollHint();
})();
