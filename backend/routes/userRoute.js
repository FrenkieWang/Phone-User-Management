const router = require('express').Router();
let User = require('../models/userModel');
let Address = require('../models/addressModel');
const generateRandomUser = require('./faker/fakerUser'); 

router.route('/generate-user').get((request, response) => {
  const user = generateRandomUser(); 
  console.log(user);
  response.json(user);
});

router.route('/get').get((request, response) => {
  User.find()
    .then(users => response.json(users))
    .catch(error => response.status(400).json(error));
});

router.route('/create').post((request, response) => {
  const newUser = new User(request.body);  
  
  newUser.save()
    .then(() => response.json('User added!'))
    .catch(error => response.status(400).json(error));
});

router.route('/get/:userID').get((request, response) => {
  User.findById(request.params.userID)
    .then(user => response.json(user))
    .catch(error => response.status(400).json(error));
});

router.route('/update/:userID').put((request, response) => {
  const updateData = request.body;

  User.findByIdAndUpdate(request.params.userID,
    updateData, { new: true, runValidators: true })
      .then(user => response.json(user))
      .catch(error => response.status(400).json(error));
});

router.route('/delete/:userID').delete((request, response) => {
  User.findByIdAndDelete(request.params.userID)
    .then(() => Address.deleteMany({ userID: request.params.userID }))
    .then(() => response.json(`User ${request.params.userID} and its Address deleted.`))
    .catch(error => response.status(400).json(error));
});

module.exports = router;