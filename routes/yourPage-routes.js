// *********************************************************************************
// yourPage-routes.js - this file offers a set of routes for displaying and saving data to the db
// *********************************************************************************

require("dotenv").config();
// Requiring our models
var db = require("../models");
const nodemailer = require("nodemailer");

module.exports = function (app) {

  // GET route for getting all the datas from both postItem & user table.
  // Filtered with id.
  app.get("/yourPage/:id", function (req, res) {
    db.postItem.findAll({
      raw: true,
      where: { userId: req.params.id },
      include: [{
        model: db.user,
        attributes:['id','FullName']
      }]
    }).then(function (dbPostUser) {
      res.render("yourPage", { id: dbPostUser[0].userId, data: dbPostUser });
    });
  })

  // GET route for getting all the datas from both postItem & user table.
  // Filtered with id and category.
  app.get("/api/yourPage/:id/:category", function (req, res) {
    db.postItem.findAll({
      where: {
        userId: req.params.id,
        category: req.params.category
      },
      raw: true,
      include: [{
        model: db.user,
        attributes:['id','FullName']
      }]
    }).then(function (dbPostUser) {
      if (dbPostUser.length) {
        res.render("yourPage", { id: dbPostUser[0].userId, data: dbPostUser });
      }
      else {
        res.render("404", { url: `/yourPage/${req.params.id}`, msg: 'No Item Found', sol: 'Back to my Posts' });
      }
    });
  })

  // DELETE route for deleting posts
  app.delete("/yourPage/:id", function (req, res) {

    db.postItem.destroy({
      where: {
        id: req.params.id
      }
    }).then(function (dbPost) {
      res.json(dbPost);
    });
  });

  // PUT route for updating offers
  app.put("/yourPage", function (req, res) {
    db.postItem.update(
      req.body,
      {
        where: {
          id: req.body.id
        }
      }).then(function (dbPost) {
        res.json(dbPost);
      });
  });

  // Route to send email notification.
  app.post("/api/email", function (req, res) {
    db.user.findAll({
      raw: true,
      attributes: ['email'],
      where: { id: req.body.id }
    }).then(function (dbUser) {
      const output = `
        <h2>You have new offer in Tradesies</h2>
        <h3>Offer Details and Contact</h3>
        <hr>
        <p><bold>NAME: ${req.body.name}</bold></p>
        <p><bold>CONTACT DETAILS: ${req.body.contactInfo}</bold></p>
        <p><bold>ITEM OFFERED: ${req.body.item}</bold></p>
        <p><bold>ITEM DESCRIPTION: ${req.body.description}</bold></p>
        <p><bold>ZIPCODE: ${req.body.zipcode}</bold></p>
        <p><bold>IMAGE LINK: ${req.body.link}</bold></p>
        <hr>
        <br>
        <br>
        <p>Regards,</p>
        <p>Tradesies Team</p>
        <p>tradesies.notification@gmail.com</p>
        `;
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.E_USER,
          pass: process.env.E_PASSWORD
        },
      });

      // setup email data with unicode symbols
      let mailOptions = {
        from: `"Tradesies Notification" ${process.env.E_USER}`, // sender address
        to: `${dbUser[0].email}`, // list of receivers(tradesies.user@gmail.com)
        subject: "You have a new offer in Tradesies", // Subject line
        text: "Hello world?", // plain text body
        html: output // html body
      };

      // send mail with defined transport object
      let info = transporter.sendMail(mailOptions)

      console.log("Message sent: %s", info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

      res.redirect('/')
      res.status(200).end()
    });
  });
};

