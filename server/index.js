const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const os = require('os');
const geoip = require('geoip-lite');

// MongoDB Connection
mongoose.connect('mongodb+srv://yzlbabapro:UhgisL0WxPhzseYE@userdatabase.b1hmh.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected')).catch(err => console.log(err));

// Define Schema
const visitorSchema = new mongoose.Schema({
    ip: String,
    country: String,
    date: { type: Date, default: Date.now }
});

const Visitor = mongoose.model('Visitor', visitorSchema);

// Middleware to log IP
app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : 'Unknown';

    const visitor = new Visitor({ ip, country });
    visitor.save().then(() => console.log(`Visitor logged: ${ip} from ${country}`));
    
    next();
});

// Main Route
app.use('/', (req, res) => {
    res.send('selam');
});

// Admin Page
app.get('/admin', async (req, res) => {
    const visitors = await Visitor.find();
    const countryStats = {};

    visitors.forEach(visitor => {
        countryStats[visitor.country] = (countryStats[visitor.country] || 0) + 1;
    });

    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Listen
app.listen(5000, () => console.log('Sunucu Calisiyor Port 5000'));
