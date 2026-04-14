const router = require('express').Router();
const path = require('path');
const fs = require('fs');

// img qr
const qrImagePath = path.join(__dirname, '../qr/qr.png');

// routes
router.get('/qr', (req, res) => {
    if (!fs.existsSync(qrImagePath)) {
        return res.status(404).send('QR code not found');
    }
    res.sendFile(qrImagePath);
});

module.exports = router;
