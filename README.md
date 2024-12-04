# Web Arayüz Kurulum Kılavuzu

## Önkoşullar
- Node.js
- npm
- MySQL

## Kurulum
1. Veritabanı bilgilerini .env dosyasına ekleyin
2. `npm install` komutu ile bağımlılıkları yükleyin
3. `npx prisma migrate dev` komutu ile veritabanını oluşturun
4. `npm run seed` komutu ile veritabanına örnek veriler ekleyin
5. `npm start` komutu ile sunucuyu başlatın
6. `npm stop` komutu ile sunucuyu durdurun
7. `npm restart` komutu ile sunucuyu yeniden başlatın