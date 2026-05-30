/* ========================================
   Merged — 合并轨道记忆卡片逐个淡入
   ======================================== */

(function () {
    gsap.utils.toArray(".merged-item").forEach((item) => {
        gsap.fromTo(item,
            { opacity: 0, y: 60 },
            {
                opacity: 1,
                y: 0,
                duration: 1.2,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 82%",
                    toggleActions: "play none none reverse",
                }
            }
        );
    });
})();
