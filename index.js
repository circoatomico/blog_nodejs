const express    = require("express")
const app        = express()
const bodyParser = require("body-parser")
const session    = require("express-session")
const connection = require('./database/database')

// Body Parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Session
app.use(session({
    secret: "6ZMG#jL%Cm&o",
    cookie: {
        maxAge: 1200000
    }
}))

const categoriesController = require("./categories/CategoriesController")
const articlesController = require("./articles/ArticlesController")
const usersController = require("./users/UsersController")

const Article  = require("./articles/Article")
const Category = require("./categories/Category");
const User     = require("./users/User");

const { render } = require("ejs");

app.use("/",articlesController)
app.use("/",categoriesController)
app.use("/",usersController)

// View Engine
app.set('view engine', 'ejs')

// Static
// Qualquer arquivo estático será buscado automaticamente no diretório public/
app.use(express.static('public'));

// Database
connection
    .authenticate()
    .then(() => {
        console.log("connected")
    }).catch((error) => {
        console.log("not connected")
    })

app.get('/', (req, res) => {

    Article.findAll({
        order: [
            [ 'id','DESC']
        ], limit: 4
    }).then(articles => {

        Category.findAll().then(categories => {
            res.render("index", {articles: articles, categories: categories})            
        })

    })

})

app.get('/:slug', (req, res) => {
    var slug = req.params.slug

    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if (article != undefined) {
            Category.findAll().then(categories => {
                res.render("article", {article: article, categories: categories})            
            })            
        } else {
            res.redirect("/")
        }
    }).catch( err => {
        res.redirect("/")
    })
})

app.get("/category/:slug", (req, res) => {
    var slug = req.params.slug
    Category.findOne({
        where: {
            slug: slug
        },
        include: [{model: Article}]
    }).then(category => {
        if (category != undefined) {

            Category.findAll().then(categories => {
                res.render("index", {articles: category.articles, categories: categories})
            })

        } else {
            res.redirect("/")
        }
    }).catch( err => {
        res.redirect("/")
    })
})

app.listen(8080, () => {
    
})