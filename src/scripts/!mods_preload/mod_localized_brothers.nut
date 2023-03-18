::LocalizedBrothers <- ::new("localized_brothers/localized_brothers.nut");
::mods_registerJS("mod_localized_brothers/main.js");
::mods_registerCSS("mod_localized_brothers/css/main.css");

::mods_registerMod(::LocalizedBrothers.ID, ::LocalizedBrothers.Version "LocalizedBrothers is a mod to translate the game");
::mods_queue(::LocalizedBrothers.ID, ::MSU.ID + ",>" + ::Console.ID, function()
{    
    ::mods_hookExactClass("ui/screens/menu/modules/main_menu_module", function(o)
    {
        local connectBackend = o.connectBackend;
        o.connectBackend <- function()
        {
            ::LocalizedBrothers.connect();
            connectBackend()
        }
    });
});