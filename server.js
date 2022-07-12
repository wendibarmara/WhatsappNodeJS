const http=require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const path = require('path');
const SocketIO = require('socket.io');
const io=SocketIO(server);
const { Client,MessageMedia, NoAuth} = require('whatsapp-web.js');
var session = require('express-session');
var fs = require("fs");
const SESSION_FILE_PATH = './session.json';
const qrcode = require('qrcode');

  // Load the session data if it has been previously saved
  let sessionData;
  if(fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
  }

  // Use the saved values
  const client = new Client({
    restartOnAuthFail: true,
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // <- this one doesn't works in Windows
        '--disable-gpu'
      ],
    },
    authStrategy: new NoAuth  ({
       session: sessionData
    })
  });

app.use(express.static(__dirname + '/')); //set root directory
app.use(
    "/jquery",
    express.static(path.join(__dirname, "node_modules/jquery/dist"))
  );
  app.use(
      "/socket.io",
      express.static(path.join(__dirname, "node_modules/socket.io/client-dist"))
    );
io.on('connection', function(x) { 
        x.on("koneksi",function(xdata){
//load page
          app.get('/',(req,res)=>{
         res.sendFile('index.html',{root:__dirname});
           });
          // client.destroy();
           client.initialize();
              io.emit('sentfromserver',"Connecting...");
              client.on('qr', (qr) => {
                // Generate and scan this code with your phone
                qrcode.toDataURL(qr,(err,url)=>
                {
                    io.emit('qr',url);
                    io.emit('sentfromserver','QR Code Received,scan please !!');
                });
                             
                client.on('ready', () => {
                  io.emit('sentfromserver','Whatsapp is ready');
             });
                client.on('ready', () => {
                  x.on("kirimWA",function(data){
                  const number='+6285294669939';
                  const text = "Test 0990909";
                  const chatId=number.substring(1)+"@c.us";
                  //Kirim Pesan
                  client.sendMessage(chatId,text);
                  io.emit('sentfromserver','Whatsapp terkirim');
                  });                
               });
      });
    });
  });
  
      client.initialize();
      server.listen(8080, function(){
        console.log('listening on *:8080');
  });