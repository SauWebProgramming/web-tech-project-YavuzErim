[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Xg2jV1i2)

ISE-201 Web Teknolojileri Proje Ödevi: İnteraktif Medya Kitaplığı (SPA)

Bu proje, ISE-201 Web Teknolojileri dersi kapsamında, modern istemci tarafı (client-side) teknolojileri kullanılarak geliştirilmiş bir Single Page Application (SPA) türünde interaktif medya kataloğudur.

🚀 Proje Hakkında

Bu uygulama, yerel bir JSON veri kaynağından (ya da API'den) film ve dizi bilgilerini çekerek bunları kullanıcı dostu, filtrelenebilir ve sıralanabilir bir arayüzde gösterir. Proje, sunucu taraflı bir dil gerektirmemektedir.

Seçilen Proje: Seçenek 1: İnteraktif Medya Kitaplığı (SPA)

🛠️ Temel Özellikler ve Teknik Detaylar

1. Mimari ve Teknolojik Temeller

SPA (Tek Sayfa Uygulaması): Sayfa yenilenmesi olmadan dinamik içerik yüklemesi (handleSPA fonksiyonu ile rota yönetimi).

Veri Kaynağı: Yerel JSON dosyası (media.json) ve fetch() API kullanılarak asenkron veri çekimi sağlanmıştır.

Modern JavaScript: Kodun tamamında ES6+ standartları (const, let, Arrow Functions, async/await) kullanılmıştır.

Yerel Depolama: Kullanıcı tarafından favorilere eklenen medyalar, tarayıcıda localStorage kullanılarak kalıcı olarak saklanır.

HTML/CSS: Anlamsal HTML5 etiketleri ve stil ile mantık dosyalarının net ayrımı sağlanmıştır.

2. İşlevsellik Özellikleri

Duyarlı Tasarım: Mobil, tablet ve masaüstü cihazlara uyumlu; Flexbox ve Media Query tabanlı tamamen duyarlı düzenleme yapılmıştır. Mobil cihazlarda menü hamburger menüye dönüşmektedir.

Arama ve Filtreleme:

Başlığa göre anlık arama yapılabilir.

Tür (Film/Dizi) ve Kategori (Genre) seçeneklerine göre filtreleme mevcuttur.

Sıralama: Listelenen medyalar; IMDb Puanına ve Çıkış Yılına göre Artan/Azalan düzende sıralanabilir.

Detay Görüntüleme: Kartın tamamına tıklandığında, detay sayfası dinamik olarak yüklenir. Diziler için Sezon/Bölüm, filmler için Süre bilgisi gösterilir.

Favori İşlemleri: Kartlar üzerinden tek tıkla favorilere ekleme/çıkarma ve ayrı bir "Favorilerim" bölümünde görüntüleme.

📁 Dosya Yapısı

/proje-repo-adi/
├── index.html          <- Projenin ana (SPA) iskeleti
├── style.css           <- Tüm CSS stilleri ve mobil uyum (responsive) kuralları
├── app.js              <- Tüm uygulama mantığı (SPA, fetch, filtreleme, sıralama, DOM manipülasyonu)
├── media.json          <- Yerel veri kaynağı
└── README.md           <- Projenin tanıtım dosyası

Öğrenci Numarası: B241200024.

Adı Soyadı: Yavuz Selim ERİM.
