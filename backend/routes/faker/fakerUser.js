const { faker } = require('@faker-js/faker');

function generateRandomUser() {
  const thisTitle = faker.helpers.arrayElement(['Mx', 'Ms', 'Mr', 'Mrs', 'Miss', 'Dr', 'Other']);

  const user = {
    title: thisTitle,
    titleOther: thisTitle === 'Other' ? faker.lorem.word() : '',
    firstName: faker.person.firstName(),
    surName: faker.person.lastName(),
    mobile: faker.string.numeric(10, { allowLeadingZeros: true }),
    email: faker.internet.email(),
  };

  return user;
}

module.exports = generateRandomUser; 