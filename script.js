// ฟังก์ชันสำหรับตรวจสอบ (DEBUGGING MODE)
async function checkStatus() {
    const idInput = document.getElementById('statusId');
    const searchAccountName = idInput.value.trim().toUpperCase(); 
    const resultDiv = document.getElementById('result');

    resultDiv.innerHTML = '<p style="color: #007bff;">⏳ กำลังดึงข้อมูลดิบจาก Sheet...</p>';
    
    // ***************************************************
    // ** โค้ดสำหรับ DEBUGGING: แสดงผลข้อมูลดิบทั้งหมด **
    // ***************************************************
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        
        // ตัดส่วนที่ไม่ใช่ JSON ออก
        const jsonText = text.replace(/^google\.visualization\.Query\.setResponse\({/i, '{').replace(/\);$/, '');
        
        const dataObject = JSON.parse(jsonText);
        const rows = dataObject.table.rows;
        
        // แปลงข้อมูลแถวแรก ๆ ให้เป็นข้อความที่อ่านได้
        let debugOutput = '<h3>DEBUG: ข้อมูลดิบจาก Sheet (แถวแรกๆ)</h3>';
        debugOutput += '<p>ค่าที่ใช้ค้นหา: <strong>' + searchAccountName + '</strong></p>';
        
        // แสดงข้อมูลในแถวแรกๆ 3-5 แถว เพื่อดูรูปแบบ
        for (let i = 0; i < Math.min(rows.length, 5); i++) {
            const row = rows[i].c;
            const accountNameValue = row[0]?.v || 'NULL/EMPTY'; // คอลัมน์ A (ชื่อบัญชี)
            const productNameValue = row[3]?.v || 'NULL/EMPTY'; // คอลัมน์ D (ชื่อสินค้า)
            
            debugOutput += `<p>แถว ${i + 1}: [A] = <strong>${accountNameValue}</strong>, [D] = ${productNameValue}</p>`;
        }
        
        resultDiv.innerHTML = debugOutput;
        console.log('Raw Sheet Data:', dataObject); // ดูข้อมูลเต็มใน Console (F12)

    } catch (error) {
        console.error('Fetch/Parse Error:', error);
        resultDiv.innerHTML = '<p style="color: #dc3545;">🚨 การเชื่อมต่อ Google Sheet ล้มเหลว</p>';
    }
    // ***************************************************
    // ** สิ้นสุดโค้ด DEBUGGING **
    // ***************************************************
}

// ... ส่วนที่เหลือของ script.js (findStatus, displayStatus) ให้คงไว้ตามเดิม
