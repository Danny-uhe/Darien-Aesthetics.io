/**
 * Darien Aesthetics - Main JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    // --- Mobile Menu Toggle ---
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const isHidden = mobileMenu.classList.contains('hidden');
            menuToggle.setAttribute('aria-expanded', !isHidden);
        });
    }

    // --- Intersection Observer for Reveal Animations ---
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.01,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Fallback reveal
    setTimeout(() => {
        revealElements.forEach(el => {
            if (!el.classList.contains('active')) el.classList.add('active');
        });
    }, 2000);

    // --- Smooth Scrolling ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
                const navHeight = 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // --- Hero Slider ---
    const slides = document.querySelectorAll('.slide');
    const prevButton = document.getElementById('prev-slide');
    const nextButton = document.getElementById('next-slide');
    let currentSlide = 0;
    
    if (slides.length > 0) {
        const showSlide = (index) => {
            slides.forEach((slide, i) => slide.style.opacity = (i === index ? '1' : '0'));
        };
        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        };
        const prevSlide = () => {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            showSlide(currentSlide);
        };
        if (prevButton) prevButton.addEventListener('click', prevSlide);
        if (nextButton) nextButton.addEventListener('click', nextSlide);
        setInterval(nextSlide, 5000);
    }

    // --- Gallery Modal ---
    const galleryModal = document.getElementById('gallery-modal');
    const modalImage = document.getElementById('modal-image');
    const closeModal = document.getElementById('close-modal');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (galleryModal && modalImage && closeModal) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                if (img) {
                    modalImage.src = img.src;
                    galleryModal.classList.remove('hidden');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
        closeModal.addEventListener('click', () => {
            galleryModal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        });
        galleryModal.addEventListener('click', (e) => {
            if (e.target === galleryModal) {
                galleryModal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });
    }

    // --- Generic Puzzle Section Animation (Multi-Section Support) ---
    const puzzleSections = document.querySelectorAll('.puzzle-section');
    
    if (puzzleSections.length > 0) {
        let tickingBuffer = false;

        const updateAllPuzzles = () => {
            const viewHeight = window.innerHeight;
            const scrollY = window.pageYOffset;

            puzzleSections.forEach(section => {
                const rect = section.getBoundingClientRect();
                
                // Only process if section is somewhat visible
                if (rect.top < viewHeight && rect.bottom > 0) {
                    const pieces = section.querySelectorAll('.puzzle-piece');
                    const icons = section.querySelectorAll('.floating-icon');
                    
                    // Progress: 0 (top entering bottom) to 1 (top at top)
                    let progress = 1 - (rect.top / viewHeight);
                    // Specialized progress mapping for smoother entrance
                    let alignFactor = (progress - 0.2) * 1.5;
                    alignFactor = Math.max(0, Math.min(1, alignFactor));

                    pieces.forEach((piece, index) => {
                        const tX = parseFloat(piece.dataset.targetX) || 0;
                        const tY = parseFloat(piece.dataset.targetY) || 0;
                        const tR = parseFloat(piece.dataset.rotate) || 0;
                        
                        // Calculate parallax/float based on scroll
                        const spread = (1 - alignFactor);
                        const startX = (index % 2 === 0 ? -400 : 400) * spread;
                        const startY = (Math.sin(index + scrollY * 0.001) * 250) * spread;
                        const startRotate = (index * 60) * spread;

                        const curX = startX + (tX * alignFactor);
                        const curY = startY + (tY * alignFactor);
                        const curR = startRotate + (tR * alignFactor);
                        const curO = Math.min(1, progress * 3);

                        piece.style.transform = `translate(calc(-50% + ${curX}px), calc(-50% + ${curY}px)) rotate(${curR}deg)`;
                        piece.style.opacity = curO;
                    });

                    icons.forEach(icon => {
                        const speed = parseFloat(icon.dataset.speed) || 0.05;
                        const offset = (scrollY - section.offsetTop) * speed;
                        icon.style.transform = `translateY(${offset}px) rotate(${scrollY * speed * 2}deg)`;
                    });
                }
            });
            tickingBuffer = false;
        };

        window.addEventListener('scroll', () => {
            if (!tickingBuffer) {
                window.requestAnimationFrame(updateAllPuzzles);
                tickingBuffer = true;
            }
        });
        updateAllPuzzles();
    }

    // --- Image Fallbacks ---
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.classList.add('image-error');
            const fallbackDiv = document.createElement('div');
            fallbackDiv.className = 'bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg flex items-center justify-center w-full h-64';
            fallbackDiv.innerHTML = '<div class="text-center p-4"><i class="fas fa-image text-gray-400 text-4xl mb-2"></i><p class="text-gray-500 text-sm">Image failed to load</p></div>';
            if (this.parentNode) this.parentNode.replaceChild(fallbackDiv, this);
        });
    });
});

window.addEventListener('error', (e) => console.error('Core Script Error:', e.message));
