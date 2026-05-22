// var express = require("express");
// var route = express.Router();
// var { verifyToken } = require('./middleware/auth'); // Import middleware

// var { login } = require('./controller/login')
// route.post('/login', login)

// var { Register } = require('./controller/registartion')
// route.post('/register', Register)

// var { forgotpassword, verifyOtp, ResetPassword } = require('./controller/forgetpassword')
// route.post('/forgotpassword', forgotpassword)
// route.post('/verifyOtp', verifyOtp)
// route.post('/changepassword', ResetPassword)

// var { verifyOtp } = require('./controller/registartion')
// route.post('/register/verifyOtp', verifyOtp)

// var { RazorpayCallback } = require('./controller/razorpaycallback')
// route.get('/razorpay/callback', RazorpayCallback)

// // Protected Routes

// var { LogOut } = require('./controller/login')
// route.post('/logout', verifyToken, LogOut)

// // var { addbike } = require('./controller/addbike')
// // route.post('/add/bike', verifyToken, addbike)

// // var { listbike } = require('./controller/addbike')
// // route.post('/list/bike', verifyToken, listbike)

// // var { deleteBikes } = require('./controller/addbike')
// // route.post('/delete/bike', verifyToken, deleteBikes)

// // var { editbikes } = require('./controller/addbike')
// // route.post('/edit/bike', verifyToken, editbikes)

// var { bookings, listbooking, extendbooking } = require('./controller/booking')
// route.post('/add/booking', verifyToken, bookings)
// route.post('/list/booking', verifyToken, listbooking)
// route.post('/extend/booking', verifyToken, extendbooking);

// var { updateBookingStatus } = require('./controller/updatebooking')
// route.post('/update/status', verifyToken, updateBookingStatus)

// var { cancelBooking } = require('./controller/cancelbooking')
// route.post('/cancel/booking', verifyToken, cancelBooking)

// var { EditPersonalInfo } = require('./controller/editprofile')
// route.post('/edit/profile', verifyToken, EditPersonalInfo)

// var { ContactUs, listcontact, deletecontact } = require('./controller/contact')
// route.post('/add/contact', verifyToken, ContactUs)
// route.post('/list/contact', verifyToken, listcontact)
// route.post('/delete/contact', verifyToken, deletecontact)

// var { documents } = require('./controller/documents')
// route.post('/add/document', verifyToken, documents)

// var { listNotification } = require('./controller/listnotification')
// route.post('/list/notification', verifyToken, listNotification)

// var { reviewadd } = require('./controller/review')
// route.post('/add/review', verifyToken, reviewadd)

// var { listUser, listAdmincontact, deleteUser } = require('./controller/listUser')
// route.post('/list/user', verifyToken, listUser)
// route.post('/list/contacts', verifyToken, listAdmincontact)
// route.post('/deleteUser', verifyToken, deleteUser);

// var { addbikecenter, listcenter, deletecenter, editcenter } = require('./controller/bikeceneter')
// route.post('/add/center', verifyToken, addbikecenter)
// route.post('/list/center', verifyToken, listcenter)
// route.post('/delete/center', verifyToken, deletecenter)
// route.post('/edit/center', verifyToken, editcenter)

// var { Invoice } = require('./controller/Invoice')
// route.post('/booking/invoice', verifyToken, Invoice)

// var { AddPriceDetails, ListPriceDetails, DeletePriceDetails, EditPriceDetails } = require('./controller/priceDetails')
// route.post('/add/price', verifyToken, AddPriceDetails)
// route.post('/list/price', ListPriceDetails)
// route.post('/delete/price', verifyToken, DeletePriceDetails)
// route.post('/edit/price', verifyToken, EditPriceDetails)

// module.exports = route



const express = require("express");
const route = express.Router();
const logger = require('./util/logger'); // make sure path is correct
const { verifyToken } = require('./middleware/auth'); // Auth middleware

// ========================
// Auth Routes
// ========================
const { login, LogOut } = require('./controller/login');
const { Register, verifyOtp: registerVerifyOtp } = require('./controller/registartion');
const { forgotpassword, verifyOtp, ResetPassword } = require('./controller/forgetpassword');

route.post('/login', (req, res) => {
    logger.info("POST /login called");
    login(req, res);
});

route.post('/register', (req, res) => {
    logger.info("POST /register called");
    Register(req, res);
});

route.post('/register/verifyOtp', (req, res) => {
    logger.info("POST /register/verifyOtp called");
    registerVerifyOtp(req, res);
});

route.post('/forgotpassword', (req, res) => {
    logger.info("POST /forgotpassword called");
    forgotpassword(req, res);
});

route.post('/verifyOtp', (req, res) => {
    logger.info("POST /verifyOtp called");
    verifyOtp(req, res);
});

route.post('/changepassword', (req, res) => {
    logger.info("POST /changepassword called");
    ResetPassword(req, res);
});

// Protected
route.post('/logout', verifyToken, (req, res) => {
    logger.info("POST /logout called");
    LogOut(req, res);
});

// ========================
// Booking Routes
// ========================
const { bookings, listbooking, extendbooking } = require('./controller/booking');
const { updateBookingStatus } = require('./controller/updatebooking');
const { cancelBooking } = require('./controller/cancelbooking');

route.post('/add/booking', verifyToken, (req, res) => {
    logger.info("POST /add/booking called");
    bookings(req, res);
});

route.post('/list/booking', verifyToken, (req, res) => {
    logger.info("POST /list/booking called");
    listbooking(req, res);
});

route.post('/extend/booking', verifyToken, (req, res) => {
    logger.info("POST /extend/booking called");
    extendbooking(req, res);
});

route.post('/update/status', verifyToken, (req, res) => {
    logger.info("POST /update/status called");
    updateBookingStatus(req, res);
});

route.post('/cancel/booking', verifyToken, (req, res) => {
    logger.info("POST /cancel/booking called");
    cancelBooking(req, res);
});

// ========================
// User / Profile Routes
// ========================
const { EditPersonalInfo } = require('./controller/editprofile');
const { listUser, listAdmincontact, deleteUser } = require('./controller/listUser');

route.post('/edit/profile', verifyToken, (req, res) => {
    logger.info("POST /edit/profile called");
    EditPersonalInfo(req, res);
});

route.post('/list/user', verifyToken, (req, res) => {
    logger.info("POST /list/user called");
    listUser(req, res);
});

route.post('/list/contacts', verifyToken, (req, res) => {
    logger.info("POST /list/contacts called");
    listAdmincontact(req, res);
});

route.post('/deleteUser', verifyToken, (req, res) => {
    logger.info("POST /deleteUser called");
    deleteUser(req, res);
});

// ========================
// Contact Routes
// ========================
const { ContactUs, listcontact, deletecontact } = require('./controller/contact');

route.post('/add/contact', (req, res) => {
    logger.info("POST /add/contact called");
    ContactUs(req, res);
});

route.post('/list/contact', verifyToken, (req, res) => {
    logger.info("POST /list/contact called");
    listcontact(req, res);
});

route.post('/delete/contact', verifyToken, (req, res) => {
    logger.info("POST /delete/contact called");
    deletecontact(req, res);
});

// ========================
// Bike Routes
// ========================
const { addbike, listbike, deleteBikes, editbikes } = require('./controller/addbike');

route.post('/add/bike', verifyToken, (req, res) => {
    logger.info("POST /add/bike called");
    addbike(req, res);
});

route.post('/list/bike', verifyToken, (req, res) => {
    logger.info("POST /list/bike called");
    listbike(req, res);
});

route.post('/delete/bike', verifyToken, (req, res) => {
    logger.info("POST /delete/bike called");
    deleteBikes(req, res);
});

route.post('/edit/bike', verifyToken, (req, res) => {
    logger.info("POST /edit/bike called");
    editbikes(req, res);
});

// ========================
// Other Routes
// ========================
const { documents } = require('./controller/documents');
const { listNotification } = require('./controller/listnotification');
const { reviewadd } = require('./controller/review');
const { Invoice } = require('./controller/Invoice');
const { addbikecenter, listcenter, deletecenter, editcenter } = require('./controller/bikeceneter');
const { AddPriceDetails, ListPriceDetails, DeletePriceDetails, EditPriceDetails } = require('./controller/priceDetails');
const { RazorpayCallback } = require('./controller/razorpaycallback');

route.post('/add/document', verifyToken, (req, res) => {
    logger.info("POST /add/document called");
    documents(req, res);
});

route.post('/list/notification', verifyToken, (req, res) => {
    logger.info("POST /list/notification called");
    listNotification(req, res);
});

route.post('/add/review', verifyToken, (req, res) => {
    logger.info("POST /add/review called");
    reviewadd(req, res);
});

route.post('/add/center', verifyToken, (req, res) => {
    logger.info("POST /add/center called");
    addbikecenter(req, res);
});

route.post('/list/center', verifyToken, (req, res) => {
    logger.info("POST /list/center called");
    listcenter(req, res);
});

route.post('/delete/center', verifyToken, (req, res) => {
    logger.info("POST /delete/center called");
    deletecenter(req, res);
});

route.post('/edit/center', verifyToken, (req, res) => {
    logger.info("POST /edit/center called");
    editcenter(req, res);
});

route.post('/booking/invoice', verifyToken, (req, res) => {
    logger.info("POST /booking/invoice called");
    Invoice(req, res);
});

route.post('/add/price', verifyToken, (req, res) => {
    logger.info("POST /add/price called");
    AddPriceDetails(req, res);
});

route.post('/list/price', (req, res) => {
    logger.info("POST /list/price called");
    ListPriceDetails(req, res);
});

route.post('/delete/price', verifyToken, (req, res) => {
    logger.info("POST /delete/price called");
    DeletePriceDetails(req, res);
});

route.post('/edit/price', verifyToken, (req, res) => {
    logger.info("POST /edit/price called");
    EditPriceDetails(req, res);
});

// Razorpay callback
route.get('/razorpay/callback', (req, res) => {
    logger.info("GET /razorpay/callback called");
    RazorpayCallback(req, res);
});

// ========================
// Payment Reports
// ========================
const { paymentReportList, paymentReportExcel } = require('./controller/paymentReport');

route.post('/report/payments', verifyToken, (req, res) => {
    logger.info("POST /report/payments called");
    paymentReportList(req, res);
});

route.post('/report/excel', verifyToken, (req, res) => {
    logger.info("POST /report/excel called");
    paymentReportExcel(req, res);
});

module.exports = route;
