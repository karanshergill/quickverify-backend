import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (!process.env.API_TOKEN) {
    console.warn("API_TOKEN not set in .env, skipping auth check");
    return next();
  }
  if (token !== process.env.API_TOKEN) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
}

router.get("/api/coupons", auth, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "1000", 10), 5000);
    const offset = parseInt(req.query.offset || "0", 10);

    const rows = await prisma.couponInfo.findMany({
      select: { 
        linkUniqueCouponCc: true,
        uniqueCode: true,
        dateCreated: true 
      },
      skip: offset,
      take: limit,
      orderBy: { id: "asc" },
    });

    const data = rows
      .map((r) => {
        const coupon = (r.linkUniqueCouponCc || "").trim();
        if (!coupon) return null;
        
        const date = r.dateCreated 
          ? r.dateCreated.toISOString().split('T')[0]
          : null;
        
        return { 
          "Date": date,
          "Coupon Code": coupon,
          "Token": r.uniqueCode || null
        };
      })
      .filter(Boolean);

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error("/api/coupons error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;