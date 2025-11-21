const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

// *** ID ของ Google Sheet ของคุณ ***
const SPREADSHEET_ID = '1ig9GtFnjF_slfSjySLDT01ZYe3NsGRaVYEjx_70YrSQ'; 

// *** ชีต Summary และช่วงข้อมูล ***
const SUMMARY_SHEET_NAME = 'Summary'; 
const DATA_RANGE = 'A:G';

const SHEET_NAME_RANGE = `${SUMMARY_SHEET_NAME}!${DATA_RANGE}`; 

module.exports = async (req, res) => {
    // ตั้งค่า Header (CORS)
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

        // อ่านข้อมูลจากชีต Summary
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

        let results = []; 

        // แปลงสิ่งที่ลูกค้าพิมพ์มา ให้ตัดช่องว่างออก
        const searchKey = trackingId.toString().trim();

        for (const row of dataRows) {
            // ดึงข้อมูลจาก Sheet และตัดช่องว่างออกด้วย (.trim()) เพื่อกันพลาด
            const sheetKey = (row[trackingColIndex] || '').toString().trim();

            // เปรียบเทียบแบบแม่นยำ
            if (sheetKey === searchKey) {
                const status = row[statusColIndex] || 'ไม่พบสถานะล่าสุด'; 

                results.push({
                    trackingId: row[trackingColIndex], // ส่งค่าเดิมในตารางกลับไป
                    imageUrl: row[imageUrlIndex] || '',
                    productName: row[3] || 'ไม่ระบุ', 
                    price: row[4] || '0',       
                    status: status,                  
                    allData: row                     
                });
                
                // *** ห้ามใส่ break ตรงนี้เด็ดขาด ***
            }
        }
        
        if (results.length > 0) {
            // เจอข้อมูล (อาจจะ 1 หรือมากกว่า)
            return res.status(200).json({ status: 'success', data: results });
        } else {
            return res.status(404).json({ status: 'not_found', message: `ไม่พบรหัสติดตาม "${trackingId}" ในระบบ.` });
        }

    } catch (error) {
        console.error('Google Sheet Connection Error:', error);
        return res.status(500).json({ error: 'การเชื่อมต่อ Google Sheet ล้มเหลว' });
    }
};
