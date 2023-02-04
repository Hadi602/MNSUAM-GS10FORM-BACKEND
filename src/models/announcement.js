const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema({
    Title: { type: String, required: true },
    Semester: { type: String, required: false },
    Only_For: { type: String, required: true },
    Description: { type: String, required: false },
    WhoCreated: { type: String, required: true },
    StartingDate: { type: Date, default: new Date(Date.now()), required: true },
    ClosingDate: { type: Date, required: false }
})

const Announcements = new mongoose.model('Announcemnts', AnnouncementSchema);

module.exports = Announcements;