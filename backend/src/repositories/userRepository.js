// Repository för användare med enkel in-memory-lagring.
let nextUserId = 3;

const users = [
  { id: 1, name: "Mirnes", email: "mirnes@example.com" },
  { id: 2, name: "Rebecka", email: "rebecka@example.com" },
];

async function getAllUsers() {
  return users;
}

async function getUserById(id) {
  return users.find((user) => user.id === id) || null;
}

async function createUser({ name, email }) {
  const user = { id: nextUserId++, name, email };
  users.push(user);
  return user;
}

async function updateUser(id, updates) {
  const user = users.find((u) => u.id === id);
  if (!user) {
    return null;
  }

  if (updates.name !== undefined) {
    user.name = updates.name;
  }
  if (updates.email !== undefined) {
    user.email = updates.email;
  }

  return user;
}

async function deleteUser(id) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) {
    return false;
  }
  users.splice(index, 1);
  return true;
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
