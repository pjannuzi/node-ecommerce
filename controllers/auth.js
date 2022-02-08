const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const user = require('../models/user');

const transporter = nodemailer.createTransport(({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "b0360f80b0dbb6", 
    pass: "7a5c0aeecbf5a6" 
  }
}));

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
  });
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
  });
}

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Email inválido');
        return res.redirect('/login');
      }
      bcrypt.compare(password, user.password)
        .then(result => {
          if (result) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(() => {
              res.redirect('/');
            });
          }
          req.flash('error', 'Senha inválida');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => console.log(err));
}

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then(UserDoc => {
      if (UserDoc) {
        return res.redirect('/signup');
      }
      return bcrypt.hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            cart: { items: [] }
          });
          user.save();
        })
        .then(result => {
          res.redirect('/login');
          return transporter.sendMail({
            to: email,
            from: 'shop@pjannuzi.com',
            subject: 'Cadastro confirmado!',
            html: '<h1>Deu certo!</h1>'
          });
        }).catch(err => {console.log(err)});
    })
    .catch(err => 
      console.log(err)
    );
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
}

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Esqueci minha senha',
    errorMessage: message,
  });
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err){
      console.log(err);
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
    .then(user => {
      if (!user) {
        req.flash('error', 'Email não encontrado!');
        res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      user.save();
    })
    .then(result => {
      res.redirect('/');
      return transporter.sendMail({
        to: req.body.email,
        from: 'shop@pjannuzi.com',
        subject: 'Redefinição de senha!',
        html: `
          <p>Você solicitou uma redefinição de senha</p>
          <p>Clique no <a href="http://localhost:3000/reset/${token}">link</a> para escolher uma nova senha</p>
        `
      });
    })
    .catch(err => {
      console.log(err);
    });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
  .then(user => {
    if(!user) {
      console.log('????');
      return res.redirect('/reset');
    }
    let message = req.flash('error');
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render('auth/new-password', {
      path: '/new-password',
      pageTitle: 'Redefinição de senha',
      errorMessage: message,
      userId: user._id.toString(),
      passwordToken: token
    });
  })
  .catch(err => {
    console.log(err);
  })
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId})
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12)
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = null;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then(result => {
    res.redirect('/login');
    return transporter.sendMail({
      to: resetUser.email,
      from: 'shop@pjannuzi.com',
      subject: 'Senha redefinida!',
      html: `
        <p>Sua senha foi redefinida!</p>
      `
    });
  })
  .catch(err => console.log(err));
}