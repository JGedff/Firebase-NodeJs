const db = require('../config.js');
const { Router } = require('express');
const admin = require('firebase-admin');
const { getStorage } = require("firebase-admin/storage");
const { v4 } = require('uuid');

const auth = admin.auth();
const storage = getStorage();
const router = Router();
const uuid = v4;

const usersCollection = db.collection("users");
const postsCollection = db.collection("posts");
const comentsCollection = db.collection("coments");
const dateCollection = db.collection("date");
const categoriesCollection = db.collection("categories");

const adminId = uuid();
const adminPassword = "admin123";
const adminName = "admin";

router.get("/", async (req, res) => {
    const query = await postsCollection.get();

    const post = query.docs.map((doc) => ({
        ...doc.data()
    }));

    res.render("publications/posts", { post });
})

router.get("/publication/:id", async (req, res) => {
    const publication = await postsCollection.where('id', '==', req.params.id).get();
    const query = await comentsCollection.where('post', '==', req.params.id).get();

    let post = publication.docs.map(doc => ({
        ...doc.data()
    }));
    
    let comments = query.docs.map(doc => ({
        ...doc.data()
    }));

    res.render("publications/comments", { post, comments });
})

router.get("/register", (req, res) => {
    res.render("register/register", { layout: "register" });
})

router.get("/newUser", async (req, res) => {
    if (usersCollection.where('email', '==', req.query.userEmail).count > 0) {
        return res.redirect("/register");
    }
    
    let userImg;
    let userUid;
    let randomId = uuid();
    let password = Buffer.from(req.query.passwd.trim(), 'base64url').toString();

    const userData = {
        id: randomId,
        email: req.query.userEmail,
        name: req.query.userName,
        userDescription: req.query.userDescription,
        passwd: password,
        comments: 0,
        publications: 0,
        totalDislikes: 0,
        totalLikes: 0
    };

    if (req.query.imgUser != '') {
        let randomTocken = uuid();

        await storage.bucket().upload(`${req.query.imgUser}`, {
            destination: `profileImg/${req.query.imgUser}`,
            metadata: {
                cacheControl: "max-age=31536000",

                metadata: {
                firebaseStorageDownloadTokens: randomTocken,
                },
            },
            });
        
        userImg = `https://firebasestorage.googleapis.com/v0/b/pkmnut-b8812.appspot.com/o/profileImg%2F${req.query.imgUser}?alt=media&token=${randomTocken}`;
    }
    else {
        userImg = 'https://firebasestorage.googleapis.com/v0/b/pkmnut-b8812.appspot.com/o/profileImg%2Fperson-circle.svg?alt=media&token=77d7e8f3-1909-4abb-96e9-f273741b2d86';
    }

    userData.image = userImg;

    await auth.createUser({
        email: req.query.userEmail.trim(),
        password: req.query.passwd,
        displayName: req.query.userName
    });

    await auth.getUserByEmail(req.query.userEmail)
        .then((user) => {
            userUid = user.uid;
        });
    
    userData.uid = userUid;
    
    await usersCollection.doc(randomId).set(userData)
        .then(() => {
            return res.redirect("/");
        });
})

router.get("/dashboard", async (req, res) => {
    let fieldSearch;
    let searchValue;

    if (req.query.userName != "") {
        fieldSearch = "name";
        searchValue = req.query.userName;
    }
    else {
        fieldSearch = "email";
        searchValue = req.query.userEmail;
    }

    const query = await usersCollection.where(fieldSearch, '==', searchValue).get();
    
    const user = query.docs.map(doc => ({
        ...doc.data()
    }));
    
    try {
        if (user[0].id) {
            let pasword = user[0].passwd;
            let documentId = user[0].id;

            if (pasword === Buffer.from(req.query.passwd.trim(), 'base64url').toString()) {
                return res.redirect(`/dashboard/${documentId}`);
            }

            return res.redirect("/");
        }
    } catch (error) {
        return res.redirect("/");
    }
})

router.get("/dashboard/:user", async (req, res) => {
    const userData = await usersCollection.doc(req.params.user).get();

    res.render("users/dashboardUser", { layout: "dashboard", data: { id: userData.id, ...userData.data() }});
})

router.get("/loged/:user", async (req, res) => {
    const query = await postsCollection.get();

    const post = query.docs.map((doc) => ({
        touchId: req.params.user,
        ...doc.data()
    }));

    res.render("users/main", { layout: "dashboard", user: { id: req.params.user }, post });
})

router.get("/loged/:user/publication/:id", async (req, res) => {
    const publication = await postsCollection.where('id', '==', req.params.id).get();
    const query = await comentsCollection.where('post', '==', req.params.id).get();

    let post = publication.docs.map(doc => ({
        touchId: req.params.user,
        ...doc.data()
    }));
    
    let comments = query.docs.map(doc => ({
        touchId: req.params.user,
        ...doc.data()
    }));

    res.render("users/comments", { layout: "dashboard", user: { id: req.params.user, postId: req.params.id }, post, comments });
})

router.get("/newPost/:user", async (req, res) => {
    const query = await categoriesCollection.get();

    const cat = query.docs.map(category => ({
        name: category.data().name
    }));

    res.render("users/createPost", { layout: "dashboard", user: { id: req.params.user }, cat });
})

router.get("/newPost/:user/send", async (req, res) => {
    const userData = await usersCollection.doc(req.params.user).get();
    let dateId = "";
    let postImg = "";
    let mediAlt = "";
    let timesToday = 0;
    let repeatedDate = false;
    let dateRandomID = null;
    
    const date = new Date();
    
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    
    let currentDate = `${day}/${month}/${year}`;

    const query = await dateCollection.where('date', '==', currentDate).get();
    const document = query.docs.map(docs => ({
        id: docs.id,
        day: docs.data().date,
        times: docs.data().times
    }))

    document.forEach(docs => {
        dateId = docs.id
        timesToday = Number(docs.times);
        repeatedDate = true;
    });

    if (!repeatedDate) {
        dateRandomID = uuid();

        const dateDoc = {
            date: currentDate,
            times: 1,
            id: dateRandomID
        }

        await dateCollection.doc(dateRandomID).set(dateDoc);
    }
    else {
        const dateDoc = {
            times: timesToday + 1
        }

        await dateCollection.doc(dateId).update(dateDoc);
    }

    let publicationId = uuid();

    if (req.query.media != '') {
        let randomTocken = uuid();

        await storage.bucket().upload(`${req.query.imgUser}`, {
            destination: `postImg/${req.query.imgUser}`,
            metadata: {
                cacheControl: "max-age=31536000",

                metadata: {
                firebaseStorageDownloadTokens: randomTocken,
                },
            },
            });
        
        postImg = `https://firebasestorage.googleapis.com/v0/b/pkmnut-b8812.appspot.com/o/profileImg%2F${req.query.imgUser}?alt=media&token=${randomTocken}`;

        if (req.query.mediaAlt == "") {
            mediAlt = req.query.imgUser;
        }
        else {
            mediAlt = req.query.mediAlt;
        }
    }
    else {
        postImg = "";
        mediAlt = "";
    }

    const doc = {
        category: req.query.category,
        comments: 0,
        content: req.query.content,
        date: currentDate,
        dislikes: 0,
        email: userData.data().email,
        likes: 0,
        media: postImg,
        mediaAlt: mediAlt,
        title: req.query.title,
        userName: userData.data().name,
        userId: req.params.user,
        id: publicationId
    }

    const user = {
        publications: userData.data().publications + 1
    }

    await usersCollection.doc(req.params.user).update(user);

    await postsCollection.doc(publicationId).set(doc);

    res.redirect(`/loged/${req.params.user}/publication/${publicationId}`);
})

router.get("/newComment/:user/:publication", async (req, res) => {
    const userData = await usersCollection.doc(req.params.user).get();
    const document = await postsCollection.doc(req.params.publication).get();

    let commentId = uuid();

    const docData = {
        id: commentId,
        content: req.query.content,
        post: req.params.publication,
        userId: req.params.user,
        likes: 0,
        dislikes: 0,
        userName: userData.data().name,
        email: userData.data().email
    }

    const userInformation = {
        comments: userData.data().comments + 1 
    }

    const docInformation = {
        comments: document.data().comments + 1
    }

    await usersCollection.doc(req.params.user).update(userInformation);

    await postsCollection.doc(req.params.publication).update(docInformation);

    await comentsCollection.doc(commentId).set(docData);

    res.redirect(`/loged/${req.params.user}/publication/${req.params.publication}`);
})

router.get("/dashboard/:user/edit", async (req, res) => {
    res.render("register/editUser", { layout: "dashboard", data: { id: req.params.user }})
})

router.get("/dashboard/:user/update", async (req, res) => {
    const userUid = (await usersCollection.doc(req.params.user).get()).data().uid;
    const userData = {};
    let updateEmail = false;
    let updateName = false;
    let updatePassword = false;

    if (req.query.userEmail != "") {
        userData.email = req.query.userEmail;
        updateEmail = true;
    }
    
    if (req.query.userName != "") {
        userData.name = req.query.userName;
        updateName = true;
    }
    
    if (req.query.userDescription != "") {
        userData.userDescription = req.query.userDescription;
    }

    if (req.query.passwd != "") {
        let password = Buffer.from(req.query.passwd.trim(), 'base64url').toString();

        userData.passwd = password;
        updatePassword = true;
    }

    if (updateEmail && updateName && updatePassword) {
        admin.auth().updateUser(userUid, {
            email: req.query.userEmail.trim(),
            displayName: req.query.userName,
            password: req.query.passwd
        });
    }
    else if (updateEmail && updateName) {
        admin.auth().updateUser(userUid, {
            email: req.query.userEmail.trim(),
            displayName: req.query.userName
        });
    }
    else if (updateEmail && updatePassword) {
        admin.auth().updateUser(userUid, {
            email: req.query.userEmail.trim(),
            password: req.query.passwd
        });
    }
    else if (updateName && updatePassword) {
        admin.auth().updateUser(userUid, {
            displayName: req.query.userName,
            password: req.query.passwd
        });
    }
    else if (updateName) {
        admin.auth().updateUser(userUid, {
            displayName: req.query.userName
        });
    }
    else if (updateEmail) {
        admin.auth().updateUser(userUid, {
            email: req.query.userEmail.trim()
        });
    }
    else if (updatePassword) {
        admin.auth().updateUser(userUid, {
            password: req.query.passwd
        });
    }
    else {
        res.redirect(`/dashboard/${req.params.user}`)
    }

    await usersCollection.doc(req.params.user).update(userData);    

    res.redirect(`/dashboard/${req.params.user}`);
})

router.get("/dashboard/:user/delete", async (req, res) => {
    res.render("register/delete", { layout: "dashboard", user: { id: req.params.user} });
})

router.get("/deleteUser/:user", async (req, res) => {
    const user = usersCollection.doc(req.params.user);

    const emailUser = (await user.get()).data().email;
    const uid = (await user.get()).data().uid;

    await comentsCollection.where("email", "==", emailUser).get().then((query) => {
        query.forEach(doc => {
            doc.ref.delete();
        });
    });

    await postsCollection.where("email", "==", emailUser).get().then((query) => {
        query.forEach(async doc => {
            comentsCollection.where("post", "==", doc.id).get().then((coments) => {
                coments.forEach(comment => {
                    comment.ref.delete();
                });
            });
            
            const dates = await dateCollection.where('date', '==', doc.data().date).get();

            dates.docs.map(day => {
                let data = {
                    times: day.data().times - 1
                }
                
                dateCollection.doc(day.id).update(data);
            })

            doc.ref.delete();
        });
    });

    await user.delete();

    await auth.deleteUser(uid);

    res.redirect("/");
})

router.get("/deletePost/:user/:email", async (req, res) => {
    const query = await postsCollection.where("email", "==", req.params.email).get();

    let post = query.docs.map(doc => ({
        touchId: req.params.user,
        ...doc.data()
    }));

    res.render("users/deletePost", { layout: "dashboard", user: { id: req.params.user }, post });
})

router.get("/deletePublication/:user/:id", async (req, res) => {
    const query = await comentsCollection.where("post", "==", req.params.id).get(); 
    const user = await usersCollection.doc(req.params.user).get();
    const post = await postsCollection.doc(req.params.id).get();
    const days = await dateCollection.where('date', '==', post.data().date).get();
    let likesPost = post.data().likes;
    let dislikesPost = post.data().dislikes;
    let dislikesComments = 0;
    let likesComments = 0;

    query.docs.map((doc)=> {
        dislikesComments = dislikesComments + doc.data().dislikes;
        likesComments = likesComments + doc.data().likes;

        doc.ref.delete();
    });

    days.docs.map(day => {
        let data = {
            times: day.data().times - 1
        }
        
        dateCollection.doc(day.id).update(data);
    });

    await postsCollection.doc(req.params.id).delete();

    let allLikes = dislikesComments + dislikesPost;
    let allDislikes = likesComments + likesPost;
    
    const dataUser = {
        publications: user.data().publications - 1,
        comments: user.data().comments - post.data().comments,
        totalLikes: user.data().totalLikes - allLikes,
        totalDislikes: user.data().totalDislikes - allDislikes
    };

    await usersCollection.doc(user.id).update(dataUser);

    res.redirect(`/loged/${req.params.user}`);
})

router.get("/deleteComment/:user", async (req, res) => {
    const dataUser = await usersCollection.doc(req.params.user).get();

    let email = dataUser.data().email;

    const comments = await comentsCollection.where("email", "==", email).get();

    let answers = comments.docs.map(doc => ({
        ...doc.data()
    }));

    res.render("users/deleteComent", { layout: "dashboard", user: { id: req.params.user }, answers });
})

router.get("/deleteComent/:user/:id", async (req, res) => {
    const dataComment = await comentsCollection.doc(req.params.id).get();
    let postId = dataComment.data().post;

    const dataUser = await usersCollection.doc(req.params.user).get();
    const dataPost = await postsCollection.doc(postId).get();

    const postInformation = {
        comments: dataPost.data().comments - 1
    }

    const userInformation = {
        comments: dataUser.data().comments - 1,
        totalLikes: dataUser.data().totalLikes - dataComment.data().likes,
        totalDislikes: dataUser.data().totalDislikes - dataComment.data().dislikes
    }

    await postsCollection.doc(postId).update(postInformation);
    
    await usersCollection.doc(req.params.user).update(userInformation);

    await comentsCollection.doc(req.params.id).delete();

    res.redirect(`/loged/${req.params.user}`);;
})

router.get("/search", async (req, res) => {
    const categories = await categoriesCollection.get();
    const dateDocs = await dateCollection.orderBy('date').get();

    const category = categories.docs.map(doc => ({
        name: doc.data().name
    }));

    dateDocs.docs.map(doc => {
        if (doc.data().times == 0) {
            doc.ref.delete();
        }
        else if (doc.data().times < 0) {
            return res.redirect("/DATE-COLLECTION-ERROR");
        }
    })

    const date = dateDocs.docs.map(doc => ({
        day: doc.data().date
    }));

    return res.render('search/search', { category, date });
})

router.get("/search/search", async (req, res) => {

    if (req.query.collection == "posts") {
        if (req.query.field == "undefined") {
            const query = await postsCollection.get();

            const post = query.docs.map(doc => ({
                ...doc.data()
            }));
            
            return res.render("search/resultSearch", { post });
        }
        else if (req.query.field == "userName" || req.query.field == "email" || req.query.field == "title" || req.query.field == "content") {
            const query = await postsCollection.orderBy(req.query.field).startAt(req.query.value).endAt(req.query.value + '\uf8ff').get()
            
            const post = query.docs.map(doc => ({
                ...doc.data()
            }));
            
            return res.render("search/resultSearch", { post });
        }
        else {
            const query = await postsCollection.where(req.query.field, req.query.operator, Number(req.query.value)).get();
            
            const post = query.docs.map(doc => ({
                ...doc.data()
            }));
            
            return res.render("search/resultSearch", { post });
        }
    }
    else if (req.query.collection == "category") {
        const query = await postsCollection.where(req.query.collection, "==", req.query.category).get();
            
            const post = query.docs.map(doc => ({
                ...doc.data()
            }));
            
        return res.render("search/resultSearch", { post });
    }
    else if (req.query.collection == "date") {
        const query = await postsCollection.where(req.query.collection, "==", req.query.actualDate).get();
            
        const post = query.docs.map(doc => ({
            ...doc.data()
        }));
        
        return res.render("search/resultSearch", { post });
    }
    else {
        console.log(req.query);
        return res.redirect("/NOT-FOUND/ERROR");
    }
})

router.get("/searchDashboard/:userId", async (req, res) => {
    const categories = await categoriesCollection.get();
    const dateDocs = await dateCollection.orderBy('date').get();

    dateDocs.docs.map(doc => {
        if (doc.data().times == 0) {
            doc.ref.delete();
        }
        else if (doc.data().times < 0) {
            return res.redirect("/DATE-COLLECTION-ERROR");
        }
    })

    const category = categories.docs.map(doc => ({
        name: doc.data().name
    }));

    const date = dateDocs.docs.map(doc => ({
        day: doc.data().date
    }));

    return res.render('search/searchDashboard', { layout: "dashboard", user: { id:req.params.userId }, category, date });
})

router.get("/searchDashboard/:userId/search", async (req, res) => {
    
    if (req.query.collection == "posts") {
        if (req.query.field == "undefined") {
            const query = await postsCollection.get();

            const post = query.docs.map(doc => ({
                touchId: req.params.user,
                ...doc.data()
            }));
            
            return res.render("search/resultSearchLoged", { layout: "dashboard", post, user: { id: req.params.userId }});
        }
        else if (req.query.field == "userName" || req.query.field == "email" || req.query.field == "title" || req.query.field == "content") {
            const query = await postsCollection.orderBy(req.query.field).startAt(req.query.value).endAt(req.query.value + '\uf8ff').get()
            
            const post = query.docs.map(doc => ({
                touchId: req.params.user,
                ...doc.data()
            }));
            
            return res.render("search/resultSearchLoged", { layout: "dashboard", post, user: { id: req.params.userId }});
        }
        else {
            const query = await postsCollection.where(req.query.field, req.query.operator, Number(req.query.value)).get();
            
            const post = query.docs.map(doc => ({
                touchId: req.params.user,
                ...doc.data()
            }));
            
            return res.render("search/resultSearchLoged", { layout: "dashboard", post, user: { id: req.params.userId }});
        }
    }
    else if (req.query.collection == "users") {
        if (req.query.field == "undefined") {
            const query = await usersCollection.get();

            const searchUser = query.docs.map(doc => ({
                ...doc.data()
            }));
            
            return res.render("search/resultSearchLoged", { layout: "dashboard", searchUser, user: { id: req.params.userId }});
        }
        else if (req.query.field == "name" || req.query.field == "email" || req.query.field == "userDescription") {
            const query = await usersCollection.orderBy(req.query.field).startAt(req.query.value).endAt(req.query.value + '\uf8ff').get()
            
            const searchUser = query.docs.map(doc => ({
                ...doc.data()
            }));
            
            return res.render("search/resultSearchLoged", { layout: "dashboard", searchUser, user: { id: req.params.userId }});
        }
        else {
            const query = await usersCollection.where(req.query.field, req.query.operator, Number(req.query.value)).get();
            
            const searchUser = query.docs.map(doc => ({
                ...doc.data()
            }));
            
            return res.render("search/resultSearchLoged", { layout: "dashboard", searchUser, user: { id: req.params.userId }});
        }
    }
    else if (req.query.collection == "category") {
        const query = await postsCollection.where(req.query.collection, "==", req.query.category).get();
            
            const post = query.docs.map(doc => ({
                touchId: req.params.user,
                ...doc.data()
            }));
            
        return res.render("search/resultSearchLoged", { layout: "dashboard", post, user: { id: req.params.userId }});
    }
    else if (req.query.collection == "date") {
        const query = await postsCollection.where(req.query.collection, "==", req.query.actualDate).get();
            
        const post = query.docs.map(doc => ({
            touchId: req.params.user,
            ...doc.data()
        }));
        
        return res.render("search/resultSearchLoged", { layout: "dashboard", post, user: { id: req.params.userId }});
    }
    else {
        console.log(req.query);
        return res.redirect("/NOT-FOUND/ERROR");
    }
})

router.get("/like/:user/publication/:id/user/:userId", async (req, res) => {
    let userInformation = await usersCollection.doc(req.params.user).get();
    let publicationInformation = await postsCollection.doc(req.params.id).get();

    let doc = {
        totalLikes: userInformation.data().totalLikes + 1
    }

    let post = {
        likes: publicationInformation.data().likes + 1
    }

    await usersCollection.doc(req.params.user).update(doc);
    
    await postsCollection.doc(req.params.id).update(post);

    res.redirect(`/loged/${req.params.userId}`);
})

router.get("/dislike/:user/publication/:id/user/:userId", async (req, res) => {
    let userInformation = await usersCollection.doc(req.params.user).get();
    let publicationInformation = await postsCollection.doc(req.params.id).get();

    let doc = {
        totalDislikes: userInformation.data().totalDislikes + 1
    }

    let post = {
        dislikes: publicationInformation.data().dislikes + 1
    }

    await usersCollection.doc(req.params.user).update(doc);
    
    await postsCollection.doc(req.params.id).update(post);

    res.redirect(`/loged/${req.params.userId}`);
})

router.get("/like/:user/comment/:id/user/:userId", async (req, res) => {
    let userInformation = await usersCollection.doc(req.params.user).get();
    let comentInformation = await comentsCollection.doc(req.params.id).get();

    let doc = {
        totalLikes: userInformation.data().totalLikes + 1
    }

    let comment = {
        likes: comentInformation.data().likes + 1
    }

    await usersCollection.doc(req.params.user).update(doc);
    
    await comentsCollection.doc(req.params.id).update(comment);

    res.redirect(`/loged/${req.params.userId}`);
})

router.get("/dislike/:user/comment/:id/user/:userId", async (req, res) => {
    let userInformation = await usersCollection.doc(req.params.user).get();
    let comsntInformation = await comentsCollection.doc(req.params.id).get();

    let doc = {
        totalDislikes: userInformation.data().totalDislikes + 1
    }

    let comment = {
        dislikes: comsntInformation.data().dislikes + 1
    }

    await usersCollection.doc(req.params.user).update(doc);
    
    await comentsCollection.doc(req.params.id).update(comment);

    res.redirect(`/loged/${req.params.userId}`);
})

router.get("/admin", async (req, res) => {
    res.render("register/admin", { layout: "admin" });
})

router.get(`/search/${adminId}`, async (req, res) => {
    const dateDocs = await dateCollection.get();
    const categoryDocs = await categoriesCollection.get();

    dateDocs.docs.map(doc => {
        if (doc.data().times == 0) {
            doc.ref.delete();
        }
        else if (doc.data().times < 0) {
            return res.redirect("/DATE-COLLECTION-ERROR");
        }
    })

    const dates = dateDocs.docs.map(doc => ({
        ...doc.data()
    }))

    const categories = categoryDocs.docs.map(doc => ({
        ...doc.data()
    }))

    res.render("search/searchAdmin", { layout: "admin", dates, categories, admin: { id: adminId } });
})

router.get(`/search/${adminId}/search`, async (req, res) => {
    
    if (req.query.collection == "posts") {
        if (req.query.field == "undefined") {
            const query = await postsCollection.get();

            const posts = query.docs.map(doc => ({
                ...doc.data()
            }));
            
            return res.render("search/resultSearchAdmin", { layout: "admin", posts, admin: { id: adminId } });
        }
        else if (req.query.field == "userName" || req.query.field == "email" || req.query.field == "title" || req.query.field == "content") {
            const query = await postsCollection.orderBy(req.query.field).startAt(req.query.value).endAt(req.query.value + '\uf8ff').get()
            
            const posts = query.docs.map(doc => ({
                ...doc.data()
            }));
            
            return res.render("search/resultSearchAdmin", { layout: "admin", posts, admin: { id: adminId } });
        }
        else {
            const query = await postsCollection.where(req.query.field, req.query.operator, Number(req.query.value)).get();
            
            const posts = query.docs.map(doc => ({
                ...doc.data()
            }));
            
            return res.render("search/resultSearchAdmin", { layout: "admin", posts, admin: { id: adminId } });
        }
    }
    else if (req.query.collection == "users") {
        if (req.query.field == "undefined") {
            const query = await usersCollection.get();

            const users = query.docs.map(doc => ({
                ...doc.data()
            }));
            
            return res.render("search/resultSearchAdmin", { layout: "admin", users, admin: { id: adminId } });
        }
        else if (req.query.field == "name" || req.query.field == "email" || req.query.field == "userDescription") {
            const query = await usersCollection.orderBy(req.query.field).startAt(req.query.value).endAt(req.query.value + '\uf8ff').get()
            
            const users = query.docs.map(doc => ({
                ...doc.data()
            }));
            
            return res.render("search/resultSearchAdmin", { layout: "admin", users, admin: { id: adminId } });
        }
        else {
            const query = await usersCollection.where(req.query.field, req.query.operator, Number(req.query.value)).get();
            
            const users = query.docs.map(doc => ({
                ...doc.data()
            }));
            
            return res.render("search/resultSearchAdmin", { layout: "admin", users, admin: { id: adminId } });
        }
    }
    else if (req.query.collection == "category") {
        const query = await categoriesCollection.where("name", "==", req.query.category).get();
            
        const categories = query.docs.map(doc => ({
            ...doc.data()
        }));
        
        return res.render("search/resultSearchAdmin", { layout: "admin", categories, admin: { id: adminId } });
    }
    else if (req.query.collection == "date") {
        const query = await dateCollection.where("date", "==", req.query.actualDate).get();
            
        const dates = query.docs.map(doc => ({
            ...doc.data()
        }));
        
        return res.render("search/resultSearchAdmin", { layout: "admin", dates, admin: { id: adminId } });
    }
    else {
        console.log(req.query);
        return res.redirect("/NOT-FOUND/ERROR");
    }
})

router.get(`/users/${adminId}`, async (req, res) => {
    const query = await usersCollection.get();

    const users = query.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    res.render("admin/seeCollection", { layout: "admin", users, admin: { id: adminId } });
})

router.get(`/posts/${adminId}`, async (req, res) => {
    const query = await postsCollection.get();

    const posts = query.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))

    res.render("admin/seeCollection", { layout: "admin", posts, admin: { id: adminId } });
})

router.get(`/comments/${adminId}`, async (req, res) => {
    const query = await comentsCollection.get();

    const comments = query.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))

    res.render("admin/seeCollection", { layout: "admin", comments, admin: { id: adminId } });
})

router.get(`/categories/${adminId}`, async (req, res) => {
    const query = await categoriesCollection.get();

    const categories = query.docs.map(doc =>({
        id: doc.id,
        ...doc.data()
    }))

    res.render("admin/seeCollection", { layout: "admin", categories, admin: { id: adminId } });
})

router.get(`/dates/${adminId}`, async (req, res) => {
    const query = await dateCollection.get();

    const dates = query.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))

    res.render("admin/seeCollection", { layout: "admin", dates, admin: { id: adminId } });
})

router.get(`/users/${adminId}/edit`, async (req, res) => {
    const users = await usersCollection.get();
    let counter = 0;

    const user = users.docs.map(doc => ({
        ...doc.data()
    }))

    user.forEach(doc => {
        doc.counter = counter;
        counter++;
    })

    res.render("admin/editUsers", { layout: "admin", user, admin: { id: adminId } });
})

router.get(`/posts/${adminId}/edit`, async (req, res) => {
    const query = await postsCollection.get();
    let counter = 0;

    const post = query.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))

    post.forEach(doc => {
        doc.counter = counter;
        counter++;
    })

    res.render("admin/editPosts", { layout: "admin", post, admin: { id: adminId } });
})

router.get(`/comments/${adminId}/edit`, async (req, res) => {
    const comments = await comentsCollection.get();

    let counter = 0;

    const comment = comments.docs.map(doc => ({
        ...doc.data()
    }))

    comment.forEach(doc => {
        doc.counter = counter;
        counter++;
    })

    res.render("admin/editComments", { layout: "admin", comment, admin: { id: adminId } });
})

router.get(`/categories/${adminId}/edit`, async (req, res) => {
    const categories = await categoriesCollection.get();
    let counter = 0;

    const category = categories.docs.map(doc => ({
        ...doc.data()
    }))

    category.forEach(doc => {
        doc.counter = counter;
        counter++;
    })

    res.render("admin/editCategories", { layout: "admin", category, admin: { id: adminId } });
})

router.get(`/dates/${adminId}/edit`, async (req, res) => {
    const queryDates = await dateCollection.get();
    let counter = 0;

    const dates = queryDates.docs.map(doc => ({
        ...doc.data()
    }))

    dates.forEach(doc => {
        doc.counter = counter;
        counter++;
    })

    res.render("admin/editDates", { layout: "admin", dates, admin: { id: adminId } });
})

router.get(`/users/${adminId}/edit/:id`, async (req, res) => {
    const userData = await usersCollection.doc(req.params.id).get();

    res.render("admin/edit/users", { layout: "admin", doc: { ...userData.data() }, admin: { id: adminId } });
})

router.get(`/posts/${adminId}/edit/:id`, async (req, res) => {
    const queryDate = await dateCollection.get();
    const queryCategory = await categoriesCollection.get();
    const users = await usersCollection.get();
    const posts = await postsCollection.doc(req.params.id).get();

    const dates = queryDate.docs.map(doc => ({
        ...doc.data()
    }))

    const categories = queryCategory.docs.map(doc => ({
        ...doc.data()
    }))

    const user = users.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
    }))

    res.render("admin/edit/posts", { layout: "admin", doc: { ...posts.data() }, dates, categories, user, admin: { id: adminId } });
})

router.get(`/comments/${adminId}/edit/:id`, async (req, res) => {
    const comments = await comentsCollection.doc(req.params.id).get();
    const posts = await postsCollection.get();
    const users = await usersCollection.get();

    const post = posts.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title
    }))

    const user = users.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        email: doc.data().email
    }))

    res.render("admin/edit/comments", { layout: "admin", doc: { ...comments.data() }, post, user, admin: { id: adminId } });
})

router.get(`/categories/${adminId}/edit/:id`, async (req, res) => {
    const category = await categoriesCollection.doc(req.params.id).get();

    res.render("admin/edit/categories", { layout: "admin", doc: { ...category.data() }, admin: { id: adminId } });
})

router.get(`/dates/${adminId}/edit/:id`, async (req, res) => {
    const data = await categoriesCollection.doc(req.params.id).get();

    res.render("admin/edit/dates", { layout: "admin", doc: { id: req.params.id ,...data.data() }, admin: { id: adminId } });
})

router.get(`/users/${adminId}/update/:id`, async (req, res) => {
    const userData = {};
    let changeId = false;
    let userImg = "";

    if (req.query.email != '') {
        userData.email = req.query.email;
    }

    if (req.query.name != '') {
        userData.name = req.query.name;
    }

    if (req.query.userDescription != '') {
        userData.userDescription = req.query.userDescription;
    }

    if (req.query.id != '') {
        userData.id = req.query.id;
        changeId = true;
    }

    if (req.query.passwd != '') {
        userData.passwd = req.query.passwd;
    }

    if (req.query.publications != '') {
        userData.publications = Number(req.query.publications);
    }

    if (req.query.comments != '') {
        userData.comments = Number(req.query.comments);
    }

    if (req.query.totalLikes != '') {
        userData.totalLikes = Number(req.query.totalLikes);
    }

    if (req.query.totalDislikes != '') {
        userData.totalDislikes = Number(req.query.totalDislikes);
    }

    if (req.query.image != "") {
        let randomTocken = uuid();

        await storage.bucket().upload(`${req.query.image}`, {
            destination: `profileImg/${req.query.image}`,
            metadata: {
                cacheControl: "max-age=31536000",

                metadata: {
                firebaseStorageDownloadTokens: randomTocken,
                },
            },
            });
        
        userImg = `https://firebasestorage.googleapis.com/v0/b/pkmnut-b8812.appspot.com/o/profileImg%2F${req.query.image}?alt=media&token=${randomTocken}`;
    }
    else {
        userImg = "https://firebasestorage.googleapis.com/v0/b/pkmnut-b8812.appspot.com/o/profileImg%2Fperson-circle.svg?alt=media&token=77d7e8f3-1909-4abb-96e9-f273741b2d86";
    }

    userData.image = userImg;

    if (changeId) {
        usersCollection.doc(req.params.id).delete();
        usersCollection.doc(req.query.id).set(userData);
    }
    else {
        usersCollection.doc(req.params.id).update(userData);
    }

    res.redirect(`/users/${adminId}`);
})

router.get(`/posts/${adminId}/update/:id`, async (req, res) => {
    const postData = {};

    let changeId = false;

    if (req.query.title != '') {
        postData.title = req.query.title;
    }

    if (req.query.content != '') {
        postData.content = req.query.content;
    }
    
    if (req.query.media != '') {
        let randomTocken = uuid();

        await storage.bucket().upload(`${req.query.media}`, {
            destination: `profileImg/${req.query.media}`,
            metadata: {
                cacheControl: "max-age=31536000",

                metadata: {
                firebaseStorageDownloadTokens: randomTocken,
                },
            },
            });
        
        userImg = `https://firebasestorage.googleapis.com/v0/b/pkmnut-b8812.appspot.com/o/profileImg%2F${req.query.media}?alt=media&token=${randomTocken}`;
        
        if (req.query.mediaAlt != '') {
            postData.mediAlt = req.query.mediaAlt;
        }
    }

    if (req.query.id != '') {
        postData.id = req.query.id;
        changeId = true;
    }

    if (req.query.userId != "none") {
        postData.userId = req.query.userId;
    }
    
    if (req.query.category != "none") {
        postData.category = req.query.category;
    }
    
    if (req.query.date != "none") {
        postData.date = req.query.date;
    }

    if (req.query.email != "none") {
        postData.email = req.query.email;
    }
    
    if (req.query.userName != "none") {
        postData.userName = req.query.userName;
    }

    if (req.query.comments != '') {
        postData.comments = Number(req.query.comments);
    }

    if (req.query.likes != '') {
        postData.likes = Number(req.query.likes);
    }

    if (req.query.dislikes != '') {
        postData.dislikes = Number(req.query.dislikes);
    }

    if (changeId) {
        postsCollection.doc(req.params.id).delete();
        postsCollection.doc(req.query.id).set(postData);
    }
    else {
        postsCollection.doc(req.params.id).update(postData);
    }

    res.redirect(`/posts/${adminId}`);
})

router.get(`/comments/${adminId}/update/:id`, async (req, res) => {
    const comentData = {}
    let changeId = false;

    if (req.query.content != "") {
        comentData.content = req.query.content;
    }

    if (req.query.id != '') {
        comentData.id = req.query.id;
        changeId = true;
    }

    if (req.query.post != "none") {
        comentData.post = req.query.post;
    }

    if (req.query.userId != "none") {
        comentData.userId = req.query.userId;
    }

    if (req.query.userName != 'none') {
        comentData.userName = req.query.userName;
    }

    if (req.query.email != 'none') {
        comentData.email = req.query.email;
    }

    if (req.query.likes != '') {
        comentData.likes = Number(req.query.likes);
    }

    if (req.query.dislikes != '') {
        comentData.dislikes = Number(req.query.dislikes);
    }

    if (changeId) {
        comentsCollection.doc(req.params.id).delete();
        comentsCollection.doc(req.query.id).set(comentData);
    }
    else {
        comentsCollection.doc(req.params.id).update(comentData);
    }

    res.redirect(`/comments/${adminId}`);
})

router.get(`/categories/${adminId}/update/:id`, async (req, res) => {
    const category = {};
    let changeId = false;

    if (req.query.name != "") {
        category.name = req.query.name;
    }

    if (req.query.id != "") {
        category.id = req.query.id;
        changeId = true;
    }

    if (changeId) {
        categoriesCollection.doc(req.params.id).delete();
        categoriesCollection.doc(req.query.id).set(category);
    }
    else {
        categoriesCollection.doc(req.params.id).update(category);
    }

    res.redirect(`/categories/${adminId}`);
})

router.get(`/dates/${adminId}/update/:id`, async (req, res) => {
    const data = {}
    let changeId = false;

    if (req.query.date != "") {
        data.date = req.query.date;
    }

    if (req.query.times != "") {
        data.times = Number(req.query.times);
    }

    if (req.query.id != "") {
        data.id = req.query.id;
        changeId = true;
    }

    if (changeId) {
        dateCollection.doc(req.params.id).delete();
        dateCollection.doc(req.query.id).set(data);
    }
    else {
        dateCollection.doc(req.params.id).update(data);
    }

    res.redirect(`/dates/${adminId}`);
})

router.get(`/users/${adminId}/delete/:id`, async (req, res) => {
    const user = usersCollection.doc(req.params.id);

    const emailUser = (await user.get()).data().email;
    const uid = (await user.get()).data().uid;

    await comentsCollection.where("email", "==", emailUser).get().then((query) => {
        query.forEach(doc => {
            doc.ref.delete();
        });
    });

    await postsCollection.where("email", "==", emailUser).get().then((query) => {
        query.forEach(async doc => {
            comentsCollection.where("post", "==", doc.id).get().then((coments) => {
                coments.forEach(comment => {
                    comment.ref.delete();
                });
            });
            
            const dates = await dateCollection.where('date', '==', doc.data().date).get();

            dates.docs.map(day => {
                let data = {
                    times: day.data().times - 1
                }
                
                dateCollection.doc(day.id).update(data);
            })

            doc.ref.delete();
        });
    });

    await user.delete();

    await auth.deleteUser(uid);

    res.redirect(`/users/${adminId}`);
})

router.get(`/posts/${adminId}/delete/:id`, async (req, res) => {
    const query = await comentsCollection.where("post", "==", req.params.id).get(); 
    const post = await postsCollection.doc(req.params.id).get();
    const user = await usersCollection.doc(post.data().userId).get();
    const days = await dateCollection.where('date', '==', post.data().date).get();
    let likesPost = post.data().likes;
    let dislikesPost = post.data().dislikes;
    let dislikesComments = 0;
    let likesComments = 0;

    query.docs.map((doc)=> {
        dislikesComments = dislikesComments + doc.data().dislikes;
        likesComments = likesComments + doc.data().likes;

        doc.ref.delete();
    });

    days.docs.map(day => {
        let data = {
            times: day.data().times - 1
        }
        
        dateCollection.doc(day.id).update(data);
    });

    await postsCollection.doc(req.params.id).delete();

    let allLikes = dislikesComments + dislikesPost;
    let allDislikes = likesComments + likesPost;
    
    const dataUser = {
        publications: user.data().publications - 1,
        comments: user.data().comments - post.data().comments,
        totalLikes: user.data().totalLikes - allLikes,
        totalDislikes: user.data().totalDislikes - allDislikes
    };

    await usersCollection.doc(user.id).update(dataUser);

    res.redirect(`/posts/${adminId}`);
})

router.get(`/comments/${adminId}/delete/:id`, async (req, res) => {
    const dataComment = await comentsCollection.doc(req.params.id).get();
    let userId = dataComment.data().userId;
    let postId = dataComment.data().post;

    const dataUser = await usersCollection.doc(userId).get();
    const dataPost = await postsCollection.doc(postId).get();

    const postInformation = {
        comments: dataPost.data().comments - 1
    }

    const userInformation = {
        comments: dataUser.data().comments - 1,
        totalLikes: dataUser.data().totalLikes - dataComment.data().likes,
        totalDislikes: dataUser.data().totalDislikes - dataComment.data().dislikes
    }

    await postsCollection.doc(postId).update(postInformation);
    
    await usersCollection.doc(userId).update(userInformation);

    await comentsCollection.doc(req.params.id).delete();

    res.redirect(`/comments/${adminId}`);
})

router.get(`/categories/${adminId}/delete/:id`, async (req, res) => {
    await categoriesCollection.doc(req.params.id).delete();

    res.redirect(`/categories/${adminId}`);
})

router.get(`/dates/${adminId}/delete/:id`, async (req, res) => {
    await dateCollection.doc(req.params.id).delete();

    res.redirect(`/dates/${adminId}`);
})

router.get(`/posts/${adminId}/create`, async (req, res) => {
    const queryDates = await dateCollection.get();
    const queryUsers = await usersCollection.get();
    const queryCategories = await categoriesCollection.get();

    const categories = queryCategories.docs.map(doc => ({
        ...doc.data()
    }))

    const dates = queryDates.docs.map(doc => ({
        ...doc.data()
    }))

    const user = queryUsers.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        email: doc.data().email
    }))

    res.render("admin/create/posts", { layout: "admin", categories, dates, user, admin: { id: adminId } });
})

router.get(`/comments/${adminId}/create`, async (req, res) => {
    const users = await usersCollection.get();
    const posts = await postsCollection.get();

    const user = users.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        email: doc.data().email
    }))

    const post = posts.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title
    }))

    res.render("admin/create/comments", { layout: "admin", post, user, admin: { id: adminId } });
})

router.get(`/users/${adminId}/create`, async (req, res) => {
    res.render("admin/create/users", { layout: "admin", admin: { id: adminId } });
})

router.get(`/categories/${adminId}/create`, async (req, res) => {
    res.render("admin/create/categories", { layout: "admin", admin: { id: adminId } });
})

router.get(`/dates/${adminId}/create`, async (req, res) => {
    res.render("admin/create/dates", { layout: "admin", admin: { id: adminId } });
})

router.get(`/posts/${adminId}/create/send`, async (req, res) => {
    let changeId = false;

    const postData = {
        category: req.query.category,
        date: req.query.date,
        title: req.query.title,
        content: req.query.content,
        userId: req.query.userId,
        email: req.query.email,
        userName: req.query.userName,
        likes: 0,
        dislikes: 0,
        comments: 0
    }

    if (req.query.media != '') {
        let randomTocken = uuid();

        await storage.bucket().upload(`${req.query.media}`, {
            destination: `profileImg/${req.query.media}`,
            metadata: {
                cacheControl: "max-age=31536000",

                metadata: {
                firebaseStorageDownloadTokens: randomTocken,
                },
            },
            });
        
        userImg = `https://firebasestorage.googleapis.com/v0/b/pkmnut-b8812.appspot.com/o/profileImg%2F${req.query.media}?alt=media&token=${randomTocken}`;
        
        if (req.query.mediaAlt != '') {
            postData.mediAlt = req.query.mediaAlt;
        }
    }

    if (req.query.id != '') {
        postData.id = req.query.id;
        changeId = true;
    }

    if (req.query.comments != '') {
        postData.comments = Number(req.query.comments);
    }

    if (req.query.likes != '') {
        postData.likes = Number(req.query.likes);
    }

    if (req.query.dislikes != '') {
        postData.dislikes = Number(req.query.dislikes);
    }

    if (changeId) {
        await postsCollection.doc(req.query.id).set(postData);
    }
    else {
        let randomId = uuid();
        postData.id = randomId;
        await postsCollection.doc(randomId).set(postData);
    }

    res.redirect(`/posts/${adminId}`);
})

router.get(`/comments/${adminId}/create/send`, async (req, res) => {
    const dataComment = {
        content: req.query.content,
        post: req.query.post,
        userId: req.query.userId,
        userName: req.query.userName,
        email: req.query.email,
        likes: 0,
        dislikes: 0
    }

    if (req.query.likes != '') {
        dataComment.likes = Number(req.query.likes);
    }
    
    if (req.query.dislikes != '') {
        dataComment.dislikes = Number(req.query.dislikes);
    }

    if (req.query.id != '') {
        dataComment.id = req.query.id;
        await comentsCollection.doc(req.query.id).set(dataComment);
    }
    else {
        let randomId = uuid();
        dataComment.id = randomId;
        await comentsCollection.doc(randomId).set(dataComment);
    }

    res.redirect(`/comments/${adminId}`);
})

router.get(`/users/${adminId}/create/send`, async (req, res) => {
    let changeId = false;
    let password = Buffer.from(req.query.passwd.trim(), 'base64url').toString();
    const dataUser = {
        email: req.query.email,
        name: req.query.name,
        passwd: password,
        userDescription: "",
        publications: 0,
        comments: 0,
        totalLikes: 0,
        totalDislikes: 0,
    }

    if (req.query.id != '') {
        changeId = true;
        dataUser.id = req.query.id;
    }

    if (req.query.userDescription != '') {
        dataUser.userDescription = req.query.userDescription;
    }

    if (req.query.publications != '') {
        dataUser.publications = Number(req.query.publications);
    }

    if (req.query.comments != '') {
        dataUser.comments = Number(req.query.comments);
    }

    if (req.query.totalLikes != '') {
        dataUser.totalLikes = Number(req.query.totalLikes);
    }

    if (req.query.totalDislikes != '') {
        dataUser.totalDislikes = Number(req.query.totalDislikes);
    }

    if (req.query.image != '') {
        let randomTocken = uuid();

        await storage.bucket().upload(`${req.query.image}`, {
            destination: `profileImg/${req.query.image}`,
            metadata: {
                cacheControl: "max-age=31536000",

                metadata: {
                firebaseStorageDownloadTokens: randomTocken,
                },
            },
            });
        
        userImg = `https://firebasestorage.googleapis.com/v0/b/pkmnut-b8812.appspot.com/o/profileImg%2F${req.query.image}?alt=media&token=${randomTocken}`;
    }
    else {
        userImg = 'https://firebasestorage.googleapis.com/v0/b/pkmnut-b8812.appspot.com/o/profileImg%2Fperson-circle.svg?alt=media&token=77d7e8f3-1909-4abb-96e9-f273741b2d86';
    }

    dataUser.image = userImg;

    if (changeId) {
        await usersCollection.doc(req.query.id).set(dataUser);
    }
    else {
        let randomId = uuid();
        dataUser.id = randomId;
        await usersCollection.doc(randomId).set(dataUser);
    }

    await auth.createUser({
        email: req.query.email.trim(),
        password: req.query.passwd,
        displayName: req.query.userName
    });

    res.redirect(`/users/${adminId}`);
})

router.get(`/categories/${adminId}/create/send`, async (req, res) => {
    const dataCategory = {
        name: req.query.name
    }

    if (req.query.id != '') {
        dataCategory.id = req.query.id;
        await categoriesCollection.doc(req.query.id).set(dataCategory);
    }
    else {
        let randomId = uuid();
        dataCategory.id = randomId;
        await categoriesCollection.doc(randomId).set(dataCategory);
    }

    res.redirect(`/categories/${adminId}`)
})

router.get(`/dates/${adminId}/create/send`, async (req, res) => {
    const dateDoc = {
        date: req.query.date,
        times: Number(req.query.times)
    }

    if (req.query.id != '') {
        dateDoc.id = req.query.id;
        await dateCollection.doc(req.query.id).set(dateDoc);
    }
    else {
        let randomId = uuid();
        dateDoc.id = randomId;
        await dateCollection.doc(randomId).set(dateDoc);
    }

    res.redirect(`/dates/${adminId}`);
})

router.get("/admin/register", async (req, res) => {
    if (req.query.passwd == adminPassword && req.query.name == adminName) {
        return res.redirect(`/${adminId}`);
    }
    else {
        return res.redirect("/");
    }
})

router.get(`/${adminId}`, async (req, res) => {
    res.render("admin/main", { layout: "admin", admin: { id: adminId } })
})

module.exports = router;