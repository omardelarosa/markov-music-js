var EventEmitter = require('events').EventEmitter

module.exports = function(audioContext){

  var ticker = new EventEmitter()

  var pos = 0
  var length = 25

  function time(){
    if (audioContext){
      return audioContext.currentTime * 1000
    } else if (global.process && process.hrtime) {
      var t = process.hrtime()
      return (t[0] + (t[1] / Math.pow(10, 9))) * 1000
    } else {
      return Date.now()
    }
  }

  function tick(){
    if (!pos){
      pos = time()
    }; 
    pos += length; 
    var diff = pos - time()
    ticker.emit('tick')
    setTimeout(tick, diff)
  }

  ticker.setInterval = function(tempo){
    length = parseInt(tempo) || 25
  }

  tick()

  return ticker
}
