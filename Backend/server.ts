import dotenv from 'dotenv';
dotenv.config();

import app from "./src/app.js";
import { connectDatabase } from "./src/db.js";

const PORT = process.env.PORT || 3000;

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });