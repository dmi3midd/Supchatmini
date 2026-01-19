import WebSocket, { WebSocketServer } from "ws";
import type { IncomingMessage } from "http";
import * as url from "url";
import { config } from "../configs/env-config.js";
import { getPool } from "./postgreService.js";

import type { IUser } from "../types/postgresql/IUser.js";

const wss = new WebSocketServer({
    port: config.WSS_PORT
});
class Event {
    public type: string;
    public payload: any;
    constructor(type: string, payload: any) {
        this.type = type;
        this.payload = payload;
    }
}

const connectedAdmins = new Map<string, WebSocket>(); // adminId -> ws
const assignedUsers = new Map<number, string>(); // userId -> adminId

// Function for initialization assigned users to continue conversation with them
async function assignedUsersInit() {
    const pool = getPool();
    const result = await pool.query<IUser>(
        "SELECT * FROM users WHERE is_assigned = $1", 
        [true]
    );
    if (result.rowCount === 0) return;
    result.rows.forEach(user => assignedUsers.set(user.userId, user.adminId));
} 
// Function for initialization not assigned users, so admins could assign them
async function notAssignedUsersInit() {
    const pool = getPool();
    const result = await pool.query<IUser>(
        "SELECT * FROM users WHERE is_assigned = $1 AND is_closed = $2", 
        [false, true]
    );
    if (result.rowCount === 0) return [];
    return result.rows.map(user => user.userId);
}

// Function for connection and authorization
async function wsInit(ws: WebSocket, req: IncomingMessage): Promise<void> {
    try {
        if (!req.url) {
            ws.close();
            return;
        }
        const parsedUrl = url.parse(req.url, true);
        const adminId = parsedUrl.query.adminId as string;
        if (!adminId) {
            console.log("No adminId provided");
            ws.close();
            return;
        }

        const pool = getPool();
        const result = await pool.query(
            "SELECT * FROM admins WHERE admin_id = $1", 
            [adminId]
        );
        if (result.rowCount === 0) {
            console.log("Admin does not exist");
            ws.close();
            return;
        }
        const admin = result.rows[0];  
        console.log('Connected admin', admin);

        const echoEvent = new Event('echo', { text: "You are active now" });
        ws.send(JSON.stringify(echoEvent));

        if (!connectedAdmins.has(adminId)) {
            connectedAdmins.set(adminId, ws);
        }

        const notAssignedUsers = await notAssignedUsersInit();
        const newChatsEvent = new Event('new-chats', { notAssignedUsers });
        ws.send(JSON.stringify(newChatsEvent));
    } catch (error) {
        console.error(error);
        console.log("Error with authorization via ws");
        ws.close();
    }
}

// WSS initialization
export function wssInit() {
    console.log(`WSS is running on PORT ${process.env.WSS_PORT}`);
    assignedUsersInit();

    wss.on('connection', async (ws, req) => {
        console.log('admin is connected');
        await wsInit(ws, req);

        ws.on('error', (err) => {
            console.error(err);
        });
        
        // Hadling different events
        ws.on('message', async (message) => {
            const raw = message;
            let messageStr: string;
            if (typeof raw === 'string') {
                messageStr = raw;
            } else if (raw instanceof ArrayBuffer) {
                messageStr = Buffer.from(raw).toString();
            } else if (Array.isArray(raw)) {
                // Buffer[] case
                messageStr = Buffer.concat(raw.map((r) => Buffer.from(r))).toString();
            } else {
                // Buffer case
                messageStr = (raw as Buffer).toString();
            }
            const data = JSON.parse(messageStr) as Event;
            const eventType = data.type;
            const payload = data.payload;

            if (eventType === 'assign-chat') {
                const pool = getPool();
                const userId = payload?.userId;
                const adminId = payload?.adminId;
                await pool.query(
                    "UPDATE users SET admin_id = $1, is_assigned = $2, is_closed = $3 WHERE user_id = $4", 
                    [adminId, true, false, userId]
                );
                assignedUsers.set(userId, adminId);
                // await bot.sendMessage(userId, 'Admin has assigned your chat');
            }

            if (eventType === 'close-chat') {
                const pool = getPool();
                const userId = payload.userId;
                await pool.query(
                    "UPDATE users SET is_assigned = $1, is_closed = $2 WHERE user_id = $3", 
                    [false, true, userId]
                );
                assignedUsers.delete(userId);
                // bot.sendMessage(userId, 'Admin hes closed your chat.\nType /call if you need some help');
            }
        });

        ws.on('close', () => {
            console.log('Disconected');
        });
    });
}