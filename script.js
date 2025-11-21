// *****************************************************************
// *** ไม่ต้องกำหนด Sheet ID/GID ที่นี่ เพราะ Vercel Function จะจัดการ ***
// *****************************************************************

// ฟังก์ชันหลักที่ถูกเรียกเมื่อผู้ใช้กดปุ่ม 'ตรวจสอบสถานะ'
async function checkStatus() {
    const idInput = document.getElementById('statusId');
    // แปลงชื่อบัญชีที่ผู้ใช้กรอกเป็นตัวพิมพ์ใหญ่และตัดช่องว่าง
    const searchAccountName = idInput.value.trim(); 
    const resultDiv = document.getElementById('result');

    resultDiv.innerHTML = '<p style="color: #007bff;">⏳ กำลังตรวจสอบสถานะผ่าน Vercel Server...</p>';

    if (searchAccountName === "") {
        resultDiv.innerHTML = '<p style="color: red;">❌ กรุณากรอกชื่อบัญชีค่ะ</p>';
        return;
    }

    try {
        // เรียกใช้ Vercel Serverless Function ที่ /api/status โดยส่งชื่อบัญชีผ่าน query parameter 'q'
        const response = await fetch(`/api/status?q=${searchAccountName}`);
        
        if (response.status === 404) {
             // 404 จาก Serverless Function หมายถึง ไม่พบชื่อบัญชี
            displayStatus(null, searchAccountName, resultDiv);
            return;
        }

        if (!response.ok) {
            // ดักจับข้อผิดพลาดอื่น ๆ จาก Server
            const errorData = await response.json();
            resultDiv.innerHTML = `<p style="color: #dc3545;">🚨 ข้อผิดพลาดของเซิร์ฟเวอร์: ${errorData.error || 'ไม่สามารถดึงข้อมูลได้'}</p>`;
            return;
        }

        // ดึงข้อมูลสถานะจาก Serverless Function
        const statusData = await response.json(); 
        
        // ส่งข้อมูลที่ได้ไปแสดงผล
        displayStatus(statusData, searchAccountName, resultDiv);

    } catch (error) {
        console.error('Fetch Error:', error);
        resultDiv.innerHTML = '<p style="color: #dc3545;">🚨 การเชื่อมต่อกับเซิร์ฟเวอร์ Vercel ล้มเหลว</p>';
    }
}

// ***************************************************************
// *** ฟังก์ชัน displayStatus (รับข้อมูลที่เป็น Object ที่มีชื่อ Key) ***
// ***************************************************************

function displayStatus(data, searchName, resultDiv) {
    if (!data) {
        resultDiv.innerHTML = `
            <p style="color: #6c757d; font-weight: bold;">⚫ ไม่พบชื่อบัญชี "${searchName}" ในระบบ</p>
            <p style="color: #6c757d;">กรุณาตรวจสอบชื่อบัญชีอีกครั้ง</p>
        `;
        return;
    }
    
    // ดึงข้อมูลจาก Object โดยใช้ชื่อคอลัมน์เป็น Key
    const accountName = data['ชื่อบัญชี'] || '-';
    const imageUrl = data['รูปสินค้า'] || '';
    const productName = data['ชื่อสินค้า'] || '-'; 
    const price = data['ราคาสินค้า'] || '0';
    const remaining = data['ค้างชำระ'] || '0';
    const status = data['สถานะ'] || 'ไม่ระบุสถานะ'; 

    let statusColor;
    let statusIcon;
    if (status.includes("อนุมัติแล้ว") || status.includes("จัดส่ง")) {
        statusColor = "#28a745"; 
        statusIcon = '<i class="fas fa-check-circle"></i>';
    } else if (status.includes("กำลัง") || status.includes("รอ")) {
        statusColor = "#ffc107"; 
        statusIcon = '<i class="fas fa-hourglass-half"></i>';
    } else if (status.includes("ปฏิเสธ") || status.includes("ยกเลิก")) {
        statusColor = "#dc3545"; 
        statusIcon = '<i class="fas fa-times-circle"></i>';
    } else {
        statusColor = "#3f51b5"; 
        statusIcon = '<i class="fas fa-info-circle"></i>';
    }

    const imageHtml = imageUrl ? `<img src="${imageUrl}" alt="${productName}" class="product-image">` : '';

    resultDiv.innerHTML = `
        <div class="status-header">
            <h3 style="color: ${statusColor};">${statusIcon} สถานะ: ${status}</h3>
        </div>
        
        <div class="product-info-grid">
            ${imageHtml}
            <div>
                <p><strong>ชื่อบัญชี:</strong> ${accountName}</p>
                <p><strong>ชื่อสินค้า:</strong> ${productName}</p>
            </div>
        </div>

        <div class="financial-details">
            <p><strong><i class="fas fa-tag"></i> ราคาสินค้า:</strong> ${price} บาท</p>
            <p class="remaining"><strong><i class="fas fa-money-bill-wave"></i> ค้างชำระ:</strong> <span style="color: ${remaining > 0 ? '#dc3545' : '#28a745'};">${remaining} บาท</span></p>
        </div>
    `;
}

// ไม่ต้องมี findStatus เพราะการค้นหาทำใน Serverless Function แล้ว
                <p><strong>ชื่อบัญชี:</strong> ${accountName}</p>
                <p><strong>ชื่อสินค้า:</strong> ${productName}</p>
            </div>
        </div>
