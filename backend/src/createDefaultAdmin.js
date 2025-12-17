const User = require("./models/User");
const bcrypt = require("bcrypt");

// Skapar default admin-användare vid start
async function createDefaultAdmin() {
  // Fast email och lösenord för admin-inloggning
  const email = "admin@elspark.com";
  const password = "admin123";

  // Kolla om admin redan finns
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists");
    return;
  }

  // Hasha lösenord med bcrypt
  const hash = await bcrypt.hash(password, 10);

  // Skapa admin i MongoDB med id=0
  await User.create({
    id: 0,
    name: "System Admin",
    email,
    passwordHash: hash,
    role: "admin"   // Krävs för /auth/login
  });

  console.log("Admin user created:", email);
}

module.exports = createDefaultAdmin;
