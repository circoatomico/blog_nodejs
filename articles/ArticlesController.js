const express  = require("express");
const Category = require("../categories/Category");
const Article  = require("../articles/Article");
const slugify  = require("slugify")
const adminAuth = require('../middlewares/adminAuth')


const router = express.Router();

router.get("/admin/articles", adminAuth, (req, res) => {

    Article.findAll({
        include: [{model: Category}]
    }).then( articles => {
        res.render("admin/articles/index", {articles: articles})
    })
})

router.get("/admin/articles/new", adminAuth, (req, res) => {
    
    Category.findAll().then( categories => {
        res.render("admin/articles/new", {categories: categories})
    })
    
})

router.post("/articles/save", adminAuth, (req, res) => {
    var title    = req.body.title
    var body     = req.body.body
    var category = req.body.category

    Article.create({
        title: title,
        slug: slugify(title),
        body: body,
        categoryId: category
    }).then(() => {
        res.redirect('/admin/articles')
    })
})

router.post("/admin/articles/update", adminAuth, (req, res) => {

    var id         = req.body.id
    var title      = req.body.title
    var body       = req.body.body
    var categoryId = req.body.category

    if (isNaN(id)) {
        res.redirect("/admin/articles")
    }

    Article.update({
        title: title, 
        slug: slugify(title), 
        body: body, 
        categoryId: categoryId
    },{
        where: {
            id: id
        }
    }).then( () => {
       res.redirect("/admin/articles")
    })


})

router.post("/admin/articles/edit", adminAuth, (req, res) => {

    var id = req.body.id

    Article.findByPk(id).then(article => {
        if (article != undefined) {

            Category.findAll().then(categories => {
                res.render('admin/articles/edit', 
                    {article: article, categories: categories}
                )
            })
        } else {
            res.redirect('/')
        }
    }).catch( err => {
        res.redirect("/")
    })

})

router.post("/articles/delete", (req, res) => {
    
    var id = req.body.id

    if (id != undefined) {
        if (!isNaN(id)) {
            Article.destroy({
                where: {
                    id: id
                }
            }).then( () => {
                res.redirect("/admin/articles")
            })
        } else {
            res.redirect("/admin/articles")
        }
    } else {
        res.redirect("/admin/articles")
    }

})

router.get("/articles/page/:num", (req, res) => {

    var page = req.params.num
    var offset = 0
    var offsetCount = 0
    
    if (isNaN(page) || page == 1) {
        offset  = 0
        offsetCount = 0
    } else {
        offset = ( parseInt(page) * 4 ) - 4
        offsetCount = parseInt(page) * 4
    }

    Article.findAndCountAll({
        order: [
            [ 'id','DESC']
        ],
        limit: 4,
        offset: offset
    }).then(articles => {
        
        var next
        
        if (offsetCount + 1 >= articles.count) {
            next = false
        } else {
            next = true
        }

        var result = {
            page: page,
            articles: articles,
            next: next
        }

        Category.findAll().then(categories => {
            res.render("admin/articles/page", {
                result: result,
                categories: categories
            }) 
        })
    })
})

module.exports = router;