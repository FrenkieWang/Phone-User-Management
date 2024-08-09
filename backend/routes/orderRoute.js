const router = require('express').Router();
let Order = require('../models/orderModel');

/*
const generateRandomOrder = require('./faker/fakerOrder'); 

router.route('/generate-order').get((request, response) => {
  const order = generateRandomOrder(); 
  console.log(order);
  response.json(order);
});
*/

router.route('/get').get((request, response) => {
  Order.find()
    .populate('userID', 'firstName surName')  
    .populate({
      path: 'phoneBasket',
      select: 'manufacturer model'  
    })
    .then(orders => response.json(orders))
    .catch(error => response.status(400).json(error));
});

router.route('/create').post((request, response) => {
  const newOrder = new Order(request.body);

  newOrder.save()
    .then(() => response.json('Order added!'))
    .catch(error => response.status(400).json(error));
});

router.route('/get/:id').get((request, response) => {
  Order.findById(request.params.id)
    .populate('userID', 'firstName surName')  
    .populate({
      path: 'phoneBasket',
      select: 'manufacturer model'  
    })
    .then(order => response.json(order))
    .catch(error => response.status(400).json(error));
});

router.route('/delete/:id').delete((request, response) => {
  Order.findByIdAndDelete(request.params.id)
    .then(() => response.json('Order deleted.'))
    .catch(error => response.status(400).json(error));
});

router.route('/update/:id').put((request, response) => {
  Order.findByIdAndUpdate(request.params.id,
    request.body, { new: true, runValidators: true })
      .then(order => response.json(order))
      .catch(error => response.status(400).json(error));
});

module.exports = router;