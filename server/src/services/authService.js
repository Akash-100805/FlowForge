const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepo = require('../repositories/authRepo');
const config = require('../lib/config');

const registerUser = async ({ email, password, name }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const sanitizedName = name.trim();

  const existingUser = await authRepo.findUserByEmail(normalizedEmail);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const newUser = await authRepo.createUser({
    email: normalizedEmail,
    passwordHash,
    name: sanitizedName,
  });

  const { passwordHash: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await authRepo.findUserByEmail(normalizedEmail);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { userId: user.id },
    config.jwtSecret,
    { expiresIn: '1d' }
  );

  const { passwordHash: _, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    token,
  };
};

module.exports = {
  registerUser,
  loginUser,
};
