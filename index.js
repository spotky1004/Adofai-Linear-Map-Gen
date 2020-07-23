recivedFile = 0;
pathDatas = [
  'L', 'Q', 'U', 'E', 'R',
  'C', 'D', 'Z', 'H', 'G',
  'T', 'J', 'M', 'B', 'F',
  'N', '!', '5', '6', '7',
  '8'
];
pathDeg = [
  360, 45, 90, 135, 180,
  225, 270, 315, 30, 60,
  120, 150, 210, 240, 300,
  330, 0, 0, 0, 0,
  0
];
interval1 = 0;
interval2 = 0;
interval3 = 0;
pathDataThis = 0;
tileCount = 0;
totTiles = 0;
actionCount = 0;
totActions = 0;
pataDataPointerPrev = 0;
bpmNow = 0;
speedChangePointer = [];
twirlPointer = [];
speedDeletePointer = [];
twirlDirect = 0;
delEffectToggle = [
  1, 0, 0,
  1, 1, 1,
  0, 0, 0
];
delActionCount = 0;
bpmBefore = 0;
deleteSpeed = 0;
interval4 = 0;
interval5 = 0;
shiftFloorPointer = [];
shiftFloorCount = 0;
interval6 = 0;
interval7 = 0;
speedDeletePointerP = 0;
shiftThis = 0;
totActions2 = 0;

$(function (){
  $(document).on('click','#dropFile',function() {
    openTextFile();
  });
  $(document).on('click','.delEffButton',function() {
    indexThis = $('.delEffButton').index(this);
    if (delEffectToggle[indexThis] == 0) {
      delEffectToggle[indexThis] = 1;
      $('.delEffButton:eq(' + indexThis +')').removeClass('effYes').addClass('effNo');
    } else {
      delEffectToggle[indexThis] = 0;
      $('.delEffButton:eq(' + indexThis +')').removeClass('effNo').addClass('effYes');
    }
  });
  $(document).on('click','#downloadFile',function() {
    download('LinearAdofai' + new Date().getTime() + '.adofai', JSON.stringify(recivedFile));
    location.reload();
  });

  function copyToClipboard(val) {
    var t = document.createElement("textarea");
    document.body.appendChild(t);
    t.value = val;
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
  }
  function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    if (document.createEvent) {
      var event = document.createEvent('MouseEvents');
      event.initEvent('click', true, true);
      pom.dispatchEvent(event);
    } else {
      pom.click();
    }
  }

  function calcAngleOffset(d1, d2) {
    d3 = (d2-d1+540)%360;
    if (d3 == 0) {
      d3 = 360;
    }
    if (twirlDirect) {
      d3 = 360-d3;
      if (d3 == 0) {
        d3 = 360;
      }
    }
    if (0 > d3 || d3 > 360) {
      console.log('Calc Error\nd1 = ' + d1 + '\nd2 = ' + d2 + '\nd3 = ' + d3 + '\ntwirl = ' + twirlDirect);
    }
    return d3;
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
    doTimeout1();
  }
  function calcTile(i) {
    for (var j = 0; j < pathDatas.length; j++) {
      if (pathDatas[j] == pathDataThis[i]) {
        pataDataPointer = j;
        break;
      }
    }
    if (pathDataThis[i] != '!' && pathDataThis[i] != '5' && pathDataThis[i] != '6' && pathDataThis[i] != '7' && pathDataThis[i] != '8') {
      if (twirlPointer[twirlPointerP] == i) {
        twirlDirect = !twirlDirect;
        twirlPointerP++;
      }
      if (pathDataThis[i-1] != '!') {
        angleOffset = calcAngleOffset(pathDeg[pataDataPointerPrev], pathDeg[pataDataPointer]);
      } else {
        d1p = (pathDeg[pataDataPointerPrev]+180)%360;
        angleOffset = calcAngleOffset(d1p, pathDeg[pataDataPointer]);
      }
      if (i == 0) {
        recivedFile["settings"]["bpm"] = ((1/(angleOffset/180))*bpmNow);
      } else if (speedChangePointer.length != speedChangePointerP && speedChangePointer[speedChangePointerP][1] == i) {
        dataThisPointer = speedChangePointer[speedChangePointerP];
        if (dataThisPointer[0] == 0) {
          bpmNow = dataThisPointer[2];
          recivedFile["actions"][dataThisPointer[3]]["speedType"] = "Bpm";
          recivedFile["actions"][dataThisPointer[3]]["beatsPerMinute"] = (1/(angleOffset/180))*bpmNow;
          bpmBefore = Math.abs((1/(angleOffset/180))*bpmNow);
          /* if (bpmNow != Math.abs((1/(angleOffset/180))*bpmNow)) {
            recivedFile["actions"][dataThisPointer[3]]["speedType"] = "Bpm";
            recivedFile["actions"][dataThisPointer[3]]["beatsPerMinute"] = (1/(angleOffset/180))*bpmNow;
            bpmBefore = Math.abs((1/(angleOffset/180))*bpmNow);
          } else {
            speedDeletePointer.push(i);
            if (speedDeletePointer.length == 1) {
              deleteSpeed = 1;
            }
          } */
        } else {
          bpmNow = bpmNow*dataThisPointer[2];
          recivedFile["actions"][dataThisPointer[3]]["speedType"] = "Bpm";
          recivedFile["actions"][dataThisPointer[3]]["beatsPerMinute"] = (1/(angleOffset/180))*bpmNow;
          bpmBefore = Math.abs((1/(angleOffset/180))*bpmNow);
          /* if (bpmNow != Math.abs((1/(angleOffset/180))*bpmNow)) {
            recivedFile["actions"][dataThisPointer[3]]["speedType"] = "Bpm";
            recivedFile["actions"][dataThisPointer[3]]["beatsPerMinute"] = (1/(angleOffset/180))*bpmNow;
            bpmBefore = Math.abs((1/(angleOffset/180))*bpmNow);
          } else {
            speedDeletePointer.push(i);
            if (speedDeletePointer.length == 1) {
              deleteSpeed = 1;
            }
          } */
        }
        speedChangePointerP++;
      } else if (angleOffset == 180) {
        if (bpmNow != bpmBefore) {
          recivedFile["actions"].push(JSON.parse('{ "floor": ' + (i) + ', "eventType": "SetSpeed", "speedType": "Bpm", "beatsPerMinute": ' + bpmNow + ', "bpmMultiplier": 1 }'));
          bpmBefore = bpmNow;
        }
      } else {
        if ((1/(angleOffset/180))*bpmNow != bpmBefore) {
          recivedFile["actions"].push(JSON.parse('{ "floor": ' + (i) + ', "eventType": "SetSpeed", "speedType": "Bpm", "beatsPerMinute": ' + ((1/(angleOffset/180))*bpmNow) + ', "bpmMultiplier": 1 }'));
          bpmBefore = ((1/(angleOffset/180))*bpmNow);
        }
      }
      recivedFile["pathData"] = recivedFile["pathData"].replaceAt(i, 'R');
      pataDataPointerPrev = pataDataPointer;
    } else {
      if (pathDataThis[i] == '!') {
        shiftFloorPointer.push(i);
      } else {
        errorStop();
      }
    }
    doTimeout2();
  }
  function calcDelAction(i) {
    deleteThis = 0;
    if (recivedFile["actions"][i]["eventType"] == "MoveCamera" && delEffectToggle[0] == 1) {
      deleteThis = 1;
    }
    if (recivedFile["actions"][i]["eventType"] == "Twirl" && delEffectToggle[2] == 1) {
      deleteThis = 1;
    }
    if (recivedFile["actions"][i]["eventType"] == "MoveTrack" && delEffectToggle[3] == 1) {
      deleteThis = 1;
    }
    if (recivedFile["actions"][i]["eventType"] == "AnimateTrack" && delEffectToggle[4] == 1) {
      deleteThis = 1;
    }
    if (speedDeletePointer.length != 0 && speedDeletePointer[speedDeletePointerP] == i) {
      // deleteThis = 1;
      speedDeletePointerP--;
    }
    if (deleteThis) {
      recivedFile["actions"].splice(i,1);
    }
    doTimeout3();
  }
  function shiftFloor(i) {
    floorThis = recivedFile["actions"][i]["floor"];
    for (var j = 0; j < shiftFloorPointer.length; j++) {
      if (floorThis > shiftFloorPointer[j]) {
        shiftThis = j;
      } else if (floorThis == shiftFloorPointer[j]) {
        shiftThis = -1;
        break;
      }
    }
    if (shiftThis != -1) {
      recivedFile["actions"][i]["floor"] -= shiftThis;
    } else {
      recivedFile["actions"].splice(i,1);
    }
    doTimeout4();
  }
  function doTimeout1() {
    interval1 = setTimeout( function () {
      if (totActions >= 1) {
        calcAction(actionCount);
        actionCount++;
        progressNow = actionCount/totActions*100;
        $('#transferProgress').css('background', 'linear-gradient(90deg, rgba(113, 176, 227, 0.8) ' + progressNow + '% ' + progressNow + '%, #aaa ' + progressNow + '%)');
        $('#transferProgress').html(function (index,html) {
          return (progressNow).toFixed(1) + '% (Searching Actions... ' + actionCount + ' )';
        });
      }
      if (actionCount >= totActions) {
        clearTimeout(interval1);
        doTimeout2();
      }
    }, 10);
  }
  function doTimeout2() {
    interval2 = setTimeout( function () {
      if (delEffectToggle[1] == 0) {
        calcTile(tileCount);
        progressNow = tileCount/totTiles*100;
        $('#transferProgress').html(function (index,html) {
          return (progressNow).toFixed(1) + '% (Searching Tiles & Putting Rabbits and Turtles... ' + tileCount + ' )';
        });
        $('#transferProgress').css('background', 'linear-gradient(90deg, rgba(227, 200, 113, 0.8) ' + progressNow + '% ' + progressNow + '%, #aaa ' + progressNow + '%)');
      }
      tileCount++;
      if (tileCount+1 > totTiles || delEffectToggle[1] == 1) {
        clearTimeout(interval2);
        delActionCount = totActions-1;
        speedDeletePointerP = speedDeletePointer.length-1;
        doTimeout3();
      }
    }, 10);
  }
  function doTimeout3() {
    interval3 = setTimeout( function () {
      if (totActions >= 1) {
        calcDelAction(delActionCount);
        delActionCount--;
        progressNow = (1-delActionCount/totActions)*100
        $('#transferProgress').html(function (index,html) {
          return (progressNow).toFixed(1) + '% (Deleting Actions... ' + delActionCount + ' )';
        });
        $('#transferProgress').css('background', 'linear-gradient(90deg, rgba(227, 72, 45, 0.8) ' + progressNow + '% ' + progressNow + '%, #aaa ' + progressNow + '%)');
      }
      if ((delActionCount <= -1 || totActions < 1) && (deleteSpeed == 0 || delActionCount <= 0)) {
        clearTimeout(interval3);
        recivedFile["pathData"] = recivedFile["pathData"].replace(/!/g, '');
        totActions2 = recivedFile["actions"].length;
        shiftFloorCount = totActions2-2;
        doTimeout4();
      }
    }, 10);
  }
  function doTimeout4() {
    interval4 = setTimeout( function () {
      if (shiftFloorPointer.length >= 1) {
        shiftFloor(shiftFloorCount);
        shiftFloorCount--;
        progressNow = (1-shiftFloorCount/totActions2)*100;
        $('#transferProgress').html(function (index,html) {
          return (progressNow).toFixed(1) + '% (Shifting wrong Floors... ' + shiftFloorCount + ' )';
        });
        $('#transferProgress').css('background', 'linear-gradient(90deg, rgba(45, 227, 163, 0.8) ' + progressNow + '% ' + progressNow + '%, #aaa ' + progressNow + '%)');
      }
      if (shiftFloorCount < 0 || shiftFloorPointer.length == 0) {
        $('#transferProgress').html(function (index,html) {
          return 'Done!';
        });
        clearTimeout(interval4);
        setTimeout( function () {
          $('#transferProgress').hide();
          $('#downloadFile').show();
          $('#transferAlert').hide()
        }, 500);
      }
    }, 10);
  }
  function setEtc() {
    if (delEffectToggle[0] == 1) {
      recivedFile["settings"]["rotation"] = 0;
      recivedFile["settings"]["relativeTo"] = "Player";
      recivedFile["settings"]["position"] = [0, 0];
      recivedFile["settings"]["zoom"] = 100;
    }
  }
  function errorStop() {
    if (delEffectToggle[5]) {
      clearTimeout(interval1);
      clearTimeout(interval2);
      clearTimeout(interval3);
      clearTimeout(interval4);
      setTimeout( function () {
        $('#transferProgress').html(function (index,html) {
          return 'Calculate Error!';
        });
        $('#transferProgress').css('background', 'linear-gradient(90deg, rgba(20, 20, 20, 0.8) ' + progressNow + '% ' + progressNow + '%, #aaa ' + progressNow + '%)');
      }, 0);
    }
  }
  function makeMapLinear() {
    $('#dropFile').hide();
    $('#deleteEffect').hide();
    $('#infoText').hide();
    $('#transferProgress').show();
    $('#transferAlert').show();
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
    delActionCount = 0;
    speedDeletePointer = [];
    speedDeletePointerP = 0;
    deleteSpeed = 0;
    shiftFloorPointer = [];
    shiftFloorCount = 0;
    totActions2 = 0;
    setEtc();
    doTimeout1();
  }

  $('#warpAll').show();
  $('#warpAll').playKeyframe (
    'goApper 1.3s ease forwards',
  );
});

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}
