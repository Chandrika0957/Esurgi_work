const onValue = jest.fn();
const off = jest.fn();
const ref = jest.fn();

const getDatabase = jest.fn(() => ({
  ref,
}));

module.exports = {
  getDatabase,
  ref,
  onValue,
  off,
};
