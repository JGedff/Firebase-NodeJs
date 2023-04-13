const exphbs = require('express-handlebars');
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const app = express();

app.set('views', path.join(__dirname, './views'))
app.engine('.hbs', exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs'
}).engine)

app.set('view engine', '.hbs')

app.use(morgan('dev'));
app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(require("./routes/index.js"));

app.use((req, res) => {
    res.status(404);
  
    // respond with html page
    if (req.accepts('html')) {
        return res.render("layouts/notFound", { layout: "notFound", url: req.url });
    }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "js")));
app.use(express.static(path.join(__dirname, "css")));

module.exports = app