/* ========================================
   Meeting — confetti 粒子爆发 & 相遇文字动画
   ======================================== */

(function () {
    let confettiFired = false;

    /* ---- Confetti Burst ---- */
    ScrollTrigger.create({
        trigger: ".meeting-point",
        start: "top 60%",
        onEnter: () => {
            if (confettiFired) return;
            confettiFired = true;

            const colors = ['#f4c2c2', '#ffffff', '#e8a0a0', '#f0d0d0'];

            const burst = (delay, count, spread) => {
                setTimeout(() => {
                    confetti({
                        particleCount: count,
                        spread: spread,
                        origin: { x: 0.5, y: 0.35 },
                        colors: colors,
                        startVelocity: 45,
                        decay: 0.9,
                        ticks: 200,
                    });
                }, delay);
            };

            burst(0,   150, 100);
            burst(200, 80,  160);
            burst(450, 120, 130);
            burst(700, 60,  180);
        }
    });

    /* ---- Meeting Text Scrub ---- */
    gsap.set(".meeting-text", { opacity: 0, y: 50 });

    gsap.to(".meeting-text", {
        scrollTrigger: {
            trigger: ".meeting-point",
            start: "top 50%",
            end: "top 20%",
            scrub: 1,
        },
        opacity: 1,
        y: 0,
    });

    /* ---- Click to re-trigger confetti ---- */
    document.querySelector(".meeting-text").addEventListener("click", () => {
        confetti({
            particleCount: 200,
            spread: 150,
            origin: { x: 0.5, y: 0.3 },
            colors: ['#f4c2c2', '#ffffff', '#e8a0a0'],
        });
    });
})();
