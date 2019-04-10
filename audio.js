let time = document.querySelector('.Graph--time');
let spectrum = document.querySelector('.Graph--spectrum');
let timeGraph, spectrumGraph;

let handleSuccess = function(stream) {
  let context = new AudioContext();
  let source = context.createMediaStreamSource(stream);
  let processor = context.createScriptProcessor(1024, 1, 1);

  source.connect(processor);
  processor.connect(context.destination);

  processor.onaudioprocess = function(e) {
    // Do something with the data, i.e Convert this to WAV
    let channel = e.inputBuffer.getChannelData(0);

    let timeData = [];
    for (let i = 0; i < channel.length; i++) {
      timeData.push([i, channel[i]]);
    }
    let result = doFFT(channel, e.inputBuffer.sampleRate);
    if (!timeGraph) {
      timeGraph = new Dygraph(time, timeData, {
        valueRange: [-0.5, 0.5]
      });
    } else {
      timeGraph.updateOptions( { 'file': timeData } );
    }

    if (!spectrumGraph) {
      spectrumGraph = new Dygraph(spectrum, result, {
        valueRange: [null, 0.1]
      });
    } else {
      spectrumGraph.updateOptions( { 'file': result } );
    }
  };
};

navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    .then(handleSuccess);