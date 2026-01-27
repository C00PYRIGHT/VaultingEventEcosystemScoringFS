import { logger } from '../logger.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  getAllMappings,
  getMappingById,
  createMapping,
  updateMapping,
  deleteMapping,
  getAllPermissions
} from '../DataServices/mappingData.js';


const renderNew = (req, res) => {
  res.render('mapping/newTablemapping', {
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
  const newMapping = await createMapping(req.body);
  logger.db(`Mapping ${newMapping._id} created by user ${req.user.username}.`);
  req.session.successMessage = 'Mapping created successfully!';
  res.redirect('/mapping/dashboard');
});

const dashboard = asyncHandler(async (req, res) => {
  const mappings = await getAllMappings();
  res.render('mapping/tablemappingdash', {
    mappings,
    rolePermissons: req.user?.role?.permissions,
    failMessage: req.session.failMessage,
    successMessage: req.session.successMessage,
    user: req.user
  });
  req.session.failMessage = null;
  req.session.successMessage = null;
});

const editGet = asyncHandler(async (req, res) => {
  const mapping = await getMappingById(req.params.id);
  res.render('mapping/editTablemapping', {
    formData: mapping,
    rolePermissons: req.user?.role?.permissions,
    failMessage: req.session.failMessage,
    successMessage: req.session.successMessage,
    user: req.user
  });
  req.session.failMessage = null;
  req.session.successMessage = null;
});

const editPost = asyncHandler(async (req, res) => {
  const mapping = await updateMapping(req.params.id, req.body);
  logger.db(`Mapping ${mapping._id} updated by user ${req.user.username}.`);
  req.session.successMessage = 'Mapping updated successfully!';
  res.redirect('/mapping/dashboard');
});

const delete_ = asyncHandler(async (req, res) => {
  const mapping = await deleteMapping(req.params.id);
  logger.db(`Mapping ${mapping._id} deleted by user ${req.user.username}.`);
  req.session.successMessage = 'Mapping deleted successfully!';
  res.status(200).json({ message: 'Mapping deleted successfully' });
});

export default {
  renderNew,
  createNew,
  dashboard,
  editGet,
  editPost,
  delete: delete_
};
