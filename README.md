# **Mod Localized Brothers**
This repos contain a mod to translate the game. If you are a dev, and want to translate your mod, it can also be used. If you want to help to translate the game don't hesitate to contact me (and if you know how to do it, by opening a pull request).

# Why this repos
Some mods already exist to translate the game but they are for one language. Those mods are done without the hook system which mean high chance of incompatibility between mods. That's why I've done this mod which is highly compatible with other mods and make translations easier.

# Functionality
- Translate the game on runtime.
- Easy to translate.
- Change you language in the option menu (TODO)
- Will by default contain a big list of languages translated using google translation. (TODO)

# FAQ
## How to add translations ?
First of all, thanks to take a look at this mod. In the mod files, you can find under `./src/ui/mods/mod_localized_brothers/translations` some json files containing translations. You can edit those files or create new ones. Once it's done, you can if you know how to do it, create a pull request and if you are not a dev, you can open an Issue and put a zip file containing your translations in it. The best way to translate those files are to copy the "en.json" one and translate value by value. Don't translate the keys, only the values {key:value}.

Some translations contain values, like for exemple "Jour 2 (Beginner/Beginner)". You can translate this value by doing somethings like that "Day %a% (%b%,%c%)". The values between two % are placeholders for values. You can name it how you want, it's not important. Exception for %SPEECH_ON% and %SPEECH_OFF% which are reserved.

Lastly, don't worry if there is errors in your translation files. With enough user and time, corrections will be done. Thanks again for the reading.

# Dependencies
- [Modding Standards and Utilities (MSU)](https://www.nexusmods.com/battlebrothers/mods/479)
- [Modding script hooks](https://www.nexusmods.com/battlebrothers/mods/42)

# References
- [ES6 brothers](https://github.com/NathanGASC/ES6-Brothers) is a setup which allow using ES6 for BB modding. I've used it for this project. If you want to know how to dev on it, it's a good idea to start here.