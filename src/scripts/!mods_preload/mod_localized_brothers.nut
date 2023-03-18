
::LocalizedBrothers <- {
	ID = "localized_brothers",
	Version = "1.0.0",
	Name = "Localized Brothers"
}

::mods_registerMod(::LocalizedBrothers.ID, ::LocalizedBrothers.Version "LocalizedBrothers is a mod to translate the game");
::mods_queue(::LocalizedBrothers.ID, ::MSU.ID + ",>" + ::Console.ID, function()
{    
	::LocalizedBrothers.Mod <- ::MSU.Class.Mod(::LocalizedBrothers.ID, ::LocalizedBrothers.Version, ::LocalizedBrothers.Name);
    ::LocalizedBrothers <- ::new("localized_brothers/localized_brothers.nut");
    ::mods_registerJS("mod_localized_brothers/main.js");
    ::mods_registerCSS("mod_localized_brothers/css/main.css");
    ::MSU.UI.registerConnection(::LocalizedBrothers)
});