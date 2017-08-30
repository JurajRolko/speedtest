//load configuration
require('./server/config/config.js');

const http = require('http');
const WebSocketServer = require('websocket').server;
//express server
const express = require('express');
//template engine
const ejs = require('ejs');
//crypto module to help generate pseudo-random data
const crypto = require('crypto');
//connection list from custom modules
let { ConnectionsList } = require('./server/modules/connectionsList.js');

//define port
const port = process.env.PORT;
//initialize app
const app = express();
const server = http.createServer(app);
//create websocket server
wsServer = new WebSocketServer({
    httpServer: server,
    //should never use true for production environment. correct approach is to verify connections origin 
    autoAcceptConnections: false
});

let connectionsList = new ConnectionsList();

//initialize view engine
app.set('view engine', 'ejs');
//set static files
// !!! TODO: how to deal with static files? Let enginx do the job? Using express routing for static files is probably extra work 
app.use('/public', express.static('public'));


/* APPLICATION ROUTING */
//route to index page, simple app, only 1 page - simple design
app.get('/', (req, res) => {
    res.render('index', {
        copyrightYear: new Date().getFullYear()
    });
});


//attempt to change headers 
// server.on('upgrade', (req, socket, head) => {
//     socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
//         'Upgrade: WebSocket\r\n' +
//         'Connection: Upgrade\r\n' +
//         '\r\n');

//     socket.pipe(socket); // echo back
// });


// WebSocket server
wsServer.on('request', (request) => {
    // if ( ! create_custom_function_to_check_orogin(request.origin) ){
    //     request.reject();
    //     return;
    // }

    let connection = request.accept(null, request.origin);
    //console.log(connection); //console object contains many useful informations?
    connectionsList.addConnection(connection);
    console.log(`New user connected. Active connections: ${connectionsList.getAll().length} `);

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function (message) {
        //console.log(message);
        // console.log(`server message event fired. connection: ${this.uuid}`);        
        let uuidConnection = this.uuid;

        if ((message.type === 'utf8') && (message.utf8Data === 'test-initiate')) {
            //begin testing
            console.log(`Begin test for connection: ${uuidConnection}`);
            //do latency test
            //it is very begining, do some initialization 
            connectionsList.initializeTest(uuidConnection);
            //send first ping command. other ping command will be processed in pong event
            //send uuid as ping data. max lend for ping is 125;
            connection.ping(uuidConnection);
        } else if ((message.type === 'utf8') && (message.utf8Data === 'download-test-initiate')) {
            //start download test
            //generate random data - alternative is to use existing data
            crypto.randomBytes(32768, (err, buf) => {
                if (err) throw err;
                //console.log(`${buf.length} bytes of random data: ${buf.toString('hex')}`);                
                connectionsList.downloadTestInitialize(uuidConnection);
                //connectionsList.downloadTestProgress(uuidConnection);
                connection.send(buf);
            });
        } else if ((message.type === 'utf8') && (message.utf8Data === 'download-test-progress')) {
            //continue download test            
            let downloadTestProgress = connectionsList.downloadTestProgress(uuidConnection);
            if (downloadTestProgress === true) {
                //we are sending partial results for every iteration            
                let downloadTestResult = connectionsList.downloadTestResult(uuidConnection);
                connection.send(JSON.stringify(
                    {
                        action: 'download-test-progress-step-done',
                        downloadTotalTime: downloadTestResult.downloadTotalTime,
                        downloadCounter: downloadTestResult.downloadCounter
                    }
                ));
                //generate random data - alternative is to use existing data
                crypto.randomBytes(32768, (err, buf) => {
                    if (err) throw err;
                    connection.send(buf);
                });
                //Finish ping test -> get final ping result, proceed to download test, 
            } else if (downloadTestProgress === false) {
                let downloadTestResult = connectionsList.downloadTestResult(uuidConnection);
                connection.send(JSON.stringify(
                    {
                        action: 'download-test-done',
                        downloadTotalTime: downloadTestResult.downloadTotalTime,
                        downloadCounter: downloadTestResult.downloadCounter
                    }
                ));
            } else {

            }
        } else if ((message.type === 'utf8') && (message.utf8Data === 'upload-test-initiate')) {
            //start upload test
            connectionsList.uploadTestInitialize(uuidConnection);
            let uploadTestResult = connectionsList.uploadTestResult(uuidConnection);
            connection.send(JSON.stringify(
                {
                    action: 'upload-test-progress-step-done',
                    uploadTotalTime: uploadTestResult.uploadTotalTime,
                    uploadCounter: uploadTestResult.uploadCounter
                }
            ));
        } else if (message.type === 'binary') {
            //if message type binary we are receiving uploading data from client
            let uploadTestProgress = connectionsList.uploadTestProgress(uuidConnection);
            if (uploadTestProgress === true) {
                //we are sending partial results for every iteration            
                let uploadTestResult = connectionsList.uploadTestResult(uuidConnection);
                connection.send(JSON.stringify(
                    {
                        action: 'upload-test-progress-step-done',
                        uploadTotalTime: uploadTestResult.uploadTotalTime,
                        uploadCounter: uploadTestResult.uploadCounter
                    }
                ));
                //Finish ping test -> get final ping result, proceed to download test, 
            } else if (uploadTestProgress === false) {
                let uploadTestResult = connectionsList.uploadTestResult(uuidConnection);
                connection.send(JSON.stringify(
                    {
                        action: 'upload-test-done',
                        uploadTotalTime: uploadTestResult.uploadTotalTime,
                        uploadCounter: uploadTestResult.uploadCounter
                    }
                ));
            } else {

            }
        }
    });

    //pong event 
    //if data === uuid => it is response to manual ping
    //if data !== => non custom response, maybe keep connection alive
    connection.on('pong', (data) => {
        //is some data exist, possible custom ping response
        if ((data) && (data.length > 30)) {
            let pingTestProgress = connectionsList.pingTestProgress(data);
            //continue ping test
            if (pingTestProgress === true) {
                connection.ping(data);
                //Finish ping test -> get final ping result, proceed to download test, 
            } else if (pingTestProgress === false) {
                let pingTestResult = connectionsList.pingTestResult(data);
                connection.send(JSON.stringify(
                    {
                        action: 'ping-test-done',
                        pingTotalTime: pingTestResult.pingTotalTime,
                        pingCounter: pingTestResult.pingCounter
                    }
                ));
                //console.log(pingTestResult);
                //undefined result do nothing?    
            } else {

            }
        }
    });

    connection.on('close', function (connection) {
        // close user connection
        connectionsList.removeConnection(this.uuid);
        console.log(`User disconnected connection: ${this.uuid} . Active connections: ${connectionsList.getAll().length} `);
    });
});


//start listening 
server.listen(port, () => {
    console.log(`Application started up on port ${port}`);
});