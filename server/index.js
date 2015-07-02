var port = process.env.PORT || 9000
var io = require('socket.io')(port)

var bunnies = {}
var coins 	= {}

io.on('connection', function (socket) {
  socket.broadcast.emit('hi')
  console.log('connection', socket.id)
  for(var bunnyId in bunnies) {
  	socket.emit('update_position', bunnies[bunnyId])
  }
  for(var coinId in coins) {
  	socket.emit('put_pick_up', coins[coinId])
  }
  socket.on('disconnect', function () {
    console.log('disconnection', socket.id)
    delete bunnies[socket.id]
    socket.broadcast.emit('player_disconnected', socket.id)
  })
  socket.on('update_position', function (pos) {
    pos.id = socket.id
    bunnies[socket.id] = pos
    socket.broadcast.emit('update_position', pos)
    for(coinId in coins) {
      if (isColision(pos, coins[coinId])) {
      	delete coins[coinId]
        io.sockets.emit('delete_coin', coinId)
      }
    }
  })
})

setInterval(putPickUp, 3000);

function putPickUp() {
	var pos = {}
	pos.x = Math.random() * 800
	pos.y = Math.random() * 600
	pos.id = pos.x + '' + pos.y
	coins[pos.id] = pos
	io.sockets.emit('put_pick_up', pos)
}

function isColision(posBunny, posCoin) {
  if(Math.abs(posBunny.x - posCoin.x) < 64 && Math.abs(posBunny.y - posCoin.y) < 64) return true
  return false
}

console.log('server started on port', port)
