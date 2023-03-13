const { Router } = require('express');
const db = require('../config.js');

const router = Router();

router.get("/", async (req, res) => {

    console.log("XD");

    const query = await db.collection("posts").get();

    const post = query.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }))

    res.render("index", { post })
})

router.post("/createPost", async (req, res) => {

    await db.collection('posts').add({
        title: req.body.title
    })

    res.redirect("/")
})

router.get("/editPost/:id", async (req, res) => {

    const doc = await db.collection('posts').doc(req.params.id).get();

    res.render("index", { editPost: { id: doc.id, ...doc.data() } })
})

router.post("/updatePost/:id", async (req, res) => {

    await db.collection('posts').doc(req.params.id).update();

    res.redirect("/")

})

router.get("/deletePost/:id", async (req, res) => {

    await db.collection('posts').doc(req.params.id).delete();

    res.redirect("/")
})

module.exports = router