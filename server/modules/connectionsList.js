//use uuid library, RFC4122 compatible , v1-v4, v1 is timestamp based
const uuidv1 = require('uuid/v1');

//const for hrtime manipulation
const NS_PER_SEC = 1e9;

//class for storing all connections
class ConnectionsList {
    constructor() {
        this.connections = [];
        //hardcoded value for ping iterations count
        this.pingTestCounterMax = 20;  
        this.donwloadTestCounterMax = 20;      
        this.uploadTestCounterMax = 20; 
    };
    //add new connection
    addConnection(connection) {
        connection.uuid = uuidv1();
        this.connections.push(connection);
    };
    //remove specific connection
    removeConnection(uuid) {
        this.connections = this.connections.filter( (connection) => {
            return connection.uuid !== uuid;    
        });
    };
    //get specific connection by uuid
    getConnection(uuid){
        return this.connections.filter( (connection) => {
            return connection.uuid == uuid;    
        })[0];          
    }
    //get list of all connections
    getAll() {
        return this.connections;
    };
    //initialize test - reset all values
    initializeTest(uuid) {
        let connection = this.getConnection(uuid);

        if (connection) {
            connection.pingCounter = 0;                                    
            connection.downloadCounter = 0;  
            connection.uploadCounter = 0;              
            connection.pingLastTime = process.hrtime();
            connection.pingTotalTime = 0;
            connection.downloadTotalTime = 0;
            connection.uploadTotalTime = 0;
        } else {
            //do something if connection with uuid doesnt exist. should be thrown an error?
        }
    };
    //process 1 ping test iteration
    pingTestProgress(uuid) {              
        let actualTime = process.hrtime();
        let connection = this.getConnection(uuid);         
        //connection found
        if (connection) {                      
            if (connection.pingCounter < this.pingTestCounterMax){                
                //get difference between 2 last timestamps
                let timeDifference = (actualTime[0] * NS_PER_SEC + actualTime[1]) - (connection.pingLastTime[0] * NS_PER_SEC + connection.pingLastTime[1]);
                //increase total time
                connection.pingTotalTime += timeDifference;
                connection.pingCounter += 1;
                //set new time
                connection.pingLastTime = process.hrtime();
                //return value true -> ping test will continue
                return true;
            } else {
                //return value false -> ping test is over, we can get ping test results
                return false;
            }                                   
        } else {
            //do something if connection with uuid doesnt exist. should be thrown an error?
        }
    };
    //get final results of the ping test
    pingTestResult(uuid) {
        let connection = this.getConnection(uuid);
         //connection found
         if (connection) {
             return {
                pingTotalTime: connection.pingTotalTime,
                pingCounter: connection.pingCounter
             }
         }
    };
    //initialize download test
    downloadTestInitialize(uuid){
        let connection = this.getConnection(uuid);   
        //connection found
        if (connection) {                      
            connection.downloadLastTime = process.hrtime();                                 
        } 
    }
    //process 1 download test iteration
    downloadTestProgress(uuid){
        let actualTime = process.hrtime();
        let connection = this.getConnection(uuid);   
        //connection found
        if (connection) {                      
            if (connection.downloadCounter < this.donwloadTestCounterMax){                
                //get difference between 2 last timestamps
                let timeDifference = (actualTime[0] * NS_PER_SEC + actualTime[1]) - (connection.downloadLastTime[0] * NS_PER_SEC + connection.downloadLastTime[1]);
                //increase total time
                connection.downloadTotalTime += timeDifference;
                connection.downloadCounter += 1;
                //set new time
                connection.downloadLastTime = process.hrtime();
                //return value true -> download test will continue
                return true;
            } else {
                //return value false -> download test is over, we can get download test results
                return false;
            }                                   
        } else {
            //do something if connection with uuid doesnt exist. should be thrown an error?
        }  
    };
    //get results of the download test
    downloadTestResult(uuid) {
        let connection = this.getConnection(uuid);
         //connection found
         if (connection) {
             return {
                downloadTotalTime: connection.downloadTotalTime,
                downloadCounter: connection.downloadCounter
             }
         }
    };
    //initialize upload test
    uploadTestInitialize(uuid){
        let connection = this.getConnection(uuid);   
        //connection found
        if (connection) {                      
            connection.uploadLastTime = process.hrtime();                                 
        } 
    };
    //process 1 upload test iteration
    uploadTestProgress(uuid){
        let actualTime = process.hrtime();
        let connection = this.getConnection(uuid);   
        //connection found
        if (connection) {                      
            if (connection.uploadCounter < this.uploadTestCounterMax){                
                //get difference between 2 last timestamps
                let timeDifference = (actualTime[0] * NS_PER_SEC + actualTime[1]) - (connection.uploadLastTime[0] * NS_PER_SEC + connection.uploadLastTime[1]);
                //increase total time
                connection.uploadTotalTime += timeDifference;
                connection.uploadCounter += 1;
                //set new time
                connection.uploadLastTime = process.hrtime();
                //return value true -> upload test will continue
                return true;
            } else {
                //return value false -> upload test is over, we can get upload test results
                return false;
            }                                   
        } else {
            //do something if connection with uuid doesnt exist. should be thrown an error?
        }  
    };
    //get results of the download test
    uploadTestResult(uuid) {
        let connection = this.getConnection(uuid);
         //connection found
         if (connection) {
             return {
                uploadTotalTime: connection.uploadTotalTime,
                uploadCounter: connection.uploadCounter
             }
         }
    };
}

module.exports = {
    ConnectionsList: ConnectionsList
}