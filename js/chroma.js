let cameraToggle = document.getElementById("camera-toggle");
let takePhoto = document.getElementById("take-photo");
let frontFacing = false;
let bgImage = document.getElementById("bg-image");

/*
function gotDevices(mediaDevices) {
    select.innerHTML = '';
    select.appendChild(document.createElement('option'));
    let count = 1;
    mediaDevices.forEach(mediaDevice => {
      if (mediaDevice.kind === 'videoinput') {
        const option = document.createElement('option');
        option.value = mediaDevice.deviceId;
        const label = mediaDevice.label || `Camera ${count++}`;
        const textNode = document.createTextNode(label);
        option.appendChild(textNode);
        select.appendChild(option);
      }
    });
}*/

function startCamera() {
    var streaming = false,
    video        = document.querySelector('#video'),
    width = 320,
    height = 0;

    let videoFacingSettings = frontFacing?{facingMode: { exact: "environment" }}:{facingMode: "user"};
  
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
        return;
    }
  };

document.addEventListener("DOMContentLoaded", () => {
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

takePhoto.addEventListener("click", ()=>{
    let cCapture = document.getElementById("c-capture");
    let ctxCapture = cCapture.getContext("2d");

    let c2 = document.getElementById("c2");

    ctxCapture.drawImage(bgImage, 0, 0);
    ctxCapture.drawImage(c2, 0, 0);

    let dataURL = cCapture.toDataURL();
    
    let link = document.createElement('a');
    link.download = "foto.png";
    link.href = dataURL;
    link.click();
    link.remove();
});

