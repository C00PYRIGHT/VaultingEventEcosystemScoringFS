import { logger } from '../logger.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
    getAllCalcTemplates,
    getCalcTemplateById,
    createCalcTemplate,
    updateCalcTemplate,
    deleteCalcTemplate,
    getCalcTemplateFormData
} from '../DataServices/resultCalcTemplateData.js';

/**
 * @route GET /result/calcTemp/dashboard
 * @desc Show calculation templates dashboard
 */
const getCalcTemplatesDashboard = asyncHandler(async (req, res) => {
    res.render("resultCalc/dashboard", {
        resultCalcs: await getAllCalcTemplates(),
        rolePermissons: req.user?.role?.permissions,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
});

/**
 * @route GET /result/calcTemp/new
 * @desc Show new calculation template form
 */
const getNewCalcTemplateForm = asyncHandler(async (req, res) => {
    const { categories } = await getCalcTemplateFormData();
    res.render("resultCalc/newResultCalc", {
        formData: req.session.formData || {},
        categoryList: categories,
        rolePermissons: req.user?.role?.permissions,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
});

/**
 * @route POST /result/calcTemp/new
 * @desc Create new calculation template
 */
const createNewCalcTemplate = asyncHandler(async (req, res) => {
    if (Number(req.body.round2FirstP) + Number(req.body.round1FirstP) + Number(req.body.round1SecondP) !== 100) {
        req.session.failMessage = "The sum of the percentages must be 100%.";
        req.session.formData = req.body;
        return res.redirect("/result/calcTemp/new");
    }
    const calcTemp = await createCalcTemplate(req.body);
    logger.db(`Result calculation template ${calcTemp._id} created by user ${req.user.username}.`);
    req.session.successMessage = "Result calculation template created successfully.";
    res.redirect("/result/calcTemp/dashboard");
});

/**
 * @route GET /result/calcTemp/edit/:id
 * @desc Show edit calculation template form
 */
const getEditCalcTemplateForm = asyncHandler(async (req, res) => {
    const calcTemp = await getCalcTemplateById(req.params.id);
    res.render("resultCalc/editResultCalc", {
        formData: calcTemp,
        rolePermissons: req.user?.role?.permissions,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
});

/**
 * @route POST /result/calcTemp/edit/:id
 * @desc Update calculation template
 */
const updateCalcTemplateById = asyncHandler(async (req, res) => {
    if (Number(req.body.round2FirstP) + Number(req.body.round1FirstP) + Number(req.body.round1SecondP) !== 100) {
        const sum = Number(req.body.round2FirstP) + Number(req.body.round1FirstP) + Number(req.body.round1SecondP);
        logger.error('Percentage sum error by user: ' + req.user.username + sum);
        req.session.failMessage = "The sum of the percentages must be 100%.";
        return res.redirect("/result/calcTemp/edit/" + req.params.id);
    }
    const updated = await updateCalcTemplate(req.params.id, req.body);
    logger.db(`Result calculation template ${updated?._id || req.params.id} edited by user ${req.user.username}.`);
    req.session.successMessage = "Result calculation template edited successfully.";
    res.redirect("/result/calcTemp/dashboard");
});

/**
 * @route DELETE /result/calcTemp/delete/:id
 * @desc Delete calculation template
 */
const deleteCalcTemplateById = asyncHandler(async (req, res) => {
    await deleteCalcTemplate(req.params.id);
    logger.db(`Result calculation template ${req.params.id} deleted by user ${req.user.username}.`);
    res.status(200).send("Calculation template deleted successfully.");
});

export default {
    getCalcTemplatesDashboard,
    getNewCalcTemplateForm,
    createNewCalcTemplate,
    getEditCalcTemplateForm,
    updateCalcTemplateById,
    deleteCalcTemplateById
};
