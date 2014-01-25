XSound.js
=========
  
HTML5 Web Audio API Library
  
## Overview
  
This library enables developers to use **Web Audio API by description like jQuery**.  
In concrete, this library may be useful to implement the following functions.
  
* Create Sound
* Play the One-Shot Audio
* Play the Audio
* Play the Media (Fallback by HTML5 MediaElement)
* Play the MML (Music Macro Language)
* Effectors (Compressor / Wah / Equalizer / Tremolo / Phaser / Chorus / Delay / Reverb, and Original Effector ... etc)
* Visualization (Overview in Time Domain / Time Domain / Spectrum)
* Recording (Create WAVE file)
* Session (by WebSocket)
  
The structure of description is the following.
  
    X(/* sound source */).setup();
    X(/* sound source */).param();
    X(/* sound source */).ready();
    X(/* sound source */).start();
    X(/* sound source */).stop();
  
    X(/* sound source */).module(/* effectors, analyser, recorder, session */).setup();
    X(/* sound source */).module(/* effectors, analyser, recorder, session */).param();
    X(/* sound source */).module(/* effectors, analyser, recorder, session */).start();
    X(/* sound source */).module(/* effectors, analyser, recorder, session */).stop();
  
etc...
  
## Demo
  
The application that uses this library is in the following URL.  
Please use Chrome (Windows / Mac) or Safari (Mac).  

* [X Sound](http://curtaincall.weblike.jp/portfolio-x-sound/)

* [Music V](http://curtaincall.weblike.jp/portfolio-music-v/)

* [Panner / Listener](http://curtaincall.weblike.jp/portfolio-x-sound/javascript/myworks/tests/AudioModule/test-audio-panner-listener)

Now, I'm creating website for Web Audio API. Please use the following site for understanding README.  

* [WEB SOUNDER](http://curtaincall.weblike.jp/portfolio-web-sounder/)
  
## Global Objects
  
This library defines 2 global objects. These are "X" and "XSound".  
If "X" is used already in the application, "X" can be removed by "noConflict" method
  
    //Remove 'X'
    XSound.noConflict();

    XSound(/* .... */);

    //....
  
In the case of removing both of global objects,
  
    //Remove 'X', 'XSound'
    var $ = XSound.noConflict(true);  //change variable name "$" freely
  
Some constant values are defined by these global objects as static property.
  
    //Can browser use this library ?
    if (X.IS_XSOUND) {
        //Can use Web Audio API

        //Sampling Rate
        console.log(XSound.SAMPLE_RATE);
        console.log(X.SAMPLE_RATE);

        //Buffer size (for ScriptProcessorNode)
        console.log(XSound.BUFFER_SIZE);
        console.log(X.BUFFER_SIZE);

        //The number of input channels
        console.log(XSound.NUM_INPUT);
        console.log(X.NUM_INPUT);

        //The number of output channels
        console.log(XSound.NUM_OUTPUT);
        console.log(X.NUM_OUTPUT);
    } else {
        //Cannot use this library
    }
  
### Error Message
  
The "error" static method changes the destination of error message for developement.
  
    X.error('ALERT');      //-> window.alert()
    X.error('CONSOLE');    //-> console.error()
    X.error('EXCEPTION');  //-> throw new Error()
    X.error('NONE');       //-> Not output
  
### Get "currentTime" property in the instance of AudioContext
  
The way of accessing [the "currentTime" property in AudioContext](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#attributes-AudioContext) is the following,
  
    //Can browser use this library ?
    if (X.IS_XSOUND) {
        //Getter only
        console.log(XSound.getCurrentTime());
        console.log(X.getCurrentTime());
    }
  
## Change Buffer Size for ScriptProcessorNode
  
The buffer size for ScriptProcessorNode is selected automaticly in the case of default.  
But, if the selected size is not adequate, the buffer size can be changed.  
The selectable buffer size is one of 256, 512, 1024, 2048, 4096, 8192, 16384.  
In addition, it is necessary that this process is executed before the all of processes in "XSound".
  
    //for example
    X('oscillator').resize(2048);
    X('oneshot').resize(1024);
    X('audio').resize(16384);
    X('media').resize(16384);
  
## Create Sound
  
### Initialization
  
In the case of using single sound,
  
    //The argument is initial state
    X('oscillator').setup(true);
  
In the case of using multiple sounds,
  
    //4 sounds
    X('oscillator').setup([true, true, true, false]);
  
### Start Sound
  
In the case of single sound,
  
    //440 Hz (A)
    X('oscillator').ready(0, 0).start(440);  //or, X('oscillator').start(440);
  
or,
  
    //440 Hz (A) is the 49th in keyboard of piano
    X('oscillator').ready(0, 0).start(X.toFrequencies([49]));  //or, X('oscillator').start(X.toFrequencies([49]));
  
In the case of multi sounds (for example, chord),
  
    //Set up four sources
    X('oscillator').setup([true, true, true, false]);

    var base = 40;

    //C major
    X('oscillator').ready(0, 0).start(X.toFrequencies([base, (base + 4), (base + 7)]));

    //C minor
    X('oscillator').ready(0, 0).start(X.toFrequencies([base, (base + 3), (base + 7)]));

    //Change the 4th oscillator's state
    X('oscillator', 3).state(true);  //Refer to the following "Manage State"

    //C7
    X('oscillator').ready(0, 0).start(X.toFrequencies([base, (base + 4), (base + 7), (base + 10)]));

    //Cm7
    X('oscillator').ready(0, 0).start(X.toFrequencies([base, (base + 3), (base + 7), (base + 10)]));
  
### Stop Sound
  
    X('oscillator').stop();
  
### Sound Scheduling
  
    //for example, Starting after 5 seconds, to stop after 10 seconds,
    X('oscillator').ready(5, 10).start(440).stop();
  
    //Method chain
    X('oscillator').ready(5, 10).start(440).stop().ready(15, 20).start(880).stop() /* ... */ ;
  
### Master Volume
  
    //Getter
    var volume = X('oscillator').param('masterVolume');  //The default value is 1

    //Setter
    X('oscillator').param('masterVolume', 0.5);  //The range of value is between 0 and 1

    //Associative array
    X('oscillator').param({masterVolume : 0.5});
  
### Envelope Generator
  
     //Getter
     var a = X('oscillator').module('eg').param('attack');   //The default value is 0.01
     var d = X('oscillator').module('eg').param('decay');    //The default value is 0.30
     var s = X('oscillator').module('eg').param('sustain');  //The default value is 0.50
     var r = X('oscillator').module('eg').param('release');  //The default value is 1.00

    //Setter
    X('oscillator').module('eg').param('attack', 0.5);   //The range of value is between 0 and 1
    X('oscillator').module('eg').param('decay', 0.5);    //The range of value is between 0 and 1
    X('oscillator').module('eg').param('sustain', 0.5);  //The range of value is between 0 and 1
    X('oscillator').module('eg').param('release', 0.5);  //The range of value is between 0 and 1

    //Method chain
    X('oscillator').module('eg').param('attack', 0.5)
                                .param('decay', 0.5)
                                .param('sustain', 0.5)
                                .param('release', 0.5);

     //Associative array
    X('oscillator').module('eg').param({
      attack  : 0.5,
      decay   : 0.5,
      sustain : 0.5,
      release : 0.5
    });
  
### Glide
  
    //Getter
    var type = X('oscillator').module('glide').param('type');  //The default value is 'linear'
    var time = X('oscillator').module('glide').param('time');  //The default value is 0

    //Setter
    X('oscillator').module('glide').param('type', 'exponential');  //either 'linear' or 'exponential'
    X('oscillator').module('glide').param('time', 5);              //This value is greater than or equal 0

    //Associative array
    X('oscillator').module('glide').param({
      type : 'exponential',
      time : 5
    });
  
### Wave Type / Gain / Octave / Fine
  
The 2nd argument of "X" or "XSound" is number type for designating each oscillator.  
For example, if 3 oscillators are used, this argument is either 0, 1 or 2.
  
    //Getter
    var type   = X('oscillator', 0).param('type');    //The default value is 'sine'
    var volume = X('oscillator', 0).param('volume');  //The default value is 1
    var octave = X('oscillator', 0).param('octave');  //The default value is 0
    var fine   = X('oscillator', 0).param('fine');    //The default value is 0

    //Setter
    X('oscillator', 0).param('type', 'sawtooth');  //one of 'sine', 'square', 'sawtooth', 'triangle'
    X('oscillator', 0).param('volume', 0.5);       //The range of value is between 0 and 1
    X('oscillator', 0).param('octave', 1.0);       //The range of value is between -4 and 4
    X('oscillator', 0).param('fine', 100);         //The range of value is between -1200 and 1200

    //Method chain
    X('oscillator', 0).param('type', 'sawtooth')
                      .param('volume', 0.5)
                      .param('octave', 1.0)
                      .param('fine', 100);

    //Associative array
    X('oscillator', 0).param({
      type   : 'sawtooth',
      volume : 0.5,
      octave : 1.0,
      fine   : 100
    });
  
### Manage State
  
The 2nd argument of "X" or "XSound" is number type for designating each oscillator.  
For example, if 3 oscillators are used, this argument is either 0, 1 or 2.
  
    //Getter
    var state  = X('oscillator', 0).state();  //Boolean type

    //Setter
    X('oscillator', 0).state(true);      //Boolean type
    X('oscillator', 0).state('toggle');  //Change state according to current state
  
## Play the One-Shot Audio
  
### Initialization
  
For example, the following 12 one-shot audios are corresponded to 88 keyboards of Piano.
  
    var base = 'http://xxx.jp/one-shots/';
    var urls = [
      (base + 'C.mp3'),
      (base + 'Ch.mp3'),
      (base + 'D.mp3'),
      (base + 'Dh.mp3'),
      (base + 'E.mp3'),
      (base + 'F.mp3'),
      (base + 'Fh.mp3'),
      (base + 'G.mp3'),
      (base + 'Gh.mp3'),
      (base + 'A.mp3'),
      (base + 'Ah.mp3'),
      (base + 'B.mp3')
    ];

    //for "X('oneshot').setup()"
    var settings = new Array(88);

    for (var i = 0, len = settings.length; i < len; i++) {
        var setting = {
          buffer : 0,      //for selecting the instance of AudioBuffer
          rate   : 1,      //for "playbackRate" property in the instance of AudioBufferSourceNode
          loop   : false,  //for "loop" property in the instance of AudioBufferSourceNode
          start  : 0,      //for "loopStart" property in the instance of AudioBufferSourceNode
          end    : 0,      //for "loopEnd" property in the instance of AudioBufferSourceNode
          volume : 1       //for the instance of GainNode
        };

        //Compute index for selecting the instance of AudioBuffer
        setting.buffer = (i + 9) % 12;

        //Compute "playbackRate" property in the instance of AudioBufferSourceNode
        if ((i >= 0) && (i <= 2)) {
            setting.rate = 0.0625;
        } else if ((i >= 3) && (i <= 14)) {
            setting.rate = 0.125;
        } else if ((i >= 15) && (i <= 26)) {
            setting.rate = 0.25;
        } else if ((i >= 27) && (i <= 38)) {
            setting.rate = 0.5;
        } else if ((i >= 39) && (i <= 50)) {
            setting.rate = 1;
        } else if ((i >= 51) && (i <= 62)) {
            setting.rate = 2;
        } else if ((i >= 63) && (i <= 74)) {
            setting.rate = 4;
        } else if ((i >= 75) && (i <= 86)) {
            setting.rate = 8;
        } else if ((i >= 87) && (i <= 98)) {
            setting.rate = 16;
        }

        settings[i] = setting;
    }

    //Load one-shot audios
    try {
        X('oneshot').setup({
          resources : urls,
          settings  : settings,
          timeout   : 60000,
          success   : function(buffers){
              //"buffers" is the instances of AudioBuffer
          },
          error     : function(object, textStatus){
              //"object" is either the instance of XMLHttpRequest,  "onerror" event object in the instance of FileReader or error object of "decodeAudioData"
              //"textStatus" is one of 'error', 'timeout', 'decode', error code of FileReader;
          },
          progress  : function(xhr){
              //"xhr" is the instance of XMLHttpRequest
          }
        });
    } catch (error) {
        window.alert(error.message);
        return;
    }
  
### Start / Stop Audio
  
    //for selecting the instance of AudioBuffer
    var index = 48;

    X('oneshot').ready(0, 0).start(index);  //or, X('oneshot').start(index);
    X('oneshot').stop(index);
  
### Sound Scheduling
  
    var index = 48;
  
    //for example, Starting after 5 seconds, to stop after 10 seconds,
    X('oneshot').ready(5, 10).start(index).stop(index);
  
    //Method chain
    X('oneshot').ready(5, 10).start(index).stop(index).ready(15, 20).start((index + 12)).stop((index + 12)) /* ... */ ;
  
### Master Volume
  
    //Getter
    var volume = X('oneshot').param('masterVolume');  //The default value is 1

    //Setter
    X('oneshot').param('masterVolume', 0.5);  //The range of value is between 0 and 1

    //Associative array
    X('oneshot').param({masterVolume : 0.5});
  
### Envelope Generator
  
    //Getter
    var a = X('oneshot').module('eg').param('attack');   //The default value is 0.01
    var d = X('oneshot').module('eg').param('decay');    //The default value is 0.30
    var s = X('oneshot').module('eg').param('sustain');  //The default value is 0.50
    var r = X('oneshot').module('eg').param('release');  //The default value is 1.00

    //Setter
    X('oneshot').module('eg').param('attack', 0.5);   //The range of value is between 0 and 1
    X('oneshot').module('eg').param('decay', 0.5);    //The range of value is between 0 and 1
    X('oneshot').module('eg').param('sustain', 0.5);  //The range of value is between 0 and 1
    X('oneshot').module('eg').param('release', 0.5);  //The range of value is between 0 and 1

    //Method chain
    X('oneshot').module('eg').param('attack', 0.5)
                             .param('decay', 0.5)
                             .param('sustain', 0.5)
                             .param('release', 0.5);

     //Associative array
    X('oneshot').module('eg').param({
      attack  : 0.5,
      decay   : 0.5,
      sustain : 0.5,
      release : 0.5
    });
  
## Play the Audio
  
### Initialization
  
Register callback functions.
  
    X('audio').setup({
      decode : function(arrayBuffer){
          //While "decodeAudioData" is executing, this callback function is executed
          //for example, this callback function displays progress bar

          //"arrayBuffer" is the instance of ArrayBuffer
      },
      ready : function(buffer){
          //When "decodeAudioData" ended, this callback function is executed
          //for example, this callback function makes UI valid for starting audio

          //"buffer" is the instance of AudioBuffer
      },
      start : function(source, currentTime){
          //When audio starts, this callback function is executed
          //for example, this callback function updates UI for stopping audio

          //"source" is the instance of AudioBufferSourceNode
          //"currentTime" is current time (position) in the played audio
      },
      stop : function(source, currentTime){
          //When audio stopped, this callback function is executed
          //for example, this callback function updates UI for starting audio

          //"source" is the instance of AudioBufferSourceNode
          //"currentTime" is current time (position) in the played audio
      },
      update : function(source, currentTime){
          //While audio is playing, this callback function is executed
          //for example, this callback updates text for displaying current time

          //"source" is the instance of AudioBufferSourceNode
          //"currentTime" is current time (position) in the played audio
      },
      ended : function(source, currentTime){
          //When audio ended, this callback function is executed
          //for example, this callback clears UI for playing the audio

          //'source' is the instance of AudioBufferSourceNode
          //'currentTime' is current time in audio
      }
    });
  
### Ready
  
It is required to create the instance of AudioBuffer in order to to play the audio.
  
    //"X('audio').ready()" method creates the instance of AudioBuffer

    //Ajax
    X.ajax({
      url     : 'http://xxx.jp/sample.wav',  //Resource URL
      timeout : 60000,                       //Timeout (1 minutes)
      success : function(xhr, arrayBuffer){
          //"xhr" is the instance of XMLHttpRequest
          //"arrayBuffer" is the instance of ArrayBuffer

          //ArrayBuffer -> AudioBuffer -> AudioBufferSourceNode
          X('audio').ready.call(X('audio'), arrayBuffer);
      },
      error : function(xhr, textStatus){
          //"xhr" is the instance of XMLHttpRequest
          //"textStatus" is either 'error' or 'timeout'
      },
      progress : function(xhr){
          //"xhr" is the instance of XMLHttpRequest
      }
    });

    //<input type="file">
    document.getElementById('file-upload').addEventListener('change', function(event){
        try {
            //The returned value is the instance of File (extends Blob)
            var file = X.file(
              event   : event,
              type    : 'ArrayBuffer',
              success : function(event, arrayBuffer){
                  //"event" is "onload" event object in the instance of FileReader
                  //"arrayBuffer" is the instance of ArrayBuffer

                  //the instance of File -> ArrayBuffer -> AudioBuffer -> AudioBufferSourceNode
                  X('audio').ready.call(X('audio'), arrayBuffer);
              },
              error : function(event, error){
                  //"event" is "onerror" event object in the instance of FileReader
              },
              progress : function(event){
                  //"event" is "onprogress" event object in the instance of FileReader
              }
            });
        } catch (error) {
            window.alert(error.message);
        }
    }, false);
  
### Start Audio
  
The instance of AudioBufferSourceNode has been prepared already.
  
    X('audio').start(0);
  
In the case of starting audio on the way of audio,
  
    var currentTime = 60;  //60 sec

    X('audio').start(currentTime);  //Start audio from 60 sec
  
### Stop Audio
  
    X('audio').stop();
  
### Start / Pause
  
    X('audio').toggle(X('audio').param('currentTime'));
  
### Parameters
  
    //Getter
    var volume      = X('audio').param('masterVolume');  //The default value is 1
    var rate        = X('audio').param('playbackRate');  //The default value is 1
    var loop        = X('audio').param('loop');          //The default value is false
    var currentTime = X('audio').param('currentTime');   //If the instance of AudioBuffer does not exist, this value is 0
    var duration    = X('audio').param('duration');      //If the instance of AudioBuffer does not exist, this value is 0 (Getter only)
    var smpleRate   = X('audio').param('sampleRate');    //If the instance of AudioBuffer does not exist, this value equals to "X.SAMPLE_RATE" (Getter only)
    var channels    = X('audio').param('channels');      //If the instance of AudioBuffer does not exist, this value is 0

    //Setter
    X('audio').param('masterVolume', 0.5);  //The range of value is between 0 and 1
    X('audio').param('playbackRate', 0.5);  //The range of value is greater than or equal 0
    X('audio').param('loop', false);
    X('audio').param('currentTime', 60);    //The range of value is between 0 and audio duration

    //Method chain
    X('audio').param('masterVolume', 0.5)
              .param('playbackRate', 0.5)
              .param('loop', false)
              .param('currentTime', 60);

    //Associative array
    X('audio').param({
      masterVolume : 0.5,
      playbackRate : 0.5,
      loop         : false,
      currentTime  : 60
    });
  
### Vocal Canceler
  
    //Getter
    var canceler = X('audio').module('vocalCanceler').param('depth');  //The default value is 0

    //Setter
    X('audio').module('vocalCanceler').param('depth', 0.5);  //The range of value is between 0 and 1

    //Associative array
    X('audio').module('vocalCanceler').param({depth : 0.5});
  
## Play the Media
  
### Initialization
  
Get node object of HTMLMediaElement and select media format and register callback functions.
  
    var mediaPlayer = null;
  
    if (X.IS_XSOUND) {
        mediaPlayer = X('media');  //Use Web Audio API (MediaElementAudioSourceNode)
    } else {
        mediaPlayer = X('media');  //Not use Web Audio API (Fallback by MediaElement)
    }

    //....

    //The properties this object has are properties of "loadstart", "loadedmetadata", "loadeddata", "canplay", "canplaythrough", "timeupdate", "ended" ...etc 
    var callbacks = {};

    //Element ID, Media type ('audio' or 'video'), Media format array, callback
    try {
        X('media').setup({
          id        : 'audio-element',        //If this value is empty string, this method creates HTMLMediaElement
          type      : 'audio',                //either 'audio' or 'video'
          formats   : ['wav', 'ogg', 'mp3'],
          callbacks : callbacks
        });
    } catch (error) {
        //Cannot use HTML5 MediaElement (for example, less than IE9)
        window.alert(error.message);
        return;
    }
  
### Ready
  
It is required to create the instance of MediaElementAudioSourceNode in order to to play the media.
  
    X('media').ready('http://xxx.jp/sample.wav');  //The argument is path name or Data URL or Object URL for media resource
  
### Start Media
  
The instance of MediaElementAudioSourceNode has been prepared already.
  
    X('media').start(0);
  
In the case of starting media on the way of media,
  
    var currentTime = 60;  //60 sec

    X('media').start(currentTime);  //Start media from 60 sec
  
### Stop Media
  
    X('media').stop();
  
### Start / Pause
  
    X('media').toggle(X('media').param('currentTime'));
  
### Parameters
  
    //Getter
    var volume      = X('media').param('masterVolume');  //The default value is 1
    var rate        = X('media').param('playbackRate');  //The default value is 1
    var currentTime = X('media').param('currentTime');   //The default value is 0
    var loop        = X('media').param('loop');          //The default value is false
    var muted       = X('media').param('muted');         //The default value is false
    var controls    = X('media').param('controls');      //The default value is false
    var width       = X('media').param('width');         //Video only
    var height      = X('media').param('height');        //Video only
    var duration    = X('media').param('duration');      //If media data does not exist, this value is 0 (Getter only)
    var channels    = X('media').param('channels');      //If the instance of MediaElementAudioSourceNode does not exist, this value is 0

    //Setter
    X('media').param('masterVolume', 0.5);  //The range of value is between 0 and 1
    X('media').param('playbackRate', 0.5);  //The range of value is greater than or equal 0
    X('media').param('currentTime', 60);    //The range of value is between 0 and audio duration
    X('media').param('loop', false);
    X('media').param('muted', false);
    X('media').param('controls', false);
    X('media').param('width', 600);
    X('media').param('height', 480);

    //Method chain
    X('media').param('masterVolume', 0.5)
              .param('playbackRate', 0.5)
              .param('currentTime', 60)
              .param('loop', false)
              .param('muted', false)
              .param('controls', false)
              .param('width', 600)
              .param('height', 480);

    //Associative array
    X('media').param({
      masterVolume : 0.5,
      playbackRate : 0.5,
      currentTime  : 60,
      loop         : false,
      muted        : false,
      controls     : false,
      width        : 600,
      height       : 480
    });
  
### Vocal Canceler
  
Vocal Canceler requires to use Web Audio API.
Therefore, it is requires to check flag.

    if (X.IS_XSOUND) {
        //Getter
        var canceler = X('media').module('vocalCanceler').param('depth');  //The default value is 0

        //Setter
        X('media').module('vocalCanceler').param('depth', 0.5);  //The range of value is between 0 and 1

        //Associative array
        X('media').module('vocalCanceler').param({depth : 0.5});
    } else {
        //Cannot use Vocal Canceler
    }
  
## Select Connected Module
  
The default connection is the follwing.
  

1. compressor

1. distortion

1. wah

1. equalizer

1. filter

1. tremolo

1. ringmodulator

1. autopanner

1. flanger

1. phaser

1. chorus

1. delay

1. reverb

  
In the case of selecting module,
  
    //For exmaple, source (input) -> ScriptProcessorNode -> masterVolume -> analyser -> AudioDestinationNode (output)
    X('oscillator').start(440, []);
    X('oneshot').start(0, []);
    X('audio').start(0, []);
    X('media').start(0, []);

    //For exmaple, source (input) -> ScriptProcessorNode -> [ chorus -> delay ] -> masterVolume -> analyser -> AudioDestinationNode (output)
    X('oscillator').start(440, [X('oscillator').module('chorus), X('oscillator').module('delay')]);
    X('oneshot').start(0, [X('audio').module('chorus), X('audio').module('delay')]);
    X('audio').start(0, [X('audio').module('chorus), X('audio').module('delay')]);
    X('media').start(0, [X('media').module('chorus), X('media').module('delay')]);
  
## Custom Sound Processor
  
In ths case of customizing "onaudioprocess" event handler in the instance of ScriptProcessorNode,
  
    //for exmale, white noise
    X('oscillator').start(440, [], function(event){
        var outputLs = event.outputBuffer.getChannelData(0);
        var outputRs = event.outputBuffer.getChannelData(1);

        for (var i = 0; i < this.bufferSize; i++) {
            outputLs[i] = 2 * (Math.random() - 0.5);
            outputRs[i] = 2 * (Math.random() - 0.5);
        }
    });

    //for exmale, audio and white noise
    X('audio').start(0, [], function(event){
        var inputLs = event.inputBuffer.getChannelData(0);
        var inputRs = event.inputBuffer.getChannelData(1);
        var outputLs = event.outputBuffer.getChannelData(0);
        var outputRs = event.outputBuffer.getChannelData(1);

        for (var i = 0; i < this.bufferSize; i++) {
            outputLs[i] = (inputLs[i] + 2 * (Math.random() - 0.5)) / 2;
            outputRs[i] = (inputRs[i] + 2 * (Math.random() - 0.5)) / 2;
        }
    });
  
## Effectors
    
The following, the variable is one of 'oscillator', 'oneshot', 'audio', 'media'.
  
    var source = /* 'oscillator' or 'oneshot' or 'audio' or 'media' */;
  
If effectors are used to X('media'), it is necessary to determine global flag (X.IS_XSOUND).  
However, this is omitted the following.
  
### Compressor
  
    var params = {};
  
    //Getter
    params.threshold = X(source).module('compressor').param('threshold');  //The default value is 24
    params.knee      = X(source).module('compressor').param('knee');       //The default value is 30
    params.ratio     = X(source).module('compressor').param('ratio');      //The default value is 12
    params.attack    = X(source).module('compressor').param('attack');     //The default value is 0.003
    params.release   = X(source).module('compressor').param('release');    //The default value is 0.25

    //Setter
    X(source).module('compressor').param('threshold', 24);  //The range of value is between -100 and 0
    X(source).module('compressor').param('knee',30 );       //The range of value is between 0 and 40
    X(source).module('compressor').param('ratio', 12);      //The range of value is between 1 and 20
    X(source).module('compressor').param('attack', 0.003);  //The range of value is between 0 and 1
    X(source).module('compressor').param('release', 0.25);  //The range of value is between 0 and 1

    //Method chain
    X(source).module('compressor').param('threshold', 24)
                                  .param('knee',30 )
                                  .param('ratio', 12)
                                  .param('attack', 0.003)
                                  .param('release', 0.25);

    //Associative array
    X(source).module('compressor').param({
      threshold : 24,
      knee      : 30,
      ratio     : 12,
      attack    : 0.003,
      release   : 0.25
    });
  
### Distortion
  
    var params = {};

    //Getter
    params.curve = X(source).module('distortion').param('curve');  //The default value is 'clean'
    params.drive = X(source).module('distortion').param('drive');  //The default value is 0

    //Setter
    X(source).module('distortion').param('curve', 'overdirve');  //one of 'clean', 'crunch', 'overdrive', 'distortion', 'fuzz'
    X(source).module('distortion').param('drive', 0.5);          //The range of value is between 0 and 1

    //Method chain
    X(source).module('distortion').param('curve', 'overdirve')
                                  .param('drive', 0.5);

    //Associative array
    X(source).module('distortion').param({
      curve : 'overdrive',
      drive : 0.5
    });
  
### Wah
  
    var params = {};
  
    //Getter
    params.depth     = X(source).module('wah').param('depth');      //The default value is 0
    params.rate      = X(source).module('wah').param('rate');       //The default value is 0
    params.mix       = X(source).module('wah').param('mix');        //The default value is 0
    params.resonance = X(source).module('wah').param('resonance');  //The default value is 1

    //Setter
    X(source).module('wah').param('depth', 500);     //The range of value is between 0 and 500
    X(source).module('wah').param('rate', 5);        //The range of value is greater than or equal 0
    X(source).module('wah').param('mix', 0.5);       //The range of value is between 0 and 1
    X(source).module('wah').param('resonance', 20);  //The range of value is between 0.0001 and 1000

    //Method chain
    X(source).module('wah').param('depth', 500)
                           .param('rate', 5)
                           .param('mix', 0.5)
                           .param('resonance', 20);

    //Associative array
    X(source).module('wah').param({
      depth     : 500,
      rate      : 5,
      mix       : 0.5,
      resonance : 20
    });
  
### Equalizer
  
    var params = {};

    //Getter
    params.bass     = X(source).module('equalizer').param('bass');      //The default value is 0
    params.middle   = X(source).module('equalizer').param('middle');    //The default value is 0
    params.treble   = X(source).module('equalizer').param('treble');    //The default value is 0
    params.presence = X(source).module('equalizer').param('presence');  //The default value is 0

    //Setter
    X(source).module('equalizer').param('bass', 18);      //The range of value is between -40 and 40
    X(source).module('equalizer').param('middle', 18);    //The range of value is between -40 and 40
    X(source).module('equalizer').param('treble', 18);    //The range of value is between -40 and 40
    X(source).module('equalizer').param('presence', 18);  //The range of value is between -40 and 40

    //Method chain
    X(source).module('equalizer').param('bass', 18)
                                 .param('middle', 18)
                                 .param('treble', 18)
                                 .param('presence', 18);

    //Associative array
    X(source).module('equalizer').param({
      bass     : 18,
      middle   : 18,
      treble   : 18,
      presence : 18
    });
  
### Filter
  
    var params = {};

    //Getter
    params.type      = X(source).module('filter').param('type');       //The default value is 'lowpass'
    params.frequency = X(source).module('filter').param('frequency');  //The default value is 350
    params.resonance = X(source).module('filter').param('Q');          //The default value is 1
    params.gain      = X(source).module('filter').param('gain');       //The default value is 0
    params.attack    = X(source).module('filter').param('attack');     //The default value is 0.01
    params.decay     = X(source).module('filter').param('decay');      //The default value is 0.3
    params.sustain   = X(source).module('filter').param('sustain');    //The default value is 0.5
    params.release   = X(source).module('filter').param('release');    //The default value is 1

    //Setter
    X(source).module('filter').param('type', 'lowpass');  //one of 'lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass'
    X(source).module('filter').param('frequency', 1000);  //The range of value is between 10 and half the sample-rate
    X(source).module('filter').param('Q', 20);            //The range of value is between 0.0001 and 1000
    X(source).module('filter').param('gain', 18);         //The range of value is between -40 and 40
    X(source).module('filter').param('attack', 0.5);      //The range of value is between 0 and 1
    X(source).module('filter').param('decay', 0.5);       //The range of value is between 0 and 1
    X(source).module('filter').param('sustain', 0.5);     //The range of value is between 0 and 1
    X(source).module('filter').param('release', 0.5);     //The range of value is between 0 and 1

    //Method chain
    X(source).module('filter').param('type', 'lowpass')
                              .param('frequency', 1000)
                              .param('Q', 20)
                              .param('gain', 18)
                              .param('attack', 0.5)
                              .param('decay', 0.5)
                              .param('sustain', 0.5)
                              .param('release', 0.5);

    //Associative array
    X(source).module('filter').param({
      type      : 'lowpass',
      frequency : 1000,
      Q         : 20,
      gain      : 18,
      attack    : 0.5,
      decay     : 0.5,
      sustain   : 0.5,
      release   : 0.5
    });
  
### Tremolo
  
    var params = {};

    //Getter
    params.depth = X(source).module('tremolo').param('depth');  //The default value is 0
    params.rate  = X(source).module('tremolo').param('rate');   //The default value is 0

    //Setter
    X(source).module('tremolo').param('depth', 0.5);  //The range of value is between 0 and 1
    X(source).module('tremolo').param('rate', 5);     //The range of value is greater than or equal 0

    //Method chain
    X(source).module('tremolo').param('depth', 0.5)
                               .param('rate', 5);

    //Associative array
    X(source).module('tremolo').param({
      depth : 0.5,
      rate  : 5
    });
  
### Ring Modulator
  
    var params = {};

    //Getter
    params.depth = X(source).module('ringmodulator').param('depth');  //The default value is 0
    params.rate  = X(source).module('ringmodulator').param('rate');   //The default value is 0

    //Setter
    X(source).module('ringmodulator').param('depth', 0.5);  //The range of value is between 0 and 1
    X(source).module('ringmodulator').param('rate', 1000);  //The range of value is greater than or equal 0

    //Method chain
    X(source).module('ringmodulator').param('depth', 0.5)
                                     .param('rate', 1000);

    //Associative array
    X(source).module('ringmodulator').param({
      depth : 0.5,
      rate  : 1000
    });
  
### Auto Panner
  
    var params = {};

    //Getter
    params.depth = X(source).module('autopanner').param('depth');  //The default value is 0
    params.rate  = X(source).module('autopanner').param('rate');   //The default value is 0

    //Setter
    X(source).module('autopanner').param('depth', 0.5);  //The range of value is between 0 and 1
    X(source).module('autopanner').param('rate', 0.5);   //The range of value is greater than or equal 0

    //Method chain
    X(source).module('autopanner').param('depth', 0.5)
                                  .param('rate', 0.5);

    //Associative array
    X(source).module('autopanner').param({
      depth : 0.5,
      rate  : 0.5
    });
  
### Phaser
  
    var params = {};

    //Getter
    params.depth = X(source).module('phaser').param('depth');  //The default value is 0
    params.rate  = X(source).module('phaser').param('rate');   //The default value is 0
    params.mix   = X(source).module('phaser').param('mix');    //The default value is 0

    //Setter
    X(source).module('phaser').param('depth', 100);  //The range of value is between 0 and 350
    X(source).module('phaser').param('rate', 5);     //The range of value is greater than or equal 0
    X(source).module('phaser').param('mix', 0.5);    //The range of value is between 0 and 1

    //Method chain
    X(source).module('phaser').param('depth', 100)
                              .param('rate', 5)
                              .param('mix', 0.5);

    //Associative array
    X(source).module('phaser').param({
      depth : 100,
      rate  : 5,
      mix   : 0.5
    });
  
### Flanger
  
    var params = {};

    //Getter
    params.depth    = X(source).module('flanger').param('depth');     //The default value is 0
    params.rate     = X(source).module('flanger').param('rate');      //The default value is 0
    params.mix      = X(source).module('flanger').param('mix');       //The default value is 0
    params.feedback = X(source).module('flanger').param('feedback');  //The default value is 0

    //Setter
    X(source).module('flanger').param('depth', 0.005);   //The range of value is between 0 and 0.005 (5 msec)
    X(source).module('flanger').param('rate', 5);        //The range of value is greater than or equal 0
    X(source).module('flanger').param('mix', 0.5);       //The range of value is between 0 and 1
    X(source).module('flanger').param('feedback', 0.5);  //The range of value is between 0 and 1

    //Method chain
    X(source).module('flanger').param('depth', 0.005)
                               .param('rate', 5)
                               .param('mix', 0.5)
                               .param('feedback', 0.5);

    //Associative array
    X(source).module('flanger').param({
      depth    : 0.005,
      rate     : 5,
      mix      : 0.5,
      feedback : 0.5
    });
  
### Chorus
  
    var params = {};

    //Getter
    params.depth    = X(source).module('chorus').param('depth');     //The default value is 0
    params.rate     = X(source).module('chorus').param('rate');      //The default value is 0
    params.mix      = X(source).module('chorus').param('mix');       //The default value is 0
    params.feedback = X(source).module('chorus').param('feedback');  //The default value is 0

    //Setter
    X(source).module('chorus').param('depth', 0.015);    //The range of value is between 0 and 0.020 (20 msec)
    X(source).module('chorus').param('rate', 0.5);       //The range of value is greater than or equal 0
    X(source).module('chorus').param('mix', 0.5);        //The range of value is between 0 and 1
    X(source).module('chorus').param('feedback', 0.05);  //The range of value is between 0 and 1

    //Method chain
    X(source).module('chorus').param('depth', 0.015)
                              .param('rate', 0.5)
                              .param('mix', 0.5)
                              .param('feedback', 0.05);

    //Associative array
    X(source).module('chorus').param({
      depth    : 0.015,
      rate     : 0.5,
      mix      : 0.5,
      feedback : 0.05
    });
  
### Delay
  
    var params = {};

    //Getter
    params.time     = X(source).module('delay').param('delayTime');  //The default value is 0
    params.dry      = X(source).module('delay').param('dry');        //The default value is 1
    params.wet      = X(source).module('delay').param('wet');        //The default value is 0
    params.feedback = X(source).module('delay').param('feedback');   //The default value is 0

    //Setter
    X(source).module('delay').param('delayTime', 0.500);  //The range of value is between 0 and 5 (5000 msec)
    X(source).module('delay').param('dry', 0.5);          //The range of value is between 0 and 1
    X(source).module('delay').param('wet', 0.5);          //The range of value is between 0 and 1
    X(source).module('delay').param('feedback', 0.5);     //The range of value is between 0 and 1

    //Method chain
    X(source).module('delay').param('delayTime', 0.500)
                             .param('dry', 0.5)
                             .param('wet', 0.5)
                             .param('feedback', 0.5);

    //Associative array
    X(source).module('delay').param({
      delayTime : 0.500,
      dry       : 0.5,
      wet       : 0.5,
      feedback  : 0.5
    });
  
### Reverb
  
Reverb effect requires ArrayBuffer of impulse response.
  
    //Ajax
    X.ajax({
      url     : 'http://xxx.jp/impulse.wav',  //Resource URL
      timeout : 60000,                        //Timeout (1 minutes)
      success : function(xhr, arrayBuffer){
          //"xhr" is the instance of XMLHttpRequest
          //"arrayBuffer" is the instance of ArrayBuffer

          //ArrayBuffer -> AudioBuffer -> "buffer" property in the instance of ConvolverNode
          X(source).module('reverb').run.call(X(source).module('reverb'), arrayBuffer);
      },
      error : function(object, textStatus){
          //"object" is either the instance of XMLHttpRequest or "onerror" event object in the instance of FileReader
          //"textStatus" is one of 'error', 'timeout', error code of FileReader;
      },
      progress : function(xhr){
          //"xhr" is the instance of XMLHttpRequest
      }
    });

    //<input type="file">
    document.getElementById('file-upload').addEventListener('change', function(event){
        try {
            //The returned value is the instance of File (extends Blob)
            var file = X.file(
              event   : event,
              type    : 'ArrayBuffer',
              success : function(event, arrayBuffer){
                  //"event" is "onload" event object in the instance of FileReader
                  //"arrayBuffer" is the instance of ArrayBuffer

                  //the instance of File -> ArrayBuffer -> AudioBuffer -> AudioBufferSourceNode
                  X(source).module('reverb').run.call(X(source).module('reverb'), arrayBuffer);
              },
              error : function(event, error){
                  //"event" is "onerror" event object in the instance of FileReader
              },
              progress : function(event){
                  //"event" is "onprogress" event object in the instance of FileReader
              }
            });
        } catch (error) {
            window.alert(error.message);
        }
    }, false);

    var params = {};

    //Getter
    params.dry = X(source).module('reverb').param('dry');  //The default value is 1
    params.wet = X(source).module('reverb').param('wet');  //The default value is 0

    //Setter
    X(source).module('reverb').param('dry', 0.5);  //The range of value is between 0 and 1
    X(source).module('reverb').param('wet', 0.5);  //The range of value is between 0 and 1

    //Method chain
    X(source).module('reverb').param('dry', 0.5)
                              .param('wet', 0.5);

    //Associative array
    X(source).module('reverb').param({
      dry : 0.5,
      wet : 0.5
    });
  
### Customized Effector
  
If customized effector module is used, the module should be defined the following.
  
    function MyEffector(context){
        /* "context" is the instance of AudioContext */

        this.isActive;         //Boolean type from Effector class
        this.lfo;              //the instance of OscillatorNode from Effector class
        this.depth;            //the instance of GainNode from Effector class

        // It is necessary to connection from "input" and to "output"
        // (The properties of "input" and "output" are inherited from Effector class)

        /* this.input.connect( .... connect(this.output); */
    };

     /** @extends {Effector} */
    X(source).install('myeffector', MyEffector);

    /** @override */
    MyEffector.prototype.param = function(){
        /* Getter and Setter for accessible parameters */
    };

    /** 
     * This method starts LFO. Namely, this method starts Effector.
     * @param {number} startTime This argument is in order to schedule parameter.
     * @override
     */
    MyEffector.prototype.start = function(startTime){
        //....
    };

    /** 
     * This method stops LFO, and prepares {OscillatorNode} again in the case of "false".
     * @param {number} stopTime This argument is in order to schedule parameter.
     * @param {number} releaseTime This argument is in order to schedule parameter when it is necessary to consider release time.
     * @override
     */
    MyEffector.prototype.stop = function(stopTime, releaseTime){
        //....
    };

    X(source).start(/* the 1st argument */, [/* Other modules ,*/ X(source).module('myeffector') /*, Other modules */]);
  
for example,
  
    function SuperModulation(context){
        this.predelay = context.createDelay();
        this.delay    = context.createDelay();
        this.splitter = context.createChannelSplitter();
        this.merger   = context.createChannelMerger();

        this.dry      = context.createGain();
        this.wet      = context.createGain();
        this.feedback = context.createGain();

        this.input.connect(this.dry);
        this.dry.connect(this.output);

        this.input.connect(this.splitter);
        this.splitter.connect(this.predelay, 0);
        this.splitter.connect(this.merger, 1, 1);
        this.predelay.connect(this.merger, 0, 0);
        this.merger.connect(this.delay);
        this.delay.connect(this.wet);
        this.wet.connect(this.output);

        this.delay.connect(this.feedback);
        this.feedback.connect(this.delay);

        this.lfo.connect(this.feedback.gain);

        this.predelay.delayTime.value = 1;
        this.delay.delayTime.value    = 0;
        this.dry.gain.value           = 1;
        this.wet.gain.value           = 0;

        this.values = {
          pre  : this.predelay.delayTime,
          time : this.delay.delayTime,
          dry  : this.dry.gain,
          wet  : this.wet.gain
        };

        this.isActive = true;
    };

    /** @extends {Effector} */
    X('oscillator').install('supermodulation', SuperModulation);

    /** @override */
    SuperModulation.prototype.param = function(key, value){
        if (value === undefined) {
            return this.values[key].value;  //Getter
        } else {
            this.values[key].value = value;  //Setter

        }
    };

    /** @override */
    SuperModulation.prototype.start = function(startTime){
        if (this.isActive) {
            this.lfo.start(startTime);
        }
    };

    /** @override */
    SuperModulation.prototype.stop = function(stopTime, releaseTime){
        if (this.isActive) {
            this.lfo.stop(stopTime + releaseTime);
        }
    };

    X('oscillator').module('supermodulation').param('pre',  0.025);
    X('oscillator').module('supermodulation').param('time', 0.050);
    X('oscillator').module('supermodulation').param('dry',  0.700);
    X('oscillator').module('supermodulation').param('wet',  0.300);

    X('oscillator').start(440, [X('oscillator').module('supermodulation')]);
  
### Panner
  
    var params = {};

    //Getter
    params.x = X(source).module('panner').param('x');  //'x' for setPosition. The default value is 0
    params.y = X(source).module('panner').param('y');  //'y' for setPosition. The default value is 0
    params.z = X(source).module('panner').param('z');  //'z' for setPosition. The default value is 0

    params.ox = X(source).module('panner').param('ox');  //'ox' for setOrientation. The default value is 1
    params.oy = X(source).module('panner').param('oy');  //'oy' for setOrientation. The default value is 0
    params.oz = X(source).module('panner').param('oz');  //'oz' for setOrientation. The default value is 0

    params.vx = X(source).module('panner').param('vx');  //'vx' for setVelocity. The default value is 0
    params.vy = X(source).module('panner').param('vy');  //'vy' for setVelocity. The default value is 0
    params.vz = X(source).module('panner').param('vz');  //'vz' for setVelocity. The default value is 0

    params.refDistance   = X(source).module('panner').param('refDistance');    //The default value is 1
    params.maxDistance   = X(source).module('panner').param('maxDistance');    //The default value is 10000
    params.rolloffFactor = X(source).module('panner').param('rolloffFactor');  //The default value is 1

    params.coneInnerAngle = X(source).module('panner').param('coneInnerAngle');  //The default value is 360
    params.coneOuterAngle = X(source).module('panner').param('coneOuterAngle');  //The default value is 360
    params.coneOuterGain  = X(source).module('panner').param('coneOuterGain');   //The default value is 0

    params.pannningModel = X(source).module('panner').param('panningModel');   //The default value is 'HRTF'
    params.distanceModel = X(source).module('panner').param('distanceModel');  //The default value is 'inverse'

    //Setter
    X(source).module('panner').param('x', 0);
    X(source).module('panner').param('y', 0);
    X(source).module('panner').param('z', 0);

    X(source).module('panner').param('ox', 1);
    X(source).module('panner').param('oy', 0);
    X(source).module('panner').param('oz', 0);

    X(source).module('panner').param('vx', 0);
    X(source).module('panner').param('vy', 0);
    X(source).module('panner').param('vz', 0);

    X(source).module('panner').param('refDistance', 1);
    X(source).module('panner').param('maxDistance', 10000);
    X(source).module('panner').param('rolloffFactor', 1);

    X(source).module('panner').param('coneInnerAngle', 360);
    X(source).module('panner').param('coneOuterAngle', 360);
    X(source).module('panner').param('coneOuterGain', 0);

    X(source).module('panner').param('panningModel', 'HRTF');      //either 'equalpower' or 'HRTF'
    X(source).module('panner').param('distanceModel', 'inverse');  //one of 'linear', 'inverse', 'exponential'

    //Method chain
    X(source).module('panner').param('x', 0)
                              .param('y', 0)
                              .param('z', 0)
                              .param('ox', 1)
                              .param('oy', 0)
                              .param('oz', 0)
                              .param('vx', 0)
                              .param('vy', 0)
                              .param('vz', 0)
                              .param('refDistance', 1)
                              .param('maxDistance', 10000)
                              .param('rolloffFactor', 1)
                              .param('coneInnerAngle', 360)
                              .param('coneOuterAngle', 360)
                              .param('coneOuterGain', 0)
                              .param('panningModel', 'HRTF')
                              .param('distanceModel', 'inverse');

    //Associative array
    X(source).module('panner').param({
      x  : 0,
      y  : 0,
      z  : 0,
      ox : 1,
      oy : 0,
      oz : 0,
      vx : 0,
      vy : 0,
      vz : 0,
      refDistance    : 1,
      maxDistance    : 10000,
      rolloffFactor  : 1,
      coneInnerAngle : 360,
      coneOuterAngle : 360,
      coneOuterGain  : 0,
      panningModel   : 'HRTF',
      distanceModel  : 'inverse'
    });
  
The Panner does not connect in default.  
Therefore, it is necessary to connect the Panner.
  
    X(source).start(/* the 1st argument */, [/* Other modules ,*/ X(source).module('panner') /*, Other modules */]);
  
### Listener
  
    var params = {};

    //Getter
    params.dopplerFactor = X(source).module('listener').param('dopplerFactor');  //The default value is 1
    params.speedOfSound  = X(source).module('listener').param('speedOfSound');   //The default value is 343.3

    params.x = X(source).module('listener').param('x');  //'x' for setPosition. The default value is 0
    params.y = X(source).module('listener').param('y');  //'y' for setPosition. The default value is 0
    params.z = X(source).module('listener').param('z');  //'z' for setPosition. The default value is 0

    params.fx = X(source).module('listener').param('fx');  //'fx' for setOrientation (front). The default value is 0
    params.fy = X(source).module('listener').param('fy');  //'fy' for setOrientation (front). The default value is 0
    params.fz = X(source).module('listener').param('fz');  //'fz' for setOrientation (front). The default value is -1
    params.ux = X(source).module('listener').param('ux');  //'ux' for setOrientation (up). The default value is 0
    params.uy = X(source).module('listener').param('uy');  //'uy' for setOrientation (up). The default value is 1
    params.uz = X(source).module('listener').param('uz');  //'uz' for setOrientation (up). The default value is 0

    params.vx = X(source).module('listener').param('vx');  //'vx' for setVelocity. The default value is 0
    params.vy = X(source).module('listener').param('vy');  //'vy' for setVelocity. The default value is 0
    params.vz = X(source).module('listener').param('vz');  //'vz' for setVelocity. The default value is 0

    //Setter
    X(source).module('listener').param('dopplerFactor', 1);
    X(source).module('listener').param('speedOfSound', 343.3);

    X(source).module('listener').param('x', 0);
    X(source).module('listener').param('y', 0);
    X(source).module('listener').param('z', 0);

    X(source).module('listener').param('fx', 0);
    X(source).module('listener').param('fy', 0);
    X(source).module('listener').param('fz', -1);
    X(source).module('listener').param('ux', 0);
    X(source).module('listener').param('uy', 1);
    X(source).module('listener').param('uz', 0);

    X(source).module('listener').param('vx', 0);
    X(source).module('listener').param('vy', 0);
    X(source).module('listener').param('vz', 0);

    //Method chain
    X(source).module('listener').param('dopplerFactor', 1)
                                .param('speedOfSound', 343.3)
                                .param('x', 0)
                                .param('y', 0)
                                .param('z', 0)
                                .param('fx', 0)
                                .param('fy', 0)
                                .param('fz', -1)
                                .param('ux', 0)
                                .param('uy', 1)
                                .param('uz', 0)
                                .param('vx', 0)
                                .param('vy', 0)
                                .param('vz', 0);

    //Associative array
    X(source).module('listener').param({
      dopplerFactor : 1,
      speedOfSound  : 343.3,
      x  : 0,
      y  : 0,
      z  : 0,
      fx : 0,
      fy : 0,
      fz : -1,
      ux : 0,
      uy : 1,
      uz : 0,
      vx : 0,
      vy : 0,
      vz : 0
    });
  
It is necessary to connect Panner for using the Listener.
  
    X(source).start(/* the 1st argument */, [/* Other modules ,*/ X(source).module('panner') /*, Other modules */]);
  
## Visualization
  
### Initialization
  
HTML
  
    ....

    <dl>
        <dt>TIME DOMAIN [ LEFT ]</dt>
        <dd><canvas id="canvas-time-all-L" width="360" height="120"></canvas></dd>
        <dd id="svg-parent-L"><svg id="svg-time-all-L" width="360" height="120" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg></dd>
    </dl>
    <dl>
        <dt>TIME DOMAIN [ RIGHT ]</dt>
        <dd><canvas id="canvas-time-all-R" width="360" height="120"></canvas></dd>
        <dd id="svg-parent-R"><svg id="svg-time-all-R" width="360" height="120" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg></dd>
    </dl>
    <dl>
        <dt>TIME DOMAIN</dt>
        <dd><canvas id="canvas-time" width="360" height="120"></canvas></dd>
        <dd id="svg-parent-time"><svg id="svg-time" width="360" height="120" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg></dd>
    </dl>
    <dl>
        <dt>FREQUENCY DOMAIN</dt>
        <dd><canvas id="canvas-spectrum" width="360" height="120"></canvas></dd>
        <dd id="svg-parent-spectrum"><svg id="svg-spectrum" width="360" height="120" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg></dd>
    </dl>

    ....
  
In the case of using HTML5 Canvas,
  
    //for drawing created sound
    X('oscillator').module('analyser').domain('time').setup('canvas', 'canvas-time');     //Time domain
    X('oscillator').module('analyser').domain('fft').setup('canvas', 'canvas-spectrum');  //Frequency domain

    //for drawing one-shot audio
    X('oneshot').module('analyser').domain('time').setup('canvas', 'canvas-time');     //Time domain
    X('oneshot').module('analyser').domain('fft').setup('canvas', 'canvas-spectrum');  //Frequency domain

    //for drawing audio
    X('audio').module('analyser').domain('timeAllL').setup('canvas', 'canvas-time-all-L');  //Overview in time domain (L channel)
    X('audio').module('analyser').domain('timeAllR').setup('canvas', 'canvas-time-all-R');  //Overview in time domain (R channel)
    X('audio').module('analyser').domain('time').setup('canvas', 'canvas-time');            //Time domain
    X('audio').module('analyser').domain('fft').setup('canvas', 'canvas-spectrum');         //Frequency domain

    //for drawing media
    X('media').module('analyser').domain('time').setup('canvas', 'canvas-time');     //Time domain
    X('media').module('analyser').domain('fft').setup('canvas', 'canvas-spectrum');  //Frequency domain
  
In the case of using HTML5 SVG,
  
    //for drawing created sound
    X('oscillator').module('analyser').domain('time').setup('svg', 'svg-time', 'svg-parent-time');         //Time domain
    X('oscillator').module('analyser').domain('fft').setup('svg', 'svg-spectrum', 'svg-parent-spectrum');  //Frequency domain

    //for drawing one-shot audio
    X('oneshot').module('analyser').domain('time').setup('svg', 'svg-time', 'svg-parent-time');         //Time domain
    X('oneshot').module('analyser').domain('fft').setup('svg', 'svg-spectrum', 'svg-parent-spectrum');  //Frequency domain

    //for drawing audio
    X('audio').module('analyser').domain('timeAllL').setup('svg', 'svg-time-all-L', 'svg-parent-L');  //Overview in time domain (L channel)
    X('audio').module('analyser').domain('timeAllR').setup('svg', 'svg-time-all-R', 'svg-parent-R');  //Overview in time domain (R channel)
    X('audio').module('analyser').domain('time').setup('svg', 'svg-time', 'svg-parent-time');         //Time domain
    X('audio').module('analyser').domain('fft').setup('svg', 'svg-spectrum', 'svg-parent-spectrum');  //Frequency domain

    //for drawing media
    X('media').module('analyser').domain('time').setup('svg', 'svg-time', 'svg-parent-time');         //Time domain
    X('media').module('analyser').domain('fft').setup('svg', 'svg-spectrum', 'svg-parent-spectrum');  //Frequency domain
  
### Access Parameters
  
The following, the variable ("source") is one of 'oscillator', 'oneshot', 'audio', 'media'.
  
    var source = /* one of 'oscillator', 'oneshot', 'audio', 'media' */;
  
And, the variable ("domain") is one of 'timeAllL', 'timeAllR', 'time', 'fft'.
  
    var domain = /* one of 'timeAllL', 'timeAllR', 'time', 'fft' */;
  
#### Manage State
  
    //Getter
    var state  = X(source).module('analyser').doamin(domain).state();  //Boolean type

    //Setter
    X(source).module('analyser').domain(domain).state(true);      //Boolean type
    X(source).module('analyser').domain(domain).state('toggle');  //Change state according to current state
  
#### Analyser
  
    var params = {};

    //Getter
    params.fftSize               = X(source).module('analyser').param('fftSize');
    params.minDecibels           = X(source).module('analyser').param('mindecibels');
    params.maxdecibels           = X(source).module('analyser').param('maxDecibels');
    params.smoothingTimeConstant = X(source).module('analyser').param('smoothingTimeConstant');

    //Setter
    X(source).module('analyser').param('fftSize', 2048);  //one of 32, 64, 128, 256, 512, 1024, 2048
    X(source).module('analyser').param('mindecibels', -100);
    X(source).module('analyser').param('maxDecibels', -30);
    X(source).module('analyser').param('smoothingTimeConstant', 0.8);  //The range of value is between 0 and 1

    //Method Chain
    X(source).module('analyser').param('fftSize', 2048)
                                .param('mindecibels', -100)
                                .param('maxDecibels', -30)
                                .param('smoothingTimeConstant', 0.8);

    //Associative array
    X(source).module('analyser').param({
      fftSize               : 2048,
      mindecibels           : -100,
      maxDecibels           : -30,
      smoothingTimeConstant : 0.8
    });
  
#### Overview in Time Domain
  
    var params = {
      shape        : 'line',                      //Wave shape ('line' or 'rect')
      wave         : 'rgba(0, 0, 255, 1.0)',      //Wave color
      grid         : 'rgba(255, 0, 0, 1.0)',      //Grid color (color sting or 'none')
      currentTime  : 'rgba(255, 255, 255, 1.0)',  //Shape color (for current time)
      text         : 'rgba(255, 255, 255, 1.0)',  //Text color (color string or 'none')
      font         : '13px Arial',                //Text font
      top          : 15,                          //Between audio wave graph and canvas border [px]
      right        : 15,                          //Between audio wave graph and canvas border [px]
      bottom       : 15,                          //Between audio wave graph and canvas border [px]
      left         : 15,                          //Between audio wave graph and canvas border [px]
      width        : 1.5,                         //Wave width (lineWidth)
      cap          : 'round',                     //lineCap
      join         : 'miter',                     //lineJoin
      plotInterval : 0.0625,                      //Draw wave at intervals of this value [sec]
      textInterval : 60                           //Draw text at intervals of this value [sec]
    };
  
    The following, the variable "key" is one of properties in "params".  
    And, the variable "value" is according to "key".
  
    var waveLs = {};
    var waveRs = {};

    //Getter
    waveLs[key] = X('audio').module('analyser').domain('timeAllL').param(key);
    waveRs[key] = X('audio').module('analyser').domain('timeAllR').param(key);

    //Setter
    X('audio').module('analyser').domain('timeAllL').param(key, value);
    X('audio').module('analyser').domain('timeAllR').param(key, value);

    //Method chain or Associative array ....
  
In the case of displaying current time according to playing the audio,
  
    var drawCallback = function(currentTime){
        X('audio').param('currentTime', currentTime);

        //....
    }

    X('audio').module('analyser').domain('timeAllL').drag(drawCallback);
    X('audio').module('analyser').domain('timeAllR').drag(drawCallback);
  
#### Time Domain
  
    var params = {
      interval     : 500,                         //at intervals of drawing sound wave [msec]
      shape        : 'line',                      //Wave shape ('line' or 'rect')
      wave         : 'rgba(0, 0, 255, 1.0)',      //Wave color
      grid         : 'rgba(255, 0, 0, 1.0)',      //Grid color
      text         : 'rgba(255, 255, 255, 1.0)',  //Text color
      font         : '13px Arial',                //Text font
      top          : 15,                          //Between audio wave graph and canvas border [px]
      right        : 15,                          //Between audio wave graph and canvas border [px]
      bottom       : 15,                          //Between audio wave graph and canvas border [px]
      left         : 15,                          //Between audio wave graph and canvas border [px]
      width        : 1.5,                         //Wave width (lineWidth)
      cap          : 'round',                     //lineCap
      join         : 'miter',                     //lineJoin
      textinterval : 60                           //Draw text at intervals of this value [sec]
    };
  
    The following, the variable "key" is one of properties in "params".  
    And, the variable "value" is according to "key".
  
    var times = {};

    //Getter
    times[key] = X(source).module('analyser').domain('time').param(key);

    //Setter
    X(source).module('analyser').domain('time').param(key, value);

    //Method chain or Associative array ....
  
#### Frequency Domain (Spectrum)
  
    var params = {
      interval     : 500,                         //at intervals of drawing sound wave [msec]
      shape        : 'line',                      //Wave shape ('line' or 'rect')
      wave         : 'rgba(0, 0, 255, 1.0)',      //Wave color
      grid         : 'rgba(255, 0, 0, 1.0)',      //Grid color
      text         : 'rgba(255, 255, 255, 1.0)',  //Text color
      font         : '13px Arial',                //Text font
      top          : 15,                          //Between audio wave graph and canvas border [px]
      right        : 15,                          //Between audio wave graph and canvas border [px]
      bottom       : 15,                          //Between audio wave graph and canvas border [px]
      left         : 15,                          //Between audio wave graph and canvas border [px]
      width        : 1.5,                         //Wave width (lineWidth)
      cap          : 'round',                     //lineCap
      join         : 'miter',                     //lineJoin
      range        : 256,                         //the number of plots
      textinterval : 1000                         //Draw text at intervals of this value [Hz]
    };
  
    The following, the variable "key" is one of properties in "params".  
    And, the variable "value" is according to "key".
  
    var ffts = {};

    //Getter
    ffts[key] = X(source).module('analyser').domain('fft').param(key);

    //Setter
    X(source).module('analyser').domain('fft').param(key, value);

    //Method chain or Associative array ....
  
## Recording
  
The following, the variable is one of 'oscillator', 'oneshot', 'audio', 'media'.
  
    var source = /* 'oscillator' or 'oneshot' or 'audio' or 'media' */;
  
### Initialization
  
    X(source).module('recorder').setup(4);  //The number of tracks
  
### Start Recording / Stop Recording
  
    if (X(source).module('recorder').getActiveTrack() === -1) {
        //Start (Track 1)
        X(source).module('recorder').ready(0);  //for example, if the number of tracks is 4, the range of this argument is between 0 and 3

        //....

        X(source).start(/* arguments */);
        X(source).module('recorder').start();
    } else {
        //Stop
        X(source).module('recorder').stop();
    }
  
### Clear
  
     //Delete recorded data in track 1
     X(source).module('recorder').clear(0);  //for example, if the number of tracks is 4, the range of this argument is between 0 and 3
  
     //Delete recorded data in the all of tracks
     X(source).module('recorder').clear('all');
  
### Create WAVE file
  
    //The 1st argument is track number or 'all'. If this argument is 'all', the all of tracks are mixed
    //The 2nd argument is the number of channel. This argument is either 1 or 2. The default value is 2 channels
    //The 3rd argument is quantization bit. This argument is either 8 or 16. The default value is 16 bit
    var wave = X(source).module('recorder').create('all', 2, 16);
  
### Channel Gain
  
    //Getter
    var L = X(source).module('recorder').param('gainL');  //The default value is 1
    var R = X(source).module('recorder').param('gainR');  //The default value is 1

    //Setter
    X(source).module('recorder').param('gainL', 0.5);
    X(source).module('recorder').param('gainR', 0.5);

    //Method Chain
    X(source).module('recorder').param('gainL', 0.5)
                                .param('gainR', 0.5);

    //Associative array
    X(source).module('recorder').param({
      gainL : 0.5,
      gainR : 0.5
    });
  
## Session
  
The following, the variable is one of 'oscillator', 'oneshot', 'audio', 'media'.
  
    var source = /* 'oscillator' or 'oneshot' or 'audio' or 'media' */;
  
### Initialization
  
    //WebSocket's connection already exists ?
    if (X(source).module('session').isConnected()) {
        //Connection to server has existed already
    } else {
        X(source).module('session').setup({
          tls   : false,                                   //Whether non TLS (ws:) or TLS (wss:)
          host  : '210.152.156.200',                       //IP address or Host name
          port  :'8000',                                   //Port number
          path  : '/home/node/websocket/',                 //Path name
          open  : function(event, socket){
              //"event" is event object on "onopen" event handler in the instance of WebSokcet
              //"socket" is the instance of WebSokcet
          },
          close : function(event, socket){
              //"event" is event object on "onclose" event handler in the instance of WebSokcet
              //"socket" is the instance of WebSokcet
          },
          error : function(event, socket){
              //"event" is event object on "open" event handler in the instance of WebSokcet
              //"socket" is the instance of WebSokcet
          }
        });
    }
  
### Start Session
  
    X(source).start(/* arguments */);
    X(source).module('session').start();
  
### Stop Session
  
    X(source).module('session').state(false);  //Connection exists
  
### Manage State
  
    //Getter
    var state  = X(source).module('session').state();  //Boolean type

    //Setter
    X(source).module('session').state(true);      //Boolean type
    X(source).module('session').state('toggle');  //Change state according to current state
  
### Close
  
    X(source).module('session').close();  //Connection dose not exists
  
## MML (Music Macro Language)

### Description Rule

|  MUSIC             | MML                              |
|:-------------------|:---------------------------------|
| Scale              | C D E F G A B                    |
| Duration           | 1 2 4 8 16 32 64 128 256         |
| Triplet / Nonuplet | 6 8 12 18 24 36 48 72 96 144 192 |
| Sharp              | +, #                             |
| Flat               | \-                               |
| Rest               | R                                |
| Dotted note        | .                                |
| Tie                | &                                |
| Octave             | O                                |
| Tempo              | T                                |
  
#### Example
  
    var mml = 'T74O4AF+DB2AEB4G+4AF+C+2&AF+C+8F+8A8O5F+8AF+D2AEB4G+4 AF+D2BB4O6C+AE+2.&C+AE+8O5BG+16AF+16BG+E2G+B8AC+8G+B8EG+8F+C+A4.F+F+8G+G+8F+F+8G+G+4AF+C+2.BB4AEB2.&AEB8G+16F+16G+EB2R4';
  
If multipart is used, it is requires to define separator.  
But, separator must not be the characters that are used by MML.
  
    var mml1 = 'T74O4AF+DB2AEB4G+4AF+C+2&AF+C+8F+8A8O5F+8AF+D2AEB4G+4 AF+D2BB4O6C+AE+2.&C+AE+8O5BG+16AF+16BG+E2G+B8AC+8G+B8EG+8F+C+A4.F+F+8G+G+8F+F+8G+G+4AF+C+2.BB4AEB2.&AEB8G+16F+16G+EB2R4';
    var mml2 = 'T74O2B2O3C+2D1O2B2O3C+2D2E2O2A1E1F+2E2O3DD1EE1&EE1';

    //for example, '||' is separator.
    var mml = mml1 + '||' + mml2;
  
### Initialization
  
    X('mml').setup({
        start : function(sequence, index){
            //When the MML starts, this callback function is executed

            //"sequence" is associative array for playing the MML.
            //This has the following properties.
            //    sequence.indexes;      //for X('oneshot')
            //    sequence.frequencies;  //for X('oscillator')
            //    sequence.start;        //the start time of notes
            //    sequence.duration;     //the duration of notes
            //    sequence.stop;         //the stop time of notes (this is total of "start" and "duration")
        },
        stop : function(sequence, index){
            //When the MML stopped, this callback function is executed
        },
        ended : function(){
            //When the MML ended, this callback function is executed
        },
        error : function(error, note){
            //"error" is one of 'TEMPO', 'OCTAVE', 'NOTE', 'MML'
            //"note" is invalid MML string
        }
    });
  
### Parse MML
  
    var mml1 = 'T74O4AF+DB2AEB4G+4AF+C+2&AF+C+8F+8A8O5F+8AF+D2AEB4G+4 AF+D2BB4O6C+AE+2.&C+AE+8O5BG+16AF+16BG+E2G+B8AC+8G+B8EG+8F+C+A4.F+F+8G+G+8F+F+8G+G+4AF+C+2.BB4AEB2.&AEB8G+16F+16G+EB2R4';
    var mml2 = 'T74O2B2O3C+2D1O2B2O3C+2D2E2O2A1E1F+2E2O3DD1EE1&EE1';

    //for example, '||' is separator.
    var mml = mml1 + '||' + mml2;  //for example, Get this string from <input type="text">, <textarea> ... etc

    var mmls = mml.split.split('||');

    X('mml').ready(X('oneshot'), mmls);

or,

    X('mml').ready(X('oscillator'), mmls);  //If "X('oscillator')" is used, this library cannot corresponds to multipart
  
### Start MML
  
    var parts = X('mml').getSequences();

    for (var i = 0, len = parts.length; i < len; i++) {
        X('mml').start(i);
    }
  
In the case of using "X('oscillator')",
  
    X('mml').start(0);
  
### Stop MML
  
    X('mml').stop();
  