var Obniz = require("obniz");
var obniz = new Obniz("OBNIZ_ID_HRE");

const DISTANCE = 500; 
const DETECT_COUNT = 5;

obniz.onconnect = async function () {

  // mp3初期化
  const mp3 = obniz.wired("Grove_MP3", { gnd: 5, vcc: 6, mp3_rx: 7, mp3_tx: 8 });
  await mp3.initWait();

  // 距離センサー初期化
  const hcsr04 = obniz.wired("HC-SR04", {gnd:0, echo:1, trigger:2, vcc:3});
  hcsr04.temp = 20;

  let sayFlg = false;
  let count = 0;

  // ループ
  while(true) {

    let avg = 0;
    let cnt = 0;

    for (let i=0; i<3; i++) { // measure three time. and calculate average
      const val = await hcsr04.measureWait();
      if (val) {
        cnt++;
        avg += val;
      }
    }
    if (cnt > 1) {
      avg /= cnt;
    }

    if (!sayFlg) {
      if (avg < DISTANCE) {
        count++;
        if (count >= DETECT_COUNT) {
          sayFlg = true;
          count = 0;
          await mp3.play(1);
        }
      } else {
        count = 0;
      }
    } else {
      if (avg > DISTANCE) {
        count++;
        if (count >= DETECT_COUNT) {
          sayFlg = false;
          count = 0;
        }
      } else {
        count = 0;
      }
    }

    console.log("----------------")
    console.log(`DISTANCE: ${avg}`);
    console.log(`COUNT: ${count}`);
    console.log(`SAYFLG: ${sayFlg}`);

    await obniz.wait(1000);
  }
}
