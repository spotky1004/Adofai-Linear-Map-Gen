recivedFile = 0;
pathDatas = [
  'L', 'Q', 'U', 'E', 'R',
  'C', 'D', 'Z', 'H', 'G',
  'T', 'J', 'M', 'B', 'F',
  'N'
];
pathDeg = [
  0, 45, 90, 135, 180,
  225, 270, 315, 30, 60,
  120, 150, 210, 240, 300,
  330
];
interval1 = 0;
interval2 = 0;
pathDataThis = 0;
tileCount = 0;
totTiles = 0;
actionCount = 0;
totActions = 0;
pataDataPointerPrev = 0;
bpmNow = 0;
speedChangePointer = [];
twirlPointer = [];
twirlDirect = 0;

$(function (){
  $(document).on('click','#dropFile',function() {
    openTextFile();
  });

  function copyToClipboard(val) {
    var t = document.createElement("textarea");
    document.body.appendChild(t);
    t.value = val;
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
  }

  function openTextFile() {
      var input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt, .adofai";
      input.onchange = function (event) {
        processFile(event.target.files[0]);
      };
      input.click();
  }
  function processFile(file) {
    var output = document.getElementById('welcomeTxt');
    var reader = new FileReader();
    reader.onload = function () {
      recivedFile = String(reader.result).replace(', ,', ',').replace(/},/g, '}').replace(/}/g, '},').replace(',\n	]', '\n	]').replace(/,]}/g, ']}');
      recivedFile = recivedFile.substr(0, recivedFile.lastIndexOf(","));
      recivedFile = recivedFile.replace(/, },/g, '},');
      console.log(recivedFile);
      recivedFile = JSON.parse(recivedFile);
      makeMapLinear();
    };
    reader.readAsText(file, /* optional */ "euc-kr");
  }
  function calcAction(i) {
    if (recivedFile["actions"][i]["eventType"] == "Twirl") {
      twirlPointer.push(recivedFile["actions"][i]["floor"]);
    }
    if (recivedFile["actions"][i]["eventType"] == "SetSpeed") {
      if (recivedFile["actions"][i]["speedType"] == "Multiplier") {
        speedChangePointer.push([1, recivedFile["actions"][i]["floor"], recivedFile["actions"][i]["bpmMultiplier"], i]);
      } else {
        speedChangePointer.push([0, recivedFile["actions"][i]["floor"], recivedFile["actions"][i]["beatsPerMinute"], i]);
      }
    }
  }
  function calcTile(i) {
    for (var j = 0; j < pathDatas.length; j++) {
      if (pathDatas[j] == pathDataThis[i]) {
        pataDataPointer = j;
        break;
      }
    }
    if (twirlPointer[twirlPointerP] == i) {
      twirlDirect = !twirlDirect;
      twirlPointerP++;
    }
    angleOffset = (pathDeg[pataDataPointer]-pathDeg[pataDataPointerPrev]+180)%360;
    if (angleOffset < 0) {
      angleOffset = 360+angleOffset;
    }
    if (angleOffset > 360 || angleOffset < 0) {
      console.log(pathDeg[pataDataPointerPrev] + ', ' + pathDeg[pataDataPointer] + ', ' + angleOffset);
    }
    if (angleOffset == 0) {
      angleOffset = 360;
    }
    if (twirlDirect == 1) {
      angleOffset = 360-angleOffset;
    }
    if (angleOffset == 0) {
      angleOffset = 360;
    }

    if (speedChangePointer.length != speedChangePointerP && speedChangePointer[speedChangePointerP][1] == i) {
      dataThisPointer = speedChangePointer[speedChangePointerP];
      if (dataThisPointer[0] == 0) {
        bpmNow = dataThisPointer[2];
        recivedFile["actions"][dataThisPointer[3]]["beatsPerMinute"] = Math.abs((1/(angleOffset/180))*bpmNow);
      } else {
        bpmNow = bpmNow*dataThisPointer[2];
        recivedFile["actions"][dataThisPointer[3]]["beatsPerMinute"] = Math.abs((1/(angleOffset/180))*bpmNow);
      }
      speedChangePointerP++;
    } else if (angleOffset == 180) {
      recivedFile["actions"].push(JSON.parse('{ "floor": ' + (i) + ', "eventType": "SetSpeed", "speedType": "Bpm", "beatsPerMinute": ' + bpmNow + ', "bpmMultiplier": 1 }'));
    } else {
      recivedFile["actions"].push(JSON.parse('{ "floor": ' + (i) + ', "eventType": "SetSpeed", "speedType": "Bpm", "beatsPerMinute": ' + ((1/(angleOffset/180))*bpmNow) + ', "bpmMultiplier": 1 }'));
    }
    recivedFile["pathData"] = recivedFile["pathData"].replaceAt(i, 'R');
    pataDataPointerPrev = pataDataPointer;
  }
  function makeMapLinear() {
    $('#dropFile').hide();
    $('#transferProgress').show();
    pathDataThis = recivedFile["pathData"];
    tileCount = 0;
    totTiles = recivedFile["pathData"].length;
    actionCount = 0;
    totActions = recivedFile["actions"].length;
    pataDataPointerPrev = 4;
    bpmNow = recivedFile["settings"]["bpm"];
    speedChangePointer = [];
    speedChangePointerP = 0;
    twirlPointer = [];
    twirlPointerP = 0;
    twirlDirect = 0;
    interval1 = setInterval( function () {
      calcAction(actionCount);
      actionCount++;
      $('#transferProgress').css('background', 'linear-gradient(90deg, rgba(113, 176, 227, 0.8) ' + actionCount/totActions*100 + '% ' + actionCount/totActions*100 + '%, #aaa ' + actionCount/totActions*100 + '%)');
      $('#transferProgress').html(function (index,html) {
        return (actionCount/totActions*100).toFixed(1) + '%';
      });
      if (actionCount >= totActions) {
        clearInterval(interval1);
      }
    }, 3);
    setTimeout( function () {
      interval2 = setInterval( function () {
        calcTile(tileCount);
        tileCount++;
        $('#transferProgress').html(function (index,html) {
          return (tileCount/totTiles*100).toFixed(1) + '%';
        });
        $('#transferProgress').css('background', 'linear-gradient(90deg, rgba(227, 200, 113, 0.8) ' + tileCount/totTiles*100 + '% ' + tileCount/totTiles*100 + '%, #aaa ' + tileCount/totTiles*100 + '%)');
        if (tileCount >= totTiles) {
          $('#transferProgress').html(function (index,html) {
            return 'Copied to Clipboard! (Ctrl + V to paste OR Copy from Console :D)';
          });
          copyToClipboard(JSON.stringify(recivedFile));
          console.log(JSON.stringify(recivedFile));
          clearInterval(interval2);
        }
      }, 10);
    }, totActions*3+50);
  }

  $('#warpAll').show();
  $('#warpAll').playKeyframe (
    'goApper 1.3s ease forwards',
  );
});

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}
