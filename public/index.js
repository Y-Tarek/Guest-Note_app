var socket = io();
socket.on('connect',function()  {
    console.log("connected to server");
});

socket.on('disconnect',function(socket)  {
    console.log("server disconncted");
    
});

socket.on('newMessage'function(message){
 console.log(message);
})



