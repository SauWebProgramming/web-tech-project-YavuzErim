// Zorunlu Global Değişkenler ve DOM Referansları
const API_URL = './media.json'; 

let allMediaData = []; // Tüm filmleri ve dizileri tutacak global dizi
let currentRoute = 'home'; // Mevcut sayfa durumu (home, favorites, detail)

// DOM Elementleri Global Tanımlamalar (Sadece değişkenleri tanımlıyoruz)
let appContent, mediaListSection, mediaListContainer, detailSection, mediaDetailContainer, favoritesSection, favoritesListContainer;
let searchInput, typeFilter, genreFilter, sortCombinedSelect, filterArea, backButton;
let navLinks, menuToggle, mainNav;


// ====================================================================
// A. TEMEL UTILITY FONKSİYONLARI (BAŞTA TANIMLANMALI)
// ====================================================================

// URL Güncelleme (Sayfa yenilenmeden adres çubuğu güncelle)
const updateURL = (hash) => {
    history.pushState(null, '', hash);
};

// Mobil menüyü kapatmak için yardımcı fonksiyon
const closeMobileMenu = () => {
    if (mainNav && menuToggle) {
        mainNav.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
};

// ====================================================================
// B. LOCAL STORAGE MANTIKLARI
// ====================================================================

const getFavorites = () => {
    try {
        const favorites = localStorage.getItem('mediaFavorites');
        return favorites ? JSON.parse(favorites) : [];
    } catch (e) {
        console.error("Local Storage'dan veri okunurken hata oluştu:", e);
        return [];
    }
};

const saveFavorites = (favorites) => {
    try {
        localStorage.setItem('mediaFavorites', JSON.stringify(favorites));
    } catch (e) {
        console.error("Local Storage'a veri yazılırken hata oluştu:", e);
    }
};

const toggleFavorite = (id) => {
    const mediaId = Number(id); 
    let favorites = getFavorites();
    const mediaItem = allMediaData.find(m => m.id === mediaId);

    if (!mediaItem) return;

    const index = favorites.findIndex(fav => Number(fav.id) === mediaId);

    if (index === -1) {
        favorites.push(mediaItem);
    } else {
        favorites.splice(index, 1); 
    }
    
    saveFavorites(favorites);
    console.log(`Medya ID ${mediaId} favori durumu değiştirildi. Güncel favori sayısı: ${favorites.length}`);
};

// ====================================================================
// C. SPA YÖNLENDİRME (handleSPA ve handlePopState)
// ====================================================================

const handleSPA = (route, mediaId = null) => {
    currentRoute = route;
    // Tüm bölümleri gizle
    if (mediaListSection) mediaListSection.style.display = 'none';
    if (favoritesSection) favoritesSection.style.display = 'none';
    if (detailSection) detailSection.style.display = 'none';
    if (filterArea) filterArea.style.display = 'none';
    
    // Aktif linki işaretle
    navLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`[data-route="${route}"]`);
    if (activeLink) activeLink.classList.add('active');


    if (route === 'home') {
        if (mediaListSection) mediaListSection.style.display = 'block';
        if (filterArea) filterArea.style.display = 'flex';
        // Filtrelenmiş listeyi göster
        applyFilters(); 
    } else if (route === 'favorites') {
        if (favoritesSection) favoritesSection.style.display = 'block';
        // Favorileri yükle
        renderFavorites();
    } else if (route === 'detail' && mediaId !== null) {
        if (detailSection) detailSection.style.display = 'block';
        // Detay sayfasını göster
        showMediaDetail(mediaId);
    }
};

// Tarayıcı Geri/İleri Butonu İşleme (URL Yönetimi)
const handlePopState = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash.startsWith('detail-')) {
        const id = hash.split('-')[1];
        showMediaDetail(parseInt(id));
    } else if (hash === 'favorites') {
        handleSPA('favorites');
    } else {
        handleSPA('home');
    }
};


// ====================================================================
// D. RENDER & FİLTRELEME & SIRALAMA
// ====================================================================

// DOM'a Kart Basma Fonksiyonu (Tüm karta tıklama)
const renderMediaCards = (data, container, showFavoritesButton) => {
    if (!container) return; 

    container.innerHTML = ''; 
    
    if (data.length === 0) {
        container.innerHTML = `<p class="empty-message">Aradığınız kriterlere uygun medya bulunamadı.</p>`;
        return;
    }

    const favorites = getFavorites();
    
    data.forEach(media => {
        const isFavorite = favorites.some(fav => Number(fav.id) === media.id); 
        
        const card = document.createElement('div');
        card.className = 'media-card';
        card.setAttribute('data-id', media.id);
        
        card.innerHTML = `
            <img src="${media.posterUrl}" onerror="this.onerror=null;this.src='https://placehold.co/200x300/1e1e1e/fff?text=Poster+Yok';" alt="${media.title} Poster" class="card-image">
            <div class="card-content">
                <div>
                    <h3 class="card-title">${media.title}</h3>
                    <p class="card-meta">${media.year} | ${media.type}</p>
                </div>
                ${showFavoritesButton ? `<button class="favorite-btn ${isFavorite ? 'is-favorite' : ''}" data-id="${media.id}" title="${isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}">
                    <i class="fa-solid fa-star"></i>
                </button>` : ''}
            </div>
        `;
        
        // TIKLAMA OLAYI KARTIN TAMAMINA EKLENDİ
        card.addEventListener('click', (e) => {
            // Favori butonuna tıklandıysa detay sayfasına gitmeyi engelle
            if (e.target.closest('.favorite-btn')) {
                return;
            }
            
            handleSPA('detail', media.id);
            updateURL(`#detail-${media.id}`);
        });

        const favButton = card.querySelector('.favorite-btn');
        if(favButton) {
            favButton.addEventListener('click', (e) => {
                e.stopPropagation(); 
                const mediaId = Number(e.currentTarget.getAttribute('data-id'));
                toggleFavorite(mediaId);
                
                if (currentRoute === 'favorites') {
                    renderFavorites();
                } else {
                    const updatedIsFavorite = getFavorites().some(fav => Number(fav.id) === mediaId); 
                    favButton.classList.toggle('is-favorite', updatedIsFavorite);
                    favButton.title = updatedIsFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle';
                }
            });
        }
        
        container.appendChild(card);
    });
};

// Detay Sayfasını Gösterme (Zorunlu Gereksinim: Dinamik Oluşturma)
const showMediaDetail = (id) => {
    const media = allMediaData.find(m => m.id === id);
    if (!media) {
        if (mediaDetailContainer) mediaDetailContainer.innerHTML = '<p class="error-error">Medya detayı bulunamadı.</p>';
        return;
    }
    
    const isFavorite = getFavorites().some(fav => Number(fav.id) === media.id); 

    let detailValue = media.duration; 
    let detailLabel = 'Süre'; 

    const isDizi = media.type.toLowerCase() === 'tv show' || media.type.toLowerCase() === 'dizi';

    if (isDizi) {
        detailLabel = 'Sezon/Bölüm'; 
        
        const seasons = media.seasons || '';
        const episodes = media.episodeCount || ''; 
        
        const numSeasons = seasons.toString().match(/\d+/);
        const numEpisodes = episodes.toString().match(/\d+/);
        
        const seasonsText = numSeasons ? `${numSeasons[0]} Sezon` : '';
        const episodesText = numEpisodes ? `${numEpisodes[0]} Bölüm` : '';
        
        if (seasonsText && episodesText) {
            detailValue = `${seasonsText} / ${episodesText}`;
        } else if (seasonsText) {
            detailValue = seasonsText;
        } else if (episodesText) {
            detailValue = episodesText;
        } else {
            detailValue = 'Bilgi Yok';
        }
    }
    
    if (!mediaDetailContainer) return; 

    // OYUNCULAR ALANINDA GÜVENLİK KONTROLÜ EKLENDİ
    const actorsList = (media.actors && Array.isArray(media.actors)) ? media.actors.join(', ') : 'Bilgi yok';

    mediaDetailContainer.innerHTML = `
        <div class="detail-header">
            <img src="${media.posterUrl}" onerror="this.onerror=null;this.src='https://placehold.co/250x375/1e1e1e/fff?text=Poster+Yok';" alt="${media.title} Poster" class="detail-poster">
            <div class="detail-info">
                <h1 class="detail-title">${media.title} (${media.year})</h1>
                <p class="detail-type"><strong>Tür:</strong> ${media.type}</p>
                <p class="detail-genre"><strong>Kategori:</strong> ${media.genre}</p>
                
                <div class="detail-stats">
                    <span class="rating"><strong>IMDb:</strong> ${media.rating} <i class="fa-solid fa-star"></i></span>
                    <span class="duration"><strong>${detailLabel}:</strong> ${detailValue}</span>
                </div>
                
                <p class="detail-plot"><strong>Özet:</strong> ${media.plot}</p>
                
                <p class="detail-actors"><strong>Oyuncular:</strong> ${actorsList}</p>
                
                <button id="detail-favorite-btn" class="favorite-btn detail-btn ${isFavorite ? 'is-favorite' : ''}" data-id="${media.id}">
                        <i class="fa-solid fa-star"></i> ${isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                </button>
            </div>
        </div>
    `;

    const detailFavoriteButton = document.getElementById('detail-favorite-btn');
    if (detailFavoriteButton) {
        detailFavoriteButton.addEventListener('click', (e) => {
            const mediaId = Number(e.currentTarget.getAttribute('data-id')); 
            toggleFavorite(mediaId);
            
            const btn = e.currentTarget;
            const updatedIsFavorite = getFavorites().some(fav => Number(fav.id) === mediaId);

            btn.classList.toggle('is-favorite', updatedIsFavorite);
            btn.innerHTML = `<i class="fa-solid fa-star"></i> ${updatedIsFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}`;
        });
    }
};

// Kategori Filtresini dinamik olarak doldurma
const populateGenreFilter = (data) => {
    const allGenres = new Set();
    
    data.forEach(media => {
        if (media.genre) {
            // Virgül ile ayrılmış tüm kategorileri küçük harfe çevirerek toplar
            media.genre.split(',').forEach(g => {
                const cleanGenre = g.trim().toLowerCase();
                allGenres.add(cleanGenre);
            });
        }
    });

    const sortedGenres = Array.from(allGenres).sort();
    
    if (genreFilter) genreFilter.innerHTML = '<option value="all">Tüm Kategoriler</option>';

    sortedGenres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        // İlk harfi büyük yapıp göster (Estetik görünüm için)
        option.textContent = genre.charAt(0).toUpperCase() + genre.slice(1);
        if (genreFilter) genreFilter.appendChild(option);
    });
};

// Arama ve Filtreleme
const applyFilters = () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const type = typeFilter.value; 
    
    const selectedGenre = genreFilter ? genreFilter.value : 'all'; 
    const sortCombined = sortCombinedSelect ? sortCombinedSelect.value : 'none'; 
    
    const [sortBy, sortOrder] = sortCombined.split('_'); 

    // 1. FİLTRELEME İŞLEMİ
    const filteredData = allMediaData.filter(media => {
        const matchesName = media.title.toLowerCase().includes(searchTerm);
        
        const mediaTypeLower = media.type.toLowerCase();
        const selectedTypeLower = type.toLowerCase();
        
        let matchesType = false;
        
        if (selectedTypeLower === 'all') {
            matchesType = true;
        } else if (selectedTypeLower === 'dizi' || selectedTypeLower === 'tv show') {
            matchesType = mediaTypeLower === 'dizi' || mediaTypeLower === 'tv show';
        } else if (selectedTypeLower === 'film' || selectedTypeLower === 'movie') {
            matchesType = mediaTypeLower === 'film' || mediaTypeLower === 'movie';
        } else {
            matchesType = mediaTypeLower === selectedTypeLower;
        }
        
        let matchesGenre = true;
        if (selectedGenre !== 'all') {
            const mediaGenres = media.genre ? media.genre.toLowerCase() : '';
            // includes() ile kontrol ediyoruz.
            matchesGenre = mediaGenres.includes(selectedGenre);
        }
        
        return matchesName && matchesType && matchesGenre; 
    });

    // 2. SIRALAMA İŞLEMİ
    const sortedData = filteredData.sort((a, b) => {
        if (sortBy === 'none') {
            return 0; 
        }
        
        let aValue;
        let bValue;

        if (sortBy === 'rating') {
            aValue = a.rating || 0;
            bValue = b.rating || 0;
        } else if (sortBy === 'year') {
            aValue = parseInt(a.year) || 0;
            bValue = parseInt(b.year) || 0;
        } else {
            return 0;
        }
        
        if (aValue < bValue) {
            return sortOrder === 'desc' ? 1 : -1; 
        }
        if (aValue > bValue) {
            return sortOrder === 'desc' ? -1 : 1;
        }
        return 0;
    });


    renderMediaCards(sortedData, mediaListContainer, true);
};

// Favorilerim Bölümünü Gösterme
const renderFavorites = () => {
    const favorites = getFavorites();
    renderMediaCards(favorites, favoritesListContainer, true); 

    if (favorites.length === 0 && favoritesListContainer) {
        favoritesListContainer.innerHTML = `<p class="empty-message">Henüz favorilere eklenmiş bir medya yok.</p>`;
    }
};

// DOM Elementlerine değer atama
const initializeDOMElements = () => {
    appContent = document.getElementById('app-content');
    mediaListSection = document.getElementById('media-list-section');
    mediaListContainer = document.getElementById('media-list');
    detailSection = document.getElementById('detail-section');
    mediaDetailContainer = document.getElementById('media-detail');
    favoritesSection = document.getElementById('favorites-section');
    favoritesListContainer = document.getElementById('favorites-list');

    searchInput = document.getElementById('search-input');
    typeFilter = document.getElementById('type-filter');
    genreFilter = document.getElementById('genre-filter'); 
    sortCombinedSelect = document.getElementById('sort-combined');
    filterArea = document.getElementById('filter-area');
    backButton = document.getElementById('back-button');

    navLinks = document.querySelectorAll('.nav-link');
    menuToggle = document.getElementById('menu-toggle');
    mainNav = document.getElementById('main-nav');
};

// Olay Dinleyicilerini Ayarlama
const setupEventListeners = () => {
    // Arama, Filtre ve SIRALAMA Dinleyicileri
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
    
    // GENREFİLTER VE SORTCOMBINEDSELECT KONTROLLERİ EKLENDİ (Güvenlik için)
    if (genreFilter) genreFilter.addEventListener('change', applyFilters); 
    if (sortCombinedSelect) sortCombinedSelect.addEventListener('change', applyFilters);

    // Navigasyon Dinleyicileri (SPA Yönlendirme)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = link.getAttribute('data-route');
            handleSPA(route);
            updateURL(link.getAttribute('href')); // URL'yi güncelle (Zorunlu)
            closeMobileMenu(); // Mobil menüyü kapat
        });
    });

    // Mobil Menü Aç/Kapat Dinleyicisi (KONTROLLER EKLENDİ)
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('is-open');
            const isExpanded = mainNav.classList.contains('is-open');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // Tarayıcı Geri/İleri Butonu Dinleyicisi (URL Yönetimi)
    window.addEventListener('popstate', handlePopState);
    
    // Geri Butonu Dinleyicisi
    if (backButton) {
        backButton.addEventListener('click', () => {
            handleSPA('home');
            updateURL('#home');
        });
    }
};


// ====================================================================
// F. İLK ÇALIŞTIRMA VE VERİ ÇEKME
// ====================================================================

const fetchAndInitializeApp = async () => {
    try {
        if (mediaListContainer) mediaListContainer.innerHTML = `<p class="loading-message">Medya verileri çekiliyor...</p>`;
        
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            // YOL VEYA SERVER HATASI DURUMUNDA KONSOLA ÖZEL HATA MESAJI BASIYORUZ
            console.error(`Fetch başarısız oldu: API_URL: ${API_URL}, Durum Kodu: ${response.status}`);
            throw new Error(`Veri yüklenemedi. Durum kodu: ${response.status}. JSON dosya yolunu (${API_URL}) kontrol edin.`);
        }
        
        const data = await response.json();
        allMediaData = data;
        
        populateGenreFilter(allMediaData); 
        handleSPA('home');

    } catch (error) {
        console.error('Veri çekme/işleme hatası:', error);
        if (mediaListContainer) mediaListContainer.innerHTML = `<p class="error-message">Veriler yüklenemedi. JSON dosya yolunu veya formatını kontrol edin. (${error.message})</p>`;
    }
};


// Uygulama Başlatma Fonksiyonu
document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Elementlerine Güvenli Değer Atama
    initializeDOMElements();

    // 2. Tüm olay dinleyicilerini ayarla
    setupEventListeners(); 

    // 3. Verileri çek ve uygulamayı başlat
    fetchAndInitializeApp();
});