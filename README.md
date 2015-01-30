XSound.js
=========
  
HTML5 Web Audio API Library
  
## Overview
  
This library enables developers to use **Web Audio API by description like jQuery**.  
In concrete, this library may be useful to implement the following features.
  
* Create Sound
* Play the One-Shot Audio
* Play the Audio
* Play the Media (Fallback by HTML5 MediaElement)
* Play the MML (Music Macro Language)
* Streaming (by WebRTC)
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
Please use Chrome (Mac / Windows) or Safari (Mac) or Opera (Mac / Windows).  

* [X Sound](http://korilakkuma.github.io/X-Sound/)

* [Music V](http://curtaincall.weblike.jp/portfolio-music-v/)

Now, I'm creating website for Web Audio API. Please use the following site for understanding README.  

* [WEB SOUNDER](http://curtaincall.weblike.jp/portfolio-web-sounder/)
  
## Usage
  
    <script type="text/javascript" src="xsound.min.js"></script>
  
In the case of displaying error message for development,
  
    <script type="text/javascript" src="xsound.dev.js"></script>
  
In the case of using WebSocket,
  
    $ node xsound-server-session-websocket.js  // Use "websocket" module
  
or,
  
    $ node xsound-server-session-ws.js  // Use "ws" module
  
Default port number is 8000.  
This port number can be changed by designating argument.  
For example,
  
    $ node xsound-server-session-websocket.js 8080  // Listen by 8080 ...
  
If path to module does not exist, module path must be designated by the 2nd argument.  
For exmaple,
  
    $ node xsound-server-session-websocket.js 8080 /usr/local/lib/node_modules/websocket/lib/websocket.js
  
In the case of recording log, the path of log file must be designated by the 3rd argument.
  
    $ node xsound-server-session-websocket.js 8080 /usr/local/lib/node_modules/websocket/lib/websocket.js websocket.log
  
## Download & API Document
  
* [XSound.js Download & API Document](http://korilakkuma.github.io/XSound/)
  
