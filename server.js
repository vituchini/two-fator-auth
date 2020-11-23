if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
const sendMessage = require('./sendMessage')
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []
let kode = '1010'
let isKoded = false

app.use(express.static('public'))
app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated,checkIsKodGood, (req, res) => {
    res.render('index.ejs', {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    // successRedirect: '/second',
    failureRedirect: '/login',
    failureFlash: true
}), (req, res) => {
    kode = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    sendMessage(kode,req.body.email)
    res.redirect('/second')
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    console.log(users)
})

app.delete('/logout', (req, res) => {
    req.logOut()
    isKoded = false
    res.redirect('/login')
})

app.get('/second', checkAuthenticated, (req, res) => {
    res.render('second.ejs')
})

app.post('/second', (req, res) => {
    if (req.body.kod == kode) {
        isKoded = true
        res.redirect('/')
    }

})

function checkAuthenticated(req, res, next) {//якщо автентифікований то продовжує,якщо ні то логін
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {//якщо автентифікований то переносить на /
    if (req.isAuthenticated()) {
        return res.redirect('/second')
    }
    next()
}

function checkIsKodGood(req, res, next) {
    if (isKoded) {
        return next()
    } else {
        return res.redirect('/second')
    }

}

app.listen(3001)