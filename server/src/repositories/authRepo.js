const prisma = require('../lib/prisma');

const createUser = async (data) => {
  return await prisma.user.create({
    data,
  });
};

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

module.exports = {
  createUser,
  findUserByEmail,
};
