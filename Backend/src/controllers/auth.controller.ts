import type { Request, Response } from "express";
import UserModel  from "./../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// ✅ Register User
export async function registerUser(req: Request, res: Response): Promise<Response> {
  try {
    const { username, email, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Username, email, and password are required",
      });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const isAlreadyRegistered = await UserModel.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (isAlreadyRegistered) {
      return res.status(400).json({
        message: "User with the same email or username already exists",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      username: normalizedUsername,
      email: normalizedEmail,
      password: hash,
    });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // ✅ for localhost
      sameSite: "lax",
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err: any) {
    console.error("REGISTER ERROR:", err);
    if (err?.code === 11000) {
      return res.status(409).json({
        message: "User with the same email or username already exists",
      });
    }
    if (err?.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
}

// ✅ Login User
export async function loginUser(req: Request, res: Response): Promise<Response> {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET as string,
      { expiresIn: "3d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).json({
      message: "User logged in successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// ✅ Get Current User
export async function getMe(req: Request, res: Response): Promise<Response> {
  try {
    const user = await UserModel.findById((req as any).user.id);
    return res.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    console.error("GETME ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// ✅ Logout User
export async function logoutUser(req: Request, res: Response): Promise<Response> {
  try {
    const token = req.cookies.token;
    res.clearCookie("token");

   

    return res.status(200).json({
      message: "Logout successfully.",
    });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
