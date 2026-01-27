import { logger } from '../logger.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
    getUserById,
    updateUserProfile,
    getUserProfileFormData
} from '../DataServices/userData.js';

/**
 * @route GET /profile/:id
 * @desc Show user profile edit form
 */
const getProfileEditForm = asyncHandler(async (req, res) => {
    const user = await getUserById(req.params.id);
    const { roleList } = await getUserProfileFormData();
    res.render("selfEdit", {
        formID: req.params.id,
        formData: user,
        roleList,
        rolePermissons: req.user?.role.permissions,
        user: req.user,
        successMessage: req.session.successMessage,
        failMessage: req.session.failMessage
    });
    req.session.successMessage = null;
    req.session.failMessage = null;
});

/**
 * @route POST /profile/:id
 * @desc Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
    await updateUserProfile(req.params.id, req.body);
    logger.db(`User ${req.user.username} updated their profile.`);
    req.session.successMessage = 'Profile updated successfully!';
    res.redirect(`/profile/${req.params.id}`);
});

export default {
    getProfileEditForm,
    updateProfile
};
