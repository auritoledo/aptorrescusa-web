document.addEventListener('DOMContentLoaded', () => {

    // --- Theme Toggle ---
    const themeToggleBtn = document.querySelector('.theme-toggle');
    const rootHtml = document.documentElement;

    // Check localStorage for saved theme, default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    rootHtml.setAttribute('data-theme', savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = rootHtml.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        rootHtml.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // --- Floating Phrases Rotation (Landing Page) ---
    const phrases = document.querySelectorAll('.floating-phrase');
    if (phrases.length > 0) {
        let currentPhrase = 0;

        // Show first phrase after preloader
        setTimeout(() => {
            phrases[currentPhrase].classList.add('active');
        }, 2500);

        setInterval(() => {
            if (phrases[currentPhrase]) phrases[currentPhrase].classList.remove('active');
            currentPhrase = (currentPhrase + 1) % phrases.length;
            if (phrases[currentPhrase]) phrases[currentPhrase].classList.add('active');
        }, 5000);
    }

    // --- Preloader Logic ---
    const preloader = document.querySelector('.preloader');
    setTimeout(() => {
        preloader.classList.add('hidden');
        document.body.classList.remove('loading');
    }, 2200);

    // --- Custom Cursor ---
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    const hoverTargets = document.querySelectorAll('.hover-target, a, button, input, textarea');

    if (window.innerWidth > 1024) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Instantly move the dot
            cursor.style.left = `${mouseX}px`;
            cursor.style.top = `${mouseY}px`;

            // Mouse parallax for huge hero bg
            const heroBg = document.querySelector('.parallax-img-bg');
            if (heroBg) {
                const xVal = (mouseX / window.innerWidth - 0.5) * 20;
                const yVal = (mouseY / window.innerHeight - 0.5) * 20;
                heroBg.style.transform = `translate(${xVal}px, ${yVal}px) scale(1.05)`;
            }
        });

        // Smooth follow for the outer circle
        const animateFollower = () => {
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;

            cursorFollower.style.left = `${followerX}px`;
            cursorFollower.style.top = `${followerY}px`;

            requestAnimationFrame(animateFollower);
        };
        animateFollower();

        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
            target.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
        });
    }

    // --- Mobile Menu Toggle ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Advanced Intersection Observer for Fade/Reveal ---
    const fadeElements = document.querySelectorAll('.fade-up, .reveal-text > *');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        scrollObserver.observe(el);
    });

    // --- Scrollytelling & Parallax Effects ---
    const parallaxImages = document.querySelectorAll('.parallax-img');
    const parallaxBgs = document.querySelectorAll('.parallax-bg');
    const heroFsBg = document.querySelector('.hero-fs-bg img');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;

        // Cinematic hero scrollytelling
        if (heroFsBg) {
            const scale = 1 + (scrolled * 0.0005);
            const opacity = Math.max(0, 1 - (scrolled * 0.0015));
            heroFsBg.style.transform = `translateY(${scrolled * 0.3}px) scale(${scale})`;
            heroFsBg.style.opacity = opacity;
        }

        parallaxImages.forEach(img => {
            const speed = 0.2;
            img.style.transform = `translateY(${scrolled * speed}px)`;
        });

        parallaxBgs.forEach(bg => {
            // Apply parallax effect mostly to Y translation
            bg.style.transform = `translateY(${scrolled * 0.15}px)`;
        });
    });

    // --- Smooth Scrolling for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    // --- Load More Characters Logic ---
    const loadMoreBtn = document.getElementById('load-more-chars');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const charCards = document.querySelectorAll('.extra-character');
            charCards.forEach(card => {
                card.style.display = ''; // Reset to default display

                // Observe with IntersectionObserver so they animate properly
                setTimeout(() => {
                    scrollObserver.observe(card);
                }, 10);
            });
            // Hide the button container once revealed
            loadMoreBtn.parentElement.style.display = 'none';

            // Re-trigger scroll processing slightly to ensure visible elements fade-in instantly 
            window.dispatchEvent(new Event('scroll'));
        });
    }

    // --- Back to Top Logic ---
    const backToTopBtns = document.querySelectorAll('.back-to-top');
    backToTopBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });

    // --- Privacy Consent Banner ---
    const initPrivacyBanner = () => {
        if (localStorage.getItem('privacyAccepted')) return;

        const banner = document.createElement('div');
        banner.className = 'privacy-banner';
        banner.innerHTML = `
            <div class="privacy-text">
                Utilizamos herramientas mínimas para gestionar tus mensajes de forma segura. 
                Al continuar, aceptas nuestra <a href="politica-privacidad.html">Política de Privacidad</a>.
            </div>
            <div class="privacy-actions">
                <button class="privacy-accept-btn hover-target">Aceptar</button>
            </div>
        `;

        document.body.appendChild(banner);

        // Animation delay for smooth entrance
        setTimeout(() => banner.classList.add('active'), 1000);

        const acceptBtn = banner.querySelector('.privacy-accept-btn');
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('privacyAccepted', 'true');
            banner.classList.remove('active');
            setTimeout(() => banner.remove(), 800);
        });

        // Add to hover targets for custom cursor
        if (window.innerWidth > 1024) {
            acceptBtn.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
            acceptBtn.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
        }
    };

    initPrivacyBanner();
});
