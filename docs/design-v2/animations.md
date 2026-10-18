# PsikoAl · Animasyon kullanım listesi

Ortak eğri: **ease-out** `cubic-bezier(.2,.8,.2,1)` · taşmalı: **spring** `cubic-bezier(.3,1.3,.5,1)`
React Native karşılıkları: `withTiming(v, { duration, easing: Easing.bezier(.2,.8,.2,1) })`, taşmalı olanlar için `withSpring({ damping: 14, stiffness: 180 })`, sıralı girişler için Reanimated `FadeInDown.delay(i * 60).duration(550)`.
**Erişilebilirlik:** `prefers-reduced-motion` / `AccessibilityInfo.isReduceMotionEnabled()` açıksa döngüler ve girişler kapatılır, durum değişiklikleri anında olur.

## 1. Etkileşim (her yerde)

| Ad | Ne olur | Tetik | Süre · eğri | Nerede |
|---|---|---|---|---|
| `press` | scale 1 → .96 | basma | 150 ms · ease | Tüm düğme, kart, bağlantı |
| `hover-lift` | translateY −3/−4 px + çizgi accent-line | fare üstünde (web) | 150–200 ms | Web kartları |
| `color` | zemin/yazı/çizgi geçişi | durum değişimi | 200 ms | Çip, sekme, input odağı |
| `focus-ring` | 2 px primary halka | klavye odağı | anında | Hepsi |

## 2. Giriş ve geçiş

| Ad | Ne olur | Tetik | Süre · eğri | Nerede |
|---|---|---|---|---|
| `enter-up` | opacity 0→1, Y +18→0 | ekran/öğe ilk göründüğünde | 500–600 ms · ease-out · **60 ms** sıralı gecikme (web 80) | Tüm ekranlarda kartlar, başlıklar |
| `enter-right` | X +30–60 → 0 | adım değişimi, yeni öğe | 400–600 ms · ease-out | İlan oluştur, Kayıt 2. adım, test soruları, karşılama teklif kartları, Bildirimler |
| `slide-in-l/r` (eşleşme) | iki avatar ±160 px'ten birleşir | Eşleşti ekranı açılışı | 900 ms · **spring** · 200 ms gecikme | Eşleşti |
| `sheet-up` + `scrim-fade` | panel aşağıdan, scrim 0→1 | sheet açılır | 380 ms / 250 ms | Eşleş onayı, ilanı kapat, davet, geri çek, hesap sil/dondur, çıkış |
| `dialog-in` (web) | scale .92→1 + fade | dialog açılır | 350 ms | Web onay ve başarı pencereleri |
| `dropdown` | Y −8→0 + fade, chevron 180° | liste açılır | 300 ms / 250 ms | Şehir seçici |
| `tab-pill` | seçili hap translateX | sekme/segment değişir | 300 ms · ease-out | Aktif/Geçmiş, Görünüm, Mesleki/Belgeler, SSS, Ayarlar |
| `switch-thumb` | thumb X 0→20 | aç/kapat | 250 ms | Web · Yalnız davetler |
| `accordion` | + ikonu 45°, içerik Y −6→0 | SSS aç/kapat | 300 ms | Site, Destek |
| `toast` | alttan girer, bekler, çıkar | kaydet | 2,6–3 sn toplam | Kişisel bilgiler, Mesleki bilgiler, web Ayarlar |

## 3. Geri bildirim

| Ad | Ne olur | Tetik | Süre | Nerede |
|---|---|---|---|---|
| `pop` | scale 0 → 1.1 → 1 | seçim, rozet, başarı ikonu | 350–500 ms | Rozetler, seçili tikler, sayaç rozeti (1 sn gecikme), yıldızlar |
| `draw-check` | SVG stroke-dashoffset 80→0 | tik görünür | 400–700 ms | Checkbox, başarı ekranları, doğrulandı rozeti |
| `shake` | X ±7 px sarsıntı | hata | 450 ms · tek | Hata kutuları, bakiye yetersiz, kilit ikonu |
| `heart` + `burst` | kalp 1→1.35→1, çevresinde halka büyür | beğen | 450 / 500 ms | Blog, Blog detayı, site |
| `copy-tick` | kopyala ikonu tike döner, 1,4 sn sonra geri | kopyala | 300 ms | Telefon/e-posta satırları |
| `flash` | yeni ücret 1.25→1 | ücret değişti | 600 ms | Teklif gönder |
| `count-roll` | rakam alttan kayarak gelir | bakiye/istatistik açılışı | 600 ms | Bakiyem, Kategori, Fırsatlar şeridi |
| `fill` | scaleX 0→1 soldan | ilerleme değişimi | 400–900 ms | Adım çubukları, şifre gücü, anlatım gücü, test seviyesi, yükleme |
| `cell-rise` | scaleY .2→1 | bütçe aralığı seçimi | 400 ms | İlan oluştur · bütçe |
| `score-ring` | çember 0'dan skora çizilir | sonuç açılışı | 1,4 sn | Test sonucu |
| `marker-slide` | seviye işaretçisi soldan konumuna kayar | sonuç açılışı | 1,2 sn | Test sonucu |
| `type-reveal` | metin soldan açılır (clip-path) | teklif notu | 1,2 sn | Teklif detayı |

## 4. Sürekli (ambient) döngüler

| Ad | Ne olur | Süre | Nerede |
|---|---|---|---|
| `pulse-dot` | nokta 1→2,6 büyür, söner | 1,6 sn ∞ | Yayında rozetleri, okunmamış bildirim, hatırlatma ikonu |
| `ring` | halka dışa doğru söner | 1,2–1,8 sn ∞ | Başarı ikonları, "Teklif gönder" dikkat halkası |
| `bell` | zil sallanır | 2,4 sn ∞ · 1 sn gecikme | Keşfet, Fırsatlar, web sidebar |
| `bob` | ok ±3 px | 1,4 sn ∞ | Teklif ücreti "düşecek" oku |
| `drain` | çubuk sağdan boşalır | 8 sn ∞ (gerçekte: sonraki düşüşe kalan süreye bağlayın) | Fırsatlar kartları, İlan detayı (uzman) |
| `skeleton` | opaklık .4↔1 | 1,2 sn ∞, parçalar arası 100–150 ms | Yükleniyor durumları |
| `orbit` | kesikli halka döner | 10–20 sn ∞ | Splash, avatar halkaları, hero dekorları |
| `float` / `breathe` | Y ±8 px / scale .9↔1.05 | 3–4 sn ∞ | Boş durum illüstrasyonları, test girişi |
| `wave` | blog kapak çubukları dalgalanır | 3,2 sn ∞ | Blog, site |
| `coin` | ₺ rozeti döner ve zıplar | 3 sn ∞ | Bakiyem |
| `radar` | 3 halka sırayla yayılır | 2,2 sn ∞ | "Henüz teklif yok", "Açık ilan yok" |
| `spin` | yükleme halkası | 0,8–1,2 sn ∞ | Gönderiliyor, inceleme, ödeme bekleniyor |
| `wobble` | hero köşe dekoru 90° salınır | 4–5 sn ∞ | Keşfet hero |

## 5. Tek seferlik büyük anlar

| Ad | Sıra | Nerede |
|---|---|---|
| **Splash** | halka spring ile döner (0,7 sn) → marka dairesi sağdan kayar (0,8 sn, 0,55 gecikme) → yazı yukarı (0,9 sn) → nokta yükleyici | Açılış |
| **Eşleşti** | iki avatar birleşir (0,9 sn spring) → çift halka (1,1 / 1,4 sn) → tik dairesi pop + çizim (1,05 / 1,35 sn) → konfeti (1,0–1,7 sn gecikmeli 14 parça, 3,2 sn) → metin ve kart sıralı | Eşleşti (iki rol) |
| **İlan yayınlandı** | halka + pop + tik + 6 parça konfeti | İlan oluştur sonu |
| **Teklif gönderildi** | halka + pop + tik → iletişim kartı aşağıdan | Teklif gönder |
| **Karşılama slaytları** | her slaytın illüstrasyonu kendi girişini oynar (kartlar sağdan, çubuklar yükselir, tik çizilir) | Karşılama |
| **E-postanı onayla** | mektup zarftan yukarı kayar, zarf yüzer | Kayıt sonu |
