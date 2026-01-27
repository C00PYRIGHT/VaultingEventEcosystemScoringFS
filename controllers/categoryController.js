import { logger } from '../logger.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} from '../DataServices/categoryData.js';

/**
 * @route GET /category/new
 * @desc Show new category form
 */
const getNewCategoryForm = asyncHandler(async (req, res) => {
    res.render('category/newCategory', {
        formData: req.session.formData,
        rolePermissons: req.user?.role?.permissions,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
});

/**
 * @route POST /category/new
 * @desc Create new category
 */
const createNewCategoryHandler = asyncHandler(async (req, res) => {
    const newCategory = await createCategory(req.body);
    logger.db(`Category ${newCategory.name} created by user ${req.user.username}.`);
    req.session.successMessage = 'Category created successfully!';
    res.redirect('/category/dashboard');
});

/**
 * @route GET /category/dashboard
 * @desc Show categories dashboard
 */
const getCategoriesDashboard = asyncHandler(async (req, res) => {
    const categorys = await getAllCategories();
    res.render('category/categorydash', {
        categorys,
        rolePermissons: req.user?.role?.permissions,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
});

/**
 * @route GET /category/edit/:id
 * @desc Show edit category form
 */
const getEditCategoryForm = asyncHandler(async (req, res) => {
    const category = await getCategoryById(req.params.id);
    res.render('category/editCategory', {
        formData: category,
        rolePermissons: req.user?.role?.permissions,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
});

/**
 * @route POST /category/edit/:id
 * @desc Update category
 */
const updateCategoryHandler = asyncHandler(async (req, res) => {
    const updated = await updateCategory(req.params.id, req.body);
    logger.db(`Category ${updated.CategoryDispName} updated by user ${req.user.username}.`);
    req.session.successMessage = 'Category updated successfully!';
    res.redirect('/category/dashboard');
});

/**
 * @route DELETE /category/delete/:id
 * @desc Delete category
 * @note Currently commented out in original code - can be implemented if needed
 */
const deleteCategoryHandler = asyncHandler(async (req, res) => {
    const category = await deleteCategory(req.params.id);
    logger.db(`Category ${category.name} deleted by user ${req.user.username}.`);
    if (!category) {
        req.session.failMessage = 'Category not found';
        return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully' });
});

export default {
    getNewCategoryForm,
    createNewCategoryHandler,
    getCategoriesDashboard,
    getEditCategoryForm,
    updateCategoryHandler,
    deleteCategoryHandler
};
