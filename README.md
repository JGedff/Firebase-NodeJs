# Firebase-NodeJs

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

* In your firebase storage, you'll have to create 4 folders:
  * css:
    * There, you'll have to put the css
  * scripts:
    * There will be the javascript files
  * postImg:
    * There is where the images that people put in their posts will save
  * profileImg:
    * There is where the images that people put in their profile will save

* In the layouts you'll find CSS TOCKEN and JAVASCRIPT TOCKEN. There, you'll have to put the css and the javascript url once you upload it into our firebase.

* In the firebaseKey.json, you'll have to put there the firebase SDK information.

* Also, in the config.js, you'll have to put your database URL and in the storageBucket, you'll have to put your firebase ID.

* In a lot of documents, you'll see YOUR FIREBASE APP. You'll have to change that for your firebase ID

* You'll also see some DEFAULT PROFILE IMAGE. The image or url of that image will be the image that all user will have if they don't put any image in the file input.
