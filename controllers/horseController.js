import { logger } from '../logger.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  getAllHorses,
  getHorseById,
  getHorseByIdWithPopulation,
  createHorse,
  updateHorse,
  deleteHorseNote,
  addHorseNote,
  updateHorseNumbers,
  getHorsesForEvent,
  getAllPermissions
} from '../DataServices/horseData.js';

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua & Deps",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Cape Verde",
  "Central African Rep",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Congo {Democratic Rep}",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland {Republic}",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Korea North",
  "Korea South",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Macedonia",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar, {Burma}",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russian Federation",
  "Rwanda",
  "St Kitts & Nevis",
  "St Lucia",
  "Saint Vincent & the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome & Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Swaziland",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad & Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe"
];


const renderNew = (req, res) => {
  res.render('horse/newHorse', {
    countries: countries,
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
  const forerr = req.body;
  forerr.box = req.body.BoxNr;
  forerr.head = req.body.HeadNr;
  const headNr = req.body.HeadNr;
  const boxNr = req.body.BoxNr;
  delete req.body.HeadNr;
  delete req.body.BoxNr;
  const newHorse = await createHorse(req.body, headNr, boxNr, res.locals.selectedEvent._id);
  logger.db(`Horse ${newHorse.Horsename} created by user ${req.user.username}.`);
  req.session.successMessage = 'Horse created successfully!';
  res.redirect('/horse/dashboard');
});

const dashboard = asyncHandler(async (req, res) => {
  const horses = await getAllHorses();
  horses.forEach(horse => {
    horse.HeadNr = horse.HeadNr.filter(h => String(h.eventID) === String(res.locals.selectedEvent._id));
    horse.BoxNr = horse.BoxNr.filter(b => String(b.eventID) === String(res.locals.selectedEvent._id));
  });
  res.render('horse/horsedash', {
    horses,
    rolePermissons: req.user?.role?.permissions,
    failMessage: req.session.failMessage,
    successMessage: req.session.successMessage,
    user: req.user
  });
  req.session.failMessage = null;
  req.session.successMessage = null;
});

const details = asyncHandler(async (req, res) => {
  const horse = await getHorseByIdWithPopulation(req.params.id);
  horse.HeadNr = horse.HeadNr.filter(h => String(h.eventID) === String(res.locals.selectedEvent._id));
  horse.BoxNr = horse.BoxNr.filter(b => String(b.eventID) === String(res.locals.selectedEvent._id));

  res.render('horse/horseDetail', {
    formData: horse,
    rolePermissons: req.user?.role?.permissions,
    failMessage: req.session.failMessage,
    successMessage: req.session.successMessage,
    user: req.user
  });
  req.session.failMessage = null;
  req.session.successMessage = null;
});

const editGet = asyncHandler(async (req, res) => {
  const horse = await getHorseById(req.params.id);
  horse.HeadNr = horse.HeadNr.filter(h => String(h.eventID) === String(res.locals.selectedEvent._id));
  horse.BoxNr = horse.BoxNr.filter(b => String(b.eventID) === String(res.locals.selectedEvent._id));
  res.render('horse/editHorse', {
    countries: countries,
    formData: horse,
    rolePermissons: req.user?.role?.permissions,
    failMessage: req.session.failMessage,
    successMessage: req.session.successMessage,
    user: req.user
  });
  req.session.failMessage = null;
  req.session.successMessage = null;
});

const editPost = asyncHandler(async (req, res) => {
  const forerr = req.body;
  forerr.box = req.body.BoxNr;
  forerr.head = req.body.HeadNr;

  const boxNr = req.body.BoxNr;
  const headNr = req.body.HeadNr;
  delete req.body.BoxNr;
  delete req.body.HeadNr;

  const horse = await updateHorse(req.params.id, req.body, headNr, boxNr, res.locals.selectedEvent._id);
  logger.db(`Horse ${horse.Horsename} updated by user ${req.user.username}.`);
  req.session.successMessage = 'Horse updated successfully!';
  res.redirect('/horse/dashboard');
});

const deleteNote = asyncHandler(async (req, res) => {
  const horse = await deleteHorseNote(req.params.id, req.body.note);
  logger.db(`Horse ${horse.name} note deleted by user ${req.user.username}.`);
  res.status(200).json({ message: 'Note deleted successfully' });
});

const newNotePost = asyncHandler(async (req, res) => {
  const noteData = {
    note: req.body.note,
    user: req.user._id,
    eventID: res.locals.selectedEvent._id
  };
  const horse = await addHorseNote(req.params.id, noteData);
  logger.db(`Horse ${horse.HorseName} note created by user ${req.user.username}.`);

  res.status(200).json({ message: 'Note added successfully!' });
});

const numbersGet = asyncHandler(async (req, res) => {
  const horses = await getHorsesForEvent(res.locals.selectedEvent._id);

  horses.forEach(horse => {
    horse.HeadNr = horse.HeadNr.filter(h => String(h.eventID) === String(res.locals.selectedEvent._id));
    horse.BoxNr = horse.BoxNr.filter(b => String(b.eventID) === String(res.locals.selectedEvent._id));
  });
  res.render('horse/numberedit', {
    horses,
    rolePermissons: req.user?.role?.permissions,
    failMessage: req.session.failMessage,
    successMessage: req.session.successMessage,
    user: req.user
  });
  req.session.failMessage = null;
  req.session.successMessage = null;
});

const updateNums = asyncHandler(async (req, res) => {
  const horse = await updateHorseNumbers(req.params.id, req.body.headNumber, req.body.boxNumber, res.locals.selectedEvent._id);
  logger.db(`Horse ${horse.HorseName} numbers updated by user ${req.user.username}.`);

  res.status(200).json({ message: 'Numbers updated successfully!' });
});

export default {
  renderNew,
  createNew,
  dashboard,
  details,
  editGet,
  editPost,
  deleteNote,
  newNotePost,
  numbersGet,
  updateNums
};
