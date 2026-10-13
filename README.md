# Selenophile · selenophile.art

Akışta kaybolan fikirlerin, X gönderilerinin ve önemli belgelerin Türkçe seçkisi. Saf statik site; derleme adımı yok.

- `index.html` + `tweets.js`: Ana sayfa. X gönderileri, X'in resmi gömme aracıyla (oEmbed + widgets.js) ve Türkçe notla
- `fikirler.html` + `data.js`: Fikirler (elle seçilmiş yazılar, Türkçe özet)
- `tweetler.html`: eski adres, ana sayfaya yönlendirir
- `pdfler.html` + `pdfs.js`: Belgeler; orijinal adreslerine bağlanır, izin verenler sayfa içinde önizlenir. Hiçbir PDF burada barındırılmaz.

- `robots.txt`, `sitemap.xml`, `og.png` (1200x630 paylaşım görseli): SEO. Yeni sayfa eklenirse `sitemap.xml`'e ekleyin; ItemList JSON-LD'si her sayfanın `<head>` kısmında ilk 10 girdiyi listeler.

Yayın yaparken `index.html`, `tweetler.html` ve `pdfler.html` ve `fikirler.html` içindeki `?v=` sürüm numarasını artırın.
