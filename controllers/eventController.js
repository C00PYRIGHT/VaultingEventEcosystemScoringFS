import { logger } from '../logger.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteResponsiblePerson,
  addResponsiblePerson,
  selectEvent,
  getAllPermissions,
  getAllUsers
} from '../DataServices/eventData.js';

const renderNew = (req, res) => {
  res.render('event/newEvent', {
    formData: req.session.formData,
    rolePermissons: req.user?.role?.permissions,
    failMessage: req.session.failMessage,
    successMessage: req.session.successMessage,
    user: req.user
  });
  req.session.failMessage = null;
  req.session.successMessage = null;
};

const createNew = asyncHandler(async (req, res) => {
  const newEvent = await createEvent(req.body);
  logger.db(`Event ${newEvent.name} created by user ${req.user.username}.`);
  req.session.successMessage = 'Event created successfully!';
  res.redirect('/admin/event/dashboard');
});

const dashboard = asyncHandler(async (req, res) => {
  const events = await getAllEvents();
  logger.debug(req.session.successMessage);
  res.render('event/eventdash', {
    events,
    rolePermissons: req.user?.role?.permissions,
    failMessage: req.session.failMessage,
    successMessage: req.session.successMessage,
    user: req.user
  });
  req.session.failMessage = null;
  req.session.successMessage = null;
});

const editGet = asyncHandler(async (req, res) => {
  const event = await getEventById(req.params.id);
  res.render('event/editEvent', {
    formData: event,
    rolePermissons: req.user?.role?.permissions,
    failMessage: req.session.failMessage,
    successMessage: req.session.successMessage,
    user: req.user
  });
  req.session.failMessage = null;
  req.session.successMessage = null;
});

const editPost = asyncHandler(async (req, res) => {
  const event = await updateEvent(req.params.id, req.body);
  logger.db(`Event ${event.name} updated by user ${req.user.username}.`);
  req.session.successMessage = 'Event updated successfully!';
  res.redirect('/admin/event/dashboard');
});

const details = asyncHandler(async (req, res) => {
  const event = await getEventById(req.params.id);
  const users = await getAllUsers();
  res.render('event/EventDetail', {
    users: users,
    formData: event,
    rolePermissons: req.user?.role?.permissions,
    failMessage: req.session.failMessage,
    successMessage: req.session.successMessage,
    user: req.user
  });
  req.session.failMessage = null;
  req.session.successMessage = null;
});

const deleteResponsiblePersonHandler = asyncHandler(async (req, res) => {
  const event = await deleteResponsiblePerson(req.params.id, req.body);
  logger.db(`Responsible person ${req.body.name} from event ${event.EventName} deleted by user ${req.user.username}.`);
  res.status(200).json({ message: `${req.body.name} responsible person deleted successfully by ${req.user.username}` });
});

const addResponsiblePersonHandler = asyncHandler(async (req, res) => {
  const event = await addResponsiblePerson(req.params.id, req.body);
  logger.db(`Responsible person added to event ${event.EventName} by user ${req.user.username}.`);
  res.status(200).json({ message: 'Responsible person added successfully!' });
});

const selectEventHandler = asyncHandler(async (req, res) => {
  const event = await selectEvent(req.params.eventId);
  logger.db(`Event ${event.EventName} selected by user ${req.user.username}.`);
  req.session.selectedEvent = event._id;
  req.session.successMessage = 'Event selected successfully! ' + event.EventName;
  res.status(200).json({ message: 'Event selected successfully! ' + event.EventName });
});

export default {
  renderNew,
  createNew,
  dashboard,
  editGet,
  editPost,
  details,
  deleteResponsiblePersonHandler,
  addResponsiblePersonHandler,
  selectEventHandler
};
