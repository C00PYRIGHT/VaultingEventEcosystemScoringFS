import { logger } from '../logger.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
    getAllRoles,
    getRoleById,
    getAllRolesWithUserCounts,
    getRoleFormData,
    createRole,
    updateRole,
    deleteRole
} from '../DataServices/adminRoleData.js';

/**
 * @route GET /admin/dashboard/roles
 * @desc Show roles dashboard with user counts
 */
const getRolesDashboard = asyncHandler(async (req, res) => {
    const { roles, RoleNumList } = await getAllRolesWithUserCounts();
    res.render("admin/roledash", {
        rolenumlist: RoleNumList,
        rolePermissons: req.user.role.permissions,
        roles: roles,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
});

/**
 * @route GET /admin/newRole
 * @desc Show new role form
 */
const getNewRoleForm = asyncHandler(async (req, res) => {
    const { permissions } = await getRoleFormData();
    res.render("admin/newRole", {
        permissions: permissions,
        rolePermissons: req.user.role.permissions,
        failMessage: req.session.failMessage,
        formData: req.session.formData,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.formData = null;
    req.session.failMessage = null;
    req.session.successMessage = null;
});

/**
 * @route POST /admin/newRole
 * @desc Create new role
 */
const createNewRoleHandler = asyncHandler(async (req, res) => {
    const newRole = await createRole(req.body);
    logger.db(`Role ${newRole.roleName} created by user ${req.user.username}.`);
    req.session.successMessage = 'Role created successfully.';
    res.redirect('/admin/dashboard/roles');
});

/**
 * @route GET /admin/editRole/:id
 * @desc Show edit role form
 */
const getEditRoleForm = asyncHandler(async (req, res) => {
    const role = await getRoleById(req.params.id);
    if (!role) {
        req.session.failMessage = 'Role not found.';
        return res.redirect('/admin/dashboard/roles');
    }
    const { permissions } = await getRoleFormData();
    res.render('admin/editRole', {
        permissions: permissions,
        rolePermissons: req.user.role.permissions,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage,
        formData: role,
        user: req.user
    });
    req.session.successMessage = null;
    req.session.failMessage = null;
});

/**
 * @route POST /admin/editRole/:id
 * @desc Update role
 */
const updateRoleHandler = asyncHandler(async (req, res) => {
    const updatedRole = await updateRole(req.params.id, req.body);
    logger.db(`Role ${req.body.roleName} updated by user ${req.user.username}.`);
    if (!updatedRole) {
        req.session.failMessage = 'Role not found.';
        return res.redirect('/admin/dashboard/roles');
    }
    req.session.successMessage = 'Role updated successfully.';
    res.redirect('/admin/dashboard/roles');
});

/**
 * @route DELETE /admin/deleteRole/:roleId
 * @desc Delete role
 */
const deleteRoleHandler = asyncHandler(async (req, res) => {
    const roleId = req.params.roleId;
    const role = await deleteRole(roleId);
    logger.db(`Role ${role.roleName} deleted by user ${req.user.username}.`);
    req.session.successMessage = 'Role successfully deleted.';
    res.status(200).send('Role deleted.');
});

export default {
    getRolesDashboard,
    getNewRoleForm,
    createNewRoleHandler,
    getEditRoleForm,
    updateRoleHandler,
    deleteRoleHandler
};
