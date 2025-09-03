import { getAllUsers } from "../../services/admin/users.service.js";

export const getLoggerUsers = async (_, res, next) => {
    try {
        const users = await getAllUsers();
        res.json({ users });
    } catch (error) {
        next(error);
    }
};
