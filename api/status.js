const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

// *** กรุณาใส่ ID ของ Google Sheet ของคุณที่นี่ ***
const SPREADSHEET_ID = '1ig9GtFnjF_slfSjySLDT01ZYe3NsGRaVYEjx_70YrSQ'; 

// *** โค้ดจะดึงข้อมูลจากชีต Summary ที่มีสูตร QUERY อยู่เท่านั้น ***
const SUMMARY_SHEET_NAME = 'Summary'; 
const DATA_RANGE = 'A:G'; // ดึงข้อมูลถึงคอลัมน์ G เท่านั้น

const SHEET_NAME_RANGE = `${SUMMARY_SHEET_NAME}!${DATA_RANGE}`; 

module.exports = async (req, res) => {
    // กำหนด CORS Header สำหรับให้เว็บไซต์อื่นเรียกใช้ได้
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
            range: SHEET_NAME_RANGE, // ดึงจากชีต Summary!A:G เท่านั้น
        });

        const rows = response.data.values;
        if (!rows || rows.length <= 1) {
            return res.status(404).json({ status: 'Sheet Empty', message: 'ไม่พบข้อมูลในตารางสรุป.' });
        }

        // 2. ค้นหาสถานะในข้อมูลที่ดึงมา
        const dataRows = rows.slice(1);
        const trackingColIndex = 0; // Col1 (A)
        const imageUrlIndex = 1;    // Col2 (B) - สำหรับ URL รูปภาพ
        const statusColIndex = 6;   // Col7 (G)

        let statusFound = false;
        let result = {};

        for (const row of dataRows) {
            if (row[trackingColIndex] === trackingId) {
                const status = row[statusColIndex] || 'ไม่พบสถานะล่าสุด'; 

                result = {
                    trackingId: row[trackingColIndex],
                    imageUrl: row[imageUrlIndex] || '', // ดึง URL รูปภาพจาก Col B (Index 1)
                    productName: row[3] || 'ไม่ระบุ', // Col4 (D)
                    price: row[4] || 'ไม่ระบุ',       // Col5 (E)
                    status: status,                  // Col7 (G)
                    allData: row                     
                };

                statusFound = true;
                break;
            }
        }
        
        // 3. ตอบกลับผลลัพธ์
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
