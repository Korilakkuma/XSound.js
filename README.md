XSound
=========
  
HTML5 Web Audio API Library
  
[![Build Status](https://travis-ci.org/Korilakkuma/XSound.svg?branch=master)](https://travis-ci.org/Korilakkuma/XSound)
  
## Overview
  
This is full stack library for Web Audio API.  
In concrete, this library may be useful to implement the following features.
  
* Create Sound
* Play the One-Shot Audio
* Play the Audio
* Play the Media (Fallback by HTML5 MediaElement)
* Streaming (by WebRTC)
* MIDI (by Web MIDI API)
* MML (Music Macro Language)
* Effectors (Compressor / Wah / Equalizer / Tremolo / Phaser / Chorus / Delay / Reverb ...etc)
* Visualization (Overview in Time Domain / Time Domain / Spectrum)
* Recording (Create WAVE file)
* Session (by WebSocket)
  
## Demo
  
The application that uses this library is in the following URL.  
Please use Chrome, Opera, Safari, Firefox.
  
* [X Sound](https://korilakkuma.github.io/X-Sound/)
* [Music V](http://curtaincall.weblike.jp/portfolio-music-v/)
  
Now, I'm creating website for Web Audio API. Please refer to the following site for understanding API Document.
  
* [WEB SOUNDER](http://curtaincall.weblike.jp/portfolio-web-sounder/)
  
## Installation
  
    $ npm install xsound
  
or,
  
    $ bower install xsound
  
In the case of using WebSocket,
  
    $ npm install websocket
  
or,
  
    $ npm install ws
  
## Usage
  
    <script type="text/javascript" src="xsound.min.js"></script>
  
In the case of development,
  
    <script type="text/javascript" src="xsound.js></script>
  
In the case of using WebSocket,
  
    $ node xsound-server-session-websocket.js
  
or,
  
    $ node xsound-server-session-ws.js
  
Default port number is 8000.  
This port number can be changed by designating argument.  
For example,
  
    $ node xsound-server-session-websocket.js 8080
  
In the case of recording log, the path of log file must be designated by the 2nd argument.
  
    $ node xsound-server-session-websocket.js 8080 websocket.log
  
## API Document
  
* [XSound.js API Document](https://korilakkuma.github.io/XSound/)
  
## License
  
Copyright (c) 2012, 2013, 2014 Tomohiro IKEDA (Korilakkuma)  
Released under the MIT license
  
