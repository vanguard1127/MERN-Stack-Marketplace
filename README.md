<H1> Setup SERVER Document </H1>

---install Git on Ubuntu<br />
apt-get install git

---check git version<br />
git --version

---clone source code from github <br />
git clone git@github.com:peony846/marketplace.git

<br/>
--- install build essentials on ubuntu server
<br/>
sudo apt install build-essential

<br/>
--- install Python (2.7) and python3
<br/>
sudo apt-get install python
<br/>
sudo apt-get install python3
<br/>

---How to install MongoDB<br />
sudo apt install -y mongodb

---create db<br />
cd /var/   </br>
sudo mkdir marketplacedb   <br/>
sudo chmod 777 marketplacedb  <br/>

sudo nohup mongod --dbpath=/var/marketplacedb  &

---check service status
sudo systemctl status mongodb


--setup node.js on Linux instance
--install nvm
<br/>

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash

<br/>
--activate nvm
<br/>
chmod 777 /home/$USER/.nvm/nvm.sh  
<br/>
source ~/.profile
<br/>
--install node
<br/>
nvm install node

<br/>
--install pm2
<br/>
npm install pm2 -g

<br/>
// check node is installed
<br/>
node -v
<br/>
// verify the version is v12.2.0
<BR/> </br>

<br/>
-- install elastic search
<br/>
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.0.1-linux-x86_64.tar.gz
<br/>
wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.0.1-linux-x86_64.tar.gz.sha512
<br/>

sudo mv elasticsearch-7.0.1-linux-x86_64.tar.gz* /opt/
<br/>
cd /opt/
<br/>
sudo shasum -a 512 -c elasticsearch-7.0.1-linux-x86_64.tar.gz.sha512 
<br/>
sudo tar -xzf elasticsearch-7.0.1-linux-x86_64.tar.gz
<br/>
sudo adduser elastic
<br/>
sudo chown -R /opt/elasticsearch-7.0.1/ 
<br/>
cd /opt/elasticsearch-7.0.1/ 
sudo su elastic
<br/>
export ES_HOME=/opt/elasticsearch-7.0.1/ 
<br/>
./bin/elasticsearch -d -p es.pid
<br/>
--Test it
wget 127.0.0.1:9200/
<br/>
cat index.html
<br.>
-- to stop <br/>
sudo pkill -F es.pid
<br/>
<br/>

--5.5.0 install
sudo apt-get install openjdk-8-jre
curl -L -O https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-5.5.3.deb
sudo dpkg -i elasticsearch-5.5.3.deb
sudo /etc/init.d/elasticsearch start


<br/>
<H1> TO RUN THE BACKEND server </H1>
<br/> ssh $ServeIP$
<br/> sudo su marketplace
<br/> cd /home/marketplace
<br/> git clone https://github.com/peony846/marketplace.git
<br/> cd /home/marketplace/marketplace
<br/> cd backend
<br/> npm install
<br/> npm start
<br/> OR 
<br/> pm2 start npm -- start
<br/>

<br/>
<H1> TO RUN UI server for JS Frontend App </H1>
<br/> cd ../frontend/react_js
<br/> npm install
<br/> either  
<br/> npm start  
<br/> or
<br/> sudo npm start ( if starting on port number below 1000 start as sudo)
<br/> OR run the app with pm2 for reliability and auto restart
<br/> pm2 start npm -- start
<br/>


<br/>
<H1> TO RUN FRONT END WITH HTTPS </H1>
<br/> go to the frontend/react_js folder
<br/> 	Open package.json file
<br/>	please channge from 'set HTTPS=true' to 'HTTPS=true' on	line 30 
<br/>	npn start

<br/>
<H1> TO RUN FRONT END on different PORT than the default 3000 </H1>
<br/>   go to the frontend/react_js folder
<br/>	Open package.json file
<br/>	please add ' PORT=80 ' to the start section 
<br/>	npm start
<br/>
<br/>
<br/>
<H1> BUILD ANDROID APP APK </H1>
<br/>
<br/> Prepare your envrionment
<br/> 1. installing android studio (which includes android emulator ADB).
<br/> Before complile, you should export android sdk path. download latest android sdk.
<br/> set enviornmental variable in .bashrc.
<br/> export $ANDROID_HOME=/usr/android/sdk.
<br/> Edit or Add a new file 
<br/> $> vi marketplace/frontend/PeonyMarketplace/android/local.properties file and then add these 2 lines 
<br/>  sdk.dir=$ANDROID_SDK_HOME  (e.g. /opt/Android/Sdk)
<br/>  ndk.dir=#ANDROID_NDK_HOME  (e.g. /opt/Android/Ndk)
<br/>

<br/> 2. Build common libraries
<br/> $> cd  frontend/PeonyMarketPlace
<br/> $> vi src/config/config.js file and then change the REACT_APP_API_URL to your backend server address.
<br/> $> sudo chmod 777 -R /home/user33/projects/marketplace/frontend/PeonyMarketplace/node_modules/
<br/> Now build the libraries
<br/> $> npm install --save react-native-fetch-blob
<br/>   Note: 
<br/>	While compiling , 'Outofmemory' error may be occured.
<br/>	At this time , please go to PeonyMarketplace/android folder.
<br/>	And then open gradle.properties file
<br/>	Then add this line 'org.gradle.jvmargs=-Xmx3536m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError'
<br/>	You can change memory size.
<br/>
<br/> 3. Fix issues with  REACT NATIVE DEPENDENCY LIBRARY VERSION
<br/> $> vi node_modules/react-native-fetch-blob/android/build.gradle
<br/>	
<br/>		-Line 17 : compileSdkVersion 23 -> compileSdkVersion 28
<br/>		-Line 18 : buildToolsVersion "23.0.1" -> buildToolsVersion "28.0.3"
<br/>		-Line 21 : targetSdkVersion 23 -> targetSdkVersion 28
<br/>		-Line 36 : compile -> implementation
<br/>  and 
<br/>  $> vi  PeonyMarketplace/android/app/build.gradle
<br/>	--Line 116: add line like this.
<br/>		subprojects {
<br/>			afterEvaluate {project ->
<br/>			    if (project.hasProperty("android")) {
<br/>				android {
<br/>				    compileSdkVersion 28
<br/>				    buildToolsVersion "28.0.3"
<br/>				}
<br/>			    }
<br/>			}
<br/>		    }
<br/>
<br/>  
<br/> 4. Setup debug keystore
<br/> $> cd marketplace/frontend/PeonyMarketplace/android/keystores
<br/> $> keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
<br/> 
<br/> 5. Finally to compile and build the APK 
<br/> $> cd marketplace/frontend/PeonyMarketplace/android 
<br/> $> sudo ./gradlew clean
<br/> $> sudo ./gradlew assembleRelease
<br/>OR 
<br/> $> sudo ./gradlew assembleRelease -x bundleReleaseJsAndAssets
<br/>
<br/> 6. APK file should be built and available in  ./android/app/build/outputs/apk/release/app-release.apk'




<br/>
<H1> TO DEBUG ANDROID APP </H1>
<br/>
<br/> Install react-native libraray with npm console.
	npm install -g react-native-cli
<br/> i.e. react-native-cli@2.0.1  (????? HOW TO MAKE SURE THE CORRECT VERSION IS INSTALLED ???????) 
<br/> cd  frontend/PeonyMarketPlace
<br/> npm install
<br/> Make sure android emulator device is running or you have connected android device
<br/> If you are using real android device, you should enable developer option.
<br/> Alsp Open src/config/config.js file and then change the REACT_APP_API_URL to your backend server address.
<br/> $> react-native run-android
<br/>
<br/>



<br/>
<br/>
<br/>
<H1> Following steps on the server done by Zhang</H1>

<br/># Setup Java env
<br/>sudo add-apt-repository ppa:openjdk-r/ppa
<br/>sudo apt update
<br/>sudo apt-get install openjdk-8-jdk
<br/>export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
<br/>export PATH=$PATH:$JAVA_HOME/bin
<br/>java -version
<br/>
<br/>
<br/># Setup nodejs env
<br/>sudo apt-get install nodejs
<br/>sudo apt-get install curl 
<br/>
<br/>curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
<br/>chmod 777 /home/$USER/.nvm/nvm.sh 
<br/>nvm install node 
<br/>sudo ln -s $HOME/.nvm/versions/node/v12.6.0/bin/node /usr/local/bin/node
<br/>dir/usr/local/bin/node
<br/>node -v
<br/>
<br/>npm install -g react-native-cli
<br/>react-native -h
<br/>
<br/>export ANDROID_HOME=$HOME/android_sdk
<br/>mkdir $ANDROID_HOME
<br/>
<br/>cd $ANDROID_HOME
<br/>sudo wget https://dl.google.com/android/repository/tools_r25.2.3-linux.zip
<br/>sudo unzip tools_r25.2.3-linux.zip
<br/>cd $ANDROID_HOME/tools
<br/>sudo ./android update sdk --no-ui
<br/>
<br/>cd $ANDROID_HOME/build-tools/
<br/>wget https://dl.google.com/android/repository/build-tools_r28.0.3-linux.zip
<br/>unzip build-tools_r28.0.3-linux.zip 
<br/>mv android-9/ 28.0.3
<br/>
<br/>cd $ANDROID_HOME/tools/bin
<br/>./sdkmanager "platform-tools" "platforms;android-28" "build-tools;28.0.3" 
<br/>
<br/>sudo chmod -R 777 $ANDROID_HOME
<br/>
<br/>
<br/>export SRC_ROOT=$HOME/projects/marketplace
<br/>cd $SRC_ROOT
<br/>
<br/>git clone https://github.com/peony846/marketplace.git
<br/>
<br/>cd $SRC_ROOT/frontend/PeonyMarketplace/
<br/>npm install
<br/>vi $SRC_ROOT/frontend/PeonyMarketplace/node_modules/react-native-fetch-blob/android/build.gradle 
<br/>vi $SRC_ROOT/frontend/PeonyMarketplace/android/app/build.gradle 
<br/>vi $SRC_ROOT/frontend/PeonyMarketplace/node_modules/react-native-fetch-blob/android/build.gradle 
<br/>
<br/>react-native upgrade
<br/>react-native -v
<br/>																																																																																																																																																																																																																																																						
<br/>react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
<br/>  
<br/># setup keystores
<br/># https://coderwall.com/p/r09hoq/android-generate-release-debug-keystores
<br/>cd $SRC_ROOT/frontend/PeonyMarketplace/android/keystores
<br/>keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000
<br/>chmod 777 $SRC_ROOT/frontend/PeonyMarketplace/android/keystores/debug.keystore
<br/>
<br/>cd $SRC_ROOT/frontend/PeonyMarketplace/android
<br/>sudo ./gradlew clean
<br/>sudo ./gradlew assembleRelease
<br/>
<br/>
<br/>
<br/>																																																																																																																																																																											
