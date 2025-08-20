import express from 'express';

import logger from '../logger.js';
import { Login } from "../controllers/auth.js";
import { Logout } from "../controllers/auth.js";
import Validate from "../middleware/Validate.js";
import { check } from "express-validator";
import { Verify, VerifyRole } from "../middleware/Verify.js";
import { Register } from "../controllers/auth.js";
import Role from "../models/Role.js"; // Import the Role model
import User from "../models/User.js"; // Import the User model
const adminRouter = express.Router();
import bcrypt from 'bcrypt';
import Permissions from '../models/Permissions.js';






/*router.get("/dashboard", Verify, async (req, res) => {
    const forms = await Form.find();
    req.session.successMessage = null; // Üzenet törlése a session-ből  
    req.session.failMessage = null; // Üzenet törlése a session-ből
    res.render("dashboard", {userrole: req.user.role, forms, successMessage: req.session.successMessage, failMessage: req.session.failMessage });
});*/
adminRouter.get("/newUser",Verify,VerifyRole("manage_users"), async (req, res) => {
    const roles = await Role.find();
    const userrole = req.user?.role.permissions; // Safe check for req.user
    res.render("admin/newUser", {
        rolePermissons: userrole,
        failMessage: req.session.failMessage,
        formData: req.session.formData,
        roleList: roles
    });
    req.session.formData = null;
    req.session.failMessage = null;
});
adminRouter.post(
    "/newUser", 
    Verify,
    VerifyRole("manage_users"),
    Validate,
    Register
);


adminRouter.get("/dashboard/users", Verify, VerifyRole("manage_users"), async (req, res) => {
    const users = await User.find().populate('role', 'roleName'); // Populate the Role field with the role name
    const rolePermissons = req.user.role.permissions; // Safe check for req.user

    res.render("admin/userdash", {

        rolePermissons: rolePermissons,
        users: users,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage
    });
    req.session.failMessage = null; // Clear the fail message after rendering
    req.session.successMessage = null; // Clear the success message after rendering

});
adminRouter.get('/editUser/:id',Verify,VerifyRole("manage_users"), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.render('admin/editUser', {failMessage: req.session.failMessage, formData: user,userrole: req.user.role,roleList: await Role.find(),rolePermissons: req.user.role.permissions }); 
    } catch (err) {
        logger.error(err);
        res.status(500).send('Server Error');
    }
});

adminRouter.post('/editUser/:id',Verify,VerifyRole("manage_users") , async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.body.password=== '') {
            const user = await User.findById(req.params.id);
            updateData.password = user.password;
        }else{
            updateData.password = await bcrypt.hash(req.body.password, 10);
        }
        console.log(updateData);
        await User.findByIdAndUpdate(req.params.id, updateData, { runValidators: true });
        req.session.successMessage = 'User modified successfully!';
        res.redirect('/admin/dashboard/users');
    } catch (err) {
        console.error(err);
        if (err.errors || err.code === 11000) {

            const errorMessage = err.errors
                ? Object.values(err.errors).map(error => error.message).join(' ')
                : 'Ez a User már létezik!';
            return res.render('admin/editUser', {
                formData: req.body,
                successMessage: null,
                failMessage: errorMessage,
                user: { ...req.body, _id: req.params.id }
            });
        }
        logger.error(err);
        res.status(500).send('Server Error');
    }
});


adminRouter.get("/dashboard", Verify,VerifyRole("admin_dashboard"), async (req, res) => {
    const rolePermissons = req.user.role.permissions; // Safe check for req.user
    res.render("admin/admindash", {
        rolePermissons: rolePermissons,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage
    });
    req.session.failMessage = null; // Clear the fail message after rendering
    req.session.successMessage = null; // Clear the success message after rendering
}); 


adminRouter.delete('/deleteUser/:userId', Verify,VerifyRole("manage_users"), async (req, res) => {
    try {
        const UserId = req.params.userId;
        await User.findByIdAndDelete(UserId);
        req.session.successMessage = 'User successfully deleted.';
        res.status(200).send('User deleted.');
    } catch (err) {
        logger.error("Err:" +err.toString());
        res.status(500).send('Server Error');
    }
});


//ROLE MANAGEMENT ROUTES
adminRouter.get("/dashboard/roles", Verify, VerifyRole("manage_roles"), async (req, res) => {
    try {
                const roles = await Role.find();

        const RoleNumList = [];
        for (const role of roles) {
            const CountUsersbyRoleId = await User.countDocuments({ role: role._id });
            RoleNumList.push({ roleID: role._id, count: CountUsersbyRoleId });
        }
        res.render("admin/roledash", {
            rolenumlist: RoleNumList,
            rolePermissons: req.user.role.permissions,
            roles: roles,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage
        });
        req.session.failMessage = null; // Clear the fail message after rendering
        req.session.successMessage = null; // Clear the success message after rendering
    } catch (err) {
        logger.error(err);
        res.status(500).send('Server Error');
    }
});
adminRouter.get("/newRole", Verify, VerifyRole("manage_roles"), async (req, res) => {
    const permissions = await Permissions.find();
    res.render("admin/newRole", {
        permissions: permissions,
        rolePermissons: req.user.role.permissions,
        failMessage: req.session.failMessage,
        formData: req.session.formData
    });
    req.session.formData = null; // Clear the form data after rendering
    req.session.failMessage = null; // Clear the fail message after rendering
});

adminRouter.post("/newRole", Verify, VerifyRole("manage_roles"), async (req, res) => {
    try {
        const { roleName, description, permissions } = req.body;
        const newRole = new Role({
            roleName,
            description,
            permissions
        });
        await newRole.save();
        req.session.successMessage = 'Role created successfully.';
        res.redirect('/admin/dashboard/roles');
    } catch (err) {
        logger.error(err);
        req.session.failMessage = 'Error creating role. Please try again.';
        req.session.formData = req.body; // Save form data to session
        res.redirect('/admin/newRole');
    }
});

adminRouter.get('/editRole/:id', Verify, VerifyRole("manage_roles"), async (req, res) => {
    try {
        const roles = await Role.find();
        const permissions = await Permissions.find();
        const role = await Role.findById(req.params.id);
        if (!role) {
            req.session.failMessage = 'Role not found.';
            return res.redirect('/admin/dashboard/roles');
        }
        res.render('admin/editRole', {
            permissions: permissions,
            rolePermissons: req.user.role.permissions,
            failMessage: req.session.failMessage,
            formData: role
        });
        req.session.failMessage = null; // Clear the fail message after rendering
    } catch (err) {
        logger.error(err);
        res.status(500).send('Server Error');
    }
});

adminRouter.post('/editRole/:id', Verify, VerifyRole("manage_roles"), async (req, res) => {
    try {
        const { roleName, description, permissions } = req.body;
        
        const updatedRole = await Role.findByIdAndUpdate(req.params.id, {
            roleName,
            description,
            permissions
        }, { runValidators: true });

        if (!updatedRole) {
            req.session.failMessage = 'Role not found.';
            return res.redirect('/admin/dashboard/roles');
        }

        req.session.successMessage = 'Role updated successfully.';
        res.redirect('/admin/dashboard/roles');
    } catch (err) {
        logger.error(err);
        req.session.failMessage = 'Error updating role. Please try again.';
        res.redirect(`/admin/editRole/${req.params.id}`);
    }
}); 

adminRouter.delete('/deleteRole/:roleId', Verify, VerifyRole("manage_roles"), async (req, res) => {
    try {
        const roleId = req.params.roleId;
        const role = await Role.findById(roleId);
        if (!role) {
            req.session.failMessage = 'Role not found.';
            return res.status(404).send('Role not found.');
        }

        // Check if the role is assigned to any user
        const userCount = await User.countDocuments({ role: roleId });
        if (userCount > 0) {
            req.session.failMessage = 'Cannot delete role. It is assigned to one or more users.';
            return res.status(400).send('Cannot delete role. It is assigned to one or more users.');
        }

        await Role.findByIdAndDelete(roleId);
        req.session.successMessage = 'Role successfully deleted.';
        res.status(200).send('Role deleted.');
    } catch (err) {
        logger.error("Err:" + err.toString());
        res.status(500).send('Server Error');
    }
});

// PERMISSION MANAGEMENT ROUTES
adminRouter.get("/dashboard/permissions", Verify, VerifyRole("manage_permissions"), async (req, res) => {
    try {
        const permissions = await Permissions.find();
        const RoleList = await Role.find();
        const RolePermNumList = [];
        for (const perm of permissions) {
            let CountRolesbyPermissionId = 0;
            for (const role of RoleList) {
               if( role.permissions.includes(perm.name)){
                    CountRolesbyPermissionId++;
                }
               
            }
            RolePermNumList.push({ permID: perm._id, count: CountRolesbyPermissionId });
        }
        res.render("admin/permdash", {
            rolepermNumList: RolePermNumList,
            rolePermissons: req.user.role.permissions,
            permissions: permissions,
            failMessage: req.session.failMessage,
            successMessage: req.session.successMessage
        });
        req.session.failMessage = null; // Clear the fail message after rendering
        req.session.successMessage = null; // Clear the success message after rendering

    } catch (err) {
        logger.error(err);
        res.status(500).send('Server Error');
    }


});
adminRouter.get("/newPermission", Verify, VerifyRole("manage_permissions"), (req, res) => {
    res.render("admin/newPerm", {
        rolePermissons: req.user.role.permissions,
        failMessage: req.session.failMessage,
        formData: req.session.formData
    });
    req.session.formData = null; // Clear the form data after rendering
    req.session.failMessage = null; // Clear the fail message after rendering
});

adminRouter.post("/newPermission", Verify, VerifyRole("manage_permissions"), async (req, res) => {
    try {
        console.log(req.body);
        const {name, displayName, attachedURL, requestType } = req.body;
        const newPermission = new Permissions({
            name,
            displayName,
            attachedURL,
            requestType
        });
        await newPermission.save();
        req.session.successMessage = 'Permission created successfully.';
        res.redirect('/admin/dashboard/permissions');
    } catch (err) {
        logger.error(err);
        req.session.failMessage = 'Error creating permission. Please try again.';
        req.session.formData = req.body; // Save form data to session
        res.redirect('/admin/newPermission');
    }
});

adminRouter.get('/editPermission/:id', Verify, VerifyRole("manage_permissions"), async (req, res) => {
    try {
        const permission = await Permissions.findById(req.params.id);
        if (!permission) {
            req.session.failMessage = 'Permission not found.';
            return res.redirect('/admin/dashboard/permissions');
        }
        res.render('admin/editPerm', {
            rolePermissons: req.user.role.permissions,
            failMessage: req.session.failMessage,
            formData: permission
        });
        req.session.failMessage = null;
    } catch (err) {
        logger.error(err);
        res.status(500).send('Server Error');
    }
});

adminRouter.post('/editPermission/:id', Verify, VerifyRole("manage_permissions"), async (req, res) => {
    try {
        const { name, displayName, attachedURL, requestType } = req.body;
        const updatedPermission = await Permissions.findByIdAndUpdate(req.params.id, {
            name,
            displayName,
            attachedURL,
            requestType
        }, { runValidators: true });

        if (!updatedPermission) {
            req.session.failMessage = 'Permission not found.';
            return res.redirect('/admin/dashboard/permissions');
        }

        req.session.successMessage = 'Permission updated successfully.';
        res.redirect('/admin/dashboard/permissions');
    } catch (err) {
        logger.error(err);
        req.session.failMessage = 'Error updating permission. Please try again.';
        res.redirect(`/admin/editPermission/${req.params.id}`);
    }
});
export default adminRouter;