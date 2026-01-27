import { logger } from '../logger.js';
import DashCards from '../models/DashCards.js';
import Permissions from '../models/Permissions.js';

/**
 * Get all dashboard cards
 */
export async function getAllCards() {
    return await DashCards.find();
}

/**
 * Get card by ID
 */
export async function getCardById(cardId) {
    return await DashCards.findById(cardId);
}

/**
 * Get form data for card creation/editing
 */
export async function getCardFormData() {
    const permissionList = await Permissions.find();
    return { permissionList };
}

/**
 * Create a new dashboard card
 */
export async function createCard(cardData) {
    const newCard = new DashCards(cardData);
    await newCard.save();
    return newCard;
}

/**
 * Update dashboard card
 */
export async function updateCard(cardId, cardData) {
    return await DashCards.findByIdAndUpdate(cardId, cardData, { runValidators: true });
}

/**
 * Delete dashboard card
 */
export async function deleteCard(cardId) {
    return await DashCards.findByIdAndDelete(cardId);
}
