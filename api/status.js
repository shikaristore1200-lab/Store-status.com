// ไฟล์: api/status.js (Vercel Serverless Function)

// *** สำคัญ: ต้องกำหนด GOOGLE_SHEETS_API_KEY ใน Vercel Environment Variables ***
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY; 
const SHEET_ID = '1ig9GtFnjF_slfSjySLDT01ZYe3NsGRaVYEjx_70YrSQ'; 
// ระบุช่วงข้อมูล A ถึง G เพราะคุณข้าม C (A=0, B=1, C=2, D=3, E=4, F=5, G=6)
const SHEET_RANGE = 'ตาราง3!A:G'; 

module.exports = async (req, res) => {
    // กำหนด Header เพื่อป้องกันข้อผิดพลาด CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    // ตรวจสอบว่ามี API Key และ query parameter 'q' หรือไม่
    if (!API_KEY) {
        return res.status(500).json({ error: 'GOOGLE_SHEETS_API_KEY is not set in Vercel Environment Variables.' });
    }
    const searchName = req.query.q ? req.query.q.trim().toUpperCase() : '';

    if (!searchName) {
        return res.status(400).json({ error: 'Missing search query (q)' });
    }

    try {
        // 1. ดึงข้อมูลทั้งหมดจาก Google Sheets API
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`
        );
        
        if (!response.ok) {
            // ถ้า Google API ส่งข้อผิดพลาดกลับมา
            const errorDetail = await response.json();
            console.error('Google API Error:', errorDetail);
            return res.status(500).json({ error: 'Failed to fetch data from Google Sheets API.', details: errorDetail.error.message });
        }
        
        const data = await response.json();
        const rows = data.values; // rows คือ Array ของ Array (ข้อมูลแถว)

        // 2. ตรวจสอบและค้นหาข้อมูลใน Node.js Backend
        if (!rows || rows.length < 2) {
            return res.status(404).json({ message: 'No data found in sheet.' });
        }

        const header = rows[0]; // แถวแรกคือ Header (ชื่อคอลัมน์)
        
        // ค้นหาแถวที่ชื่อบัญชีตรงกับที่ค้นหา (คอลัมน์ A/Index 0)
        const matchedRow = rows.slice(1).find(row => {
            const sheetAccountName = (row[0] || '').trim().toUpperCase();
            return sheetAccountName === searchName;
        });

        if (!matchedRow) {
            return res.status(404).json({ message: 'Account not found.' });
        }

        // 3. แปลงผลลัพธ์ให้เป็น Object ที่ Frontend อ่านง่าย
        const result = {};
        header.forEach((key, index) => {
            // ใช้ชื่อคอลัมน์เป็น Key (เช่น 'ชื่อบัญชี', 'รูปสินค้า', ฯลฯ)
            result[key] = matchedRow[index] || null; 
        });

        return res.status(200).json(result);

    } catch (error) {
        console.error('Server Serverless Error:', error);
        return res.status(500).json({ error: 'Internal server error during data processing.' });
    }
};
