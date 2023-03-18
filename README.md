# **ES6 Brothers**
This repo contain a basic setup for modding **Battle Brothers**.

# Why this repos
JavaScript is a good language at one condition. Being able to use ES6 syntax (and if possible TypeScript).
Sadly the browser inside Battle Brothers which display the UI is in ES3 syntax (1997-1999). Luckily some
tools exist to transpile ES6 syntax to ES3 syntax. This project is a setup which implement this solution.

We also want to do some stuff automatically. Some scripts will be added with time and need to make things
easier.

# How to use
Here some steps to follow to test the setup and check if it work well. If you have an error during those steps, don't hesitate to create an issue.  

0. Prerequisite : Install [NodeJS](https://nodejs.org/en)
1. First, you need to install the dependencies. To do so make `npm i`.
2. Customize the .env file as follow:
    - **DIST_FOLDER** : the absolute path to your workspace where you dev all your mods (ex: `C:/Users/KFox/Desktop/Games/Devs/Battle brothers/customMods/`)
3. Next, you can do `npm run watch` to compile files. At this point you should see the compiled mod in the DIST_FOLER you have set in the env variable.
4. Zip the compiled mod and move it in the data folder of the game `C:\Program Files (x86)\Steam\steamapps\common\Battle Brothers\data`.
5. Lastly, launch the game. Once in the menu, open the log.html file which should be under `C:\Users\[YourUsername]\Documents\Battle Brothers\log.html`. If you refresh it, you will see a new log every 2s saying "
SQ : receive ping" and "
SQ : receive pong".

# How to go further
To create your own mod you can go to the env file and customize further :  
- **MOD_NAME** : the name of your mode. It will be usefull in futur scripts. For now the only things it do is being used to create the dist folder and to find the index.ts file (ex: if my mod is named "supermod" the index.ts will be under `./src/ui/mods/mod_supermod/index.ts`)
- **DIST_FOLDER** : the absolute path to your workspace where you dev all your mods (ex: `C:/Users/KFox/Desktop/Games/Devs/Battle brothers/customMods/`).
- **NODE_ENV** : This is related to the compilation. You don't have to touch it but if you are interested have a look at webpack documentation.

The index.ts file at `./src/ui/mods/mod_[YourModName]/index.ts` is the entry point for the frontend. For the backend and others files/folders, there is no compilation work. They will just be copied on compilation to your DIST_FOLDER with the compiled frontend with the same folder ordering than in your src folder.

Like you have maybe already seen, `npm run watch` will "watch" your src folder. Each time you save/delete/add a file in this folder, a compilation will be triggered automatically. To go further you can have a look at [Mod Brothers](https://github.com/NathanGASC/Mod-Brothers). It is an executable which zip a folder at each update in it to a given destination. Usefull if you don't want to zip at hand each time you edit your mod.

From now on, you are ready to start modding, but if you want to have all the keys, don't hesitate to continue to read this README.

# FAQ
## **When I use ES6 features, I have errors on runtime. How I can use ES6 withtout errors ?**
To use JavaScript ES6, we have two things which are different. Syntaxes, and native code. The syntaxes is the way you write your code, native code is the available functions. Obviously we want to use both and be able to use ES6 syntax and native code.
- An exemple of syntax available :
    - ES3 : you can create function like this `function(){}`
    - ES6 : you can also create function like this `()=>{}`
- An exemple of native code available :
    - ES3 : if we want to do `document.querySelector("*").forEach(...)`, the forEach method **don't exist**
    - ES6 : if we want to do `document.querySelector("*").forEach(...)`, the forEach method **exist**

Why do I explain this? Because this setup handle the conversion from ES6 syntax to ES3 syntax but will not do it **automatically** for native code. We don't do it automatically for performance reason (from my test in game, I go from 90/100fps to 15fps). Then you will have to add manually your own "polyfill" which are chunck of code implementing new ES6 native code to ES3 native code. Here a little tutorial on how to do it and what to avoid.

We are lucky to be in 2023 (when I write this) and have amazing peoples who make things like [core-js](https://github.com/zloirock/core-js). This library contain every polyfill up to ES7 and will probably continue to update with time. I've added this library to dependencies to make us able to use it, **but** as I've sayed, we mustn't call the entire library to implement every ES6 features like they do in the first example of the README with `import 'core-js/actual'`. You can test and see how it will break your performance in game. If you read further the README, you see that you can call part of the library individually depending of your need. If I reuse my upper example : To use `document.querySelector("*").forEach(...)` in ES3, I should do `import 'core-js/actual/dom-collections/for-each'`. This will drastically reduce the performance issue and make me able to use my ES6 feature.

How to find the right import for a given feature? Use CTRL+F on [core-js](https://github.com/zloirock/core-js) README and search for example, "toArray". You will have 9 results. If you go through the results, you will see sections called *CommonJS entry points* over the searched element which show you how to import what you want. For example, if I want to implement "toArray", I should do this import `import "core-js/actual/iterator/to-array"`.

Lastly, if you see error about native code which don't exist, it's because you haven't imported the ES6 feature. If you aren't sure that the issue come from missing import, you can try temporarly to import the entire library with `import 'core-js/actual'`. If the error disepear, the issue come from missing import.

## **My game performance drastlycally decrease, how can I fix ?**
If you have issue with FPS, it probably come from polyfill import. To understand what I talk about, look at the FAQ question "**When I use ES6 features, I have errors on runtime. How I can use ES6 withtout errors ?**".

To resolve this issue, you can try first to remove other mods. They maybe add polyfill like you do. It's maybe too much polyfill at once. Another solution is to reduce your own polyfill. That can be done by beeing more specific in your import and transform import like `import "core-js/actual/iterator"` to `import "core-js/actual/iterator/to-array"`. Or by removing unused polyfill.