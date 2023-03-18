# ES6 Brothers
This repo contain a basic setup for modding **Battle Brothers**.

## Why this repos
JavaScript is a good language at one condition. Being able to use ES6 syntax (and if possible TypeScript).
Sadly the browser inside Battle Brothers which display the UI is in ES3 syntax (1997-1999). Luckily some
tools exist to transpile ES6 syntax to ES3 syntax. This project is a setup which implement this solution.

We also want to do some stuff automatically. Some scripts will be added with time and need to make things
easier.

## How to use
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

## How to go further
To create your own mod you can go to the env file and customize further :  
- **MOD_NAME** : the name of your mode. It will be usefull in futur scripts. For now the only things it do is being used to create the dist folder and to find the index.ts file (ex: if my mod is named "supermod" the index.ts will be under `./src/ui/mods/mod_supermod/index.ts`)
- **DIST_FOLDER** : the absolute path to your workspace where you dev all your mods (ex: `C:/Users/KFox/Desktop/Games/Devs/Battle brothers/customMods/`).
- **NODE_ENV** : This is related to the compilation. You don't have to touch it but if you are interested have a look at webpack documentation.

The index.ts file at `./src/ui/mods/mod_[YourModName]/index.ts` is the entry point for the frontend. For the backend and others files/folders, there is no compilation work. They will just be copied on compilation to your DIST_FOLDER with the compiled frontend with the same folder ordering than in your src folder.

Like you have maybe already seen, `npm run watch` will "watch" your src folder. Each time you save/delete/add a file in this folder, a compilation will be triggered automatically. To go further you can have a look at [Mod Brothers](https://github.com/NathanGASC/Mod-Brothers). It is an executable which zip a folder at each update in it to a given destination. Usefull if you don't want to zip at hand each time you edit your mod.