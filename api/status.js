const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

// รหัส Google Sheet ของคุณ (คัดลอกจาก URL ระหว่าง /d/ กับ /edit)
// ตัวอย่าง: https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
const SPREADSHEET_ID = 'ใส่-GOOGLE-SHEET-ID-ของคุณ-ที่นี่'; 

// ชื่อชีตและช่วงข้อมูลที่ต้องการอ่าน (เช่น 'ตาราง3!A:G')
const SHEET_NAME_RANGE = 'ตาราง3!A:G'; 

module.exports = async (req, res) => {
    // กำหนดค่า Header สำหรับ CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // จัดการ OPTIONS request สำหรับ CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).send();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { trackingId } = req.body;

    if (!trackingId) {
        return res.status(400).json({ error: 'Tracking ID is required.' });
    }

    try {
        // 1. สร้าง GoogleAuth Object จาก Environment Variables
        const privateKey = process.env.GOOGLE_PRIVATE_KEY;
        
        const auth = new GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_EMAIL,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // 2. อ่านข้อมูลจาก Google Sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: SHEET_NAME_RANGE,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return res.status(404).json({ status: 'Sheet Empty', message: 'ไม่พบข้อมูลในตาราง.' });
        }

        // 3. ค้นหาสถานะ
        // แถวแรกคือ Header (ชื่อบัญชี, รูปสินค้า, ชื่อสินค้า, ฯลฯ)
        const header = rows[0]; 
        const dataRows = rows.slice(1);
        
        const trackingColIndex = 0; // คอลัมน์ A (index 0) คือ 'ชื่อบัญชี' (รหัสติดตาม)
        const statusColIndex = 6;  // คอลัมน์ G (index 6) คือ 'สถานะ'

        let statusFound = false;
        let result = {};

        for (const row of dataRows) {
            if (row[trackingColIndex] === trackingId) {
                // สถานะที่อยู่ในคอลัมน์ G
                const status = row[statusColIndex] || 'ไม่พบสถานะล่าสุด'; 

                // ดึงข้อมูลทั้งหมดของแถวนั้นมาตอบกลับ
                result = {
                    trackingId: row[trackingColIndex],
                    productName: row[3], // D: ชื่อสินค้า
                    price: row[4],       // E: ราคาสินค้า
                    status: status,      // G: สถานะ
                    allData: row         // ข้อมูลแถวทั้งหมด
                };

                statusFound = true;
                break;
            }
        }

        if (statusFound) {
            return res.status(200).json({ status: 'success', data: result });
        } else {
            return res.status(404).json({ status: 'not_found', message: `ไม่พบรหัสติดตาม "${trackingId}" ในระบบ.` });
        }

    } catch (error) {
        console.error('Google Sheet Connection Error:', error);
        return res.status(500).json({ error: 'การเชื่อมต่อ Google Sheet ล้มเหลว' });
    }
};
