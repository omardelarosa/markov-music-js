var EventEmitter = require('events').EventEmitter
var Ticker = require('./tick')

//var execFile = require('child_process').execFile

module.exports = function(context){
  var clock = new EventEmitter()

  var state = {
    tickLength: 60,

    nextTickAt: 0,
    position: 0,

    playing: false
  }


  var ticker = Ticker(context)
  ticker.on('tick', function(){
    if (state.playing){
      state.position += 1
      clock.emit('position', state.position)
    }
  })

  //var tickProcess = execFile('/usr/local/bin/node', [__dirname + '/tick_process.js'], function(err){
  //  if (err) throw err
  //})
  //tickProcess.stdout.on('data', function(){
  //  if (state.playing){
  //    state.position += 1
  //    clock.emit('position', state.position)
  //  }
  //})
  


  clock.setTempo = function(tempo){
    state.tickLength = 60000 / (tempo * 24)
    //tickProcess.stdin.write(state.tickLength + '\n')
    ticker.setInterval(state.tickLength)
    clock.emit('tempo', tempo)
  }

  clock.setPosition = function(pos){
    state.position = state.position - 1
  }

  clock.start = function(){
    state.nextTickAt = 0
    state.position = -1
    clock.emit('start')
    state.playing = true
  }

  clock.stop = function(){
    clock.emit('stop')
    state.playing = false
  }

  return clock
}