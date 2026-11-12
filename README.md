# 🏥 Aqilli shifoxona

Onlayn qabul, navbat kuzatuvi, aqlli maslahat va admin panelli PWA ilova.

## Fayllar
- `index.html` – asosiy sahifa
- `style.css` – dizayn
- `app.js` – butun mantiq
- `manifest.json`, `sw.js`, `icon.svg` – telefonga o'rnatish (PWA)

## Imkoniyatlar
- Bemor: bo'limlar, qabulga yozilish (band vaqtlar yopiladi), telefon bo'yicha navbatni tekshirish, alomatlar bo'yicha bo'lim tavsiyasi
- Admin: statistika, qabullarni tasdiqlash/bekor qilish, shifokor va bo'limlar CRUD, parolni almashtirish, JSON zaxira

## Admin
Boshlang'ich parol: `admin123` → Admin → Sozlamalar'dan darhol o'zgartiring.

## GitHub Pages'ga joylash
1. GitHub'da yangi repo oching (`aqilli-shifoxona`), fayllarni yuklang
2. Settings → Pages → Branch: `main` / root → Save
3. `https://<username>.github.io/aqilli-shifoxona/` manzilida ochiladi
4. Telefonda brauzerdan oching → "Ilovani o'rnatish" yoki menyudan "Bosh ekranga qo'shish"

## Muhim eslatma
Ma'lumotlar hozircha har bir qurilma brauzerida (localStorage) saqlanadi. Ya'ni bir telefonda yozilgan qabul admin kompyuterida ko'rinmaydi. Haqiqiy umumiy baza uchun keyingi bosqichda Firebase yoki Supabase ulanadi.
