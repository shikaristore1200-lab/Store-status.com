// *****************************************************************
// *** 1. การกำหนด ID Google Sheet (ใส่ค่าใหม่ของคุณแล้ว) ***
// *****************************************************************
const YOUR_SHEET_ID = "1ig9GtFnjF_slfSjySLDT01ZYe3NsGRaVYEjx_70YrSQ"; 
const YOUR_GID = "534811997";
// *****************************************************************

// สร้าง URL พิเศษสำหรับดึงข้อมูลเป็น JSON
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${YOUR_SHEET_ID}/gviz/tq?tqx=out:json&gid=${YOUR_GID}`;

// ฟังก์ชันหลักที่ถูกเรียกเมื่อผู้ใช้กดปุ่ม 'ตรวจสอบสถานะ'
async function checkStatus() {
    const idInput = document.getElementById('statusId');
    const searchAccountName = idInput.value.trim().toUpperCase(); 
    const resultDiv = document.getElementById('result');

    resultDiv.innerHTML = '<p style="color: #007bff;">⏳ กำลังตรวจสอบสถานะ...</p>';

    if (searchAccountName === "") {
        resultDiv.innerHTML = '<p style="color: red;">❌ กรุณากรอกชื่อบัญชีค่ะ</p>';
        return;
    }

    try {
        const response = await fetch(SHEET_URL);
        
        // ตรวจสอบ HTTP Status ก่อน (สำคัญมาก)
        if (!response.ok) {
            resultDiv.innerHTML = `<p style="color: #dc3545;">🚨 การเชื่อมต่อ Google Sheet ล้มเหลว (Code: ${response.status})</p>`;
            return;
        }

        const text = await response.text();
        
        // ตัดส่วนที่ไม่ใช่ JSON ออก
        const jsonText = text.replace(/^google\.visualization\.Query\.setResponse\({/i, '{').replace(/\);$/, '');
        
        const dataObject = JSON.parse(jsonText);
        const rows = dataObject.table.rows;

        const statusData = findStatus(rows, searchAccountName);
        
        displayStatus(statusData, searchAccountName, resultDiv);

    } catch (error) {
        console.error('Fetch/Parse Error:', error);
        resultDiv.innerHTML = '<p style="color: #dc3545;">🚨 การดึงข้อมูลผิดพลาด โปรดตรวจสอบสิทธิ์การแชร์ของ Google Sheet</p>';
    }
}

// ฟังก์ชันสำหรับค้นหาข้อมูลในตาราง
function findStatus(rows, searchAccountName) {
    const normalizedSearchName = searchAccountName.toUpperCase(); 
    
    // ดัชนีตามโครงสร้าง Sheet ใหม่ (ข้ามคอลัมน์ C ที่ Index 2)
    const ACCOUNT_NAME_INDEX = 0; // A: ชื่อบัญชี (ใช้ค้นหา)
    const IMAGE_URL_INDEX
