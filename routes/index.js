const { Router } = require('express');
const db = require('../config.js');


const router = Router();

//Principal page
router.get("/", async (req, res) => {
    const query = await db.collection("posts").get();

    const post = query.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }))

    res.render("posts", { post });
})

//More info of a post
router.get("/publication/:id", async (req, res) => {
    const publication = await db.collection("posts").where('id', '==', req.params.id).get();
    const query = await db.collection("coments").where('post', '==', req.params.id).get();

    let post = publication.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))
    
    let comments = query.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))

    console.log(post);
    console.log(comments);

    res.render("comments", { post, comments });
})

//Users utilities
router.get("/register", async (req, res) => {

})

router.post("/newUser", async (req, res) => {
    res.redirect("/");
})

router.get("/dashboard", async (req, res) => {

})

router.get("/dashboard/:user", async (req, res) => {

})

router.get("/dashboard/:user/edit", async (req, res) => {

})

router.post("/dashboard/:user/update", async (req, res) => {
    res.redirect("/dashboard/:user");
})

router.post("/dashboard/:user/delete", async (req, res) => {
    res.redirect("/");
})

//Post utilities
router.get("/createPost/:user", async (req, res) => {

})

router.post("/newPost", async (res, req) => {
    res.redirect("/:post");
})

router.get("/editPost/:id", async (res,req) => {

})

router.post("/updatePost", async (req, res) => {
    res.redirect("/:post");
})

router.post("/deletePost/:id", async (req, res) => {
    res.redirect("/");
})

//Comments utlities
router.post("/createComment", async (req, res) => {
    res.redirect("/:post");
})

router.get("/editComment/:id", async (req, res) => {

})

router.post("/updateComment", async (req, res) => {
    res.redirect("/:post");
})

router.post("/deleteComment/:id", async (req, res) => {
    res.redirect("/:post");
})

//Search utilities
router.get("/search/posts", async (req, res) => {

})

router.get("/search/users", async (req, res) => {

})

module.exports = router