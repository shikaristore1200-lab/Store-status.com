// ไฟล์: api/status.js (Vercel Serverless Function - ไม่ต้องแก้ไขเพิ่มเติม)

const { google } = require('googleapis');

// ดึงค่าจาก Vercel Environment Variables
const SERVICE_EMAIL = process.env.GOOGLE_SERVICE_EMAIL;
// โค้ดนี้จะแทนที่ \n ใน Environment Variable ให้กลับเป็น Newline จริงๆ
const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'); 

const SHEET_ID = '1ig9GtFnjF_slfSjySLDT01ZYe3NsGRaVYEjx_70YrSQ'; 
const SHEET_RANGE = 'ตาราง3!A:G'; 

module.exports = async (req, res) => {
    // ... (ส่วนการตั้งค่า Header และตรวจสอบ Service Account Keys) ...

    try {
        // 1. ยืนยันตัวตนด้วย Service Account Key
        const auth = new google.auth.JWT(
            SERVICE_EMAIL,
            null,
            PRIVATE_KEY, // ใช้ Private Key ที่ได้จาก Environment Variable
            ['https://www.googleapis.com/auth/spreadsheets.readonly']
        );
        
        const sheets = google.sheets({ version: 'v4', auth });
        // ... (ส่วนที่เหลือของการดึงข้อมูลและค้นหา) ...
