const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

// *** ID ของ Google Sheet ของคุณ (กรุณาเปลี่ยนให้ถูกต้อง) ***
const SPREADSHEET_ID = '1ig9GtFnjF_slfSjySLDT01ZYe3NsGRaVYEjx_70YrSQ'; 

// *** ชีต Summary และช่วงข้อมูล ***
const SUMMARY_SHEET_NAME = 'Summary'; 
const DATA_RANGE = 'A:G'; // ยังใช้ A:G เหมือนเดิม เพื่อเข้าถึง G

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

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: SHEET_NAME_RANGE,
        });

        const rows = response.data.values;
        if (!rows || rows.length <= 1) {
            return res.status(404).json({ status: 'Sheet Empty', message: 'ไม่พบข้อมูลในตารางสรุป.' });
        }

        const dataRows = rows.slice(1);
        
        // *** Final Index Mapping ตามที่ลูกค้าระบุ (A=0, B=1, C=2, D=3, E=4, F=5, G=6) ***
        const accountNameIndex = 0;      // คอลัมน์ A (ชื่อบัญชี และ Search Key)
        const imageUrlIndex = 1;         // คอลัมน์ B 
        const productNameIndex = 3;      // คอลัมน์ D
        const priceIndex = 4;            // คอลัมน์ E
        const pendingPaymentIndex = 5;   // คอลัมน์ F (ค้างชำระ)
        const statusColIndex = 6;        // คอลัมน์ G 

        let results = []; 
        const searchKey = trackingId.toString().trim();

        for (const row of dataRows) {
            // ใช้คอลัมน์ A เป็น Key ในการค้นหา (Account Name)
            const sheetKey = (row[accountNameIndex] || '').toString().trim();

            if (sheetKey === searchKey) {
                const status = row[statusColIndex] || 'ไม่พบสถานะล่าสุด'; 

                results.push({
                    accountName: row[accountNameIndex] || 'ไม่ระบุชื่อบัญชี', // คอลัมน์ A
                    imageUrl: row[imageUrlIndex] || '', // คอลัมน์ B
                    // ไม่มีการส่ง TrackingId/หมายเลขพัสดุ (คอลัมน์ C) กลับไปตามโครงสร้างใหม่
                    productName: row[productNameIndex] || 'ไม่ระบุสินค้า', // คอลัมน์ D
                    price: row[priceIndex] || '0', // คอลัมน์ E
                    pendingPayment: row[pendingPaymentIndex] || '0', // คอลัมน์ F
                    status: status, // คอลัมน์ G
                    allData: row                     
                });
            }
        }
        
        if (results.length > 0) {
            return res.status(200).json({ status: 'success', data: results });
        } else {
            return res.status(404).json({ status: 'not_found', message: `ไม่พบชื่อบัญชี "${trackingId}" ในระบบ.` });
        }

    } catch (error) {
        console.error('Google Sheet Connection Error:', error);
        return res.status(500).json({ error: 'การเชื่อมต่อ Google Sheet ล้มเหลว' });
    }
};
