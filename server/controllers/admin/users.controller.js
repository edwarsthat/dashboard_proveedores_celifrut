import { getAllUsers } from "../../services/admin/users.service.js";

export const getLoggerUsers = async (_, res, next) => {
    try {
        const usersCount = await getAllUsers();
        res.json({ usersCount: usersCount.length });
    } catch (error) {
        next(error);
    }
};
