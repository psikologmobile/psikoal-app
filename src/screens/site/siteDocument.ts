/**
 * Web sitesinin kök HTML'ine (src/app/+html.tsx) gömülen sabitler. +html Node'da
 * (static render) çalışır; burada tarayıcı API'si ya da RN importu YOKTUR.
 */

export const SITE_NAME = 'Psikosirius'

/** Oturum bayrağı: kayıtlı oturum varsa <html data-session="in">. */
export const SESSION_ATTRIBUTE = 'data-session'

/** Tanıtım sayfasının kök sınıfı; oturumlu ziyaretçide hidrasyona kadar gizlenir. */
export const SITE_LANDING_CLASS = 'site-landing'

/**
 * Oturum açık bir kullanıcı `/` adresine geldiğinde statik HTML tanıtım sayfasıdır;
 * uygulama hidrasyondan sonra sekmelere geçer. Arada tanıtımın görünüp kaybolmasın
 * diye, zustand'ın `auth-storage` kaydı oturum diyorsa sayfa ilk boyamadan önce
 * işaretlenir ve tanıtım gizlenir. Oturum geçersiz çıkarsa SiteLandingGate bayrağı
 * kaldırır. Hata olursa hiçbir şey yapılmaz (tanıtım görünür kalır).
 */
export const SITE_SESSION_SCRIPT = `try{var s=JSON.parse(localStorage.getItem('auth-storage')||'null');if(s&&s.state&&s.state.isAuthenticated){document.documentElement.setAttribute('${SESSION_ATTRIBUTE}','in')}}catch(e){}`

/**
 * Site sayfalarının giriş/döngü animasyonları ve fareyle üzerine gelme durumları.
 * Statik HTML'de JS yüklenmeden çalışsın (içerik görünür kalsın) diye Reanimated
 * yerine CSS; tasarımın (b2_Site_*) keyframe'leri ve gecikmeleri. Renkler token
 * değişkenlerinden (global.css). Azaltılmış harekette hepsi kapanır.
 */
export const SITE_STYLES = `
html[${SESSION_ATTRIBUTE}="in"] .${SITE_LANDING_CLASS}{visibility:hidden}
@keyframes site-up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
@keyframes site-in-r{from{opacity:0;transform:translateX(50px)}to{opacity:1;transform:none}}
@keyframes site-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes site-orbit{to{transform:rotate(360deg)}}
@keyframes site-pop{0%{transform:scale(0)}70%{transform:scale(1.12)}100%{transform:scale(1)}}
@keyframes site-drop{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
@keyframes site-grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes site-wave{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes site-spin{to{transform:rotate(360deg)}}
.site-a{animation:site-up .6s cubic-bezier(.2,.8,.2,1) both}
.site-r{animation:site-in-r .6s cubic-bezier(.2,.8,.2,1) both}
.site-d1{animation-delay:.08s}.site-d2{animation-delay:.16s}.site-d3{animation-delay:.24s}
.site-d4{animation-delay:.32s}.site-d5{animation-delay:.4s}.site-d6{animation-delay:.48s}
.site-ft{animation:site-float 4s ease-in-out infinite}
.site-ob{animation:site-orbit 20s linear infinite}
.site-p{animation:site-pop .45s cubic-bezier(.2,.8,.2,1) both}
.site-dp{animation:site-drop .3s ease-out both}
.site-bar{transform-origin:bottom;animation:site-grow .9s cubic-bezier(.2,.8,.2,1) both}
.site-wv{animation:site-wave 3.2s ease-in-out infinite}
.site-sp{animation:site-spin 1s linear infinite}
.site-hov{transition:transform .2s ease,border-color .2s ease}
.site-hov:hover{transform:translateY(-4px);border-color:rgb(var(--color-accent-line)) !important}
.site-lnk{transition:background-color .2s ease,color .2s ease}
.site-lnk:hover{background-color:rgb(var(--color-surface))}
.site-press{transition:transform .15s ease}
.site-press:active{transform:scale(.97)}
.site-press:focus-visible,.site-lnk:focus-visible,.site-hov:focus-visible{outline:2px solid rgb(var(--color-focus));outline-offset:2px}
@media (prefers-reduced-motion: reduce){
.site-a,.site-r,.site-ft,.site-ob,.site-p,.site-dp,.site-bar,.site-wv,.site-sp{animation:none !important}
.site-hov,.site-lnk,.site-press{transition:none !important}
.site-hov:hover{transform:none}
}
`
