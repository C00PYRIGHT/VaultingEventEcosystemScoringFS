import DashCards from '../models/DashCards.js';
import User from '../models/User.js';
import Permissions from '../models/Permissions.js';
import Role from '../models/Role.js';

/**
 * Get admin dashboard data with statistics
 */
export async function getAdminDashboardData() {
    const [cards, userCount, permissionCount, roleCount] = await Promise.all([
        DashCards.find({ dashtype: 'admin' }).sort({ priority: 1 }),
        User.countDocuments(),
        Permissions.countDocuments(),
        Role.countDocuments()
    ]);

    return {
        cards,
        userCount,
        permissionCount,
        roleCount
    };
}

/**
 * Get all users for admin dashboard
 */
export async function getAllUsers() {
    return await User.find();
}

/**
 * Get all permissions for admin dashboard
 */
export async function getAllPermissions() {
    return await Permissions.find();
}
