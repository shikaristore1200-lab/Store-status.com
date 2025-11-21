// ในไฟล์ script.js (ส่วนที่จัดการ Response)

// ... (ส่วนการเรียก Fetch/Axios API)

.then(response => {
    const data = response.data;
    const errorOutput = document.getElementById('errorOutput');
    const resultContainer = document.getElementById('resultContainer');

    errorOutput.innerHTML = '';
    resultContainer.innerHTML = ''; 

    if (data.status === 'success') {
        const results = data.data; // ได้รับ Array ของผลลัพธ์ทั้งหมด
        const firstItem = results[0]; // ใช้รายการแรกเป็นตัวแทนสถานะและรหัสติดตาม

        if (firstItem) {
            
            // ******************************************************
            // 1. สร้างตารางรายละเอียด (วนลูปสร้างแถวสินค้าทุกรายการ)
            // ******************************************************
            let tableRowsHtml = '';

            results.forEach((item, index) => {
                // สำหรับบรรทัดสถานะและรหัสติดตาม ให้ใช้ของรายการแรกเท่านั้น
                if (index === 0) {
                     tableRowsHtml += `
                        <tr>
                            <td>สถานะปัจจุบัน</td>
                            <td><span class="status-value">${item.status}</span></td>
                        </tr>
                        <tr>
                            <td>หมายเลขพัสดุ</td>
                            <td>${item.trackingId}</td>
                        </tr>
                    `;
                }

                // วนลูปสร้างรายการสินค้าทั้งหมดที่ถูกค้นพบ
                tableRowsHtml += `
                    <tr>
                        <td>รายการสินค้า (${index + 1})</td>
                        <td>${item.productName}</td>
                    </tr>
                    <tr>
                        <td>ยอดชำระ (${index + 1})</td>
                        <td>${item.price} บาท</td>
                    </tr>
                `;
            });
            
            // ******************************************************
            // 2. สร้างโครงสร้าง HTML ทั้งหมด (รวมรูปภาพและตาราง)
            // ******************************************************
            
            const resultHtml = `
                <div class="result-card">
                    <div class="row">
                        <div class="image-col">
                            <img class="product-img-dynamic" src="${firstItem.imageUrl}" alt="รูปสินค้า">
                        </div>
                        <div class="data-col">
                            <table>
                                ${tableRowsHtml}
                            </table>
                        </div>
                    </div>
                </div>
            `;
            
            resultContainer.innerHTML = resultHtml;
            
            // (คุณอาจจะต้องเพิ่มโค้ดสำหรับเปลี่ยนสีสถานะตรงนี้ด้วย)

        } else {
            errorOutput.innerHTML = 'ไม่พบข้อมูลสถานะสำหรับรหัสนี้';
        }
    } else {
        errorOutput.innerHTML = data.message || 'เกิดข้อผิดพลาดในการตรวจสอบ';
    }
})

// ... (ส่วน Error Handling)
