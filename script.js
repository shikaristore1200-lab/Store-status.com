// ... โค้ดต่อจากบรรทัด const IMAGE_URL_INDEX ในฟังก์ชัน findStatus ...
    
    // Index 2 ถูกข้ามไป (คอลัมน์ C)
    const PRODUCT_NAME_INDEX = 3; // D: ชื่อสินค้า
    const PRICE_INDEX = 4;        // E: ราคาสินค้า
    const REMAINING_INDEX = 5;    // F: ค้างชำระ
    const STATUS_INDEX = 6;       // G: สถานะ

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i].c;
        
        // ค้นหาจากคอลัมน์ A (index 0) 'ชื่อบัญชี'
        const accountNameFromSheet = row[ACCOUNT_NAME_INDEX]?.v ? String(row[ACCOUNT_NAME_INDEX].v).toUpperCase() : '';
        
        if (accountNameFromSheet === normalizedSearchName) {
            
            // ดึงข้อมูลตาม Index ใหม่ที่กำหนด
            const accountName = row[ACCOUNT_NAME_INDEX]?.v || '-';
            const imageUrl = row[IMAGE_URL_INDEX]?.v || '';
            const productName = row[PRODUCT_NAME_INDEX]?.v || '-'; 
            const price = row[PRICE_INDEX]?.v || '0';
            const remaining = row[REMAINING_INDEX]?.v || '0';
            const status = row[STATUS_INDEX]?.v || 'ไม่ระบุสถานะ'; 
            
            return {
                accountName: accountName,
                imageUrl: imageUrl,
                productName: productName,
                price: price,
                remaining: remaining,
                status: status
            };
        }
    }
    return null; // ไม่พบชื่อบัญชี
} // <-- สิ้นสุดฟังก์ชัน findStatus

// ***************************************************************
// *** 2. ฟังก์ชัน displayStatus (ต้องมีต่อท้าย) ***
// ***************************************************************

function displayStatus(data, searchName, resultDiv) {
    if (!data) {
        resultDiv.innerHTML = `
            <p style="color: #6c757d; font-weight: bold;">⚫ ไม่พบชื่อบัญชี "${searchName}" ในระบบ</p>
            <p style="color: #6c757d;">กรุณาตรวจสอบชื่อบัญชีอีกครั้ง</p>
        `;
        return;
    }

    let statusColor;
    let statusIcon;
    if (data.status.includes("อนุมัติแล้ว") || data.status.includes("จัดส่ง")) {
        statusColor = "#28a745"; 
        statusIcon = '<i class="fas fa-check-circle"></i>';
    } else if (data.status.includes("กำลัง") || data.status.includes("รอ")) {
        statusColor = "#ffc107"; 
        statusIcon = '<i class="fas fa-hourglass-half"></i>';
    } else if (data.status.includes("ปฏิเสธ") || data.status.includes("ยกเลิก")) {
        statusColor = "#dc3545"; 
        statusIcon = '<i class="fas fa-times-circle"></i>';
    } else {
        statusColor = "#3f51b5"; 
        statusIcon = '<i class="fas fa-info-circle"></i>';
    }

    const imageHtml = data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.productName}" class="product-image">` : '';

    resultDiv.innerHTML = `
        <div class="status-header">
            <h3 style="color: ${statusColor};">${statusIcon} สถานะ: ${data.status}</h3>
        </div>
        
        <div class="product-info-grid">
            ${imageHtml}
            <div>
                <p><strong>ชื่อบัญชี:</strong> ${data.accountName}</p>
                <p><strong>ชื่อสินค้า:</strong> ${data.productName}</p>
            </div>
        </div>

        <div class="financial-details">
            <p><strong><i class="fas fa-tag"></i> ราคาสินค้า:</strong> ${data.price} บาท</p>
            <p class="remaining"><strong><i class="fas fa-money-bill-wave"></i> ค้างชำระ:</strong> <span style="color: ${data.remaining > 0 ? '#dc3545' : '#28a745'};">${data.remaining} บาท</span></p>
        </div>
    `;
}
