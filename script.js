// *****************************************************************
// *** 1. กรุณาเปลี่ยนค่าเหล่านี้ด้วย ID และ GID ของ Google Sheet ของคุณ ***
// *****************************************************************
const YOUR_SHEET_ID = "534811997"; // <--- เปลี่ยนตรงนี้
const YOUR_GID = "Honkaistarrail"; // <--- เปลี่ยนตรงนี้ (ถ้าเป็น Sheet แรก)
// *****************************************************************

// สร้าง URL พิเศษสำหรับดึงข้อมูลเป็น JSON
// tqx=out:json คือคำสั่งให้ Google ส่งข้อมูลกลับมาเป็น JSON
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${534811997}/gviz/tq?tqx=out:json&gid=${Honkaistarrail}`;

// ฟังก์ชันหลักที่ถูกเรียกเมื่อผู้ใช้กดปุ่ม
async function checkStatus() {
    const idInput = document.getElementById('statusId');
    // แปลงรหัสที่ผู้ใช้กรอกเป็นตัวพิมพ์ใหญ่และตัดช่องว่าง
    const trackingId = idInput.value.trim().toUpperCase(); 
    const resultDiv = document.getElementById('result');

    resultDiv.innerHTML = '<p style="color: #007bff;">⏳ กำลังตรวจสอบสถานะ...</p>';

    if (trackingId === "") {
        resultDiv.innerHTML = '<p style="color: red;">❌ กรุณากรอกรหัสติดตามค่ะ</p>';
        return;
    }

    try {
        const response = await fetch(SHEET_URL);
        
        // Google Sheet จะส่งข้อมูลมาในรูปแบบที่ต้องมีการตัดแต่ง
        const text = await response.text();
        
        // ตัดส่วนที่ไม่ใช่ JSON ออก (ส่วนใหญ่จะเป็น /*O_o*/ และวงเล็บปิด)
        const jsonText = text.replace(/^google\.visualization\.Query\.setResponse\({/i, '{').replace(/\);$/, '');
        
        // แปลง Text ที่ถูกตัดแล้วให้เป็น Object JSON
        const dataObject = JSON.parse(jsonText);
        
        // ดึงแถวข้อมูลทั้งหมด
        const rows = dataObject.table.rows;

        // ค้นหาสถานะที่ตรงกับรหัสที่ผู้ใช้กรอก
        const statusData = findStatus(rows, trackingId);
        
        // แสดงผลลัพธ์
        displayStatus(statusData, trackingId, resultDiv);

    } catch (error) {
        console.error('Fetch/Parse Error:', error);
        resultDiv.innerHTML = '<p style="color: #dc3545;">🚨 การเชื่อมต่อผิดพลาด โปรดตรวจสอบ ID/GID และการแชร์</p>';
    }
}

// ฟังก์ชันสำหรับค้นหาข้อมูลในตาราง
function findStatus(rows, trackingId) {
    // เริ่มจากแถวที่ 1 (index 0 คือหัวตาราง ถ้าไม่นับ)
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i].c;
        
        // คอลัมน์ A (index 0) คือ 'รหัสติดตาม'
        const idFromSheet = row[0]?.v ? String(row[0].v).toUpperCase() : '';
        
        if (idFromSheet === trackingId) {
            // คอลัมน์ B (index 1) คือ 'สถานะ'
            const status = row[1]?.v || 'ไม่มีสถานะ';
            // คอลัมน์ C (index 2) คือ 'รายละเอียด'
            const detail = row[2]?.v || 'ไม่มีรายละเอียดเพิ่มเติม';
            
            return {
                id: trackingId,
                status: status,
                detail: detail
            };
        }
    }
    return null; // ไม่พบรหัส
}

// ฟังก์ชันสำหรับแสดงผลลัพธ์บนหน้าเว็บ
function displayStatus(data, trackingId, resultDiv) {
    if (!data) {
        resultDiv.innerHTML = `
            <p style="color: #6c757d; font-weight: bold;">⚫ ไม่พบรหัส ${trackingId} ในระบบ</p>
            <p style="color: #6c757d;">กรุณาตรวจสอบรหัสอีกครั้ง</p>
        `;
        return;
    }

    // กำหนดสีตามสถานะที่อ่านได้
    let statusColor;
    if (data.status.includes("อนุมัติ") || data.status.includes("จัดส่ง")) {
        statusColor = "#28a745"; // สีเขียว
    } else if (data.status.includes("กำลัง") || data.status.includes("รอ")) {
        statusColor = "#ffc107"; // สีเหลือง
    } else if (data.status.includes("ปฏิเสธ") || data.status.includes("ยกเลิก")) {
        statusColor = "#dc3545"; // สีแดง
    } else {
        statusColor = "#007bff"; // สีฟ้า
    }

    resultDiv.innerHTML = `
        <h3>✅ ผลการตรวจสอบ</h3>
        <p><strong>รหัสติดตาม:</strong> ${data.id}</p>
        <p style="color: ${statusColor}; font-weight: bold;">
            **สถานะ:** ${data.status}
        </p>
        <p><strong>รายละเอียด:</strong> ${data.detail}</p>
    `;
}
