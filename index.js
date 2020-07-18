recivedFile = 0;
pathDatas = [
  'L', 'Q', 'U', 'E', 'R',
  'C', 'D', 'Z', 'H', 'G',
  'T', 'J', 'M', 'B', 'F',
  'N'
];
pathDeg = [
  360, 45, 90, 135, 180,
  225, 270, 315, 30, 60,
  120, 150, 210, 240, 300,
  330
];
interval1 = 0;
interval2 = 0;
pathDataThis = recivedFile["pathData"];
tileCount = 0;
totTiles = recivedFile["pathData"].length;
actionCount = 0;
totActions = recivedFile["actions"].length;
pataDataPointerPrev = 4;
bpmNow = recivedFile["settings"]["bpm"];
speedChangePointer = [];
twirlPointer = [];

$(function (){
  $(document).on('click','#dropFile',function() {
    openTextFile();
  });

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
      console.log(reader.result);
      recivedFile = JSON.parse(String(reader.result).replace(', ,', ','));
      makeMapLinear();
    };
    reader.readAsText(file, /* optional */ "euc-kr");
  }
  function calcAction(i) {
    if (recivedFile["actions"][i]["eventType"] == "Twirl") {
      twirlPointer.push(recivedFile["actions"][i]["floor"]);
    }
    if (recivedFile["actions"][i]["eventType"] == "SetSpeed") {
      speedChangePointer.push([recivedFile["actions"][i]["floor"], recivedFile["actions"][i]["beatsPerMinute"]]);
    }
  }
  function calcTile(i) {
    for (var j = 0; j < pathDatas.length; j++) {
      if (pathDatas[j] == pathDataThis[i]) {
        pataDataPointer = j;
        break;
      }
    }
    angleOffset = pathDeg[pataDataPointer]-pathDeg[pataDataPointerPrev]+180;
    if (angleOffset == 0) {
      angleOffset = 360;
    }
    if (angleOffset == 180) {
      recivedFile["actions"].push(JSON.parse('{ "floor": ' + (i) + ', "eventType": "SetSpeed", "speedType": "Bpm", "beatsPerMinute": ' + bpmNow + ', "bpmMultiplier": 1 }'));
    } else {
      recivedFile["actions"].push(JSON.parse('{ "floor": ' + (i) + ', "eventType": "SetSpeed", "speedType": "Bpm", "beatsPerMinute": ' + Math.abs((1/(angleOffset/180))*bpmNow) + ', "bpmMultiplier": 1 }'));
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
    twirlPointer = [];
    // "eventType": "Twirl"
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
          clearInterval(interval2);
          console.log(JSON.stringify(recivedFile));
        }
      }, 5);
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
