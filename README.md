# Step Sequencer

A simple javascript step sequencer experiment that does not include any UI.

At this time, it works only on Chrome.

## Example

'''html
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">
<html>
<head>
  <script src="" type="text/javascript" charset="utf-8"></script>
  
  <title>
    Chrome compatible StepSequencer
  </title>
</head>
<body>
  <button class="go">Click To Start The Loop</button>
  <button class="stop">Stop</button>
  <script src="/lib/step_sequencer.js" type="text/javascript" charset="utf-8"></script>
  <script type="text/javascript" charset="utf-8">
  var sequencer = StepSequencer() ;
  
  function play() {
    if( sequencer.playing ){ return ; }
    sequencer
    .createTrack( 'drum', 'assets/sound.mp3' )
    .createTrack( 'guitar', 'assets/guitar.mp3' )
    .program( 'drum', [1, 5, 9, 13] )
    .program( 'guitar', [2, 6, 10, 12, 14] )
    .play( ) ;
  }
  
  function stop() {
    if( ! sequencer.playing ){ return ; }
    sequencer.stop() ;
  }
  
  document.querySelector('.go').onclick = play ;
  document.querySelector('.stop').onclick = stop ;
  
  </script>
</body>
</html>
'''

## License

step_sequencer.js is freely distributable under the terms of an MIT license. See LICENSE or http://www.opensource.org/licenses/mit-license.php.