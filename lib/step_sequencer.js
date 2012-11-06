(function(){
  
  // Fetch an audio source, and buffer it.
  var loadAudioSource = function(audioContext, url, callback) {
    var request = new XMLHttpRequest() ;
    request.responseType = 'arraybuffer' ;
    request.open('GET', url) ;
    request.onload = function() {
      audioContext.decodeAudioData( this.response, function( buffer ) {
        callback( buffer ) ;
      }) ;
    } ;
    request.send() ;
  } ;
  
  var Loop = function(options) {
    this.name = options.name ;
    this.audioSource = options.audioSource ;
    this.start = options.start ;
    this.end = options.end ;
  } ;
  
  var Track = function() {
    this.audio = null ;
    this.program = [] ;
  } ;
  
  var StepSequencer = function(options){
    var self = this ;
    
    // Return a new instance if called without new
    if(self.constructor !== StepSequencer){ return new StepSequencer(options); }
    
    // Init
    options = options || {} ;
    var tracks = {},
        steps = options.steps || 16,
        bpm = options.bpm || 120,
        stepTime = 60000 / bpm,
        loopLength = stepTime * steps,
        loadingTracks = 0,
        audioContext = new webkitAudioContext(),
        startTime,
        audioSources,
        nextLoopTimeOut ;
    
    // Public Attributes
    self.playing = false ;
    
    var mightStart = function () {
      if( self.playing && loadingTracks == 0 ) {
        // start in 100ms from now, the time for us to program the first loop.
        startTime = ( audioContext.currentTime * 1000 ) + 100
        programLoop(0) ;
      }
    }
    
    var programLoop = function( loopNumber ) {
      var selfLoopStartTime = startTime + (loopNumber * loopLength) ;
      audioSources = [] ;
      for( var name in tracks ) {
        var t = tracks[ name ] ;
        for( var i = 0 ; i < t.program.length ; i++) {
          var src = audioContext.createBufferSource();
          audioSources.push( src );
          src.buffer = t.audio;
          src.connect(audioContext.destination);
          src.noteOn( ( selfLoopStartTime + ( t.program[i] * stepTime ) ) / 1000 );
        }
      }
      nextLoopTimeOut = setTimeout( function() { programLoop( loopNumber + 1 ) }, loopLength - 100 ) ;
    }
    
    // A track is defined by a sound file and
    //  * name: name of the track
    //  * url: url of the audio file
    // return the StepSequencer instance for chaining.
    self.createTrack = function(name, url) {
      loadingTracks ++ ;
      tracks[name] = new Track() ;
      loadAudioSource(audioContext, url, function(audioBuffer){
        tracks[name].audio = audioBuffer ;
        loadingTracks -- ;
        if(loadingTracks == 0){ mightStart() }
      }) ;
      return self ;
    } ;
    
    // Program a track to start at certain steps
    //  * trackName: name of the track
    //  * prog: array containing the steps where to start
    // prog might also be an object with enable and disable
    // properties containing array of indexes to set. In self case
    // other indexes are not setted.
    // finally, prog might be an integer, in self case the step is switched
    // given its current state.
    // return the StepSequencer instance for chaining.
    self.program = function ( trackName, prog ) {
      var t = tracks[trackName] ;
      function disable(track, step){ if( track.program.indexOf( step ) != -1 ) { t.program.splice( idx, 1 ) } }
      function enable(track, step){ if( track.program.indexOf(step) == -1 ) { t.program.push( idx) } }
      if( typeof prog == 'number' ) {
        var idx = t.program.indexOf( prog );
        ( idx != -1 ? disable( t, idx ) : enable( t, idx ) ) ;
      } else if( prog.constructor == [].constructor ) {
        tracks[trackName].program = prog ;
      } else if ( prog.enable && prog.disable ) {
        for( var i = 0 ; i < prog.enable.length ; i++ ) { enable( tracks[trackName], prog.enable[i] ); }
        for( var i = 0 ; i < prog.disable.length ; i++ ) { disable( tracks[trackName], prog.disable[i] ); }
      }
      return self ;
    }
    
    // Start playing the sequence.
    // Might wait until all the audio resources are loaded.
    // return the StepSequencer instance for chaining.
    self.play = function ( ) {
      if( self.playing ) { return self ; }
      self.playing = true ;
      mightStart() ;
      return self ;
    }
    
    self.stop = function ( ) {
      if( ! self.playing ) { return self ; }
      self.playing = false ;
      clearTimeout( nextLoopTimeOut ) ;
      for( var i = 0 ; i < audioSources.length ; i++){
        audioSources[i].noteOff( 0 ) ;
      }
    }
  } ;
  
  window.StepSequencer = StepSequencer;
})();
