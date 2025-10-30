// ============================================================
// SHREEAI - FRONTEND JAVASCRIPT
// Calls Node.js backend for email sending
// ============================================================

'use strict';

// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {
    // Change this to your backend URL
    API_BASE_URL: 'http://localhost:3000', // Local development
    // API_BASE_URL: 'https://your-backend.com', // Production
};

// ============================================================
// GLOBAL STATE
// ============================================================
const AppState = {
    userData: null,
    isSignedUp: false,
    verificationCode: null,
    codeExpiry: null
};

// ============================================================
// DOM ELEMENTS
// ============================================================
const DOM = {
    // Header
    header: document.getElementById('header'),
    logoBtn: document.getElementById('logoBtn'),
    signupBtn: document.getElementById('signupBtn'),
    profileMenu: document.getElementById('profileMenu'),
    profileName: document.getElementById('profileName'),
    profileInitial: document.getElementById('profileInitial'),
    
    // Signup Modal
    signupModal: document.getElementById('signupModal'),
    signupModalClose: document.getElementById('signupModalClose'),
    signupForm: document.getElementById('signupForm'),
    signupName: document.getElementById('signupName'),
    signupEmail: document.getElementById('signupEmail'),
    signupPassword: document.getElementById('signupPassword'),
    verificationCode: document.getElementById('verificationCode'),
    getCodeBtn: document.getElementById('getCodeBtn'),
    signupSubmitBtn: document.getElementById('signupSubmitBtn'),
    codeSentMsg: document.getElementById('codeSentMsg'),
    
    // Booking Modal
    bookingModal: document.getElementById('bookingModal'),
    bookingModalClose: document.getElementById('bookingModalClose'),
    bookingForm: document.getElementById('bookingForm'),
    bookingName: document.getElementById('bookingName'),
    bookingEmail: document.getElementById('bookingEmail'),
    bookingPhone: document.getElementById('bookingPhone'),
    bookingGender: document.getElementById('bookingGender'),
    bookingCountry: document.getElementById('bookingCountry'),
    meetingDate: document.getElementById('meetingDate'),
    meetingTime: document.getElementById('meetingTime'),
    bookingSubmitBtn: document.getElementById('bookingSubmitBtn'),
    
    // Success Modal
    successModal: document.getElementById('successModal'),
    successBtn: document.getElementById('successBtn'),
    
    // Service Buttons
    serviceButtons: document.querySelectorAll('.btn-service'),
    
    // Video Elements
    videoWrappers: document.querySelectorAll('.service-video-wrapper')
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
const Utils = {
    // Email Validation
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Phone Validation
    isValidPhone(phone) {
        const re = /^[\d\s\+\-\(\)]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },
    
    // Generate 6-digit code
    generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    },
    
    // Check if code expired
    isCodeExpired() {
        if (!AppState.codeExpiry) return true;
        return Date.now() > AppState.codeExpiry;
    },
    
    // Check if date is weekend
    isWeekend(dateString) {
        const date = new Date(dateString);
        const day = date.getDay();
        return day === 0 || day === 6;
    },
    
    // Format date
    formatDate(date) {
        return date.toISOString().split('T')[0];
    },
    
    // Show notification
    notify(message, type = 'info') {
        alert(message);
    },
    
    // Generate booking ID
    generateBookingId() {
        return 'SHREEAI-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
};

// ============================================================
// BACKEND API
// ============================================================
const API = {
    // Send verification code
    async sendVerificationCode(email, code) {
        try {
            console.log('📧 Sending verification email to:', email);
            console.log('🔢 Code:', code);
            console.log('🌐 Backend URL:', `${CONFIG.API_BASE_URL}/api/send-verification`);
            
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/send-verification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    code: code
                })
            });
            
            console.log('📊 Response Status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ API Error:', errorData);
                return false;
            }
            
            const result = await response.json();
            console.log('✅ API Response:', result);
            
            return result.success === true;
            
        } catch (error) {
            console.error('❌ Network Error:', error.message);
            
            // Check if backend is running
            if (error.message.includes('Failed to fetch')) {
                Utils.notify('❌ Cannot connect to backend server. Make sure backend is running on ' + CONFIG.API_BASE_URL);
            }
            
            return false;
        }
    },
    
    // Send booking email
    async sendBookingEmail(bookingData) {
        try {
            console.log('📧 Sending booking email:', bookingData);
            
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/send-booking`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });
            
            console.log('📊 Booking Response Status:', response.status);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Booking API Error:', errorData);
                return false;
            }
            
            const result = await response.json();
            console.log('✅ Booking API Response:', result);
            
            return result.success === true;
            
        } catch (error) {
            console.error('❌ Booking Network Error:', error.message);
            
            if (error.message.includes('Failed to fetch')) {
                Utils.notify('❌ Cannot connect to backend server. Make sure backend is running on ' + CONFIG.API_BASE_URL);
            }
            
            return false;
        }
    },
    
    // Test backend connection
    async testConnection() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/health`);
            const result = await response.json();
            console.log('✅ Backend connection successful:', result);
            return true;
        } catch (error) {
            console.error('❌ Backend connection failed:', error.message);
            return false;
        }
    }
};

// ============================================================
// MODAL MANAGER
// ============================================================
const ModalManager = {
    open(modal) {
        if (!modal) return;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    },
    
    close(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    },
    
    init() {
        // Signup Modal
        DOM.signupModalClose?.addEventListener('click', () => {
            this.close(DOM.signupModal);
        });
        
        DOM.signupModal?.addEventListener('click', (e) => {
            if (e.target === DOM.signupModal) {
                this.close(DOM.signupModal);
            }
        });
        
        // Booking Modal
        DOM.bookingModalClose?.addEventListener('click', () => {
            this.close(DOM.bookingModal);
        });
        
        DOM.bookingModal?.addEventListener('click', (e) => {
            if (e.target === DOM.bookingModal) {
                this.close(DOM.bookingModal);
            }
        });
        
        // Success Modal
        DOM.successBtn?.addEventListener('click', () => {
            this.close(DOM.successModal);
        });
        
        DOM.successModal?.addEventListener('click', (e) => {
            if (e.target === DOM.successModal) {
                this.close(DOM.successModal);
            }
        });
        
        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close(DOM.signupModal);
                this.close(DOM.bookingModal);
                this.close(DOM.successModal);
            }
        });
    }
};

// ============================================================
// SIGNUP MODULE
// ============================================================
const SignupModule = {
    init() {
        DOM.signupBtn?.addEventListener('click', () => {
            ModalManager.open(DOM.signupModal);
        });
        
        DOM.getCodeBtn?.addEventListener('click', () => {
            this.sendVerificationCode();
        });
        
        DOM.signupForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });
    },
    
    async sendVerificationCode() {
        const email = DOM.signupEmail?.value.trim();
        
        if (!email) {
            Utils.notify('Please enter your email address');
            return;
        }
        
        if (!Utils.isValidEmail(email)) {
            Utils.notify('Please enter a valid email address');
            return;
        }
        
        DOM.getCodeBtn.disabled = true;
        DOM.getCodeBtn.textContent = 'Sending...';
        
        const code = Utils.generateCode();
        AppState.verificationCode = code;
        AppState.codeExpiry = Date.now() + (10 * 60 * 1000);
        
        console.log('🔐 Generated Code:', code);
        console.log('⏰ Code Expiry:', new Date(AppState.codeExpiry));
        
        const success = await API.sendVerificationCode(email, code);
        
        if (success) {
            DOM.verificationCode.disabled = false;
            DOM.verificationCode.focus();
            DOM.signupSubmitBtn.disabled = false;
            DOM.codeSentMsg.style.display = 'block';
            DOM.getCodeBtn.textContent = 'Code Sent ✓';
            
            Utils.notify('✅ Verification code sent! Check your email.');
            
            setTimeout(() => {
                DOM.getCodeBtn.disabled = false;
                DOM.getCodeBtn.textContent = 'Resend Code';
            }, 30000);
        } else {
            console.error('❌ Failed to send verification email');
            Utils.notify('❌ Failed to send code. Check console for details.');
            DOM.getCodeBtn.disabled = false;
            DOM.getCodeBtn.textContent = 'Get Code';
        }
    },
    
    handleSignup() {
        const name = DOM.signupName?.value.trim();
        const email = DOM.signupEmail?.value.trim();
        const password = DOM.signupPassword?.value;
        const code = DOM.verificationCode?.value.trim();
        
        if (!name || !email || !password || !code) {
            Utils.notify('Please fill all fields');
            return;
        }
        
        if (!Utils.isValidEmail(email)) {
            Utils.notify('Please enter a valid email');
            return;
        }
        
        if (password.length < 6) {
            Utils.notify('Password must be at least 6 characters');
            return;
        }
        
        if (code.length !== 6) {
            Utils.notify('Verification code must be 6 digits');
            return;
        }
        
        if (Utils.isCodeExpired()) {
            Utils.notify('Verification code expired. Please request a new one.');
            return;
        }
        
        if (code !== AppState.verificationCode) {
            Utils.notify('Invalid verification code. Please try again.');
            return;
        }
        
        DOM.signupSubmitBtn.disabled = true;
        DOM.signupSubmitBtn.textContent = 'Creating Account...';
        
        setTimeout(() => {
            AppState.userData = { name, email };
            AppState.isSignedUp = true;
            
            DOM.signupBtn.style.display = 'none';
            DOM.profileMenu.style.display = 'flex';
            DOM.profileMenu.classList.add('active');
            DOM.profileName.textContent = name;
            DOM.profileInitial.textContent = name.charAt(0).toUpperCase();
            
            DOM.signupForm.reset();
            DOM.verificationCode.disabled = true;
            DOM.signupSubmitBtn.disabled = true;
            DOM.signupSubmitBtn.textContent = 'Create Account';
            DOM.codeSentMsg.style.display = 'none';
            DOM.getCodeBtn.textContent = 'Get Code';
            DOM.getCodeBtn.disabled = false;
            
            ModalManager.close(DOM.signupModal);
            
            Utils.notify(`Welcome, ${name}! You're all set.`);
        }, 1000);
    }
};

// ============================================================
// BOOKING MODULE
// ============================================================
const BookingModule = {
    init() {
        this.setMinDate();
        
        DOM.meetingDate?.addEventListener('change', (e) => {
            this.validateDate(e.target.value);
        });
        
        DOM.serviceButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleServiceClick();
            });
        });
        
        DOM.bookingForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBooking();
        });
    },
    
    setMinDate() {
        if (DOM.meetingDate) {
            const today = Utils.formatDate(new Date());
            DOM.meetingDate.min = today;
        }
    },
    
    validateDate(dateString) {
        if (!dateString) return;
        
        if (!Utils.isWeekend(dateString)) {
            Utils.notify('⚠️ Please select Saturday or Sunday only');
            DOM.meetingDate.value = '';
        }
    },
    
    handleServiceClick() {
        if (!AppState.isSignedUp) {
            Utils.notify('Please sign up first to book a consultation');
            ModalManager.open(DOM.signupModal);
            
            const checkSignup = setInterval(() => {
                if (AppState.isSignedUp) {
                    clearInterval(checkSignup);
                    setTimeout(() => {
                        this.openBookingModal();
                    }, 500);
                }
            }, 100);
            
            setTimeout(() => clearInterval(checkSignup), 30000);
        } else {
            this.openBookingModal();
        }
    },
    
    openBookingModal() {
        if (AppState.userData) {
            DOM.bookingName.value = AppState.userData.name;
            DOM.bookingEmail.value = AppState.userData.email;
        }
        
        ModalManager.open(DOM.bookingModal);
    },
    
    async handleBooking() {
        const name = DOM.bookingName?.value.trim();
        const email = DOM.bookingEmail?.value.trim();
        const phone = DOM.bookingPhone?.value.trim();
        const gender = DOM.bookingGender?.value;
        const country = DOM.bookingCountry?.value.trim();
        const date = DOM.meetingDate?.value;
        const time = DOM.meetingTime?.value;
        
        const services = [];
        document.querySelectorAll('input[name="services"]:checked').forEach(cb => {
            services.push(cb.value);
        });
        
        if (!name || !email || !phone || !gender || !country || !date || !time) {
            Utils.notify('Please fill all required fields');
            return;
        }
        
        if (!Utils.isValidEmail(email)) {
            Utils.notify('Please enter a valid email address');
            return;
        }
        
        if (!Utils.isValidPhone(phone)) {
            Utils.notify('Please enter a valid phone number');
            return;
        }
        
        if (!Utils.isWeekend(date)) {
            Utils.notify('Please select a weekend date (Saturday or Sunday)');
            return;
        }
        
        if (services.length === 0) {
            Utils.notify('Please select at least one service');
            return;
        }
        
        DOM.bookingSubmitBtn.disabled = true;
        DOM.bookingSubmitBtn.textContent = 'Booking...';
        DOM.bookingSubmitBtn.classList.add('loading');
        
        const bookingData = {
            bookingId: Utils.generateBookingId(),
            name,
            email,
            phone,
            gender,
            country,
            date,
            time,
            services,
            createdAt: new Date().toISOString()
        };
        
        const emailSent = await API.sendBookingEmail(bookingData);
        
        if (emailSent) {
            ModalManager.close(DOM.bookingModal);
            ModalManager.open(DOM.successModal);
            DOM.bookingForm.reset();
            
            console.log('✅ Booking successful:', bookingData);
        } else {
            Utils.notify('❌ Booking failed. Check console and try again.');
        }
        
        DOM.bookingSubmitBtn.disabled = false;
        DOM.bookingSubmitBtn.textContent = 'Book Consultation';
        DOM.bookingSubmitBtn.classList.remove('loading');
    }
};

// ============================================================
// VIDEO MODULE
// ============================================================
const VideoModule = {
    init() {
        DOM.videoWrappers.forEach(wrapper => {
            this.setupVideo(wrapper);
        });
    },
    
    setupVideo(wrapper) {
        const video = wrapper.querySelector('.service-video');
        const playBtn = wrapper.querySelector('.video-play-btn');
        const soundBtn = wrapper.querySelector('.video-sound-btn');
        
        if (!video) return;
        
        const togglePlay = () => {
            if (video.paused) {
                video.play();
                wrapper.classList.add('playing');
            } else {
                video.pause();
                wrapper.classList.remove('playing');
            }
        };
        
        wrapper.addEventListener('click', (e) => {
            if (e.target === soundBtn || soundBtn.contains(e.target)) {
                return;
            }
            togglePlay();
        });
        
        playBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlay();
        });
        
        soundBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            video.muted = false;
            soundBtn.classList.toggle('muted');
        });
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                    wrapper.classList.add('playing');
                } else {
                    video.pause();
                    wrapper.classList.remove('playing');
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(wrapper);
    }
};

// ============================================================
// HEADER SCROLL EFFECT
// ============================================================
const HeaderScroll = {
    init() {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                DOM.header?.classList.add('scrolled');
            } else {
                DOM.header?.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }
};

// ============================================================
// INITIALIZE APP
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 ShreeAI Website Initialized');
    console.log('🌐 Backend URL:', CONFIG.API_BASE_URL);
    
    // Test backend connection
    const backendConnected = await API.testConnection();
    if (backendConnected) {
        console.log('✅ Backend server is running!');
    } else {
        console.warn('⚠️ Backend server not reachable. Please start the backend server.');
        console.warn('⚠️ Run: npm start (in backend folder)');
    }
    
    ModalManager.init();
    SignupModule.init();
    BookingModule.init();
    VideoModule.init();
    HeaderScroll.init();
    
    console.log('✅ All modules loaded successfully');
    console.log('💡 Website is 100% ready!');
});

// ============================================================
// ERROR HANDLING
// ============================================================
window.addEventListener('error', (e) => {
    console.error('❌ Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Unhandled promise rejection:', e.reason);
});

