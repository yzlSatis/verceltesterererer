const express = require('express');
const mongoose = require('mongoose');
const requestIp = require('request-ip');
const axios = require('axios');
const path = require('path');
const app = express();

// MongoDB bağlantısı
mongoose.connect("mongodb+srv://yzlbabapro:UhgisL0WxPhzseYE@userdatabase.b1hmh.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB bağlantısı başarılı.");
}).catch((err) => {
    console.log("MongoDB bağlantısı başarısız:", err);
});

// MongoDB modelini tanımlayalım
const Visitor = mongoose.model('Visitor', new mongoose.Schema({
    ip: String,
    country: String,
    timestamp: { type: Date, default: Date.now }
}));

// Statistiği Admin Panelinde Görüntülemek İçin
const getCountryStats = async () => {
    try {
        const visitors = await Visitor.aggregate([
            { $group: { _id: "$country", count: { $sum: 1 } } }
        ]);
        return visitors;
    } catch (err) {
        console.error(err);
        return [];
    }
};

// IP adresini al ve ülke bilgisi ile kaydet
app.use("/", async (req, res) => {
    const clientIp = requestIp.getClientIp(req);
    try {
        // ipinfo.io API'si ile ülke bilgisini al
        const response = await axios.get(`https://ipinfo.io/${clientIp}/json?token=YOUR_API_KEY`);
        const country = response.data.country;

        // MongoDB'ye kaydet
        const visitor = new Visitor({ ip: clientIp, country: country });
        await visitor.save();

        res.send("Selam!");
    } catch (error) {
        console.log("IP bilgisi alınamadı: ", error);
        res.send("Selam!");
    }
});

// Admin sayfasını sunmak için
app.get('/admin', async (req, res) => {
    const stats = await getCountryStats();
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Sunucuyu başlat
app.listen(5000, () => {
    console.log("Sunucu Çalışıyor Port 5000");
});
