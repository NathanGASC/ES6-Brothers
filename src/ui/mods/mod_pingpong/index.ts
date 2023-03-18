//TODO: Remove this import to resolve performance issue. Read the README to know what is Polyfill and how to use them.
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

document.querySelectorAll("*").forEach((n)=>{
  console.log(n)
});

(window as any).registerScreen(PingPong.id, new PingPong());