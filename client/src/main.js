var KeyboardJS = require('./Keyboard.js')
var keyboard = new KeyboardJS(false)

var serverURL = 'localhost:9000'
var socket = require('socket.io-client')(serverURL)

// You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
// which will try to choose the best renderer for the environment you are in.
var renderer = new PIXI.autoDetectRenderer(800, 600);

// The renderer will create a canvas element for you that you can then insert into the DOM.
document.body.appendChild(renderer.view);

// You need to create a root container that will hold the scene you want to draw.
var stage = new PIXI.Container();

// This creates a texture from a 'bunny.png' image.
var bunnyTexture = PIXI.Texture.fromImage('bunny-cage.png');
var bunny = new PIXI.Sprite(bunnyTexture);
global.bunny = bunny
var coinTexture = PIXI.Texture.fromImage('yellow-coin.png');
var otherBunnies = {}
var coins = {}
var bunnySpeed = 5

// Setup the position and scale of the bunny
bunny.position.x = Math.random() * 800
bunny.position.y = Math.random() * 600
bunny.anchor.set(0.5, 0.5)

// Add the bunny to the scene we are building.
stage.addChild(bunny);

// kick off the animation loop (defined below)
animate();

function animate() {
    // start the timer for the next animation loop
    requestAnimationFrame(animate);

    if (keyboard.char('W')) moveY(-bunnySpeed); socket.emit('update_position', bunny.position)
    if (keyboard.char('S')) moveY(+bunnySpeed); socket.emit('update_position', bunny.position)
    if (keyboard.char('A')) moveX(-bunnySpeed); socket.emit('update_position', bunny.position)
    if (keyboard.char('D')) moveX(+bunnySpeed); socket.emit('update_position', bunny.position)
    
    // this is the main render call that makes pixi draw your container and its children.
    renderer.render(stage);
}

function moveY(incY) {
    bunny.position.y += incY

    for(coinId in coins) {
      if (isColision(bunny.position, coins[coinId])) {
        var sprite = coins[coinId]
        if(sprite) stage.removeChild(sprite)
        delete coins[coinId]
      }
    }
}
function moveX(incX) {
    bunny.position.x += incX

    for(coinId in coins) {
      if (isColision(bunny.position, coins[coinId])) {
        var sprite = coins[coinId]
        if(sprite) stage.removeChild(sprite)
        delete coins[coinId]
      }
    }
}

function isColision(posBunny, posCoin) {
  if(Math.abs(posBunny.x - posCoin.x) < 64 && Math.abs(posBunny.y - posCoin.y) < 64) return true
  return false
}

socket.on('update_position', function (pos) {
  // pos
  // {x, y, id}
  var sprite = otherBunnies[pos.id]
  if (!sprite) {
    sprite = new PIXI.Sprite(bunnyTexture)
    stage.addChild(sprite)
    otherBunnies[pos.id] = sprite
    sprite.anchor.set(0.5, 0.5)
  }
  sprite.position.x = pos.x
  sprite.position.y = pos.y
})

socket.on('player_disconnected', function (id) {
  var sprite = otherBunnies[id]
  if(sprite) stage.removeChild(sprite)
  delete otherBunnies[id]
})

socket.on('put_pick_up', function (pos) {
  var sprite = new PIXI.Sprite(coinTexture)
  stage.addChild(sprite)
  sprite.anchor.set(0.5,0.5)
  sprite.position = pos
  pos.id = pos.x + '' + pos.y
  coins[pos.id] = sprite
})

socket.on('connect', function () {
  console.log('connected')
  socket.emit('update_position', bunny.position)
})
// npm install
//
// npm run <script-name>
// npm run build
//
// node index.js
// http-server . <-p port>
