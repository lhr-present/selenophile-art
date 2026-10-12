# Selenophile · selenophile.art

Akışta kaybolan fikirlerin, X gönderilerinin ve önemli belgelerin Türkçe seçkisi. Saf statik site; derleme adımı yok.

- `index.html` + `tweets.js`: Ana sayfa. X gönderileri, X'in resmi gömme aracıyla (oEmbed + widgets.js) ve Türkçe notla
- `fikirler.html` + `data.js`: Fikirler (elle seçilmiş yazılar, Türkçe özet)
- `tweetler.html`: eski adres, ana sayfaya yönlendirir
- `pdfler.html` + `pdfs.js`: Belgeler; orijinal adreslerine bağlanır, izin verenler sayfa içinde önizlenir. Hiçbir PDF burada barındırılmaz.

Yayın yaparken `index.html`, `tweetler.html` ve `pdfler.html` ve `fikirler.html` içindeki `?v=` sürüm numarasını artırın.
