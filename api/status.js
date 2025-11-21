const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

// *** ID ของ Google Sheet ของคุณ ***
const SPREADSHEET_ID = '1ig9GtFnjF_slfSjySLDT01ZYe3NsGRaVYEjx_70YrSQ'; 

// *** ชีต Summary และช่วงข้อมูล ***
const SUMMARY_SHEET_NAME = 'Summary'; 
const DATA_RANGE = 'A:G';

const SHEET_NAME_RANGE = `${SUMMARY_SHEET_NAME}!${DATA_RANGE}`; 

module.exports = async (req, res) => {
    // ตั้งค่า Header
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

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: SHEET_NAME_RANGE,
        });

        const rows = response.data.values;
        if (!rows || rows.length <= 1) {
            return res.status(404).json({ status: 'Sheet Empty', message: 'ไม่พบข้อมูลในตารางสรุป.' });
        }

        const dataRows = rows.slice(1);
        const trackingColIndex = 0; 
        const imageUrlIndex = 1;    
        const statusColIndex = 6;   

        // ---------------------------------------------------------
        // จุดสำคัญ: สร้าง Array ว่างไว้เก็บผลลัพธ์หลายรายการ
        // ---------------------------------------------------------
        let results = []; 

        for (const row of dataRows) {
            if (row[trackingColIndex] === trackingId) {
                const status = row[statusColIndex] || 'ไม่พบสถานะล่าสุด'; 

                // เจอแล้วให้ "ยัดใส่กล่อง results" แทนที่จะส่งกลับเลย
                results.push({
                    trackingId: row[trackingColIndex],
                    imageUrl: row[imageUrlIndex] || '',
                    productName: row[3] || 'ไม่ระบุ', 
                    price: row[4] || '0',       
                    status: status,                  
                    allData: row                     
                });
                
                // *** สำคัญมาก: ห้ามใส่ break; ตรงนี้เด็ดขาด เพื่อให้มันหาต่อจนครบ ***
            }
        }
        
        // ส่งผลลัพธ์ทั้งหมดกลับไป (ไม่ว่าจะเจอ 1 หรือ 10 รายการ)
        if (results.length > 0) {
            return res.status(200).json({ status: 'success', data: results });
        } else {
            return res.status(404).json({ status: 'not_found', message: `ไม่พบรหัสติดตาม "${trackingId}" ในระบบ.` });
        }

    } catch (error) {
        console.error('Google Sheet Connection Error:', error);
        return res.status(500).json({ error: 'การเชื่อมต่อ Google Sheet ล้มเหลว' });
    }
};
