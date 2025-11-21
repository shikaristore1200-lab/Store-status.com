const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

const SPREADSHEET_ID = '1ig9GtFnjF_slfSjySLDT01ZYe3NsGRaVYEjx_70YrSQ'; 

// *** เปลี่ยนมาใช้ชีตสรุปใหม่ที่คุณสร้างขึ้นมาเท่านั้น ***
// คุณสามารถตั้งชื่อชีตนี้ว่า 'Summary' หรือ 'รวมข้อมูล' ก็ได้
const SUMMARY_SHEET_NAME = 'Summary'; // <-- เปลี่ยนเป็นชื่อชีตสรุปของคุณ
const DATA_RANGE = 'A:G'; // ดึงข้อมูลทุกคอลัมน์ที่จำเป็น

const SHEET_NAME_RANGE = `${SUMMARY_SHEET_NAME}!${DATA_RANGE}`; 
// โค้ดจะดึงข้อมูลจากชีต Summary เท่านั้น

module.exports = async (req, res) => {
    // ... (ส่วนการตั้งค่า Header และการรับค่า trackingId เหมือนเดิม) ...
    // ... (ส่วนการสร้าง GoogleAuth และ sheets object เหมือนเดิม) ...

    const { trackingId } = req.body;
    // ... (ส่วนตรวจสอบ trackingId) ...

    try {
        const privateKey = process.env.GOOGLE_PRIVATE_KEY; 
        
        const auth = new GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_EMAIL,
                private_key: privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // 1. อ่านข้อมูลจากชีต Summary ทั้งหมด
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: SHEET_NAME_RANGE, // ดึงจากชีต Summary เท่านั้น
        });

        const rows = response.data.values;
        if (!rows || rows.length <= 1) {
            return res.status(404).json({ status: 'Sheet Empty', message: 'ไม่พบข้อมูลในตารางสรุป.' });
        }

        // 2. ค้นหาสถานะในข้อมูลที่ดึงมา
        const dataRows = rows.slice(1);
        const trackingColIndex = 0; // Col1 = Index 0
        const statusColIndex = 6;  // Col7 (G) = Index 6

        let statusFound = false;
        let result = {};

        for (const row of dataRows) {
            if (row[trackingColIndex] === trackingId) {
                const status = row[statusColIndex] || 'ไม่พบสถานะล่าสุด'; 

                result = {
                    trackingId: row[trackingColIndex],
                    productName: row[3], // Col4
                    price: row[4],       // Col5
                    status: status,      // Col7
                    allData: row         
                };

                statusFound = true;
                break;
            }
        }
        
        // 3. ตอบกลับ
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
