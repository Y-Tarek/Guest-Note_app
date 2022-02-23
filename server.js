const express = require('express');
const {dotenv} = require('dotenv').config();
const bodyParser = require('body-parser');
const socketIo = require('socket.io');
const http = require('http');
const app = express();


var server = http.createServer(app);
const io = socketIo(server);
const router = require('./router')(io);

    // io.on('connection', (socket) => {
    //     console.log('A user is connected');
    //     socket.on('disconnect', () => {
    //         console.log('user disconnected');
    //       });

    //     //   socket.on('notes',(data) => {
    //     //       console.log(data);
    //     //   })
    // });
   module.exports = {io};

app.use(bodyParser.json());
app.use('/api',router);   
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/public/index.html');
//   });

server.listen(process.env.PORT,(err) => {
    if(err){
        console.log("error");
    }
    console.log("server connected");
});


 
module.exports = {app}; 