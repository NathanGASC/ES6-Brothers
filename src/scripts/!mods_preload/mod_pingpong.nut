::PingPong <- ::new("pingpong/pingpong.nut");
::mods_registerJS("mod_pingpong/main.js");
::mods_registerCSS("mod_pingpong/css/main.css");

::mods_registerMod(::PingPong.ID, ::PingPong.Version "Basic ping pong mod to understand how modding BB work");
::mods_queue(::PingPong.ID, ::MSU.ID, function()
{    
    ::mods_hookExactClass("ui/screens/menu/modules/main_menu_module", function(o)
    {
        local connectBackend = o.connectBackend;
        o.connectBackend <- function()
        {
            ::PingPong.connect();
            connectBackend()
        }
    });
});