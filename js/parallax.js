/* ========================================
   Parallax — 双轨视差 ScrollTrigger 时间线
   ======================================== */

(function () {
    const parallaxTL = gsap.timeline({
        scrollTrigger: {
            trigger: ".dual-track-wrapper",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2,
            pin: ".dual-track-stage",
        }
    });

    parallaxTL
        /* 异步视差：左轨 -45%，右轨 -70% */
        .fromTo(".track-left .track-inner",
            { yPercent: 0 },
            { yPercent: -45, ease: "none" },
            0
        )
        .fromTo(".track-right .track-inner",
            { yPercent: 0 },
            { yPercent: -70, ease: "none" },
            0
        )
        /* 分界线末尾消散 */
        .to(".divider-line", {
            opacity: 0,
            scaleY: 0,
            duration: 0.2,
            ease: "power2.in"
        }, "+=0.15");
})();
