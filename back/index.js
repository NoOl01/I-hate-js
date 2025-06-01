const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const sequelize = require('./database')
const User = require('./user')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const generateToken = (id, email) => {
    return jwt.sign({ id, email}, process.env.JWT_SECRET, { expiresIn: '1h' })
}

app.post('/register',  async (req, res) => {
    const { name, email, password } = req.body
    try {
        const userExist = await User.findOne({ where: { email } });
        if (userExist) return res.status(400).json({ message: "User already exists" });

        const hash = await bcrypt.hash(password, 12);
        const user = await User.create({ name: name, email: email, password: hash });
        const token = generateToken(user.id, user.name);

        res.status(200).json({
            message: "User registered successfully",
            token: token,
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error)
    }
})

app.post('/login',  async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ where: {email }});
        if (!user) return res.status(404).json({ message: "User does not exist" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ message: "Wrong Password" });

        const token = generateToken(user.id, user.name);

        res.status(200).json({
            message: "User login successfully",
            token: token,
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error)
    }
})

app.get('/getUserInfo',  async (req, res) => {
    const token = req.header("Authorization");
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ where: {id: decodedToken.id} })

        if (!user) return res.status(404).json({ message: "User does not exist" });
        res.status(200).json({
            message: "User getUserInfo successfully",
            id: user.id,
            name: user.name,
            email: user.email,
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log(error)
    }
})

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()

        app.listen(3000, () => {
            console.log("Server started on port 3000")
        });
    } catch (error) {
        console.error(error)
    }
}

start()