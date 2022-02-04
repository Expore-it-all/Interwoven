const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const varList = require('../utils/variables');

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    let foundUser;
    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                const error = new Error('Email/Password combo does not exist.');
                error.statusCode = 401;
                throw error;
            }
            foundUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then((isEqual) => {
            if (!isEqual) {
                const error = new Error('Email/Password combo does not exist.');
                error.statusCode = 401;
                throw error;
            }

            const token = jwt.sign(
                {
                    email: foundUser.email,
                    userId: foundUser._id.toString(),
                    isMod: foundUser.isMod,
                },
                varList.jwtSec,
                { expiresIn: '1h' }
            );

            res.status(200).json({
                message: 'Logged in succefully.',
                userId: foundUser._id.toString(),
                isMod: foundUser.isMod,
                token: token,
            });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            } else {
                next(err);
            }
        });
};

exports.signUp = (res, res, next) => {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt
        .hash(password, 12)
        .then((hash) => {
            const user = new User({
                email: email,
                name: name,
                password: hash,
            });
            return user.save();
        })
        .then((result) => {
            res.status(200).json({
                message: 'User Created!',
                userId: result._id,
            });
        })
        .catch((err) => catchError(err));
};

function catchError(error, next) {
    if (!err.statusCode) {
        err.statusCode = 500;
    } else {
        next(err);
    }
}