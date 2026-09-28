import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyAuthToken } from "@/lib/auth";

export async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return null;
  }

  const userId = await verifyAuthToken(token);

  if (!userId) {
    return null;
  }

  await connectDB();

  const user = await User.findById(userId)
    .select("_id name email role")
    .lean();

  if (!user || user.role !== "admin") {
    return null;
  }

  return user;
}