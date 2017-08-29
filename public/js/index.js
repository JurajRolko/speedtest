// is mozilla WebSocket condition still necessary?
window.WebSocket = window.WebSocket || window.MozWebSocket;

//var connection = new WebSocket('ws://localhost:3000');
var connection = new WebSocket('ws://desolate-beach-95540.herokuapp.com');

var blobData = null;

connection.onopen = function (event) {
    // connection is opened 
};

connection.onerror = function (error) {
    // an error occurred when sending/receiving data
    console.log('Connection error');
};

connection.onmessage = function (event) {
    //console.log(event);      
    //console.log(event.data.size);    
    try {
        var json = JSON.parse(event.data);
        //finished ping test
        if (json.action == 'ping-test-done') {            
            //update UI
            //ping in ms -> total time [ns] / iterations count * 10e-6  nanoseconds to miliseconds
            var hlpPing = Math.round(( parseInt(json.pingTotalTime) / parseInt(json.pingCounter) )*0.000001);      
            if (hlpPing < 1){      
                document.getElementById("input-latency").value = '< 1';                
            } else {
                document.getElementById("input-latency").value = hlpPing.toString();
            }
            //send message to initiate download test
            connection.send('download-test-initiate');
            document.getElementById("startTest").innerHTML = 'testing download';
        //finished 1 iteration of download test    
        } else if (json.action == 'download-test-progress-step-done'){            
            var hlpDownloadSpeed = Math.round( ( (parseInt(json.downloadCounter)*1024*1024*8*0.000001) / (parseInt(json.downloadTotalTime)*0.000000001) )*100)/100;             
            document.getElementById("input-download").value = hlpDownloadSpeed.toFixed(2).toString();            
        } else if (json.action == 'download-test-done'){
            //send message to initiate upload test
            connection.send('upload-test-initiate');
            document.getElementById("startTest").innerHTML = 'testing upload';            
        } else if (json.action == 'upload-test-progress-step-done'){  
            console.log(json);
            if ( parseInt(json.uploadTotalTime) <= 0) {
                connection.send(JSON.stringify(blobData));  
                document.getElementById("input-upload").value = '0.00';  
            } else {
                connection.send(JSON.stringify(blobData));    
                var hlpUploadSpeed = Math.round( ( (parseInt(json.uploadCounter)*1024*1024*8*0.000001) / (parseInt(json.uploadTotalTime)*0.000000001) )*100)/100;              
                document.getElementById("input-upload").value = hlpUploadSpeed.toFixed(2).toString();            
            }      
        } else if (json.action == 'upload-test-done'){            
            document.getElementById("startTest").innerHTML = 'test complete';
        }
    } catch (e) {
        //possible blob data
        if (event.data.size > 1024){            
            connection.send('download-test-progress');
            if (! blobData) {
                blobData = event.data;
            }
        } else {
            console.log('Invalid data ', event.data);
            return;
        }        
    }    
};


document.getElementById("startTest").addEventListener("click", function(){    
    //send messege with a specific keyword to begin testing
    connection.send('test-initiate');
    this.innerHTML = 'testing ping';
});
