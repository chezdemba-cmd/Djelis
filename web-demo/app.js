/* ==========================================================================
   Djeli'S App Simulator - Full Interactive Multi-Step System
   ========================================================================== */

// ─── CATALOG DATA DATABASE ───────────────────────────────────────────────
const catalog = {
    'c1': {
        title: "Le Trône du Mandé",
        type: "Série",
        year: "2026",
        age: "12+",
        tag: "Historical Series",
        synopsis: "L'épopée historique légendaire qui retrace la fondation de l'Empire du Mali à travers les yeux de Soundiata Keita. Une production originale immersive pleine de drames, de conspirations et d'action historique.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        bannerClass: "hero-banner"
    },
    'c2': {
        title: "Les Secrets du Baobab",
        type: "Film",
        year: "2025",
        age: "Tous publics",
        tag: "Exclusivité",
        synopsis: "Un jeune villageois découvre un parchemin scellé au cœur d'un baobab millénaire, révélant des secrets oubliés qui pourraient changer l'avenir de son peuple.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        bannerStyle: "background-image: url('assets/baobab.png');"
    },
    'c3': {
        title: "L'Or de Ségou",
        type: "Film",
        year: "2024",
        age: "12+",
        tag: "Drame",
        synopsis: "Dans les mines d'or traditionnelles près de Ségou, deux frères s'affrontent entre loyauté familiale et soif de richesse infinie.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        bannerStyle: "background-image: url('assets/king.png');"
    },
    'c4': {
        title: "Taxi à Bamako",
        type: "Film",
        year: "2025",
        age: "Tous publics",
        tag: "Comédie",
        synopsis: "Une folle journée dans les rues animées de Bamako à bord du taxi de Moussa, qui transporte sans le vouloir une mallette pleine de surprises.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        bannerClass: "img-bamako"
    },
    'c5': {
        title: "Le Retour de Guignol",
        type: "Théâtre",
        year: "2026",
        age: "Tous publics",
        tag: "Théâtre",
        synopsis: "La célèbre troupe théâtrale de retour sur scène pour une satire sociale mordante et hilarante qui met en scène la vie moderne urbaine.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        bannerClass: "img-guignol"
    },
    'c6': {
        title: "Abidjan Comedy Show",
        type: "Humour",
        year: "2025",
        age: "10+",
        tag: "Humour",
        synopsis: "Les meilleurs humoristes d'Afrique de l'Ouest se réunissent à Abidjan pour une soirée de stand-up inoubliable, captée en exclusivité pour Djeli'S.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
        bannerClass: "img-comedy"
    },
    'c7': {
        title: "Les Tranches de Vie",
        type: "Série Humour",
        year: "2024",
        age: "Tous publics",
        tag: "Série Humour",
        synopsis: "Une sitcom captivante qui suit le quotidien comique d'une grande famille abidjanaise unie malgré des disputes incessantes.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        bannerClass: "img-vie"
    },
    'c8': {
        title: "L'Empire du Mali",
        type: "Documentaire",
        year: "2026",
        age: "Tous publics",
        tag: "Histoire",
        synopsis: "Une série documentaire en 4 épisodes qui plonge dans la gloire, l'administration, et la richesse culturelle de l'un des plus grands empires d'Afrique.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
        bannerClass: "img-mali"
    },
    'c10': {
        title: "Femmes du Sahel",
        type: "Documentaire",
        year: "2024",
        age: "Tous publics",
        tag: "Culture",
        synopsis: "Portraits de femmes inspirantes au Sahel, qui mènent des projets écologiques, éducatifs et artistiques face aux défis contemporains.",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        bannerClass: "img-sahel"
    }
};

// ─── SUBSCRIPTION PRICE DATABASE (FCFA & EUROS) ───────────────────────────
const planPrices = {
    ao: {
        weekly: { gratuit: "0 FCFA", solo: "2 000 FCFA", famille: "4 500 FCFA", multiecrans: "3 000 FCFA" },
        monthly: { gratuit: "0 FCFA", solo: "5 000 FCFA", famille: "15 000 FCFA", multiecrans: "10 000 FCFA" },
        yearly: { gratuit: "0 FCFA", solo: "50 000 FCFA", famille: "150 000 FCFA", multiecrans: "100 000 FCFA" }
    },
    diaspora: {
        weekly: { gratuit: "0 €", solo: "1.99 €", famille: "3.99 €", multiecrans: "2.99 €" },
        monthly: { gratuit: "0 €", solo: "4.99 €", famille: "12.99 €", multiecrans: "9.99 €" },
        yearly: { gratuit: "0 €", solo: "49.99 €", famille: "129.99 €", multiecrans: "99.99 €" }
    }
};

// ─── DOM SELECTORS ────────────────────────────────────────────────────────
const timeElement = document.getElementById('status-time');
const headerTitle = document.getElementById('header-title');

// Viewports switcher buttons
const viewportBtns = document.querySelectorAll('.selector-btn');

// Header Switcher tabs
const tabDjaasoo = document.getElementById('tab-toggle-djaasoo');
const tabDjelison = document.getElementById('tab-toggle-djelison');
const screenDjaasoo = document.getElementById('screen-djaasoo');
const screenDjelison = document.getElementById('screen-djelison');

// Djelison Sub-tabs selectors
const djelisonTabPodcasts = document.getElementById('djelison-tab-podcasts');
const djelisonTabMusic = document.getElementById('djelison-tab-music');
const djelisonPodcastsContent = document.getElementById('djelison-podcasts-content');
const djelisonMusicContent = document.getElementById('djelison-music-content');

// Djaasoo Sub-tabs selectors
const djaasooTabCinema = document.getElementById('djaasoo-tab-cinema');
const djaasooTabTheatre = document.getElementById('djaasoo-tab-theatre');
const djaasooTabDocs = document.getElementById('djaasoo-tab-docs');
const djaasooCinemaContent = document.getElementById('djaasoo-cinema-content');
const djaasooTheatreContent = document.getElementById('djaasoo-theatre-content');
const djaasooDocsContent = document.getElementById('djaasoo-docs-content');

// Navigation triggers
const navHome = document.getElementById('nav-home');
const navSearch = document.getElementById('nav-search');
const navMylist = document.getElementById('nav-mylist');
const navProfile = document.getElementById('nav-profile');

const sideNavHome = document.getElementById('side-nav-home');
const sideNavSearch = document.getElementById('side-nav-search');
const sideNavMylist = document.getElementById('side-nav-mylist');
const sideNavProfile = document.getElementById('side-nav-profile');
const sideNavPlans = document.getElementById('side-nav-plans');

// Screens pages containers
const pageHome = document.getElementById('page-home');
const pageSearch = document.getElementById('page-search');
const pageMylist = document.getElementById('page-mylist');
const pageProfile = document.getElementById('page-profile');

// Overlays & Modals
const detailsModal = document.getElementById('details-modal');
const plansModal = document.getElementById('plans-modal');
const videoPlayerScreen = document.getElementById('video-player-screen');
const settingsModal = document.getElementById('settings-modal'); // now inlined, modal selector fallback

// Dynamic Island
const dynamicIsland = document.querySelector('.dynamic-island');

// Audio Players
const globalAudio = document.getElementById('global-audio-element');
const miniPlayer = document.getElementById('mini-player');
const playerProgressBar = document.getElementById('player-progress');
const playerTrackName = document.getElementById('player-track-name');
const playerTrackArtist = document.getElementById('player-track-artist');
const playerPlayPauseBtn = document.getElementById('player-play-pause-btn');
const playerPlayIcon = document.getElementById('player-play-icon');
const playerCloseBtn = document.getElementById('player-close-btn');

// Video Players
const mainVideoPlayer = document.getElementById('main-video-player');
const videoProgressBar = document.getElementById('video-progress-bar');
const videoPlayBtn = document.getElementById('video-play-btn');
const videoPlayIcon = document.getElementById('video-play-icon');
const videoTimeDisplay = document.getElementById('video-time');
const videoSpinner = document.getElementById('video-spinner');

// Actions header
const headerSearchBtn = document.getElementById('header-search-btn');
const headerProfileBtn = document.getElementById('header-profile-btn');
const headerGuestBtn = document.getElementById('header-guest-btn');

// Search elements
const searchInputPage = document.getElementById('search-input-page');
const searchPageResults = document.getElementById('search-page-results');
const searchGenresGrid = document.getElementById('search-genres-grid');

// Profile sub-views
const profileSubpageUnauth = document.getElementById('profile-subpage-unauth');
const profileSubpageHome = document.getElementById('profile-subpage-home');
const profileSubpageSettings = document.getElementById('profile-subpage-settings');

// My List sub-views
const mylistUnauth = document.getElementById('mylist-unauth');
const mylistAuth = document.getElementById('mylist-auth');

// Registration flow wizard fields
const wizName = document.getElementById('wiz-name');
const wizEmail = document.getElementById('wiz-email');
const wizPhone = document.getElementById('wiz-phone');
const wizPass = document.getElementById('wiz-pass');
const wizGroupEmail = document.getElementById('wiz-group-email');
const wizGroupPhone = document.getElementById('wiz-group-phone');

// Plans filters
const regionBtns = document.querySelectorAll('#plan-region-selector .pill-btn');
const freqBtns = document.querySelectorAll('#plan-freq-selector .pill-btn');

// Session State
let currentActiveContentId = null;
let currentDeviceMode = "mobile";
let currentActivePage = "home";
let selectedRegion = "ao";
let selectedFreq = "weekly";
let wizardSelectedPlanName = "Famille";
let wizardRegMethod = "email";

let userSession = {
    isLoggedIn: true,
    name: "Sidiki Keita",
    email: "sidiki.keita@djelis.com",
    phone: "+223 70 00 00 00",
    subscription: "Djeli'S Premium VIP (10 000 FCFA/Mois)"
};

// Offline and Download States
let isOffline = false;
let downloadedVideos = []; // array of catalog keys: ['c2']
let downloadedAudios = []; // array of audio objects: [{title, artist, cover, url}]
let activeDownloads = new Set(); // set of content IDs or titles currently downloading
let downloadIntervals = new Map(); // map: contentId/title -> intervalId
let downloadProgresses = new Map(); // map: contentId/title -> progress percentage
const LIMIT_VIDEOS = 3;
const LIMIT_AUDIOS = 15;
let currentMylistTab = "fav"; // 'fav' or 'dl'

// ─── INITIALIZATION & CLOCK ───────────────────────────────────────────────
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}`;
}
setInterval(updateClock, 1000);
updateClock();

// ─── VIEWPORT DEVICE SWITCHER ──────────────────────────────────────────────
viewportBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        viewportBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.body.className = `mode-${mode}`;
        currentDeviceMode = mode;
        
        triggerDynamicIslandPulse(`Mode ${mode.toUpperCase()}`);
        
        if (mode === 'tv') {
            initTvFocus();
        } else {
            clearTvFocus();
        }
    });
});

// ─── SCREEN TABS TOGGLE (DJAASOO / DJELISON) ──────────────────────────────
function toggleScreenTab(tab) {
    if (tab === 'djaasoo') {
        tabDjaasoo.classList.add('active');
        tabDjelison.classList.remove('active');
        screenDjaasoo.classList.add('active');
        screenDjelison.classList.remove('active');
    } else {
        tabDjaasoo.classList.remove('active');
        tabDjelison.classList.add('active');
        screenDjaasoo.classList.remove('active');
        screenDjelison.classList.add('active');
    }
}

tabDjaasoo.addEventListener('click', () => toggleScreenTab('djaasoo'));
tabDjelison.addEventListener('click', () => toggleScreenTab('djelison'));

// ─── DJELISON SUB-TABS TOGGLE (PODCASTS / MUSIC) ──────────────────────────
function toggleDjelisonSubTab(tab) {
    if (tab === 'podcasts') {
        djelisonTabPodcasts.classList.add('active');
        djelisonTabMusic.classList.remove('active');
        djelisonPodcastsContent.classList.add('active');
        djelisonMusicContent.classList.remove('active');
    } else {
        djelisonTabPodcasts.classList.remove('active');
        djelisonTabMusic.classList.add('active');
        djelisonPodcastsContent.classList.remove('active');
        djelisonMusicContent.classList.add('active');
    }
    
    // Refresh TV spatial navigation focus when components show/hide
    if (currentDeviceMode === 'tv') {
        setTimeout(initTvFocus, 100);
    }
}

if (djelisonTabPodcasts) {
    djelisonTabPodcasts.addEventListener('click', () => toggleDjelisonSubTab('podcasts'));
}
if (djelisonTabMusic) {
    djelisonTabMusic.addEventListener('click', () => toggleDjelisonSubTab('music'));
}

// ─── DJAASOO SUB-TABS TOGGLE (CINEMA / THEATRE / DOCS) ────────────────────
function toggleDjaasooSubTab(tab) {
    djaasooTabCinema.classList.remove('active');
    djaasooTabTheatre.classList.remove('active');
    djaasooTabDocs.classList.remove('active');
    djaasooCinemaContent.classList.remove('active');
    djaasooTheatreContent.classList.remove('active');
    djaasooDocsContent.classList.remove('active');
    
    if (tab === 'cinema') {
        djaasooTabCinema.classList.add('active');
        djaasooCinemaContent.classList.add('active');
    } else if (tab === 'theatre') {
        djaasooTabTheatre.classList.add('active');
        djaasooTheatreContent.classList.add('active');
    } else if (tab === 'docs') {
        djaasooTabDocs.classList.add('active');
        djaasooDocsContent.classList.add('active');
    }
    
    // Refresh TV spatial navigation focus when components show/hide
    if (currentDeviceMode === 'tv') {
        setTimeout(initTvFocus, 100);
    }
}

if (djaasooTabCinema) {
    djaasooTabCinema.addEventListener('click', () => toggleDjaasooSubTab('cinema'));
}
if (djaasooTabTheatre) {
    djaasooTabTheatre.addEventListener('click', () => toggleDjaasooSubTab('theatre'));
}
if (djaasooTabDocs) {
    djaasooTabDocs.addEventListener('click', () => toggleDjaasooSubTab('docs'));
}

// ─── MAIN PAGES ROUTING & NAVIGATION ──────────────────────────────────────
function showPage(pageId) {
    currentActivePage = pageId;
    
    pageHome.classList.remove('active');
    pageSearch.classList.remove('active');
    pageMylist.classList.remove('active');
    pageProfile.classList.remove('active');
    
    document.getElementById(`page-${pageId}`).classList.add('active');
    
    const navItems = [navHome, navSearch, navMylist, navProfile];
    navItems.forEach(item => item.classList.remove('active'));
    document.getElementById(`nav-${pageId}`).classList.add('active');

    const sideNavItems = [sideNavHome, sideNavSearch, sideNavMylist, sideNavProfile];
    sideNavItems.forEach(item => item.classList.remove('active'));
    document.getElementById(`side-nav-${pageId}`).classList.add('active');
    
    // Auto sync Profile Sub-pages depending on login status
    if (pageId === 'profile') {
        syncProfileSubpage();
    }

    // Auto sync My List views
    if (pageId === 'mylist') {
        syncMylistView();
    }
    
    if (currentDeviceMode === 'tv') {
        setTimeout(initTvFocus, 100);
    }
}

navHome.addEventListener('click', () => showPage('home'));
navSearch.addEventListener('click', () => showPage('search'));
navMylist.addEventListener('click', () => showPage('mylist'));
navProfile.addEventListener('click', () => {
    if (currentDeviceMode === 'mobile') {
        openMobileProfileMenu();
    } else {
        showPage('profile');
    }
});

sideNavHome.addEventListener('click', () => showPage('home'));
sideNavSearch.addEventListener('click', () => showPage('search'));
sideNavMylist.addEventListener('click', () => showPage('mylist'));
sideNavProfile.addEventListener('click', () => showPage('profile'));

headerSearchBtn.addEventListener('click', () => showPage('search'));
headerProfileBtn.addEventListener('click', () => {
    if (currentDeviceMode === 'mobile') {
        openMobileProfileMenu();
    } else {
        showPage('profile');
    }
});

// ─── MOBILE PROFILE DRAWER MENU ───────────────────────────────────────────
const mobileProfileOverlay = document.getElementById('mobile-profile-overlay');
const mobileProfileDrawer  = document.getElementById('mobile-profile-drawer');
let drawerSubmenuOpen = false;

function openMobileProfileMenu() {
    // Sync user identity inside the drawer
    const nameEl = document.getElementById('drawer-user-name');
    const subEl  = document.getElementById('drawer-user-sub');
    if (nameEl) nameEl.textContent = userSession.isLoggedIn ? userSession.name : 'Invité';
    if (subEl)  subEl.textContent  = userSession.isLoggedIn ? 'Premium VIP' : 'Non connecté';

    mobileProfileOverlay.classList.add('open');
    mobileProfileDrawer.classList.add('open');
    // Reset sub-menu state each time drawer opens
    closeDrawerProfileSubmenu();
}

window.closeMobileProfileMenu = function() {
    mobileProfileOverlay.classList.remove('open');
    mobileProfileDrawer.classList.remove('open');
};

window.toggleDrawerProfileSubmenu = function() {
    if (drawerSubmenuOpen) {
        closeDrawerProfileSubmenu();
    } else {
        openDrawerProfileSubmenu();
    }
};

function openDrawerProfileSubmenu() {
    drawerSubmenuOpen = true;
    const submenu = document.getElementById('drawer-profile-submenu');
    const toggle = document.getElementById('dmenu-profile-toggle');
    if (submenu) submenu.classList.add('open');
    if (toggle) toggle.classList.add('expanded');
}

function closeDrawerProfileSubmenu() {
    drawerSubmenuOpen = false;
    const submenu = document.getElementById('drawer-profile-submenu');
    const toggle = document.getElementById('dmenu-profile-toggle');
    if (submenu) submenu.classList.remove('open');
    if (toggle) toggle.classList.remove('expanded');
}

window.mobileMenuNavigate = function(pageId) {
    closeMobileProfileMenu();
    // Small delay so animation feels smooth before page change
    setTimeout(() => showPage(pageId), 200);
};

window.openPlansFromDrawer = function() {
    closeMobileProfileMenu();
    setTimeout(() => {
        const plansModal = document.getElementById('plans-modal');
        if (plansModal) plansModal.style.display = 'flex';
    }, 200);
};

window.mobileMenuLogout = function() {
    closeMobileProfileMenu();
    setTimeout(() => {
        userSession.isLoggedIn = false;
        userSession.name = '';
        userSession.email = '';
        updateSessionUI();
        triggerDynamicIslandPulse('Déconnexion réussie');
        showPage('home');
    }, 250);
};

// ─── DETAIL MODAL (GUEST BLOCKED WATCH TRIGGERS) ─────────────────────────
window.openDetails = function(contentId) {
    // 🌟 PUSH TO REGISTER: Force guest to subscribe/register before viewing details
    if (!userSession.isLoggedIn) {
        triggerDynamicIslandPulse("Inscription requise");
        openAuthModal();
        return;
    }

    const item = catalog[contentId];
    if (!item) return;
    
    currentActiveContentId = contentId;
    
    document.getElementById('modal-title-text').textContent = item.title;
    document.getElementById('modal-synopsis-text').textContent = item.synopsis;
    document.getElementById('modal-type').textContent = item.type;
    document.getElementById('modal-year').textContent = item.year;
    document.getElementById('modal-age').textContent = item.age;
    
    const banner = document.getElementById('modal-banner-img');
    if (item.bannerStyle) {
        banner.className = 'modal-banner';
        banner.style = item.bannerStyle;
    } else {
        banner.className = 'modal-banner ' + (item.bannerClass || 'img-secrets');
        banner.style = '';
    }
    
    // Update modal download button state
    const dlBtn = document.getElementById('modal-download-btn');
    if (dlBtn) {
        if (downloadedVideos.includes(contentId)) {
            dlBtn.className = 'modal-download-btn tv-focusable downloaded';
            dlBtn.innerHTML = `<span class="material-icons-round" id="modal-download-icon">check_circle</span>`;
        } else if (activeDownloads.has(contentId)) {
            dlBtn.className = 'modal-download-btn tv-focusable downloading';
            const progress = downloadProgresses.get(contentId) || 0;
            dlBtn.innerHTML = `<span style="font-size: 12px; font-weight: bold;">${progress}%</span>`;
        } else {
            dlBtn.className = 'modal-download-btn tv-focusable';
            dlBtn.innerHTML = `<span class="material-icons-round" id="modal-download-icon">download</span>`;
        }
    }

    // Update details modal play controls based on restrictions
    const isFreeOrGuest = !userSession.isLoggedIn || (userSession.subscription && userSession.subscription.includes("Gratuit"));
    let isRestricted = false;
    if (!userSession.isLoggedIn) {
        isRestricted = true;
    } else if (userSession.subscription && userSession.subscription.includes("Gratuit")) {
        const type = item.type.toLowerCase();
        isRestricted = type.includes("film") || type.includes("série") || type.includes("serie") || type.includes("documentaire");
    }

    const modalPlayOverlay = document.querySelector('#details-modal .modal-play-overlay');
    const modalActionBtn = document.querySelector('#details-modal .modal-action-btn');
    
    if (modalPlayOverlay && modalActionBtn) {
        if (isFreeOrGuest && isRestricted) {
            modalPlayOverlay.innerHTML = '<span class="material-icons-round" style="color: var(--primary-gold);">lock</span>';
            modalPlayOverlay.setAttribute('onclick', 'event.stopPropagation(); openPlans();');
            modalPlayOverlay.style.background = 'rgba(0, 0, 0, 0.85)';
            
            modalActionBtn.innerHTML = '<span class="material-icons-round">stars</span> S\'abonner pour regarder';
            modalActionBtn.setAttribute('onclick', 'openPlans();');
            modalActionBtn.style.background = 'linear-gradient(135deg, var(--secondary-orange) 0%, var(--primary-gold) 100%)';
            modalActionBtn.style.color = '#000000';
            modalActionBtn.style.fontWeight = '800';
        } else {
            modalPlayOverlay.innerHTML = '<span class="material-icons-round">play_arrow</span>';
            modalPlayOverlay.setAttribute('onclick', 'startVideoPlayer();');
            modalPlayOverlay.style.background = '';
            
            modalActionBtn.innerHTML = '<span class="material-icons-round">play_arrow</span> Commencer la lecture';
            modalActionBtn.setAttribute('onclick', 'startVideoPlayer();');
            modalActionBtn.style.background = '';
            modalActionBtn.style.color = '';
            modalActionBtn.style.fontWeight = '';
        }
    }

    detailsModal.style.display = 'flex';
    
    if (currentDeviceMode === 'tv') {
        setTimeout(initTvFocus, 100);
    }
};

window.closeDetails = function() {
    detailsModal.style.display = 'none';
    if (currentDeviceMode === 'tv') {
        setTimeout(initTvFocus, 100);
    }
};

// ─── INLINE PROFILE VIEW ROUTER ───────────────────────────────────────────
window.switchProfileSubpage = function(subpageId) {
    // hide all profile subpages
    profileSubpageUnauth.classList.remove('active');
    profileSubpageHome.classList.remove('active');
    profileSubpageSettings.classList.remove('active');
    
    // show target subpage
    if (subpageId === 'home') {
        profileSubpageHome.classList.add('active');
    } else if (subpageId === 'settings') {
        profileSubpageSettings.classList.add('active');
        // populate settings fields with session state
        document.getElementById('set-name-input').value = userSession.name;
        document.getElementById('set-email-input').value = userSession.email;
        document.getElementById('set-phone-input').value = userSession.phone;
    } else {
        profileSubpageUnauth.classList.add('active');
    }
    
    if (currentDeviceMode === 'tv') {
        setTimeout(initTvFocus, 100);
    }
};

function syncProfileSubpage() {
    if (userSession.isLoggedIn) {
        switchProfileSubpage('home');
    } else {
        switchProfileSubpage('unauth');
    }
}

function syncMylistView() {
    if (userSession.isLoggedIn) {
        mylistUnauth.style.display = 'none';
        mylistAuth.style.display = 'block';
    } else {
        mylistUnauth.style.display = 'flex';
        mylistAuth.style.display = 'none';
    }
    applyCardRestrictions();
}

// ─── MULTI-STEP REGISTRATION WIZARD (PLANS MODAL WIZARD) ──────────────────
window.openPlans = function() {
    plansModal.style.display = 'flex';
    // If guest, launch registration wizard Step 1, otherwise launch plan picker Step 2
    if (!userSession.isLoggedIn) {
        goToWizardStep(1);
    } else {
        goToWizardStep(2);
    }
    // Refresh displayed prices to match current freq selection (default: weekly)
    updatePlansPrices();
};

window.closePlans = function() {
    plansModal.style.display = 'none';
    if (currentDeviceMode === 'tv') {
        setTimeout(initTvFocus, 100);
    }
};

sideNavPlans.addEventListener('click', openPlans);

// Wizard Steps switcher
window.goToWizardStep = function(stepNum) {
    // Hide all steps
    document.querySelectorAll('.register-flow-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Deactivate indicators
    document.querySelectorAll('.indicator-step').forEach(ind => {
        ind.classList.remove('active');
    });
    
    if (stepNum === 'login') {
        // Show standalone login panel inside wizard
        document.getElementById('flow-step-login').classList.add('active');
        document.getElementById('simple-email-input').value = userSession.email || "sidiki.keita@djelis.com";
        document.getElementById('simple-phone-input').value = userSession.phone || "+223 70 00 00 00";
    } else {
        // Show target step
        document.getElementById(`flow-step-${stepNum}`).classList.add('active');
        
        // Highlight active and preceding indicators
        for (let i = 1; i <= stepNum; i++) {
            const ind = document.getElementById(`ind-step-${i}`);
            if (ind) ind.classList.add('active');
        }
    }
    
    if (currentDeviceMode === 'tv') {
        setTimeout(initTvFocus, 100);
    }
};

// Wizard Step 1: Coordinates validation
window.switchWizMethod = function(method) {
    const emailBtn = document.getElementById('wiz-method-email');
    const phoneBtn = document.getElementById('wiz-method-phone');
    
    if (method === 'email') {
        wizardRegMethod = 'email';
        emailBtn.classList.add('active');
        phoneBtn.classList.remove('active');
        wizGroupEmail.style.display = 'block';
        wizGroupPhone.style.display = 'none';
    } else {
        wizardRegMethod = 'phone';
        emailBtn.classList.remove('active');
        phoneBtn.classList.add('active');
        wizGroupEmail.style.display = 'none';
        wizGroupPhone.style.display = 'block';
    }
};

window.handleWizardStep1 = function(e) {
    e.preventDefault();
    
    // Save wizard input to temporary profile state
    userSession.name = wizName.value.trim();
    userSession.email = wizEmail.value.trim() || `${userSession.name.toLowerCase().replace(' ', '.')}@djelis.com`;
    userSession.phone = wizPhone.value.trim() || "+223 70 00 00 00";
    
    // Advance to Step 2 (Forfait selector)
    goToWizardStep(2);
};

// Wizard Step 2: Forfait selection
// Region/Frequency selectors inside Step 2
regionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        regionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedRegion = btn.getAttribute('data-region');
        updatePlansPrices();
    });
});

freqBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        freqBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedFreq = btn.getAttribute('data-freq');
        updatePlansPrices();
    });
});

function updatePlansPrices() {
    const prices = planPrices[selectedRegion][selectedFreq];
    const priceGratuitEl = document.getElementById('price-gratuit');
    if (priceGratuitEl) priceGratuitEl.textContent = prices.gratuit;
    document.getElementById('price-solo').textContent = prices.solo;
    document.getElementById('price-famille').textContent = prices.famille;
    document.getElementById('price-multiecrans').textContent = prices.multiecrans;
}

const countryData = {
    ml: { prefix: "+223", operators: [ { id: "orange", name: "Orange Money", css: "operator-orange" }, { id: "wave", name: "Wave", css: "operator-wave" }, { id: "moov", name: "Moov Money", css: "operator-moov" } ] },
    bf: { prefix: "+226", operators: [ { id: "orange", name: "Orange Money", css: "operator-orange" }, { id: "moov", name: "Moov Money", css: "operator-moov" } ] },
    sn: { prefix: "+221", operators: [ { id: "orange", name: "Orange Money", css: "operator-orange" }, { id: "wave", name: "Wave", css: "operator-wave" }, { id: "free", name: "Free Money", css: "operator-free" } ] },
    ci: { prefix: "+225", operators: [ { id: "orange", name: "Orange Money", css: "operator-orange" }, { id: "wave", name: "Wave", css: "operator-wave" }, { id: "mtn", name: "MTN MoMo", css: "operator-mtn" }, { id: "moov", name: "Moov Money", css: "operator-moov" } ] },
    gn: { prefix: "+224", operators: [ { id: "orange", name: "Orange Money", css: "operator-orange" }, { id: "mtn", name: "MTN MoMo", css: "operator-mtn" } ] },
    gq: { prefix: "+220", operators: [ { id: "qmoney", name: "QMoney", css: "operator-wave" }, { id: "africell", name: "Africell Money", css: "operator-orange" } ] },
    bj: { prefix: "+229", operators: [ { id: "mtn", name: "MTN MoMo", css: "operator-mtn" }, { id: "moov", name: "Moov Money", css: "operator-moov" } ] },
    tg: { prefix: "+228", operators: [ { id: "tmoney", name: "T-Money", css: "operator-orange" }, { id: "moov", name: "Moov Money", css: "operator-moov" } ] }
};

window.updateMobileMoneyOperators = function() {
    const countrySelect = document.getElementById('payment-country-select');
    if (!countrySelect) return;
    const country = countrySelect.value;
    const data = countryData[country];
    if (!data) return;

    const prefixEl = document.getElementById('momo-phone-prefix');
    if (prefixEl) prefixEl.textContent = data.prefix;

    const pillsContainer = document.getElementById('momo-operator-pills');
    if (pillsContainer) {
        pillsContainer.innerHTML = '';
        data.operators.forEach((op, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `operator-pill ${op.css} tv-focusable${index === 0 ? ' active' : ''}`;
            button.setAttribute('data-operator', op.id);
            button.onclick = () => selectOperatorPill(button);
            
            let iconText = 'account_balance_wallet';
            if (op.id === 'orange') iconText = 'payments';
            else if (op.id === 'wave') iconText = 'account_balance_wallet';
            else if (op.id === 'mtn') iconText = 'monetization_on';
            else if (op.id === 'moov') iconText = 'price_check';
            
            button.innerHTML = `
                <span class="material-icons-round operator-logo-icon">${iconText}</span>
                <span>${op.name}</span>
            `;
            pillsContainer.appendChild(button);
        });
    }
    
    if (currentDeviceMode === 'tv') {
        setTimeout(initTvFocus, 100);
    }
};

window.selectOperatorPill = function(selectedButton) {
    const pills = document.querySelectorAll('.operator-pill');
    pills.forEach(pill => pill.classList.remove('active'));
    selectedButton.classList.add('active');
};

window.switchDiasporaPayMethod = function(method) {
    const paytabCard = document.getElementById('paytab-card');
    const paytabPaypal = document.getElementById('paytab-paypal');
    const payformCard = document.getElementById('payform-card');
    const payformPaypal = document.getElementById('payform-paypal');
    
    if (method === 'card') {
        if (paytabCard) paytabCard.classList.add('active');
        if (paytabPaypal) paytabPaypal.classList.remove('active');
        if (payformCard) payformCard.style.display = 'block';
        if (payformPaypal) payformPaypal.style.display = 'none';
    } else {
        if (paytabCard) paytabCard.classList.remove('active');
        if (paytabPaypal) paytabPaypal.classList.add('active');
        if (payformCard) payformCard.style.display = 'none';
        if (payformPaypal) payformPaypal.style.display = 'block';
    }
    
    if (currentDeviceMode === 'tv') {
        setTimeout(initTvFocus, 100);
    }
};

window.syncPaymentMethodsUI = function() {
    const payAo = document.getElementById('payment-ao-container');
    const payDiaspora = document.getElementById('payment-diaspora-container');
    const payFree = document.getElementById('payment-free-notice');
    const payTitle = document.getElementById('payment-title');
    
    if (wizardSelectedPlanName === 'Gratuit') {
        if (payAo) payAo.style.display = 'none';
        if (payDiaspora) payDiaspora.style.display = 'none';
        if (payFree) payFree.style.display = 'flex';
        if (payTitle) payTitle.style.display = 'none';
        return;
    }
    
    if (payFree) payFree.style.display = 'none';
    if (payTitle) payTitle.style.display = 'block';

    if (selectedRegion === 'ao') {
        if (payAo) payAo.style.display = 'block';
        if (payDiaspora) payDiaspora.style.display = 'none';
        updateMobileMoneyOperators();
        
        // Auto-fill phone if available and match prefix format
        const momoPhoneInput = document.getElementById('momo-phone-input');
        const wizPhoneInput = document.getElementById('wiz-phone');
        if (momoPhoneInput && wizPhoneInput && wizPhoneInput.value) {
            let rawPhone = wizPhoneInput.value.replace(/\s+/g, '');
            const currentPrefix = document.getElementById('momo-phone-prefix').textContent;
            if (rawPhone.startsWith(currentPrefix)) {
                rawPhone = rawPhone.substring(currentPrefix.length);
            } else if (rawPhone.startsWith('00') && rawPhone.substring(2).startsWith(currentPrefix.substring(1))) {
                rawPhone = rawPhone.substring(2 + currentPrefix.length - 1);
            } else if (rawPhone.startsWith('+')) {
                rawPhone = rawPhone.substring(4);
            }
            momoPhoneInput.value = rawPhone;
        }
    } else {
        if (payAo) payAo.style.display = 'none';
        if (payDiaspora) payDiaspora.style.display = 'block';
        switchDiasporaPayMethod('card');
    }
};

window.wizardSelectPlan = function(tierName) {
    wizardSelectedPlanName = tierName;
    const cycleText = selectedFreq === 'weekly' ? 'Semaine' : (selectedFreq === 'yearly' ? 'An' : 'Mois');
    
    let key = 'solo';
    if (tierName === 'Gratuit') key = 'gratuit';
    else if (tierName === 'Famille') key = 'famille';
    else if (tierName === 'Multi-Écrans' || tierName === 'multiecrans') key = 'multiecrans';
    
    const priceText = planPrices[selectedRegion][selectedFreq][key];
    
    // Store selected plan string
    userSession.subscription = `Djeli'S ${tierName} (${priceText}/${cycleText})`;
    
    // Populate Step 3 summary fields
    document.getElementById('sum-name').textContent = userSession.name || "Sidiki Keita";
    document.getElementById('sum-login').textContent = wizardRegMethod === 'email' ? userSession.email : userSession.phone;
    document.getElementById('sum-plan').textContent = `${tierName} (${priceText} / ${cycleText})`;
    
    // Sync payment methods layout dynamically
    syncPaymentMethodsUI();

    // Advance to Step 3
    goToWizardStep(3);
};

// Wizard Step 3: Finalize registration and subscribe with simulated payment loading
window.wizardFinalize = function() {
    const finalizeBtn = document.querySelector('#flow-step-3 .modal-action-btn');
    if (!finalizeBtn) return;
    
    const originalHTML = finalizeBtn.innerHTML;
    finalizeBtn.disabled = true;
    finalizeBtn.innerHTML = `<span class="spinner-small" style="display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: rotateDl 0.8s linear infinite; margin-right: 8px; vertical-align: middle;"></span> Traitement du paiement...`;
    
    let payMessage = "Profil Activé !";
    if (wizardSelectedPlanName !== 'Gratuit') {
        if (selectedRegion === 'ao') {
            const countrySelect = document.getElementById('payment-country-select');
            const countryName = countrySelect ? countrySelect.options[countrySelect.selectedIndex].text : "Afrique de l'Ouest";
            const activeOp = document.querySelector('.operator-pill.active');
            const opName = activeOp ? activeOp.textContent.trim() : "Mobile Money";
            payMessage = `Abonnement validé via ${opName} (${countryName}) !`;
        } else {
            const isCard = document.getElementById('paytab-card') ? document.getElementById('paytab-card').classList.contains('active') : true;
            const activeMethod = isCard ? "Carte Bancaire" : "PayPal";
            payMessage = `Abonnement validé par ${activeMethod} !`;
        }
    }

    setTimeout(() => {
        userSession.isLoggedIn = true;
        updateSessionUI();
        closePlans();
        triggerDynamicIslandPulse(payMessage);
        
        // Reset button
        finalizeBtn.disabled = false;
        finalizeBtn.innerHTML = originalHTML;

        // Auto redirect to Home
        showPage('home');
    }, 1500);
};

// Shortcut to login direct from wizard
window.showSimpleLogin = function() {
    goToWizardStep('login');
};

// Direct Simple Login form inside wizard modal
window.switchSimpleLoginMethod = function(method) {
    const emailBtn = document.getElementById('simple-login-email-btn');
    const phoneBtn = document.getElementById('simple-login-phone-btn');
    const emailGroup = document.getElementById('simple-group-email');
    const phoneGroup = document.getElementById('simple-group-phone');
    
    if (method === 'email') {
        emailBtn.classList.add('active');
        phoneBtn.classList.remove('active');
        emailGroup.style.display = 'block';
        phoneGroup.style.display = 'none';
    } else {
        emailBtn.classList.remove('active');
        phoneBtn.classList.add('active');
        emailGroup.style.display = 'none';
        phoneGroup.style.display = 'block';
    }
};

window.handleSimpleLogin = function(e) {
    e.preventDefault();
    
    // Simulating quick login using stored coordinates or fallback
    userSession.name = userSession.name || "Sidiki Keita";
    userSession.email = document.getElementById('simple-email-input').value;
    userSession.phone = document.getElementById('simple-phone-input').value;
    userSession.isLoggedIn = true;
    userSession.subscription = userSession.subscription === "Djeli'S Free" ? "Djeli'S Premium VIP (10 000 FCFA/Mois)" : userSession.subscription;
    
    updateSessionUI();
    closePlans();
    triggerDynamicIslandPulse("Bienvenue !");
    showPage('home');
};

// Standalone Auth Modal fallback
window.openAuthModal = function() {
    // Redirect direct to plans wizard step 1
    openPlans();
};

window.performLogout = function() {
    // Clear active downloads
    downloadIntervals.forEach((interval) => clearInterval(interval));
    downloadIntervals.clear();
    downloadProgresses.clear();
    activeDownloads.clear();
    
    downloadedVideos = [];
    downloadedAudios = [];
    
    userSession.isLoggedIn = false;
    userSession.subscription = "Djeli'S Free";
    updateSessionUI();
    
    // Navigate home
    showPage('home');
    triggerDynamicIslandPulse("Déconnecté");
};

function updateSessionUI() {
    syncProfileSubpage();
    syncMylistView();
    
    const heroCta = document.getElementById('hero-cta-btn');
    
    if (userSession.isLoggedIn) {
        headerGuestBtn.style.display = 'none';
        headerProfileBtn.style.display = 'block';
        if (heroCta) {
            heroCta.style.display = 'none';
        }
    } else {
        headerGuestBtn.style.display = 'block';
        headerProfileBtn.style.display = 'none';
        if (heroCta) {
            heroCta.style.display = 'flex';
        }
    }
    
    applyCardRestrictions();
}

function applyCardRestrictions() {
    const isFreeOrGuest = !userSession.isLoggedIn || (userSession.subscription && userSession.subscription.includes("Gratuit"));
    
    // 1. Cards styling & actions
    const cards = document.querySelectorAll('.media-card');
    cards.forEach(card => {
        const contentId = card.getAttribute('data-id');
        const item = catalog[contentId];
        if (item) {
            const type = item.type.toLowerCase();
            let isRestricted = false;
            if (!userSession.isLoggedIn) {
                isRestricted = true; // Guest restricted from everything
            } else if (userSession.subscription && userSession.subscription.includes("Gratuit")) {
                isRestricted = type.includes("film") || type.includes("série") || type.includes("serie") || type.includes("documentaire");
            }
            
            const playOverlay = card.querySelector('.card-play-overlay');
            if (playOverlay) {
                if (isFreeOrGuest && isRestricted) {
                    playOverlay.innerHTML = '<span class="material-icons-round" style="color: var(--primary-gold);">lock</span>';
                    playOverlay.setAttribute('onclick', 'event.stopPropagation(); openPlans();');
                    playOverlay.style.background = 'rgba(0, 0, 0, 0.8)';
                } else {
                    playOverlay.innerHTML = '<span class="material-icons-round">play_circle_filled</span>';
                    playOverlay.setAttribute('onclick', `event.stopPropagation(); playDirectVideo('${contentId}')`);
                    playOverlay.style.background = '';
                }
            }
        }
    });

    // 2. Hero Banners CTAs & actions
    const heroBanners = document.querySelectorAll('.hero-banner');
    heroBanners.forEach(banner => {
        const contentId = banner.getAttribute('data-id');
        const item = catalog[contentId];
        if (item) {
            const type = item.type.toLowerCase();
            let isRestricted = false;
            if (!userSession.isLoggedIn) {
                isRestricted = true;
            } else if (userSession.subscription && userSession.subscription.includes("Gratuit")) {
                isRestricted = type.includes("film") || type.includes("série") || type.includes("serie") || type.includes("documentaire");
            }
            
            const playBtn = banner.querySelector('.play-btn-large');
            const ctaBtn = banner.querySelector('.hero-center-cta');
            
            if (isFreeOrGuest && isRestricted) {
                if (playBtn) playBtn.style.display = 'none';
                if (ctaBtn) {
                    ctaBtn.style.display = 'flex';
                    ctaBtn.innerHTML = '<span class="material-icons-round">stars</span> S\'abonner pour regarder';
                    ctaBtn.setAttribute('onclick', 'event.stopPropagation(); openPlans();');
                }
            } else {
                if (playBtn) playBtn.style.display = 'flex';
                if (ctaBtn) ctaBtn.style.display = 'none';
            }
        }
    });
}

// ─── ACCOUNT SETTINGS PREFERENCES DRAWERS UPDATE ──────────────────────────
window.openSettingsModal = function() {
    // Redirect to profile settings inline drawer
    showPage('profile');
    switchProfileSubpage('settings');
};

window.handleSettingsUpdate = function(e) {
    e.preventDefault();
    userSession.name = document.getElementById('set-name-input').value;
    userSession.email = document.getElementById('set-email-input').value;
    userSession.phone = document.getElementById('set-phone-input').value;
    
    // Feedback
    triggerDynamicIslandPulse("Profil sauvegardé");
    
    // Return to profile home
    switchProfileSubpage('home');
    updateSessionUI();
};

// ─── SEARCH GENRE FILTER ──────────────────────────────────────────────────
window.filterGenre = function(type) {
    searchInputPage.value = type.toUpperCase();
    searchGenresGrid.style.display = 'none';
    
    const results = Object.keys(catalog).filter(key => {
        return catalog[key].type.toLowerCase().includes(type) || 
               catalog[key].synopsis.toLowerCase().includes(type);
    });
    renderPageSearchResults(results);
};

function renderPageSearchResults(results) {
    if (results.length === 0) {
        searchPageResults.innerHTML = `
            <div class="search-placeholder">
                <span class="material-icons-round">search_off</span>
                <p>Aucun résultat trouvé pour votre recherche</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    results.forEach(id => {
        const item = catalog[id];
        let imageAttr = '';
        if (item.bannerStyle) {
            imageAttr = `style="${item.bannerStyle}"`;
        } else {
            imageAttr = `class="card-image ${item.bannerClass || ''}"`;
        }
        
        html += `
            <div class="media-card tv-focusable" data-id="${id}" onclick="openDetails('${id}')">
                <div ${imageAttr.startsWith('style') ? 'class="card-image"' : ''} ${imageAttr}>
                    <div class="card-play-overlay" onclick="event.stopPropagation(); playDirectVideo('${id}')">
                        <span class="material-icons-round">play_circle_filled</span>
                    </div>
                </div>
                <div class="card-title">${item.title}</div>
                <div class="card-meta">
                    <span class="card-desc">${item.type} · ${item.year}</span>
                </div>
            </div>
        `;
    });
    searchPageResults.innerHTML = html;
    
    // Apply restrictions to newly rendered cards
    applyCardRestrictions();
    
    if (currentDeviceMode === 'tv') {
        setTimeout(initTvFocus, 100);
    }
}

// ─── AUDIO PLAYBACK CONTROLS (DJELISON) ──────────────────────────────────
window.playMockTrack = function(title, artist, url) {
    if (isOffline) {
        const isDl = downloadedAudios.some(item => item.title === title);
        if (!isDl) {
            triggerDynamicIslandPulse("Hors-ligne : non téléchargé");
            alert("Cette piste audio n'est pas disponible en mode hors-ligne. Veuillez la télécharger pour pouvoir l'écouter.");
            return;
        }
    }

    // 🌟 PUSH TO REGISTER: Force guest to register before playing audio tracks
    if (!userSession.isLoggedIn) {
        triggerDynamicIslandPulse("Inscription requise");
        openAuthModal();
        return;
    }

    closeVideoPlayer();
    
    const startAudio = () => {
        globalAudio.src = url;
        globalAudio.play().then(() => {
            triggerDynamicIslandPulse("Lecture en cours...");
        }).catch(err => console.log("Audio play deferred:", err));
        
        playerTrackName.textContent = title;
        playerTrackArtist.textContent = artist;
        playerPlayIcon.textContent = "pause";
        miniPlayer.style.display = "flex";
        
        if (currentDeviceMode === 'tv') {
            setTimeout(initTvFocus, 100);
        }
    };

    if (userSession.subscription && userSession.subscription.includes("Gratuit")) {
        showSimulatedAd(startAudio);
    } else {
        startAudio();
    }
};

globalAudio.addEventListener('timeupdate', () => {
    if (globalAudio.duration) {
        const pct = (globalAudio.currentTime / globalAudio.duration) * 100;
        playerProgressBar.style.width = `${pct}%`;
    }
});

globalAudio.addEventListener('ended', () => {
    playerPlayIcon.textContent = "play_arrow";
    playerProgressBar.style.width = "0%";
    triggerDynamicIslandPulse("Terminé");
});

playerPlayPauseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (globalAudio.paused) {
        globalAudio.play();
        playerPlayIcon.textContent = "pause";
        triggerDynamicIslandPulse("Lecture");
    } else {
        globalAudio.pause();
        playerPlayIcon.textContent = "play_arrow";
        triggerDynamicIslandPulse("Pause");
    }
});

playerCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    globalAudio.pause();
    globalAudio.src = "";
    miniPlayer.style.display = "none";
    if (currentDeviceMode === 'tv') {
        setTimeout(initTvFocus, 100);
    }
});

// ─── SIMULATED ADVERTISING LOGIC ──────────────────────────────────────────
let activeAdCallback = null;
let adProgressInterval = null;
let adRemainingSeconds = 5;

const adSponsors = [
    {
        name: "Orange Money",
        slogan: "Simplifiez vos transactions !",
        desc: "Envoyez et recevez de l'argent instantanément, payez vos factures et achetez des crédits avec Orange Money, partout en Afrique de l'Ouest.",
        icon: "account_balance_wallet",
        color: "#ff6600"
    },
    {
        name: "MTN MoMo",
        slogan: "MTN MoMo: Partout avec vous !",
        desc: "Gerez votre argent en toute sécurité. Retraits rapides, transferts de compte à compte et paiements de marchands simplifiés avec MTN Mobile Money.",
        icon: "payments",
        color: "#ffcc00"
    },
    {
        name: "Wave Côte d'Ivoire",
        slogan: "Wave : Zéro frais de dépôt !",
        desc: "Envoyez de l'argent à vos proches avec seulement 1% de frais de transfert. Wave, le réseau bleu ultra-économique pour vos besoins quotidiens.",
        icon: "savings",
        color: "#00aaff"
    },
    {
        name: "Moov Money",
        slogan: "Moov Money: La liberté financière",
        desc: "Payez vos abonnements et transférez des fonds en toute simplicité en composant le *155#. Profitez du réseau Moov Money rapide et fiable.",
        icon: "monetization_on",
        color: "#4caf50"
    }
];

window.showSimulatedAd = function(callback) {
    activeAdCallback = callback;
    adRemainingSeconds = 5;
    
    // Choose random sponsor
    const sponsor = adSponsors[Math.floor(Math.random() * adSponsors.length)];
    
    // Update ad modal contents
    document.getElementById('ad-partner-name').textContent = sponsor.name;
    document.getElementById('ad-partner-slogan').textContent = sponsor.slogan;
    document.getElementById('ad-partner-desc').textContent = sponsor.desc;
    document.getElementById('ad-partner-logo').innerHTML = `<span class="material-icons-round" style="font-size: 48px; color: ${sponsor.color};">${sponsor.icon}</span>`;
    
    // Reset progress and countdown
    const progressBar = document.getElementById('ad-progress-bar');
    const countdownText = document.getElementById('ad-countdown-text');
    const skipBtn = document.getElementById('ad-skip-btn');
    
    progressBar.style.width = "0%";
    countdownText.textContent = `Votre média commence dans ${adRemainingSeconds}s...`;
    skipBtn.disabled = true;
    skipBtn.classList.remove('ready');
    skipBtn.textContent = "Patienter...";
    
    // Show Ad Modal
    const adModal = document.getElementById('ad-modal');
    adModal.style.display = 'flex';
    
    // If TV, set focus on the skip button
    if (currentDeviceMode === 'tv') {
        setTimeout(initTvFocus, 100);
    }
    
    let timeElapsed = 0;
    const totalTime = 5000; // 5 seconds
    const tick = 100;
    
    if (adProgressInterval) clearInterval(adProgressInterval);
    
    adProgressInterval = setInterval(() => {
        timeElapsed += tick;
        const percentage = (timeElapsed / totalTime) * 100;
        progressBar.style.width = `${percentage}%`;
        
        const currentSeconds = Math.ceil((totalTime - timeElapsed) / 1000);
        if (currentSeconds > 0) {
            countdownText.textContent = `Votre média commence dans ${currentSeconds}s...`;
        } else {
            countdownText.textContent = "Publicité sponsorisée terminée.";
            skipBtn.disabled = false;
            skipBtn.classList.add('ready');
            skipBtn.textContent = "Passer la publicité";
            
            // Auto focus ready skip button in TV mode
            if (currentDeviceMode === 'tv') {
                setTimeout(initTvFocus, 50);
            }
        }
        
        if (timeElapsed >= totalTime) {
            clearInterval(adProgressInterval);
            adProgressInterval = null;
        }
    }, tick);
};

window.skipAd = function() {
    if (adProgressInterval) {
        clearInterval(adProgressInterval);
        adProgressInterval = null;
    }
    const adModal = document.getElementById('ad-modal');
    adModal.style.display = 'none';
    
    if (currentDeviceMode === 'tv') {
        clearTvFocus();
    }
    
    if (activeAdCallback) {
        const callback = activeAdCallback;
        activeAdCallback = null;
        callback();
    }
};

// ─── VIDEO PLAYER CONTROLS (DJAASOO) ──────────────────────────────────────
window.playDirectVideo = function(contentId) {
    if (isOffline && !downloadedVideos.includes(contentId)) {
        triggerDynamicIslandPulse("Hors-ligne : non téléchargé");
        alert("Ce contenu vidéo n'est pas disponible en mode hors-ligne. Veuillez le télécharger pour pouvoir le regarder.");
        return;
    }
    // 🌟 PUSH TO REGISTER: Force guest to subscribe/register before playing video
    if (!userSession.isLoggedIn) {
        triggerDynamicIslandPulse("Inscription requise");
        openAuthModal();
        return;
    }
    
    // Check if on free plan and content is restricted
    if (userSession.subscription && userSession.subscription.includes("Gratuit")) {
        const item = catalog[contentId];
        if (item) {
            const type = item.type.toLowerCase();
            // Allowed: Humour, Série Humour
            const isHumour = type.includes("humour");
            if (!isHumour) {
                triggerDynamicIslandPulse("Abonnement requis");
                alert("L'offre gratuite avec publicité donne uniquement accès à la musique, aux podcasts, et à la catégorie Humour. Pour regarder des films, séries ou documentaires complets, veuillez choisir une offre premium.");
                openPlans();
                return;
            }
        }
    }
    
    currentActiveContentId = contentId;
    
    if (userSession.subscription && userSession.subscription.includes("Gratuit")) {
        showSimulatedAd(() => {
            startVideoPlayer();
        });
    } else {
        startVideoPlayer();
    }
};

window.startVideoPlayer = function() {
    const item = catalog[currentActiveContentId];
    if (!item) return;
    
    if (isOffline && !downloadedVideos.includes(currentActiveContentId)) {
        triggerDynamicIslandPulse("Hors-ligne : non téléchargé");
        alert("Ce contenu vidéo n'est pas disponible en mode hors-ligne. Veuillez le télécharger pour pouvoir le regarder.");
        return;
    }
    
    detailsModal.style.display = 'none';
    globalAudio.pause();
    playerPlayIcon.textContent = "play_arrow";
    
    mainVideoPlayer.src = item.videoUrl;
    videoPlayerScreen.style.display = 'flex';
    videoSpinner.style.display = 'flex';
    
    mainVideoPlayer.play().catch(e => console.log("Video auto play prevented:", e));
    videoPlayIcon.textContent = 'pause';
    
    triggerDynamicIslandPulse("Lancement vidéo...");
    if (currentDeviceMode === 'tv') {
        setTimeout(initTvFocus, 100);
    }
};

window.closeVideoPlayer = function() {
    mainVideoPlayer.pause();
    mainVideoPlayer.src = "";
    videoPlayerScreen.style.display = 'none';
    videoSpinner.style.display = 'none';
    if (currentDeviceMode === 'tv') {
        setTimeout(initTvFocus, 100);
    }
};

mainVideoPlayer.addEventListener('waiting', () => {
    videoSpinner.style.display = 'flex';
});

mainVideoPlayer.addEventListener('playing', () => {
    videoSpinner.style.display = 'none';
});

mainVideoPlayer.addEventListener('timeupdate', () => {
    if (mainVideoPlayer.duration) {
        const pct = (mainVideoPlayer.currentTime / mainVideoPlayer.duration) * 100;
        videoProgressBar.style.width = `${pct}%`;
        
        const currentMin = String(Math.floor(mainVideoPlayer.currentTime / 60)).padStart(1, '0');
        const currentSec = String(Math.floor(mainVideoPlayer.currentTime % 60)).padStart(2, '0');
        const totalMin = String(Math.floor(mainVideoPlayer.duration / 60)).padStart(1, '0');
        const totalSec = String(Math.floor(mainVideoPlayer.duration % 60)).padStart(2, '0');
        
        videoTimeDisplay.textContent = `${currentMin}:${currentSec} / ${totalMin}:${totalSec}`;
    }
});

videoPlayBtn.addEventListener('click', () => {
    if (mainVideoPlayer.paused) {
        mainVideoPlayer.play();
        videoPlayIcon.textContent = 'pause';
    } else {
        mainVideoPlayer.pause();
        videoPlayIcon.textContent = 'play_arrow';
    }
});

document.querySelector('.video-timeline').addEventListener('click', (e) => {
    const width = e.currentTarget.offsetWidth;
    const clickX = e.offsetX;
    if (mainVideoPlayer.duration) {
        mainVideoPlayer.currentTime = (clickX / width) * mainVideoPlayer.duration;
    }
});

window.toggleMuteVideo = function() {
    const volIcon = document.getElementById('video-volume-icon');
    if (mainVideoPlayer.muted) {
        mainVideoPlayer.muted = false;
        volIcon.textContent = 'volume_up';
    } else {
        mainVideoPlayer.muted = true;
        volIcon.textContent = 'volume_off';
    }
};

// ─── TV SPATIAL NAVIGATION ────────────────────────────────────────────────
let lastFocusedOutsideModal = null;

function getActiveTvContainer() {
    const adModal = document.getElementById('ad-modal');
    if (adModal && adModal.style.display === 'flex') {
        return adModal;
    }
    if (videoPlayerScreen && videoPlayerScreen.style.display === 'flex') {
        return videoPlayerScreen;
    }
    if (plansModal && plansModal.style.display === 'flex') {
        return plansModal;
    }
    if (detailsModal && detailsModal.style.display === 'flex') {
        return detailsModal;
    }
    return document.querySelector('.device-frame');
}

function initTvFocus() {
    clearTvFocus();
    
    const sideItems = document.querySelectorAll('.sidebar-nav-item');
    sideItems.forEach(el => el.classList.add('tv-focusable'));
    
    const activeContainer = getActiveTvContainer();
    const isModalActive = activeContainer !== document.querySelector('.device-frame');
    
    if (isModalActive && !lastFocusedOutsideModal) {
        lastFocusedOutsideModal = document.querySelector('.tv-focused');
    }
    
    const visibleFocusables = Array.from(activeContainer.querySelectorAll('.tv-focusable')).filter(el => {
        return el.offsetWidth > 0 && el.offsetHeight > 0;
    });
    
    if (visibleFocusables.length > 0) {
        if (!isModalActive && lastFocusedOutsideModal && visibleFocusables.includes(lastFocusedOutsideModal)) {
            lastFocusedOutsideModal.classList.add('tv-focused');
            lastFocusedOutsideModal = null;
        } else {
            visibleFocusables[0].classList.add('tv-focused');
        }
    }
}

function clearTvFocus() {
    const elements = document.querySelectorAll('.tv-focusable');
    elements.forEach(el => {
        el.classList.remove('tv-focused');
    });
}

function moveTvFocus(direction) {
    const activeContainer = getActiveTvContainer();
    const focusables = Array.from(activeContainer.querySelectorAll('.tv-focusable')).filter(el => {
        const rect = el.getBoundingClientRect();
        return el.offsetWidth > 0 && el.offsetHeight > 0 && rect.top >= 0 && rect.left >= 0;
    });
    
    if (focusables.length === 0) return;
    
    const currentEl = document.querySelector('.tv-focused');
    if (!currentEl || !focusables.includes(currentEl)) {
        focusables[0].classList.add('tv-focused');
        return;
    }
    
    const currentRect = currentEl.getBoundingClientRect();
    const currentCenter = {
        x: currentRect.left + currentRect.width / 2,
        y: currentRect.top + currentRect.height / 2
    };
    
    let bestEl = null;
    let bestScore = Infinity;
    
    focusables.forEach(el => {
        if (el === currentEl) return;
        const rect = el.getBoundingClientRect();
        const center = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
        };
        
        const dx = center.x - currentCenter.x;
        const dy = center.y - currentCenter.y;
        
        if (direction === 'left' && dx >= -5) return;
        if (direction === 'right' && dx <= 5) return;
        if (direction === 'up' && dy >= -5) return;
        if (direction === 'down' && dy <= 5) return;
        
        let score = Math.sqrt(dx*dx + dy*dy);
        
        if (direction === 'left' || direction === 'right') {
            score += Math.abs(dy) * 2.5;
        } else {
            score += Math.abs(dx) * 2.5;
        }
        
        if (score < bestScore) {
            bestScore = score;
            bestEl = el;
        }
    });
    
    if (bestEl) {
        currentEl.classList.remove('tv-focused');
        bestEl.classList.add('tv-focused');
        bestEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
}

// Keyboard arrow keydown triggers
window.addEventListener('keydown', (e) => {
    if (currentDeviceMode !== 'tv') return;
    
    switch (e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            moveTvFocus('left');
            break;
        case 'ArrowRight':
            e.preventDefault();
            moveTvFocus('right');
            break;
        case 'ArrowUp':
            e.preventDefault();
            moveTvFocus('up');
            break;
        case 'ArrowDown':
            e.preventDefault();
            moveTvFocus('down');
            break;
        case 'Enter':
            e.preventDefault();
            const focusedEl = document.querySelector('.tv-focused');
            if (focusedEl) {
                focusedEl.click();
            }
            break;
        case 'Escape':
            e.preventDefault();
            if (videoPlayerScreen.style.display === 'flex') {
                closeVideoPlayer();
            } else if (detailsModal.style.display === 'flex') {
                closeDetails();
            } else if (plansModal.style.display === 'flex') {
                // back button handles plans wizard modal navigation
                const step1 = document.getElementById('flow-step-1');
                const step2 = document.getElementById('flow-step-2');
                const step3 = document.getElementById('flow-step-3');
                const stepLogin = document.getElementById('flow-step-login');
                
                if (step3.classList.contains('active')) {
                    goToWizardStep(2);
                } else if (step2.classList.contains('active')) {
                    goToWizardStep(1);
                } else if (stepLogin.classList.contains('active')) {
                    goToWizardStep(1);
                } else {
                    closePlans();
                }
            } else if (currentActivePage === 'profile' && profileSubpageSettings.classList.contains('active')) {
                switchProfileSubpage('home');
            } else if (currentActivePage !== 'home') {
                showPage('home');
            }
            break;
    }
});

// Setup initial Guest Session state on load
updateSessionUI();
updateDownloadedElementsUI();

// ─── OFFLINE MODE AND DOWNLOAD EVENT HANDLERS ─────────────────────────────
window.toggleOfflineModeBtn = function() {
    isOffline = !isOffline;
    
    const networkBtn = document.getElementById('network-toggle-btn');
    const networkIcon = document.getElementById('network-status-icon');
    const networkText = document.getElementById('network-status-text');
    const statusWifiIcon = document.getElementById('status-wifi-icon');
    const appContainer = document.querySelector('.app-container');
    
    if (isOffline) {
        networkBtn.classList.add('offline');
        networkIcon.textContent = 'wifi_off';
        networkText.textContent = 'Hors-ligne';
        if (statusWifiIcon) statusWifiIcon.textContent = 'wifi_off';
        appContainer.classList.add('offline-mode');
        triggerDynamicIslandPulse("Mode Hors-ligne");
    } else {
        networkBtn.classList.remove('offline');
        networkIcon.textContent = 'wifi';
        networkText.textContent = 'En ligne';
        if (statusWifiIcon) statusWifiIcon.textContent = 'wifi';
        appContainer.classList.remove('offline-mode');
        triggerDynamicIslandPulse("Mode En ligne");
    }
    
    updateDownloadedElementsUI();
    
    // Refresh downloads tab if open
    if (currentActivePage === 'mylist' && currentMylistTab === 'dl') {
        renderDownloadsGrid();
    }
};

window.toggleDownloadCurrentVideo = function() {
    if (!userSession.isLoggedIn) {
        triggerDynamicIslandPulse("Inscription requise");
        openAuthModal();
        return;
    }
    
    if (userSession.subscription && userSession.subscription.includes("Gratuit")) {
        triggerDynamicIslandPulse("Téléchargement indisponible");
        alert("Le téléchargement hors-ligne est réservé aux forfaits payants (Solo, Famille, Multi-Écrans). Mettez à niveau votre compte pour utiliser cette fonctionnalité.");
        return;
    }
    
    const id = currentActiveContentId;
    if (!id) return;
    
    const dlBtn = document.getElementById('modal-download-btn');
    
    if (activeDownloads.has(id)) {
        // Cancel active video download
        const interval = downloadIntervals.get(id);
        if (interval) clearInterval(interval);
        downloadIntervals.delete(id);
        downloadProgresses.delete(id);
        activeDownloads.delete(id);
        
        dlBtn.className = 'modal-download-btn tv-focusable';
        dlBtn.innerHTML = `<span class="material-icons-round" id="modal-download-icon">download</span>`;
        
        triggerDynamicIslandPulse("Téléchargement annulé");
        return;
    }
    
    if (downloadedVideos.includes(id)) {
        // Remove it
        downloadedVideos = downloadedVideos.filter(item => item !== id);
        dlBtn.className = 'modal-download-btn tv-focusable';
        dlBtn.innerHTML = `<span class="material-icons-round" id="modal-download-icon">download</span>`;
        triggerDynamicIslandPulse("Supprimé");
        updateDownloadedElementsUI();
        renderDownloadsGrid();
    } else {
        // Check Limit
        if (downloadedVideos.length >= LIMIT_VIDEOS) {
            triggerDynamicIslandPulse("Limite max de 3 vidéos atteinte !");
            alert("Limite de téléchargement atteinte. Vous ne pouvez télécharger que 3 vidéos maximum en mode hors-ligne. Veuillez supprimer un film existant pour libérer un slot.");
            return;
        }
        
        // Start download progress simulation
        activeDownloads.add(id);
        downloadProgresses.set(id, 0);
        
        dlBtn.className = 'modal-download-btn tv-focusable downloading';
        dlBtn.innerHTML = `<span style="font-size: 12px; font-weight: bold;">0%</span>`;
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 25;
            downloadProgresses.set(id, progress);
            triggerDynamicIslandPulse(`Téléchargement: ${progress}%`);
            
            const currentDlBtn = document.getElementById('modal-download-btn');
            if (currentDlBtn && activeDownloads.has(id)) {
                currentDlBtn.innerHTML = `<span style="font-size: 12px; font-weight: bold;">${progress}%</span>`;
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                downloadIntervals.delete(id);
                downloadProgresses.delete(id);
                activeDownloads.delete(id);
                downloadedVideos.push(id);
                
                if (currentDlBtn) {
                    currentDlBtn.className = 'modal-download-btn tv-focusable downloaded';
                    currentDlBtn.innerHTML = `<span class="material-icons-round" id="modal-download-icon">check_circle</span>`;
                }
                triggerDynamicIslandPulse("Téléchargé !");
                updateDownloadedElementsUI();
                renderDownloadsGrid();
            }
        }, 400);
        downloadIntervals.set(id, interval);
    }
};

window.toggleDownloadAudio = function(e, title, artist, cover, url) {
    if (e) e.stopPropagation();
    
    if (!userSession.isLoggedIn) {
        triggerDynamicIslandPulse("Inscription requise");
        openAuthModal();
        return;
    }
    
    if (userSession.subscription && userSession.subscription.includes("Gratuit")) {
        triggerDynamicIslandPulse("Téléchargement indisponible");
        alert("Le téléchargement hors-ligne est réservé aux forfaits payants (Solo, Famille, Multi-Écrans). Mettez à niveau votre compte pour utiliser cette fonctionnalité.");
        return;
    }
    
    if (activeDownloads.has(title)) {
        // Cancel active audio download
        const interval = downloadIntervals.get(title);
        if (interval) clearInterval(interval);
        downloadIntervals.delete(title);
        downloadProgresses.delete(title);
        activeDownloads.delete(title);
        
        document.querySelectorAll(`.audio-card[data-audio-title="${title}"] .audio-card-download`).forEach(btn => {
            btn.className = 'audio-card-download tv-focusable';
            btn.innerHTML = `<span class="material-icons-round icon">download</span>`;
        });
        
        triggerDynamicIslandPulse("Téléchargement annulé");
        return;
    }
    
    const index = downloadedAudios.findIndex(item => item.title === title);
    
    if (index !== -1) {
        // Remove
        downloadedAudios.splice(index, 1);
        document.querySelectorAll(`.audio-card[data-audio-title="${title}"] .audio-card-download`).forEach(btn => {
            btn.className = 'audio-card-download tv-focusable';
            btn.innerHTML = `<span class="material-icons-round icon">download</span>`;
        });
        triggerDynamicIslandPulse("Audio supprimé");
        updateDownloadedElementsUI();
        renderDownloadsGrid();
    } else {
        // Limit check
        if (downloadedAudios.length >= LIMIT_AUDIOS) {
            triggerDynamicIslandPulse("Limite de 15 audios atteinte !");
            alert("Limite de téléchargement atteinte. Votre abonnement vous permet de télécharger une playlist de 15 morceaux maximum en mode hors-ligne. Veuillez supprimer une piste existante pour libérer un slot.");
            return;
        }
        
        activeDownloads.add(title);
        downloadProgresses.set(title, 0);
        
        document.querySelectorAll(`.audio-card[data-audio-title="${title}"] .audio-card-download`).forEach(btn => {
            btn.className = 'audio-card-download downloading tv-focusable';
            btn.innerHTML = `<span style="font-size: 8px; font-weight: bold; line-height: 24px;">0%</span>`;
        });
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 25;
            downloadProgresses.set(title, progress);
            triggerDynamicIslandPulse(`Téléchargement: ${progress}%`);
            
            document.querySelectorAll(`.audio-card[data-audio-title="${title}"] .audio-card-download`).forEach(btn => {
                if (activeDownloads.has(title)) {
                    btn.innerHTML = `<span style="font-size: 8px; font-weight: bold; line-height: 24px;">${progress}%</span>`;
                }
            });
            
            if (progress >= 100) {
                clearInterval(interval);
                downloadIntervals.delete(title);
                downloadProgresses.delete(title);
                activeDownloads.delete(title);
                downloadedAudios.push({ title, artist, cover, url });
                
                document.querySelectorAll(`.audio-card[data-audio-title="${title}"] .audio-card-download`).forEach(btn => {
                    btn.className = 'audio-card-download downloaded tv-focusable';
                    btn.innerHTML = `<span class="material-icons-round icon">check_circle</span>`;
                });
                
                triggerDynamicIslandPulse("Audio téléchargé !");
                updateDownloadedElementsUI();
                renderDownloadsGrid();
            }
        }, 300);
        downloadIntervals.set(title, interval);
    }
};

window.switchMylistTab = function(tab) {
    currentMylistTab = tab;
    const favTabBtn = document.getElementById('mylist-tab-fav');
    const dlTabBtn = document.getElementById('mylist-tab-dl');
    const favContent = document.getElementById('mylist-fav-content');
    const dlContent = document.getElementById('mylist-dl-content');
    
    if (tab === 'fav') {
        favTabBtn.classList.add('active');
        dlTabBtn.classList.remove('active');
        favContent.style.display = 'block';
        dlContent.style.display = 'none';
    } else {
        favTabBtn.classList.remove('active');
        dlTabBtn.classList.add('active');
        favContent.style.display = 'none';
        dlContent.style.display = 'block';
        renderDownloadsGrid();
    }
};

function renderDownloadsGrid() {
    const dlGrid = document.getElementById('mylist-dl-grid');
    const dlEmpty = document.getElementById('mylist-dl-empty');
    
    // Update Quota Gauges
    document.getElementById('dl-video-count').textContent = `${downloadedVideos.length} / ${LIMIT_VIDEOS}`;
    document.getElementById('dl-video-bar').style.width = `${(downloadedVideos.length / LIMIT_VIDEOS) * 100}%`;
    
    document.getElementById('dl-audio-count').textContent = `${downloadedAudios.length} / ${LIMIT_AUDIOS}`;
    document.getElementById('dl-audio-bar').style.width = `${(downloadedAudios.length / LIMIT_AUDIOS) * 100}%`;
    
    if (downloadedVideos.length === 0 && downloadedAudios.length === 0) {
        dlGrid.innerHTML = '';
        dlEmpty.style.display = 'flex';
        return;
    }
    
    dlEmpty.style.display = 'none';
    
    let html = '';
    
    // Populate downloaded videos
    downloadedVideos.forEach(id => {
        const item = catalog[id];
        if (!item) return;
        let imageAttr = '';
        if (item.bannerStyle) {
            imageAttr = `style="${item.bannerStyle}"`;
        } else {
            imageAttr = `class="card-image ${item.bannerClass || ''}"`;
        }
        
        html += `
            <div class="media-card tv-focusable is-downloaded" data-id="${id}" onclick="openDetails('${id}')">
                <div ${imageAttr.startsWith('style') ? 'class="card-image"' : ''} ${imageAttr}>
                    <div class="card-play-overlay" onclick="event.stopPropagation(); playDirectVideo('${id}')">
                        <span class="material-icons-round">play_circle_filled</span>
                    </div>
                </div>
                <div class="card-title">${item.title}</div>
                <div class="card-meta">
                    <span class="card-desc">${item.type} · Hors-ligne</span>
                </div>
            </div>
        `;
    });
    
    // Populate downloaded audios
    downloadedAudios.forEach(item => {
        html += `
            <div class="audio-card tv-focusable is-downloaded" data-audio-title="${item.title}" onclick="playMockTrack('${item.title}', '${item.artist}', '${item.url}')">
                <div class="audio-card-image" style="background-image: url('${item.cover}');">
                    <div class="card-play-overlay">
                        <span class="material-icons-round">play_circle_filled</span>
                    </div>
                    <button class="audio-card-download downloaded tv-focusable" onclick="event.stopPropagation(); toggleDownloadAudio(event, '${item.title}', '${item.artist}', '${item.cover}', '${item.url}')">
                        <span class="material-icons-round icon">check_circle</span>
                    </button>
                </div>
                <div class="audio-card-title">${item.title}</div>
                <div class="audio-card-subtitle">${item.artist} · Audio</div>
            </div>
        `;
    });
    
    dlGrid.innerHTML = html;
    
    applyCardRestrictions();
    
    if (currentDeviceMode === 'tv') {
        setTimeout(initTvFocus, 100);
    }
}

function updateDownloadedElementsUI() {
    // Update video elements
    document.querySelectorAll('.media-card, .hero-banner').forEach(el => {
        const id = el.getAttribute('data-id');
        if (id) {
            if (downloadedVideos.includes(id)) {
                el.classList.add('is-downloaded');
            } else {
                el.classList.remove('is-downloaded');
            }
        }
    });

    // Update audio elements
    document.querySelectorAll('.audio-card, .audio-banner').forEach(el => {
        const title = el.getAttribute('data-audio-title');
        if (title) {
            const isDownloaded = downloadedAudios.some(item => item.title === title);
            const btn = el.querySelector('.audio-card-download');
            if (isDownloaded) {
                el.classList.add('is-downloaded');
                if (btn) {
                    btn.className = 'audio-card-download downloaded tv-focusable';
                    btn.innerHTML = `<span class="material-icons-round icon">check_circle</span>`;
                }
            } else if (activeDownloads.has(title)) {
                el.classList.remove('is-downloaded');
                if (btn) {
                    btn.className = 'audio-card-download downloading tv-focusable';
                    const progress = downloadProgresses.get(title) || 0;
                    btn.innerHTML = `<span style="font-size: 8px; font-weight: bold; line-height: 24px;">${progress}%</span>`;
                }
            } else {
                el.classList.remove('is-downloaded');
                if (btn) {
                    btn.className = 'audio-card-download tv-focusable';
                    btn.innerHTML = `<span class="material-icons-round icon">download</span>`;
                }
            }
        }
    });
}

window.filterPageCategory = function(btn, sectionId, category) {
    // 1. Update active status on pills inside the parent container
    const bar = btn.parentElement;
    const pills = bar.querySelectorAll('.pill-filter');
    pills.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');

    // 2. Find the content container for this tab
    let container = null;
    if (sectionId === 'cinema') {
        container = document.getElementById('djaasoo-cinema-content');
    } else if (sectionId === 'theatre') {
        container = document.getElementById('djaasoo-theatre-content');
    } else if (sectionId === 'podcasts') {
        container = document.getElementById('djelison-podcasts-content');
    } else if (sectionId === 'music') {
        container = document.getElementById('djelison-music-content');
    }

    if (!container) return;

    // 3. Filter all elements having 'data-category' attribute
    const items = container.querySelectorAll('[data-category]');
    items.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        if (category === 'all' || itemCat === category) {
            item.classList.remove('card-filtered-out');
        } else {
            item.classList.add('card-filtered-out');
        }
    });

    // 4. Hide empty rows
    const rows = container.querySelectorAll('.content-row');
    rows.forEach(row => {
        const visibleCards = row.querySelectorAll('.media-card:not(.card-filtered-out), .audio-card:not(.card-filtered-out)');
        if (visibleCards.length === 0 && category !== 'all') {
            row.style.display = 'none';
        } else {
            row.style.display = 'block';
        }
    });

    // 5. If TV remote mode is active, refresh the TV focus
    if (typeof currentDeviceMode !== 'undefined' && currentDeviceMode === 'tv') {
        setTimeout(initTvFocus, 100);
    }
};
