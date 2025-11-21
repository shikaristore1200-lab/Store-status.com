// ไฟล์: api/status.js (ต้องสร้างโฟลเดอร์ api/ ในโปรเจกต์ Vercel)

// ใช้ API Key ที่คุณเก็บไว้ใน Vercel Environment Variables
const API_KEY = process.env.GOOGLE_SHEETS_API_KEY; 
const SHEET_ID = '1ig9GtFnjF_slfSjySLDT01ZYe3NsGRaVYEjx_70YrSQ'; 
const SHEET_RANGE = 'ตาราง3!A:G'; // ระบุช่วงข้อมูลของคุณ (A ถึง G)

module.exports = async (req, res) => {
    // ดึงชื่อบัญชีที่ผู้ใช้ค้นหาจาก Query Parameter (เช่น /api/status?q=TEST)
    const searchName = req.query.q ? req.query.q.toUpperCase() : '';

    if (!searchName) {
        return res.status(400).json({ error: 'Missing search query (q)' });
    }

    try {
        // 1. ดึงข้อมูลทั้งหมดจาก Sheets API
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`
        );
        const data = await response.json();
        const rows = data.values;

        // 2. ค้นหาแถวที่ตรงกันใน Node.js Backend
        if (!rows || rows.length < 2) {
            return res.status(404).json({ message: 'No data found in sheet.' });
        }

        const header = rows[0]; // แถวแรกคือ Header
        
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
        console.error('Sheets API Error:', error);
        return res.status(500).json({ error: 'Internal server error connecting to Google Sheets.' });
    }
};
