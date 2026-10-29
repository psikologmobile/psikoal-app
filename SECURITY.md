# Güvenlik Politikası

Psikosirius bir sağlık/psikoloji platformudur ve **özel nitelikli kişisel veri** (KVKK m.6)
işler. Güvenlik açığı bildirimlerini ciddiye alıyoruz.

## Açık bildirimi

- **Tercih edilen kanal:** GitHub Security → _Report a vulnerability_
  (private vulnerability reporting bu repoda açıktır)
- **E-posta:** yazilimuygun@gmail.com — konu satırına `[GÜVENLİK]` yazın

Açığı **herkese açık issue olarak açmayın.**

## Taahhüdümüz

| Aşama                | Süre           |
| -------------------- | -------------- |
| İlk yanıt            | 72 saat içinde |
| Etki değerlendirmesi | 7 gün içinde   |
| Düzeltme planı       | 14 gün içinde  |

Bildirimi doğrularsak, isteğiniz doğrultusunda düzeltme notunda size teşekkür ederiz.

## Kapsam

Bu repo Expo/React Native istemcisidir ve **PUBLIC**'tir. Aşağıdakiler bilinçli tasarımdır,
açık değildir:

- `EXPO_PUBLIC_*` ön ekli değişkenler bundle içinde görünür — tanım gereği geneldir.
- Supabase `anon` anahtarı istemcide bulunur; veri erişimini **RLS politikaları** korur.
  RLS'i atlatan bir erişim bulursanız bu **geçerli bir bildirimdir**, lütfen iletin.
- Test fikstürleri (`src/**/__fixtures__`) tamamen kurgusaldır, gerçek kullanıcı verisi içermez.

Backend ve veritabanı `psikologmobile/psikoal-backend` (public) reposundadır.
