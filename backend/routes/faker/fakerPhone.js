const { faker } = require('@faker-js/faker');

function generateRandomPhone() {  
  const phone = {
    manufacturer: faker.company.name().split(' ')[0].replace(/,$/, ''),
    model: faker.commerce.productName().split(' ')[0],
    price: parseFloat(faker.finance.amount({ min: 100, max: 1500, dec: 2 })),
  };

  return phone;
}

module.exports = generateRandomPhone;