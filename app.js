//load configuration
require('./server/config/config.js');

//express server
const http = require('http');
const express = require('express');
//template engine
const ejs = require('ejs');

//define port
const port = process.env.PORT;
//initialize app
const app = express();
const server = http.createServer(app);



//initialize view engine
app.set('view engine', 'ejs');
//set static files
// !!! TODO: how to deal with static files? Let enginx do the job? Using express routing for static files is probably extra work 
app.use('/public', express.static('public'));

/* APPLICATION ROUTING */
//route to index page - simple design
app.get('/', (req, res) => {
    res.render('index', {
        copyrightYear: new Date().getFullYear()
    });
});


//start listening 
server.listen(port, () => {
    console.log(`Application started up on port ${port}`);
});