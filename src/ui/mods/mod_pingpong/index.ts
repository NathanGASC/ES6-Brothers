//This import is a polyfill which will implement things which are missing in ES3. 
//It will add some time (0.5s - 2s) to the game start.
import 'core-js/actual';

class PingPong {
  sqHandle: any = null
  static id = "pingpong";

  onConnection(sqHandle: any) {
    this.sqHandle = sqHandle;
    console.log("PingPongConnected")

    this.receivePing()
  }

  receivePing(){
    setTimeout(() => {    
      (window as any).SQ.call(this.sqHandle, 'sendPong');
    }, 2000);
  }

  receivePong(){
    setTimeout(() => {
      (window as any).SQ.call(this.sqHandle, 'sendPing');
    }, 2000);
  }
}

(window as any).registerScreen(PingPong.id, new PingPong());