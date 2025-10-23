// ==========================
// VARIABLES
// ==========================
let userData = null;

// 👇 Meeting Scheduler Variables
const tryServiceBtns = document.querySelectorAll('.tryServiceBtn');
const scheduleOverlay = document.getElementById('bookingModalOverlay');
const scheduleClose = document.getElementById('bookingModalClose');
const meetingDate = document.getElementById('meetingDate');
const meetingTime = document.getElementById('meetingTime');
const scheduleForm = document.getElementById('bookingForm');
const successOverlay = document.getElementById('successOverlay');
const successClose = document.getElementById('successBtn');
const fullNameInput = document.getElementById('bookingName');

// Modal Elements
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('modalClose');
const signupForm = document.getElementById('signupForm');

// ==========================
// SMOOTH SCROLL
// ==========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ==========================
// SIGNUP MODAL LOGIC
// ==========================
closeModal.addEventListener('click', () => {
  modalOverlay.classList.remove('active');
});

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove('active');
  }
});

signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;

  userData = { name, email };

  console.log('User Data:', userData);
  
  modalOverlay.classList.remove('active');
  signupForm.reset();
  
  alert(`✅ Welcome, ${name}! You're all signed up.`);
});

// ==========================
// MEETING SCHEDULER LOGIC (NEW)
// ==========================

// Utility: Check if date is weekend
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

// Set minimum date to today
function setMinDate() {
  const today = new Date();
  const isoToday = today.toISOString().split('T')[0];
  meetingDate.setAttribute('min', isoToday);
}
setMinDate();

// Date validation - block weekends
meetingDate.addEventListener('change', () => {
  const selected = new Date(meetingDate.value);
  if (isWeekend(selected)) {
    alert('Please select Saturday or Sunday only.');
    meetingDate.value = '';
  }
});

// Open meeting popup when "Try This Service" clicked
tryServiceBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!userData) {
      // User not signed up - show signup modal
      modalOverlay.classList.add('active');
      return;
    }
    
    // User signed up - show meeting scheduler
    if (userData.name) {
      fullNameInput.value = userData.name;
    }
    scheduleOverlay.classList.add('active');
    scheduleOverlay.setAttribute('aria-hidden', 'false');
  });
});

// Close meeting popup
scheduleClose.addEventListener('click', () => {
  scheduleOverlay.classList.remove('active');
  scheduleOverlay.setAttribute('aria-hidden', 'true');
});

// Close on outside click
scheduleOverlay.addEventListener('click', e => {
  if (e.target === scheduleOverlay) {
    scheduleOverlay.classList.remove('active');
    scheduleOverlay.setAttribute('aria-hidden', 'true');
  }
});

// Form submission
scheduleForm.addEventListener('submit', e => {
  e.preventDefault();
  
  const dateVal = meetingDate.value;
  const timeVal = meetingTime.value;
  const nameVal = fullNameInput.value;
  const countryVal = document.getElementById('bookingCountry').value;
  
  // Get selected services
  const selectedServices = [];
  document.querySelectorAll('input[name="services"]:checked').forEach(checkbox => {
    selectedServices.push(checkbox.value);
  });
  
  if (!dateVal || !timeVal) {
    alert('Please select both date and time.');
    return;
  }
  
  if (selectedServices.length === 0) {
    alert('Please select at least one service.');
    return;
  }
  
  // Log meeting data
  const meetingData = {
    name: nameVal,
    date: dateVal,
    time: timeVal,
    country: countryVal,
    services: selectedServices,
    userEmail: userData ? userData.email : ''
  };
  
  console.log('Meeting Scheduled:', meetingData);
  
  // Close meeting popup and show success
  scheduleOverlay.classList.remove('active');
  scheduleOverlay.setAttribute('aria-hidden', 'true');
  successOverlay.classList.add('active');
  successOverlay.setAttribute('aria-hidden', 'false');
  
  scheduleForm.reset();
});

// Close success popup
successClose.addEventListener('click', () => {
  successOverlay.classList.remove('active');
  successOverlay.setAttribute('aria-hidden', 'true');
});

successOverlay.addEventListener('click', e => {
  if (e.target === successOverlay) {
    successOverlay.classList.remove('active');
    successOverlay.setAttribute('aria-hidden', 'true');
  }
});

// ==========================
// VIDEO MUTE/UNMUTE + AUTO PLAY (UPDATED)
// ==========================
const videoWrappers = document.querySelectorAll('.video-wrapper');

videoWrappers.forEach(wrapper => {
  const video = wrapper.querySelector('.service-video');
  const soundIndicator = wrapper.querySelector('.sound-indicator');
  const mutedIcon = wrapper.querySelector('.muted-icon');
  const unmutedIcon = wrapper.querySelector('.unmuted-icon');
  const playOverlay = wrapper.querySelector('.play-overlay');
  
  // Mute/Unmute toggle on sound indicator click
  if (soundIndicator) {
    soundIndicator.addEventListener('click', function(e) {
      e.stopPropagation();
      
      if (video.muted) {
        video.muted = false;
        mutedIcon.style.display = 'none';
        unmutedIcon.style.display = 'block';
        soundIndicator.classList.remove('muted');
      } else {
        video.muted = true;
        mutedIcon.style.display = 'block';
        unmutedIcon.style.display = 'none';
        soundIndicator.classList.add('muted');
      }
    });
  }
  
  // Auto-play when video comes into view (Intersection Observer)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.play();
        if (playOverlay) playOverlay.style.opacity = '0';
      } else {
        video.pause();
        if (playOverlay) playOverlay.style.opacity = '1';
      }
    });
  }, { threshold: 0.5 });
  
  observer.observe(wrapper);
  
  // Click on video to play/pause
  wrapper.addEventListener('click', function(e) {
    // Ignore if clicked on sound indicator
    if (soundIndicator && (e.target === soundIndicator || soundIndicator.contains(e.target))) {
      return;
    }
    
    if (video.paused) {
      video.play();
      wrapper.classList.add('playing');
      if (playOverlay) playOverlay.style.opacity = '0';
    } else {
      video.pause();
      wrapper.classList.remove('playing');
      if (playOverlay) playOverlay.style.opacity = '1';
    }
  });
});

// ==========================
// SCROLL ANIMATIONS
// ==========================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.service-card, .about-content, .contact-form').forEach(el => {
  observer.observe(el);
});

// ==========================
// MOBILE MENU TOGGLE
// ==========================
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
  });
  
  // Close menu when clicking on a link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      mobileMenuBtn.classList.remove('active');
    });
  });
}

// ==========================
// FORM VALIDATION
// ==========================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    console.log('Contact Form Data:', data);
    
    alert('✅ Thank you for your message! We will get back to you soon.');
    contactForm.reset();
  });
}