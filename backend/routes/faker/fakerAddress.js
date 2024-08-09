const { faker } = require('@faker-js/faker');

function generateRandomAddress() {
    const address = {
        addressLine1: faker.location.streetAddress(),
        addressLine2: faker.location.secondaryAddress(),
        town: faker.location.city(),
        countyCity: faker.location.county(),
        eircode: faker.location.zipCode()
    };
    return address;
}

module.exports = generateRandomAddress; 