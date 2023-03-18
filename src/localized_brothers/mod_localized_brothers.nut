this.LocalizedBrothers <- {
	ID = "localized_brothers",
	Version = "1.0.0",
	Name = "Ping pong"

	m = {
		JSHandle = null,
	}

	function connect()
	{
		this.m.JSHandle = ::UI.connect(this.ID, this);
	}
};