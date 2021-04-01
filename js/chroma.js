let cameraToggle = document.getElementById("camera-toggle");
let btnTakePhoto = document.getElementById("take-photo");
let btnTakeVideo = document.getElementById("take-video");
let frontFacing = false;
let bgImage = document.getElementById("bg-image");
let cameras = [];
let currentStream = null;

let isRecording = false;
let videoStream = null;
let mediaRecorder = null;
let chunks = null;

let cCapture = document.getElementById("c-capture");
let ctxCapture = cCapture.getContext("2d");

let recordingStartTimestamp = 0;

function gotDevices(mediaDevices) {
    cameras = [];
    mediaDevices.forEach(mediaDevice => {
        if (mediaDevice.kind === 'videoinput') {
            cameras.push(mediaDevice.deviceId);
        }
    });
    console.log(cameras);
}

function stopMediaTracks(stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }

function startCamera() {
    var streaming = false,
    video        = document.querySelector('#video'),
    width = 320,
    height = 0;

    let videoFacingSettings = frontFacing?{facingMode: "user"}:{facingMode: "environment"};
  
    /* let videoFacingSettings = {deviceId: {
                                    exact: frontFacing? cameras[0]: cameras[1],
                                }}; */

    navigator.getMedia = ( navigator.getUserMedia ||
                           navigator.webkitGetUserMedia ||
                           navigator.mozGetUserMedia ||
                           navigator.msGetUserMedia);
  
    navigator.getMedia(
      {
        video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { min: 8, max:30 },
            ...videoFacingSettings
        },
        audio: false
      },
      function(stream) {
          currentStream = stream;
        if (navigator.mozGetUserMedia) {
          video.mozSrcObject = stream;
        } else {
          var vendorURL = window.URL || window.webkitURL;
          //video.src = vendorURL.createObjectURL(stream);
          video.srcObject = stream;//chrome
        }
        video.play();
      },
      function(err) {
        console.log("An error occured! " + err);
      }
    );
  
/*      video.addEventListener('canplay', function(ev){
      if (!streaming) {
        height = video.videoHeight / (video.videoWidth/width);
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        streaming = true;
      }
    }, false); */
  /*
    function takepicture() {
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(video, 0, 0, width, height);
      var data = canvas.toDataURL('image/png');
      photo.setAttribute('src', data);
    }
  
    startbutton.addEventListener('click', function(ev){
        takepicture();
        ev.preventDefault();
    }, false); */
};

function stopCamera(){
    let video = document.querySelector('#video');
    video.pause();
    stopMediaTracks(currentStream);
    currentStream = null;
}

let processor = {
    timerCallback: function() {
      if (this.video.paused || this.video.ended) {
        return;
      }
      this.computeFrame();
      let self = this;
      setTimeout(function () {
          self.timerCallback();
        }, 0);
    },
  
    doLoad: function() {
      this.video = document.getElementById("video");
      this.c1 = document.getElementById("c1");
      this.ctx1 = this.c1.getContext("2d");
      this.c2 = document.getElementById("c2");
      this.ctx2 = this.c2.getContext("2d");
      let self = this;
      this.video.addEventListener("play", function() {
          setTimeout(function(){
            self.width = window.innerWidth;//self.video.videoWidth;
            self.height = window.innerHeight;//self.video.videoHeight;
            self.timerCallback();
          }, 1000)
        }, false);
    },
  
    computeFrame: function() {
        this.ctx1.drawImage(this.video, 0, 0, this.width, this.height);
        let frame = this.ctx1.getImageData(0, 0, this.width, this.height);
        let l = frame.data.length / 4;
  
        for (let i = 0; i < l; i++) {
            let r = frame.data[i * 4 + 0];
            let g = frame.data[i * 4 + 1];
            let b = frame.data[i * 4 + 2];
            if (g > 128 && r < 100 && b < 100)
                frame.data[i * 4 + 3] = 0;
        }
        this.ctx2.drawImage(bgImage,0,0);
        this.ctx2.putImageData(frame,0,0);

        ctxCapture.drawImage(bgImage, 0, 0);
        ctxCapture.drawImage(this.c2, 0, 0);
        return;
    }
  };

document.addEventListener("DOMContentLoaded", () => {
    navigator.mediaDevices.enumerateDevices().then(gotDevices);
    let c1 = document.getElementById("c1");
    let ctx1 = c1.getContext("2d");
    let c2 = document.getElementById("c2");
    let ctx2 = c2.getContext("2d");
    let cCapture = document.getElementById("c-capture");
    let ctxCapture = cCapture.getContext("2d");
    let video = document.getElementById("video");

    /* if(window.innerHeight > window.innerWidth){
    }
    else
    {
    } */

    video.width = window.innerWidth;
    video.height = window.innerHeight;

    ctx1.width = window.innerWidth;
    ctx1.height = window.innerHeight;
    ctx2.width = window.innerWidth;
    ctx2.height = window.innerHeight;
    ctxCapture.width = window.innerWidth;
    ctxCapture.height = window.innerHeight;
    
    c1.width = window.innerWidth;
    c1.height = window.innerHeight;
    c2.width = window.innerWidth;
    c2.height = window.innerHeight;
    cCapture.width = window.innerWidth;
    cCapture.height = window.innerHeight;

    startCamera();
    processor.doLoad();
});

cameraToggle.addEventListener("click", ()=>{
    frontFacing = !frontFacing;
    stopCamera();
    startCamera();
}, false);

btnTakePhoto.addEventListener("click", ()=>{
    let cCapture = document.getElementById("c-capture");
    let ctxCapture = cCapture.getContext("2d");

    let c2 = document.getElementById("c2");

    ctxCapture.drawImage(bgImage, 0, 0);
    //ctxCapture.rotate(45*Math.PI/180);
    ctxCapture.drawImage(c2, 0, 0);

    let dataURL = cCapture.toDataURL();
    
    let link = document.createElement('a');
    link.download = "foto.png";
    link.href = dataURL;
    link.click();
    link.remove();
});

btnTakeVideo.addEventListener("click", ()=>{
    isRecording = !isRecording;
    
    if(isRecording)
    {
        recordingStartTimestamp = Date.now();
        let cCapture = document.getElementById("c-capture");
        record(cCapture);
    }
    else
    {
        mediaRecorder.stop();
    }
        
});

function record(canvas)
{
    videoStream = canvas.captureStream(30);
    mediaRecorder = new MediaRecorder(videoStream, { 'type' : 'video/webm;codecs=vp9' });
    chunks = [];
    mediaRecorder.ondataavailable = function(e) {
        chunks.push(e.data);
    };

    mediaRecorder.onstop = function(e) {
        //var blob = new Blob(chunks, { 'type' : 'video/mp4' }); // other types are available such as 'video/webm' for instance, see the doc for more info
        var blob = new Blob(chunks, { 'type' : 'video/webm;codecs=vp9' }); 
        let elapsedTime = Date.now() - recordingStartTimestamp;
        chunks = [];

        ysFixWebmDuration(blob, elapsedTime, function(fixedBlob) {
            var videoURL = URL.createObjectURL(fixedBlob);
            let link = document.createElement('a');
            link.download = "video.webm";
            link.href = videoURL;
            link.click();
            link.remove();
        });
        /* var videoURL = URL.createObjectURL(blob);
        let link = document.createElement('a');
        link.download = "video.mp4";
        link.href = videoURL;
        link.click();
        link.remove(); */
    };

    mediaRecorder.start();
}

