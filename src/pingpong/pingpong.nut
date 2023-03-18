this.PingPong <- {
	ID = "pingpong",
	Version = "1.0.0",
	Name = "Ping pong"

	m = {
		JSHandle = null,
	}

	function connect()
	{
		this.m.JSHandle = ::UI.connect(this.ID, this);
	}

    function sendPing() {
        ::logDebug("SQ : receive pong")
		this.m.JSHandle.asyncCall("receivePing",null);
    }

    function sendPong() {
        ::logDebug("SQ : receive ping")
		this.m.JSHandle.asyncCall("receivePong",null);
    }
};