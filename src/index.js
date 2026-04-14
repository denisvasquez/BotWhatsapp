require('dotenv').config();
const express = require('express');
const client = require('./client.whatsapp');

// configurations
const app = express();
app.set('PORT', process.env.PORT || 3000);

// routes
app.use('/api', require('./routes/index.router'));

// start server
app.listen(app.get('PORT'), () => {
    console.log(`Server is running on port ${app.get('PORT')}`);
});
