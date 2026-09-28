import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import http from "http";
import { Server } from "socket.io";
import { jwtVerify } from "jose";

const PORT = 3002;
const CLIENT_ORIGIN = "http://localhost:3001";

const JWT_SECRET = process.env.JWT_SECRET;
const SOCKET_INTERNAL_SECRET = process.env.SOCKET_INTERNAL_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not available.");
}

if (!SOCKET_INTERNAL_SECRET) {
  throw new Error("SOCKET_INTERNAL_SECRET is not available.");
}

const secret = new TextEncoder().encode(JWT_SECRET);

function getCookieValue(
  cookieHeader: string | undefined,
  name: string
) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.trim().split("=");

    if (key === name) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

async function verifySocketToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);

    if (!payload.userId || typeof payload.userId !== "string") {
      return null;
    }

    return payload.userId;
  } catch {
    return null;
  }
}

function sendJson(
  response: http.ServerResponse,
  statusCode: number,
  data: unknown
) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });

  response.end(JSON.stringify(data));
}

const httpServer = http.createServer((request, response) => {
  if (
    request.method !== "POST" ||
    (
      request.url !== "/internal/message" &&
      request.url !== "/internal/notification" &&
      request.url !== "/internal/enquiry" &&
      request.url !== "/internal/booking"
    )
  ) {
    sendJson(response, 404, {
      message: "Not found",
    });

    return;
  }

  const internalSecret = request.headers["x-socket-internal-secret"];

  if (
    typeof internalSecret !== "string" ||
    internalSecret !== SOCKET_INTERNAL_SECRET
  ) {
    sendJson(response, 401, {
      message: "Unauthorized",
    });

    return;
  }

  let body = "";

  request.on("data", (chunk) => {
    body += chunk.toString();

    if (body.length > 100000) {
      request.destroy();
    }
  });

  request.on("end", () => {
    try {
      const data = JSON.parse(body);

      const receiverId =
        typeof data.receiverId === "string"
          ? data.receiverId.trim()
          : "";

      if (!receiverId) {
        sendJson(response, 400, {
          message: "Invalid receiver ID",
        });

        return;
      }

      if (request.url === "/internal/message") {
        const message = data.message;

        if (!message || !message._id) {
          sendJson(response, 400, {
            message: "Invalid message payload",
          });

          return;
        }

        io.to(`user:${receiverId}`).emit(
          "message:new",
          message
        );

        sendJson(response, 200, {
          message: "Message event delivered",
        });

        return;
      }

      if (request.url === "/internal/notification") {
        const notification = data.notification;

        if (!notification || !notification._id) {
          sendJson(response, 400, {
            message: "Invalid notification payload",
          });

          return;
        }

        io.to(`user:${receiverId}`).emit(
          "notification:new",
          notification
        );

        sendJson(response, 200, {
          message: "Notification event delivered",
        });

        return;
      }

      if (request.url === "/internal/enquiry") {
        const enquiry = data.enquiry;

        if (!enquiry || !enquiry._id) {
          sendJson(response, 400, {
            message: "Invalid enquiry payload",
          });

          return;
        }

        io.to(`user:${receiverId}`).emit(
          "enquiry:new",
          enquiry
        );

        sendJson(response, 200, {
          message: "Enquiry event delivered",
        });

        return;
      }

        if (request.url === "/internal/booking") {
        const booking = data.booking;

        if (!booking || !booking._id) {
        sendJson(response, 400, {
         message: "Invalid booking payload",
      });

       return;
     }

       io.to(`user:${receiverId}`).emit(
       "booking:new",
        booking
     );

      sendJson(response, 200, {
      message: "Booking event delivered",
    });

    return;
   }

    } catch (error) {
      console.error("Internal socket event error:", error);

      sendJson(response, 400, {
        message: "Invalid request",
      });
    }
  });
});

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const token = getCookieValue(
      socket.handshake.headers.cookie,
      "auth_token"
    );

    if (!token) {
      return next(new Error("Authentication required"));
    }

    const userId = await verifySocketToken(token);

    if (!userId) {
      return next(new Error("Invalid authentication token"));
    }

    socket.data.userId = userId;

    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Socket authentication failed"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId as string;

  socket.join(`user:${userId}`);

  console.log(
    `Socket connected: ${socket.id} | User: ${userId}`
  );

  socket.on("disconnect", (reason) => {
    console.log(
      `Socket disconnected: ${socket.id} | Reason: ${reason}`
    );
  });
});

httpServer.listen(PORT, () => {
  console.log(
    `Socket.IO server running on http://localhost:${PORT}`
  );
});