// Smooth scroll animations for all elements
document.addEventListener('DOMContentLoaded', function() {
  
  // Get all elements that need scroll animations
  const sections = document.querySelectorAll('.hero, .invitation, .calendar-modern, .program-lux, .polaroid-section, .footer');
  const elements = document.querySelectorAll('.hero-image, .hero-text, .script, .invite-text p, .month-title, .weekdays, .days, .program-title, .program-item, .gallery, .polaroid,.footer p, .divider');
  
  // Function to check if element is in viewport
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.top <= windowHeight - 100 && rect.bottom >= 0;
  }
  
  // Function to add visible class to elements in viewport
  function checkScroll() {
    // Check sections
    sections.forEach(section => {
      if (isInViewport(section)) {
        section.classList.add('section-visible');
      }
    });
    
    // Check individual elements
    elements.forEach(element => {
      if (isInViewport(element)) {
        element.classList.add('element-visible');
      }
    });
  }
  
  // Add CSS classes for animation
  const style = document.createElement('style');
  style.textContent = `
    .hero, .invitation, .calendar-modern, .program-lux, .polaroid-section, .footer {
      transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .hero-image, .hero-text, .script, .invite-text p, .month-title, .weekdays, .days, .program-title, .program-item, .gallery, .polaroid, .footer-message, .divider {
      transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
  `;
  document.head.appendChild(style);
  
  // Initial check
  checkScroll();
  
  // Listen for scroll events
  window.addEventListener('scroll', checkScroll, { passive: true });
  window.addEventListener('resize', checkScroll);
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  
  // ========== IMPROVED MUSIC ON FIRST SCROLL ==========
  const music = document.getElementById('bgMusic');
  if (music) {
    let musicStarted = false;
    let scrollTriggered = false;
    let isPageVisible = true;
    let wasPlayingBeforeHidden = false;
    
    // Configure music
    music.volume = 0.2;
    music.loop = true;
    
    // Function to start music
    function startMusicOnScroll() {
      if (scrollTriggered) return;
      if (!isPageVisible) return; // Don't start if page is hidden
      
      scrollTriggered = true;
      
      music.play().then(() => {
        musicStarted = true;
        console.log('🎵 Music started on scroll!');
        
        // Gentle fade in
        let vol = 0;
        const fadeInterval = setInterval(() => {
          if (vol < 0.2 && musicStarted) {
            vol += 0.02;
            music.volume = vol;
          } else {
            clearInterval(fadeInterval);
          }
        }, 60);
        
        // Remove scroll listeners after music starts
        window.removeEventListener('scroll', startMusicOnScroll);
        window.removeEventListener('wheel', startMusicOnScroll);
        window.removeEventListener('touchmove', startMusicOnScroll);
        window.removeEventListener('click', startMusicOnScroll);
        window.removeEventListener('keydown', startMusicOnScroll);
        
      }).catch(err => {
        console.log('Browser blocked autoplay, will try on next interaction');
        scrollTriggered = false;
        
        // Try on any user interaction as fallback
        function tryAlternativeStart() {
          if (!scrollTriggered && !musicStarted) {
            music.play().then(() => {
              musicStarted = true;
              scrollTriggered = true;
              console.log('🎵 Music started on user interaction!');
              
              // Clean up listeners
              window.removeEventListener('click', tryAlternativeStart);
              window.removeEventListener('keydown', tryAlternativeStart);
              window.removeEventListener('touchstart', tryAlternativeStart);
              window.removeEventListener('scroll', startMusicOnScroll);
              window.removeEventListener('wheel', startMusicOnScroll);
            }).catch(e => console.log('Still blocked:', e));
          }
        }
        
        window.addEventListener('click', tryAlternativeStart);
        window.addEventListener('keydown', tryAlternativeStart);
        window.addEventListener('touchstart', tryAlternativeStart);
      });
    }
    
    // Handle page visibility (stop music when tab is not active)
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        // Page is hidden (user switched tab)
        if (musicStarted && !music.paused) {
          wasPlayingBeforeHidden = true;
          music.pause();
          console.log('🎵 Music paused - page hidden');
        }
      } else {
        // Page is visible again
        if (musicStarted && wasPlayingBeforeHidden) {
          music.play().then(() => {
            console.log('🎵 Music resumed - page visible');
            wasPlayingBeforeHidden = false;
          }).catch(err => {
            console.log('Could not resume music:', err);
            // If resume fails, restart on next scroll
            if (!scrollTriggered) {
              scrollTriggered = false;
              window.addEventListener('scroll', startMusicOnScroll);
            }
          });
        }
        isPageVisible = true;
      }
    });
    
    // Handle page before unload (cleanup)
    window.addEventListener('beforeunload', function() {
      if (musicStarted && !music.paused) {
        music.pause();
      }
    });
    
    // Add scroll and interaction listeners
    window.addEventListener('scroll', startMusicOnScroll, { passive: true });
    window.addEventListener('wheel', startMusicOnScroll, { passive: true });
    window.addEventListener('touchmove', startMusicOnScroll, { passive: true });
    
    // Also try on click/tap for mobile browsers that require explicit user interaction
    window.addEventListener('click', function onClickStart(e) {
      if (!scrollTriggered && !musicStarted && window.scrollY > 50) {
        startMusicOnScroll();
      }
    });
    
    // Check if user has already scrolled
    if (window.scrollY > 50 || document.documentElement.scrollTop > 50) {
      startMusicOnScroll();
    } else {
      // Show beautiful hint for users
      const hint = document.createElement('div');
      hint.className = 'scroll-hint';
      hint.innerHTML = `
        <div class="hint-content">
          <i class="fas fa-music" style="animation: bounce 1s infinite;"></i>
          <span>🎵 Ոլորեք էջը երաժշտությունը սկսելու համար 🎵</span>
          <i class="fas fa-arrow-down"></i>
        </div>
      `;
      document.body.appendChild(hint);
      
      // Auto-remove hint after 4 seconds
      setTimeout(() => {
        if (hint && hint.parentNode) {
          hint.style.opacity = '0';
          setTimeout(() => {
            if (hint.parentNode) hint.remove();
          }, 500);
        }
      }, 4000);
    }
    
    // Optional: Add event listener for when music ends (though loop is true)
    music.addEventListener('ended', function() {
      if (musicStarted) {
        // Replay if needed (loop should handle this, but just in case)
        music.currentTime = 0;
        music.play().catch(e => console.log('Replay failed:', e));
      }
    });
    
    // Error handling for audio
    music.addEventListener('error', function(e) {
      console.error('Audio error:', e);
      const errorHint = document.createElement('div');
      errorHint.className = 'scroll-hint';
      errorHint.innerHTML = '⚠️ Երաժշտությունը հասանելի չէ, բայց հրավերը մնում է ⚠️';
      errorHint.style.background = 'rgba(100, 100, 100, 0.95)';
      document.body.appendChild(errorHint);
      setTimeout(() => errorHint.remove(), 3000);
    });
  }
  
  // Add footer animation enhancement
  const footer = document.querySelector('.footer');
  if (footer) {
    // Make sure footer content animates smoothly
    const footerText = footer.querySelectorAll('p');
    footerText.forEach((p, index) => {
      p.style.transitionDelay = `${index * 0.1}s`;
    });
  }


  document.getElementById("mapBtn").addEventListener("click", function () {
  window.open("https://yandex.com/maps/-/CPSDUM1d", "_blank");
});
  document.getElementById("mapBtn2").addEventListener("click", function () {
  window.open("https://yandex.com/maps/-/CPSDVS6m", "_blank");
});

});

// Optional: Add a simple fallback for browsers that block all autoplay
// This creates a beautiful "Enable Music" overlay that appears only if needed
setTimeout(() => {
  const music = document.getElementById('bgMusic');
  if (music && !music.played && window.scrollY < 10) {
    // Check if music hasn't started after 3 seconds
    let musicStartedCheck = false;
    music.addEventListener('play', () => { musicStartedCheck = true; });
    
    setTimeout(() => {
      if (!musicStartedCheck && window.scrollY < 10) {
        // Create a subtle floating button (optional - remove if you don't want any button)
        const enableBtn = document.createElement('div');
        enableBtn.innerHTML = '🎵 Սեղմեք երաժշտությունը միացնելու համար 🎵';
        enableBtn.style.cssText = `
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(212, 175, 55, 0.95);
          backdrop-filter: blur(10px);
          color: white;
          padding: 12px 24px;
          border-radius: 50px;
          font-size: 14px;
          cursor: pointer;
          z-index: 1000;
          font-family: inherit;
          box-shadow: 0 5px 20px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
          white-space: nowrap;
        `;
        enableBtn.onclick = function() {
          music.play().then(() => {
            enableBtn.style.opacity = '0';
            setTimeout(() => enableBtn.remove(), 500);
          }).catch(e => console.log('Still blocked'));
        };
        
        enableBtn.onmouseenter = () => enableBtn.style.transform = 'translateX(-50%) scale(1.05)';
        enableBtn.onmouseleave = () => enableBtn.style.transform = 'translateX(-50%) scale(1)';
        
        // Only show if user hasn't scrolled yet
        if (window.scrollY < 10) {
          document.body.appendChild(enableBtn);
          setTimeout(() => {
            if (enableBtn.parentNode && !musicStartedCheck) {
              enableBtn.style.opacity = '0';
              setTimeout(() => enableBtn.remove(), 500);
            }
          }, 8000);
        }
      }
    }, 3000);
  }
}, 1000);