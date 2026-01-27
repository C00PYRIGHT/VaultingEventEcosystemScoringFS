import { logger } from '../logger.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
    getAllGenerators,
    getGeneratorFormData,
    createGenerator,
    updateGenerator,
    updateGeneratorStatus,
    getGeneratorById,
    deleteGenerator
} from '../DataServices/resultGeneratorData.js';

/**
 * @route GET /result/generator/dashboard
 * @desc Show result generators dashboard
 */
const getGeneratorsDashboard = asyncHandler(async (req, res) => {
    const generators = await getAllGenerators();
    res.render("resultGen/dashboard", {
        generators: generators,
        rolePermissons: req.user?.role?.permissions,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
});

/**
 * @route GET /result/generator/new
 * @desc Show new result generator form
 */
const getNewGeneratorForm = asyncHandler(async (req, res) => {
    const { categories, calcTemplates } = await getGeneratorFormData();
    res.render("resultGen/newResultGen", {
        formData: req.session.formData || {},
        categories: categories,
        resultCalcs: calcTemplates,
        rolePermissons: req.user?.role?.permissions,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
});

/**
 * @route POST /result/generator/new
 * @desc Create new result generator
 */
const createNewGenerator = asyncHandler(async (req, res) => {
    const newGenerator = await createGenerator(req.body);
    logger.db(`Result generator ${newGenerator._id} created by user ${req.user.username}.`);
    req.session.successMessage = "Result generator created successfully.";
    res.redirect("/result/generator/dashboard");
});

/**
 * @route POST /result/generator/status/:id
 * @desc Update result generator status
 */
const updateGeneratorStatusById = asyncHandler(async (req, res) => {
    const generator = await updateGeneratorStatus(req.params.id, req.body.status);
    logger.db(`Result generator ${generator._id} status updated to ${req.body.status} by user ${req.user.username}.`);
    res.status(200).send("Result generator status updated successfully.");
});

/**
 * @route GET /result/generator/edit/:id
 * @desc Show edit result generator form
 */
const getEditGeneratorForm = asyncHandler(async (req, res) => {
    const generator = await getGeneratorById(req.params.id);
    const { categories, calcTemplates } = await getGeneratorFormData();
    res.render("resultGen/editResultGen", {
        formData: generator,
        categories: categories,
        resultCalcs: calcTemplates,
        rolePermissons: req.user?.role?.permissions,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
});

/**
 * @route POST /result/generator/edit/:id
 * @desc Update result generator
 */
const updateGeneratorById = asyncHandler(async (req, res) => {
    const generator = await updateGenerator(req.params.id, req.body);
    logger.db(`Result generator ${generator._id} edited by user ${req.user.username}.`);
    req.session.successMessage = "Result generator edited successfully.";
    res.redirect("/result/generator/dashboard");
});

/**
 * @route DELETE /result/generator/delete/:id
 * @desc Delete result generator
 */
const deleteGeneratorById = asyncHandler(async (req, res) => {
    const generator = await deleteGenerator(req.params.id);
    logger.db(`Result generator ${generator._id} deleted by user ${req.user.username}.`);
    res.status(200).send("Result generator deleted successfully.");
});

export default {
    getGeneratorsDashboard,
    getNewGeneratorForm,
    createNewGenerator,
    updateGeneratorStatusById,
    getEditGeneratorForm,
    updateGeneratorById,
    deleteGeneratorById
};
