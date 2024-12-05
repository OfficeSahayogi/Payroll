import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/User.js";
import connectDB from "./mongoose/connectDB.js";

dotenv.config();

const seedUsers = async () => {
  await connectDB();

  // Clear existing users
  await User.deleteMany();

  // User data
  const users = [
    {
      name: "Super Admin",
      mobile: "9728400000",
      password: "OS$Mittals@0275",
      organizations: ["Mittal Spinners", "HRM Spinners", "Jai Durga Cottex"],
      role: "Super Admin",
    },
    {
      name: "Akshay Mittal",
      mobile: "7717200000",
      password: "Akshay@7172",
      organizations: ["Mittal Spinners", "HRM Spinners"],
      role: "Admin",
    },
    {
      name: "Rinku Mittal",
      mobile: "9416200275",
      password: "Rinku@4162",
      organizations: ["Mittal Spinners", "HRM Spinners"],
      role: "Admin",
    },
    {
      name: "Lakshay Mittal",
      mobile: "9545500001",
      password: "Lakshay@5455",
      organizations: ["Mittal Spinners", "HRM Spinners"],
      role: "Admin",
    },
    {
      name: "Binay",
      mobile: "9992390468",
      password: "Binay@9923",
      organizations: ["Mittal Spinners", "HRM Spinners"],
      role: "Admin",
    },
    {
      name: "Suresh",
      mobile: "9255113281",
      password: "Suresh@2551",
      organizations: ["Mittal Spinners", "HRM Spinners"],
      role: "Admin",
    },
    {
      name: "Naved",
      mobile: "8607184400",
      password: "Naved@6071",
      organizations: ["Jai Durga Cottex"],
      role: "Admin",
    },
    {
      name: "Shubham Mittal",
      mobile: "9802580008",
      password: "Shubham@8025",
      organizations: ["Jai Durga Cottex"],
      role: "Admin",
    },
    {
      name: "Surender Mittal",
      mobile: "9215300008",
      password: "Surender@2153",
      organizations: ["Jai Durga Cottex"],
      role: "Admin",
    },
  ];

  // Hash passwords and save users
  for (const user of users) {
    user.password = bcrypt.hashSync(user.password, 10); // Hash the password
    await User.create(user);
  }

  process.exit();
};

seedUsers();
