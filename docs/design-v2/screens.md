# PsikoAl · Ekran envanteri

Canvas sayfaları: **1 · Danışan**, **2 · Uzman**, **3 · Web uygulaması**, **4 · Web sitesi**, **5 · Geliştirici**.
Her ekranın sağ panelindeki **Tweaks** alanında `tema` (acik/koyu), ortak ekranlarda `rol` (danisan/uzman) ve çoğunda `durum` seçimi var; boş, yükleniyor, hata ve özel durumlar buradan açılır.
`U_*` dosyaları ortak ekranın uzman sürümüdür (aynı bileşen, `rol="uzman"`); `*Koyu` dosyaları koyu tema örnekleridir.

## Mobil · ortak (iki sayfada da)

| Ekran | Dosya | Durumlar (tweak) |
|---|---|---|
| Açılış | Splash | — |
| Karşılama (3 slayt) | Karsilama | slaytlar etkileşimli |
| Giriş | Giris | normal · gonderiliyor · yanlis · onaysiz · dondurulmus · baglanti · cokDeneme |
| Kayıt (rol + bilgiler + e-posta onayı) | Kayit | hata: yok · kullanimda · zayif · baglanti; onay kutuları zorunlu |
| Şifremi unuttum → e-posta → yeni şifre → güncellendi | Sifre | baglanti: gecerli · suresiDolmus |
| Eşleşti anı | Eslesti | rol |
| Eşleşmelerim | Eslesmelerim | dolu · bos · yukleniyor; Aktif/Geçmiş |
| Eşleşme detayı | EslesmeDetay | aktif · sonlandirmaBekliyor · tamamlandi (danışan: değerlendirme) |
| Bildirimler | Bildirimler | dolu · bos · yukleniyor; role göre türler |
| Ayarlar | Ayarlar | rol; çıkış onayı |
| Kişisel bilgiler | KisiselBilgiler | rol; kaydet toast |
| Şifre · Veri ve gizlilik | Guvenlik | dondur · sil (2 adım) |

## Mobil · danışan

| Ekran | Dosya | Durumlar |
|---|---|---|
| Danışan onboarding | DanisanOnboarding | şehir seçici |
| Keşfet | Kesfet | normal · ilkKez · yukleniyor · hata |
| İlanlarım | Ilanlarim | dolu · bos · yukleniyor · hata; 7 süzgeç |
| İlan oluştur (7 adım) | IlanOlustur | normal · ilanSiniri; izin kutusu zorunlu |
| İlan detayı | IlanDetayD | yayinda · onayBekliyor · teklifYok · eslesti · reddedildi · suresiDoldu |
| Teklif detayı | TeklifDetayD | eşleş onayı |
| Uzman profili | UzmanProfili | danisan · kendiProfili · onayBekliyor; davet sheet |
| Testler / Test çöz / Sonuç | Testler · TestCoz · TestSonuc | dolu · sonucYok · yukleniyor |
| Blog / Blog detayı / Kategori | Blog · BlogDetay · Kategori | dolu · bos · yukleniyor |

## Mobil · uzman

| Ekran | Dosya | Durumlar |
|---|---|---|
| Uzman onboarding (4 adım + incelemede) | UzmanOnboarding | belgeler: yuklendi · hata |
| Fırsatlar | Firsatlar | normal · onayBekliyor · reddedildi · bakiyeSifir · bos · yukleniyor |
| İlan detayı | IlanDetayU | teklifVerilebilir · teklifVerdin · baskasiylaEslesti · kapandi · onayBekliyor · bakiyeYetersiz |
| Teklif gönder | TeklifGonder | normal · ucretsiz · ucretDegisti · bakiyeYetersiz · onayBekliyor · reddedildi · zatenVerdin · ilanKapali · hata |
| Tekliflerim | Tekliflerim | dolu · bos · yukleniyor · hata |
| Teklif detayı | TeklifDetayU | geri çek |
| Danışanla anlaştım | Anlastim | normal · bildirildi · beklemede |
| Bakiyem | Bakiyem | dolu · bakiyeSifir · bos · yukleniyor |
| Mesleki bilgiler · Belgeler | MeslekiBilgiler | sekmeler, sertifika kaldır |

## Web uygulaması (1440 masaüstü · 1024 tablet)

| Ekran | Masaüstü | Tablet | Kırılımlar |
|---|---|---|---|
| Keşfet | W_Kesfet | T_Kesfet | ≤1100 ikon rayı, sütunlar alt alta · ≤640 üst menü |
| İlan oluştur | W_IlanOlustur | T_IlanOlustur | ≤1100 adım listesi gizlenir |
| İlan detayı · danışan | W_IlanDetayD | T_IlanDetayD | teklif ızgarası 2 → 1 |
| Eşleşme detayı | W_EslesmeDetay | T_EslesmeDetay | |
| Ayarlar | W_Ayarlar | T_Ayarlar | |
| Fırsatlar | W_Firsatlar | T_Firsatlar | ≤1100 süzgeç paneli gizlenir |
| İlan detayı · uzman | W_IlanDetayU | T_IlanDetayU | |
| Teklif gönder | W_TeklifGonder | T_TeklifGonder | Web'de "Bakiye yükle" eylemi var |
| Bakiyem | W_Bakiyem | T_Bakiyem | tablo yatay kayar |

## Web sitesi

| Sayfa | Dosya | Not |
|---|---|---|
| `/` Tanıtım | S_Tanitim (+ M_Tanitim telefon) | ≤860 hamburger menü, SSS akordeon |
| `/uzmanlar-icin` | S_Uzmanlar | teklif ücreti düşüş grafiği |
| `/bakiye` | S_Bakiye (+ M_Bakiye) | adim: form · paytr · basarili · basarisiz · beklemede |
| `/blog`, `/blog/[slug]` | S_Blog · S_BlogDetay | kategori süzgeci, okuma çubuğu |
| Hukuk metinleri | S_Hukuk | 5 belge, içindekiler, kaydırılabilir tablo |
| `/destek` | S_Destek | Danışan/Uzman sekmeleri |
| 404 | S_404 | |
