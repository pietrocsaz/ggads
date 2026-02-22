document.addEventListener("DOMContentLoaded", () => {
    // ---- Navbar Scroll Effect ----
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ---- Smooth Scroll for Anchor Links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ---- Canvas Animation Sequence ----
    const canvas = document.getElementById("hero-canvas");
    const ctx = canvas.getContext("2d");

    // Setting canvas size
    const setCanvasSize = () => {
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Image Sequence settings
    const frameCount = 80;
    const images = [];
    const imagePrefix = './assets/images/hero-sequence/Cinematic_slowmotion_food_202602212353_tmf0p_';

    // The number should be padded to 3 digits like 000, 001
    const getImagePath = (index) => {
        const paddedIndex = index.toString().padStart(3, '0');
        return `${imagePrefix}${paddedIndex}.jpg`;
    };

    // Preload Images
    let imagesLoaded = 0;
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = getImagePath(i);
        img.onload = () => {
            imagesLoaded++;
            // Draw first frame once loaded
            if (imagesLoaded === 1) {
                renderFrame(0);
            }
        };
        images.push(img);
    }

    // Animation Loop Variables
    let currentFrame = 0;
    let fps = 24; // Cinematic 24fps
    let now;
    let then = Date.now();
    let interval = 1000 / fps;
    let delta;

    // Play direction: 1 for forward, -1 for backward (to make loop smooth)
    let playDirection = 1;

    const renderFrame = (index) => {
        if (!images[index] || !images[index].complete) return;

        const img = images[index];
        // Calculate crop to fill the canvas like object-fit: cover
        const zoom = 1.05; // 5% zoom to crop out any borders in the images
        const canvasRatio = canvas.offsetWidth / canvas.offsetHeight;
        const imgRatio = img.width / img.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
            drawWidth = canvas.offsetWidth * zoom;
            drawHeight = drawWidth / imgRatio;
        } else {
            drawHeight = canvas.offsetHeight * zoom;
            drawWidth = drawHeight * imgRatio;
        }

        offsetX = (canvas.offsetWidth - drawWidth) / 2;
        offsetY = (canvas.offsetHeight - drawHeight) / 2;

        ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        // Fill base with matching hero bg
        ctx.fillStyle = "#0f0f0f";
        ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    const loop = () => {
        requestAnimationFrame(loop);

        now = Date.now();
        delta = now - then;

        if (delta > interval) {
            then = now - (delta % interval);

            renderFrame(currentFrame);

            // Ping-pong loop calculation for smooth reset
            currentFrame += playDirection;

            if (currentFrame >= frameCount - 1) {
                playDirection = -1; // Reverse when hitting the end
            } else if (currentFrame <= 0) {
                playDirection = 1; // Play forward when hitting the start
            }
        }
    };

    // Start Animation Loop
    loop();

    // ---- Intersection Observer for fade-in elements (Optional Polish) ----
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply to elements
    const fadeElements = document.querySelectorAll('.benefit-card, .product-card, .review-card, .section-title');
    fadeElements.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        observer.observe(el);
    });
});
