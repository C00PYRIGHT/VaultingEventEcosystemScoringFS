import { logger } from '../logger.js';
import { asyncHandler } from '../middleware/asyncHandler.js';  // ← ADD!
import {
    getAllCards,
    getCardById,
    getCardFormData,
    createCard,
    updateCard,
    deleteCard
} from '../DataServices/adminCardData.js';

/**
 * @route GET /admin/newCard
 * @desc Show new card form
 */
const getNewCardForm = asyncHandler(async (req, res) => {
    const { permissionList } = await getCardFormData();
    const userrole = req.user?.role.permissions;
    res.render("admin/newCard", {
        permissionList: permissionList,
        rolePermissons: userrole,
        failMessage: req.session.failMessage,
        formData: req.session.formData,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.successMessage = null;
    req.session.formData = null;
    req.session.failMessage = null;
});

/**
 * @route GET /admin/dashboard/cards
 * @desc Show cards dashboard
 */
const getCardsDashboard = asyncHandler(async (req, res) => {
    const cards = await getAllCards();
    const rolePermissons = req.user.role.permissions;
    res.render("admin/carddash", {
        rolePermissons: rolePermissons,
        cards: cards,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
});

/**
 * @route GET /admin/editCard/:id
 * @desc Show edit card form
 */
const getEditCardForm = asyncHandler(async (req, res) => {
    const { permissionList } = await getCardFormData();
    const card = await getCardById(req.params.id);
    res.render('admin/editCard', {
        permissionList: permissionList,
        formData: card,
        failMessage: req.session.failMessage,
        rolePermissons: req.user.role.permissions,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
});

/**
 * @route POST /admin/newCard
 * @desc Create new card
 */
const createNewCardHandler = asyncHandler(async (req, res) => {
    const newCard = await createCard(req.body);
    logger.db(`Card ${newCard.title} created by user ${req.user.username}.`);
    req.session.successMessage = 'Card added successfully!';
    res.redirect('/admin/dashboard/cards');
});

/**
 * @route POST /admin/editCard/:id
 * @desc Update card
 */
const updateCardHandler = asyncHandler(async (req, res) => {
    await updateCard(req.params.id, req.body);
    logger.db(`Card ${req.body.title} updated by user ${req.user.username}.`);
    req.session.successMessage = 'Card modified successfully!';
    res.redirect('/admin/dashboard/cards');
});

/**
 * @route DELETE /admin/deleteCard/:cardId
 * @desc Delete card
 */
const deleteCardHandler = asyncHandler(async (req, res) => {
    const cardId = req.params.cardId;
    await deleteCard(cardId);
    logger.db(`Card ${cardId} deleted by user ${req.user.username}.`);
    req.session.successMessage = 'Card successfully deleted.';
    res.status(200).send('Card deleted.');
});

export default {
    getNewCardForm,
    getCardsDashboard,
    getEditCardForm,
    createNewCardHandler,
    updateCardHandler,
    deleteCardHandler
};
