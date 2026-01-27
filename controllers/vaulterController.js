import { logger } from '../logger.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
    getAllVaulters,
    getVaulterById,
    getVaulterByIdLean,
    createVaulter,
    updateVaulter,
    updateVaulterArmNumber,
    addIncidentToVaulter,
    removeIncidentFromVaulter,
    getAllEntriesWithVaulters,
    getAllPermissions,
    getAllUsers
} from '../DataServices/vaulterData.js';

const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua & Deps",
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas",
    "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize",
    "Benin", "Bhutan", "Bolivia", "Bosnia Herzegovina", "Botswana", "Brazil",
    "Brunei", "Bulgaria", "Burkina", "Burundi", "Cambodia", "Cameroon",
    "Canada", "Cape Verde", "Central African Rep", "Chad", "Chile", "China",
    "Colombia", "Comoros", "Congo", "Congo {Democratic Rep}", "Costa Rica",
    "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti",
    "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt",
    "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia",
    "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany",
    "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
    "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia",
    "Iran", "Iraq", "Ireland {Republic}", "Israel", "Italy", "Ivory Coast",
    "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
    "Korea North", "Korea South", "Kosovo", "Kuwait", "Kyrgyzstan", "Laos",
    "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
    "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia",
    "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
    "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
    "Morocco", "Mozambique", "Myanmar, {Burma}", "Namibia", "Nauru", "Nepal",
    "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway",
    "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay",
    "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
    "Russian Federation", "Rwanda", "St Kitts & Nevis", "St Lucia",
    "Saint Vincent & the Grenadines", "Samoa", "San Marino", "Sao Tome & Principe",
    "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone",
    "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
    "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname",
    "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
    "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad & Tobago", "Tunisia",
    "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
    "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
    "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen",
    "Zambia", "Zimbabwe"
];

const getNewVaulterForm = asyncHandler(async (req, res) => {
    res.render('vaulter/newVaulter', {
        countries: countries,
        formData: req.session.formData,
        rolePermissons: req.user?.role?.permissions,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
});

const createNewVaulter = asyncHandler(async (req, res) => {
    const newVaulter = req.body;
    const armNr = {
        eventID: res.locals.selectedEvent._id,
        armNumber: req.body.ArmNr
    };
    newVaulter.ArmNr = [armNr];

    await createVaulter(newVaulter);
    req.session.successMessage = 'Vaulter created successfully!';
    res.redirect('/vaulter/dashboard');
});

const getVaultersDashboard = asyncHandler(async (req, res) => {
    const vaulters = await getAllVaulters();
    vaulters.forEach(element => {
        element.ArmNr = element.ArmNr.filter(a => String(a.eventID) === String(res.locals.selectedEvent._id));
    });
    res.render('vaulter/vaulterdash', {
        vaulters,
        rolePermissons: req.user?.role?.permissions,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
});

const getVaulterDetails = asyncHandler(async (req, res) => {
    const eventID = res.locals.selectedEvent._id;
    const vaulter = await getVaulterById(req.params.id);
    vaulter.ArmNr = vaulter.ArmNr.filter(a => String(a.eventID) === String(eventID));
    if (!vaulter) {
        req.session.failMessage = 'Vaulter not found';
        return res.redirect('/vaulter/dashboard');
    }
    res.render('vaulter/vaulterDetail', {
        users: await getAllUsers(),
        formData: vaulter,
        rolePermissons: req.user?.role?.permissions,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
});

const getEditVaulterForm = asyncHandler(async (req, res) => {
    const vaulter = await getVaulterByIdLean(req.params.id);
    vaulter.ArmNr = vaulter.ArmNr.filter(a => String(a.eventID) === String(res.locals.selectedEvent._id));
    if (!vaulter) {
        req.session.failMessage = 'Vaulter not found';
        return res.redirect('/vaulter/dashboard');
    }
    res.render('vaulter/editVaulter', {
        countries: countries,
        formData: vaulter,
        rolePermissons: req.user?.role?.permissions,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
});

const updateVaulterById = asyncHandler(async (req, res) => {
    const ArmNr = req.body.ArmNr;
    delete req.body.ArmNr;

    const vaulter = await updateVaulter(req.params.id, req.body);
    await updateVaulterArmNumber(req.params.id, res.locals.selectedEvent._id, ArmNr);

    if (!vaulter) {
        req.session.failMessage = 'Vaulter not found';
        return res.redirect('/vaulter/dashboard');
    }
    req.session.successMessage = 'Vaulter updated successfully!';
    res.redirect('/vaulter/dashboard');
});

const deleteVaulterIncident = asyncHandler(async (req, res) => {
    const vaulter = await getVaulterById(req.params.id);
    logger.db(`Vaulter ${vaulter.Name} incident delete requested by user ${req.user.username}.`);
    if (!vaulter) {
        req.session.failMessage = 'Vaulter not found';
        return res.status(404).json({ message: 'Vaulter not found' });
    }

    const incidentCriteria = {
        description: req.body.description,
        incidentType: req.body.incidentType,
        date: req.body.date,
        userId: req.user._id
    };

    await removeIncidentFromVaulter(req.params.id, incidentCriteria);
    res.status(200).json({ message: 'Incident deleted successfully' });
});

const createVaulterIncident = asyncHandler(async (req, res) => {
    const vaulter = await getVaulterById(req.params.id);
    logger.db(`Vaulter ${vaulter.Name} incident created by user ${req.user.username}.`);
    const newIncident = {
        description: req.body.description,
        incidentType: req.body.incidentType,
        date: Date.now(),
        User: req.user._id,
        eventID: res.locals.selectedEvent._id
    };
    await addIncidentToVaulter(req.params.id, newIncident);
    req.session.successMessage = 'Incident added successfully!';
    res.status(200).json({ message: 'Incident added successfully!' });
});

const getArmNumbersEditPage = asyncHandler(async (req, res) => {
    const entries = await getAllEntriesWithVaulters();
    const VaulterSet = new Set();
    entries.forEach(entry => {
        entry.vaulter.forEach(vaulter => {
            vaulter.ArmNr = vaulter.ArmNr.filter(a => String(a.eventID) === String(res.locals.selectedEvent._id));
            VaulterSet.add(vaulter);
        });
    });
    res.render('vaulter/numberedit', {
        vaulters: Array.from(VaulterSet),
        rolePermissons: req.user?.role?.permissions,
        failMessage: req.session.failMessage,
        successMessage: req.session.successMessage,
        user: req.user
    });
    req.session.failMessage = null;
    req.session.successMessage = null;
});

const updateArmNumber = asyncHandler(async (req, res) => {
    await updateVaulterArmNumber(req.params.id, res.locals.selectedEvent._id, req.body.armNumber);
    res.status(200).json({ message: 'Arm number updated successfully!' });
});

export default {
    getNewVaulterForm,
    createNewVaulter,
    getVaultersDashboard,
    getVaulterDetails,
    getEditVaulterForm,
    updateVaulterById,
    deleteVaulterIncident,
    createVaulterIncident,
    getArmNumbersEditPage,
    updateArmNumber
};
