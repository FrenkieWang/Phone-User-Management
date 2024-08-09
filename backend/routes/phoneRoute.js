const router = require('express').Router();
let Phone = require('../models/phoneModel');

const generateRandomPhone = require('./faker/fakerPhone'); 

router.route('/generate-phone').get((request, response) => {
  const phone = generateRandomPhone(); 
  console.log(phone);
  response.json(phone);
});

router.route('/get').get((request, response) => {
  Phone.find()
    .then(phones => response.json(phones))
    .catch(error => response.status(400).json(error));
});

router.route('/create').post((request, response) => {
  const newPhone = new Phone(request.body);

  newPhone.save()
    .then(() => response.json('Phone added!'))
    .catch(error => response.status(400).json(error));
});

router.route('/get/:id').get((request, response) => {
  Phone.findById(request.params.id)
    .then(phone => response.json(phone))
    .catch(error => response.status(400).json(error));
});

router.route('/delete/:id').delete((request, response) => {
  Phone.findByIdAndDelete(request.params.id)
    .then(() => response.json('Phone deleted.'))
    .catch(error => response.status(400).json(error));
});

router.route('/update/:id').put((request, response) => {
  Phone.findByIdAndUpdate(request.params.id,
    request.body, { new: true, runValidators: true })
      .then(phone => response.json(phone))
      .catch(error => response.status(400).json(error));
});

module.exports = router;