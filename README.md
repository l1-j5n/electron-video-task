# Video - Editor

It is desktop app which is used to trim the video or in other words we can say it used for create a clip from video.

### Technology Used

- Javascript
- NodeJS
- ElectronJS
- ReactJS

### Features

- Video Trimming
  - User have to select particular mp4 format file from local system and then have to manage the brushes for set the clip timing. Then on click of save button they just have to pass path and name of video and it will get store at give path in mp4 format.

### Steps to run app in DEVELOPMENT environment

- Set Environment to "DEVELOPMENT" in public/common/constants.js file.

#### First Terminal

- npm i
- package.json ("main": "public/electron.js") set "main" entry path with "public/electron.js" if it is "build/electron.js".
- npm run start
- Above steps will start the react app in development environment.

#### Second Terminal

- npm run watch
- Now above command will run app in development environment.
- It will get close if terminal gets close or kill the process in terminal.

### Steps to create BUILD for LINUX platform

- Install all the necessary packages before create a build by run command "npm i" in terminal.
  1. set "Environment" from "DEVELOPMENT" to "PRODUCTION" in public > common > constants.js file.
  2. run "PUBLIC_URL='./' npm run build" command in terminal (you can see new folder with name "build" in project directory).
  3. run "npm run builder" command in terminal. (you can see new folder with name "dist" in project directory.)
  4. The .dmg file which is located in directory > "dist" folder is sharable and installable.

### Steps to create BUILD for MAC platform

- Install all the necessary packages before create a build by run command "npm i" in terminal.
  1. set "Environment" from "DEVELOPMENT" to "PRODUCTION" in public > common > constants.js file.
  2. run "PUBLIC_URL='./' npm run build" command in terminal (you can see new folder with name "build" in project directory)
  3. set this command to 'builder' script "export CSC_IDENTITY_AUTO_DISCOVERY=false && electron-builder build"
  4. run "npm run builder" command in terminal. (you can see new folder with name "dist" in project directory.)
  5. The .dmg file which is located in directory > "dist" folder is sharable and installable.

### Steps to create BUILD for WINDOWS platform

- Install all the necessary packages before create a build by run command "npm i" in terminal.
  1. set "Environment" from "DEVELOPMENT" to "PRODUCTION" in public > common > constants.js file.
  2. run "$env:PUBLIC_URL='./'; npm run build" command in terminal (you can see new folder with name "build" in project directory)
  3. run "npm run builder" command in terminal. (you can see new folder with name "dist" in project directory.)
  4. The .dmg file which is located in directory > "dist" folder is sharable and installable.
