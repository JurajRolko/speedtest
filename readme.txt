todo & issues

- what is the "header size" for websocket frame? 2bytes? standard http header for continuous polling is 8kb?
- each frame is prefixed with 4-12 bytes of data about the payload?
- what is the default frame size (sliding window) for websocket communication? 2^15 = 35K? 
- is the websocket communication compressed? by default? how to stop this? negotiated during webSocket handshake? premessage-deflate extension in Sec-WebSocket-Extensions?
- different approach - get data from connection object directly bytesRead,bytesWritten