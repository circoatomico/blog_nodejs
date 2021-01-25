const express = require("express");
const User    = require("../users/User");
const slugify = require("slugify")
const bcrypt  = require("bcryptjs");
const { route } = require("../articles/ArticlesController");


const router = express.Router();

router.get('/login', (req, res) => {
    res.render("admin/users/login")    
})

router.get("/logout", (req, res) => {
    req.session.user = undefined
    res.redirect("/")
})

router.get('/admin/user', (req, res) => {
    User.findAll().then(users => {
        res.render("admin/users/index", {
            users: users
        })
    })
})

router.post('/admin/user/login', (req, res) => {

    var email    = req.body.email
    var password = req.body.password
    
    User.findOne({
        where: {
            email: email
        }
    }).then(user => {

        if (user != undefined) {

            var correct = bcrypt.compareSync(password, user.password)

            if (correct) {
                req.session.user = {
                    id: user.id,
                    email: user.email
                }
                res.redirect("/admin/articles")
            } else {
                res.redirect("/login")
            }

        } else {
            res.redirect("/login")
        }
    }).catch(err => {
        console.log(err)
    })

})

router.get("/admin/user/create", (req, res) => {
    res.render('admin/users/new')
})

router.post('/admin/user/new', (req, res) => {

    var email = req.body.email
    var password = req.body.password

    User.findOne({
        where: {
            email: email
        }
    }).then( user => {
        if (user!= undefined) {
            res.redirect("/admin/user/new")
        } else {
            var salt = bcrypt.genSaltSync(10)
            var hash = bcrypt.hashSync(password, salt)
        
            User.create({
                email: email,
                password: hash
            }).then(() => {
                res.redirect("/")
            })
        }
    })

    
})

module.exports = router;