import activeUsersCache from "../../cache/activeUsers.js";

export const getAllUsers = async () => {
    try {
        const users = await activeUsersCache.getAllUsers();
        return users;
    } catch (error) {
        throw new Error("Error al obtener usuarios", error.message);
    }
};
