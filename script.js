// *****************************************************************
// *** 1. การกำหนด ID Google Sheet (ใส่ค่าของคุณแล้ว) ***
// *****************************************************************
const YOUR_SHEET_ID = "Honkaistarrail";
const YOUR_GID = "534811997";
// *****************************************************************

// สร้าง URL พิเศษสำหรับดึงข้อมูลเป็น JSON
// tqx=out:json คือคำสั่งให้ Google ส่งข้อมูลกลับมาเป็น JSON
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${YOUR_SHEET_ID}/gviz/tq?tqx=out:json&gid=${YOUR_GID}`;

// ฟังก์ชันหลักที่ถูกเรียกเมื่อผู้ใช้กดปุ่ม 'ตรวจสอบสถานะ'
async function checkStatus() {
    const idInput = document.getElementById('statusId');
    // แปลงชื่อบัญชีที่ผู้ใช้กรอกเป็นตัวพิมพ์ใหญ่และตัดช่องว่าง
    const searchAccountName = idInput.value.trim().toUpperCase(); 
    const resultDiv = document.getElementById('result');

    resultDiv.innerHTML = '<p style="color: #007bff;">⏳ กำลังตรวจสอบสถานะ...</p>';

    if (searchAccountName === "") {
        resultDiv.innerHTML = '<p style="color: red;">❌ กรุณากรอกชื่อบัญชีค่ะ</p>';
        return;
    }

    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        
        // ตัดส่วนที่ไม่ใช่ JSON ออก
        const jsonText = text.replace(/^google\.visualization\.Query\.setResponse\({/i, '{').replace(/\);$/, '');
        
        const dataObject = JSON.parse(jsonText);
        const rows = dataObject.table.rows;

        // ค้นหาสถานะที่ตรงกับชื่อบัญชีที่ผู้ใช้กรอก
        const statusData = findStatus(rows, searchAccountName);
        
        displayStatus(statusData, searchAccountName, resultDiv);

    } catch (error) {
        console.error('Fetch/Parse Error:', error);
        resultDiv.innerHTML = '<p style="color: #dc3545;">🚨 การเชื่อมต่อผิดพลาด โปรดตรวจสอบ ID/GID และการแชร์</p>';
    }
}

// ฟังก์ชันสำหรับค้นหาข้อมูลในตาราง
function findStatus(rows, searchAccountName) {
    const normalizedSearchName = searchAccountName.toUpperCase(); 
    
    // ดัชนีตามโครงสร้าง Sheet ใหม่ (ข้ามคอลัมน์ C ที่ Index 2)
    const ACCOUNT_NAME_INDEX = 0; // A: ชื่อบัญชี (ใช้ค้นหา)
    const IMAGE_URL_INDEX = 1;    // B: รูปสินค้า
    // Index 2 ถูกข้ามไป (คอลัมน์ C)
    const PRODUCT_NAME_INDEX = 3; // D: ชื่อสินค้า
    const PRICE_INDEX = 4;        // E: ราคาสินค้า
    const REMAINING_INDEX = 5;    // F: ค้างชำระ
    const STATUS_INDEX = 6;       // G: สถานะ

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i].c;
        
        // ค้นหาจากคอลัมน์ A (index 0) 'ชื่อบัญชี'
        const accountNameFromSheet = row[ACCOUNT_NAME_INDEX]?.v ? String(row[ACCOUNT_NAME_INDEX].v).toUpperCase() : '';
        
        if (
