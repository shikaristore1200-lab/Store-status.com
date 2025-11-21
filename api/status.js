const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

const SPREADSHEET_ID = '1ig9GtFnjF_slfSjySLDT01ZYe3NsGRaVYEjx_70YrSQ'; 

// *** แก้ไขช่วงข้อมูลเป็น A:G ***
const SUMMARY_SHEET_NAME = 'Summary'; // <-- ต้องตรงกับชื่อชีตสรุปที่คุณใส่สูตร
const DATA_RANGE = 'A:G'; // *** เปลี่ยนจาก A:I เป็น A:G ***

const SHEET_NAME_RANGE = `${SUMMARY_SHEET_NAME}!${DATA_RANGE}`; 

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).send();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { trackingId } = req.body;

    if (!trackingId) {
        return res.status(400).json({ error: 'Tracking ID is required.' });
    }

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
        // *เราสมมติว่า Col1 (A) = รหัสติดตาม และ Col7 (G) = สถานะ*
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
                    productName: row[3], // Col4 (D)
                    price: row[4],       // Col5 (E)
                    status: status,      // Col7 (G)
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
