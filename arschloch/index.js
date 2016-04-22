


var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var playercount=0;
var gamestarted=false;
var player=0;
var passcounter=0;
var round;
var playerrank=[];
var roundplayers=[];
var roundstarted=false;

var clients = [];


app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {

    console.log('a user connected');
    clients.push(socket.id);

    io.to(clients[playercount]).emit('playernumber', clients[playercount]);
    playercount++;
    roundplayers=clients;
    io.emit('nextplayer', roundplayers[player]);
    io.emit('listclient',clients);

    if (playercount == 4) {
        io.emit('ingameclients',roundplayers);
        gamestarted = true;
        roundplayers=clients;
        console.log(roundplayers);
        io.emit('gamestarted',gamestarted);
        handoutcards();
        roundstarted=true;
        io.emit('roundstatus',roundstarted);

    }

    socket.on('playerwon', function (playernumber) {

        console.log(roundplayers);
        console.log('player' + playernumber + 'won the game');
        if(roundplayers.length==1){
            roundstarted=false;
            io.emit('roundstatus',roundstarted);
            roundplayers=[];
            for(var x=0;x<clients.length;x++){
                roundplayers.push(clients[x]);
            }
           // roundplayers=clients;
            handoutcards();
            io.emit('ingameclients',roundplayers);
            io.emit('layedcards', "0,0");


            round ++;


        }else{
            playerrank.push(clients[playernumber]);
            var index = roundplayers.indexOf(playernumber);

            if (index > -1){


                roundplayers.splice(index, 1);


            }


        }
        io.emit('ingameclients',roundplayers);
       // player=index+1;

    });





    io.emit('nextplayer', roundplayers[player]);
        socket.on('laycards', function (selectedcards) {
        if(gamestarted) {



            roundplayers=clients;
            io.emit('layedcards', selectedcards);
            player++;
            if (player > roundplayers.length-1 || player <0) {
                player = 0;
            }
            console.log(roundplayers[player]);
            io.emit('nextplayer', roundplayers[player]);

            if (passcounter != 0) {
                passcounter = 0;
            }
            console.log('player: ' + player);
            console.log('passes: ' + passcounter);


        }


    });
        socket.on('pass', function () {
         player++;

            if (player > roundplayers.length-1 || player <0) {
                player=0;
            }
            console.log(roundplayers);
            io.emit('nextplayer', roundplayers[player]);
            passcounter++;
            if(passcounter==roundplayers.length-1){
                io.emit('layedcards', "0,0");
                passcounter=0;
            }


            console.log('player: ' + player);
            console.log('passes: ' + passcounter);

        });

        socket.on('disconnect', function () {
            console.log('user disconnected');
            playercount--;
        });

});

http.listen(3000, function(){
    console.log('listening on *:3000');
});

function handoutcards(){

    var stack=new Array(0,0,0,0,0,4,4,4,4,4,4,4,4);
   // for(var i=0;i<32-(32%playercount);i++){
      for(p=0;p<roundplayers.length;p++){
          var playercards= new Array(0,0,0,0,0,0,0,0,0,0,0,0,0);
          for(c=1;c<=((32-(32%roundplayers.length))/roundplayers.length);c++){
              var z =Math.floor((Math.random() * 13) +1);


                  var cardfound=false;
                   var up=false;
                    up=Math.floor((Math.random() * 2));
                  while(!cardfound){


                      if(z>12){
                          z=0;
                      }
                      if(z<0){
                          z=12;
                      }
                      if(!stack[z]<1){

                          playercards[z]++;
                          stack[z]--;
                          cardfound=true;

                     }else {
                            if (up==1) {
                                z++;
                            }

                            else{
                                z--;
                            }



                      }


                    }



          }

          io.to(clients[p]).emit('takecards', playercards);
          console.log('player' + p +": " + clients[p]);
          console.log('karten' + playercards);
          /*
          var v=0;
          var s=0;
          for(x=0;x<playercards.length;x++){

              v+=playercards[x];
              s+=stack[x];

          }


          //
         // */
      }
   // }
}