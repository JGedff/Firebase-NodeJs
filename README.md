# Firebase-NodeJs

# THIS PROJECT IS AFECTED BY THE VULNERABILITY OF PROTOBUFJS CVE-2023-36665 PLEASE UPDATE IT TO A HIGHER VERSION THAN 7.2.4

Hello, this is a web made with HTML, CSS and JavaScript for the front-end and NodeJs and express handlebars for the server routing.

In this release, as a unlogged user you can see all information of the Who are we, posts and comments.
You'll have a search button to search between all the posts.

As a logged user you can create, edit or delete you own posts and comments.
You can also edit your user information or even delete your account.
In your search button, you'll be able to search others users and see their information like name, email, comments made, publications made, likes acumulated, ...

As a super user you can create, edit or delete your own posts and comments.
You can also see, edit or delete others posts, comments or profiles.
Although, you can create, edit or delete categories and dates, that they are used to organize the posts.

To install all NodeJs packages you'll have to use the comand npm run install.

To run the server you'll have to user the comand npm run start.

# Before runing the service

* The folder public have 3 documents. Each one will have to be in the folder of their extension. Ex: style.css in the folder css. DO NOT delete the folder public. It will crash if you delete it.

* In your firebase storage, you'll have to create 4 folders:
  * css:
    * There, you'll have to put the css
  * scripts:
    * There will be the javascript files
  * postImg:
    * There is where the images that people put in their posts will save
  * profileImg:
    * There is where the images that people put in their profile will save

* Once you have uploaded the files, you'll have to change the url route to the style.css, javascript.js, register.css, and all the links to files, so it will connect to your firebase.

* In the firebaseKey.json, you'll have to put there the firebase SDK information.

* Also, in the config.js, you'll have to put your database URL and in the storageBucket, you'll have to put your firebase ID.
