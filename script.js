// ====== INTERNATIONALIZATION (i18n) ======
let currentLanguage = localStorage.getItem('language') || 'fr';
// Function to change language
function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
   
    // Update HTML lang attribute and text direction
    document.documentElement.lang = lang;
    document.documentElement.dir = 'ltr';
   
    // Update all elements with data-i18n
    updatePageTranslations();
}
// Function to get nested translation value
function getTranslation(key) {
    const keys = key.split('.');
    let value = translations[currentLanguage];
   
    if (!value) {
        console.warn(`Language '${currentLanguage}' not found in translations`);
        return key;
    }
   
    for (let k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            console.warn(`Translation key '${key}' not found for language '${currentLanguage}'`);
            return key;
        }
    }
   
    return value || key;
}
// Function to update all page translations
function updatePageTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const text = getTranslation(key);
       
        if (text && typeof text === 'string') {
            // Check if element contains HTML (like <br>)
            if (text.includes('<')) {
                element.innerHTML = text;
            } else {
                element.textContent = text;
            }
        }
    });
   
    // Update language selector
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.value = currentLanguage;
    }
}
// Initialize on page load
window.addEventListener('load', () => {
    // Set initial HTML attributes for the current language
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = 'ltr';
   
    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
        langSelect.value = currentLanguage;
    }
    updatePageTranslations();
});
// ====== NAVIGATION & MENU ======
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
// Toggle mobile menu
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});
// Close menu when a link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        updateActiveLink(link);
    });
});
// Update active nav link
function updateActiveLink(clicked) {
    navLinks.forEach(link => link.classList.remove('active'));
    clicked.classList.add('active');
}
// Smooth scroll with active link tracking
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
   
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});
// Scroll to section function
function scrollToSection(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}
// Service Modal Content (moved to i18n.js - no longer needed here)
// Open Service Modal
function openServiceModal(service) {
    const modal = document.getElementById('serviceModal');
    const modalBody = document.getElementById('modalBody');
    const serviceData = getTranslation(`serviceModal.${service}`);
   
    if (serviceData && typeof serviceData === 'object') {
        modalBody.innerHTML = `
            <h3>${serviceData.title}</h3>
            ${serviceData.content}
        `;
    }
   
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}
// Close Service Modal
function closeServiceModal() {
    document.getElementById('serviceModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}
// Policy Content (moved to i18n.js - no longer needed here)
// Open Policy Modal
function openPolicy(policy) {
    const modal = document.getElementById('policyModal');
    const modalBody = document.getElementById('policyModalBody');
    const policyData = getTranslation(`policyModal.${policy}`);
   
    if (policyData && typeof policyData === 'object') {
        modalBody.innerHTML = `
            <h3>${policyData.title}</h3>
            ${policyData.content}
        `;
    }
   
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}
// Close Policy Modal
function closePolicyModal() {
    document.getElementById('policyModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}
// Close modals when clicking outside
window.addEventListener('click', (event) => {
    const serviceModal = document.getElementById('serviceModal');
    const policyModal = document.getElementById('policyModal');
   
    if (event.target === serviceModal) {
        closeServiceModal();
    }
    if (event.target === policyModal) {
        closePolicyModal();
    }
});
// Handle modals closing on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeServiceModal();
        closePolicyModal();
    }
});
// Floating WhatsApp Button Visibility
document.addEventListener('DOMContentLoaded', () => {
    const contactSection = document.getElementById('contact');
    const whatsappFloat = document.getElementById('whatsapp-float');

    if (contactSection && whatsappFloat) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    whatsappFloat.style.display = 'none';
                } else {
                    whatsappFloat.style.display = 'flex';
                }
            });
        }, { threshold: 0.1 }); // Adjust threshold as needed

        observer.observe(contactSection);
    }
});
console.log('Prestige Security Website Loaded Successfully!');