// Web derlemesi (npx expo export --platform web) sonrası, Render static site için:
// 1) Dinamik rotaların şablon HTML'leri ([slug].html) köşeli parantezsiz bir ada da
//    kopyalanır (_slug_.html); render.yaml'daki yeniden yazma kuralları bu adları kullanır.
// 2) +not-found.html → 404.html (bilinmeyen adreslerin son kuralı).
// 3) Sitenin zorunlu sayfaları üretilmemişse derleme hata verir.
import { copyFileSync, cpSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const DIST = process.argv[2] ?? 'dist'

const REQUIRED = [
  'index.html',
  'uzmanlar-icin.html',
  'destek.html',
  'gizlilik.html',
  'kosullar.html',
  'kvkk.html',
  'mesafeli-satis.html',
  'on-bilgilendirme.html',
  'bakiye/index.html',
  'bakiye/basarili.html',
  'bakiye/hata.html',
  'blog/index.html',
  '+not-found.html',
]

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) {
      // Köşeli parantezli klasör (match/[id]/celebrate.html) de güvenli ada kopyalanır.
      walk(path)
      if (/^\[[^\]]+\]$/.test(name)) {
        cpSync(path, join(dir, name.replace(/^\[([^\]]+)\]$/, '_$1_')), { recursive: true })
      }
    } else if (/^\[[^\]]+\]\.html$/.test(name)) {
      const safe = join(dir, name.replace(/^\[([^\]]+)\]\.html$/, '_$1_.html'))
      copyFileSync(path, safe)
    }
  }
}

const missing = REQUIRED.filter((file) => !existsSync(join(DIST, file)))
if (missing.length > 0) {
  console.error(`[web-postexport] Eksik sayfalar: ${missing.join(', ')}`)
  process.exit(1)
}

walk(DIST)
copyFileSync(join(DIST, '+not-found.html'), join(DIST, '404.html'))
console.log('[web-postexport] dinamik rota kopyaları ve 404.html hazır')
