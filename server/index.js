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
  socket.on('disconnect', function () {
    console.log('disconnection', socket.id)
    delete bunnies[socket.id]
    socket.broadcast.emit('player_disconnected', socket.id)
  })
  socket.on('update_position', function (pos) {
    pos.id = socket.id
    bunnies[socket.id] = pos
    socket.broadcast.emit('update_position', pos)
  })
})

setInterval(putPickUp, 5000);

function putPickUp() {
	var pos = {}
	pos.x = Math.random() * 800
	pos.y = Math.random() * 600
	pos.id = pos.x + '' + pos.y
	coins[pos.id] = pos
	io.sockets.emit('put_pick_up', pos)
}

console.log('server started on port', port)
