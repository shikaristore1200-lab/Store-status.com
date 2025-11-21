// ในไฟล์ script.js

document.addEventListener('DOMContentLoaded', () => {
    // องค์ประกอบ Input และ Button
    const trackingIdInput = document.getElementById('trackingIdInput'); 
    const checkButton = document.getElementById('checkButton'); 
    
    // องค์ประกอบแสดงผลลัพธ์
    const resultContainer = document.getElementById('resultContainer');
    const productImage = document.getElementById('productImage');
    const statusOutput = document.getElementById('statusOutput'); // ตอนนี้เราจะใส่ HTML ลงไปแทนข้อความธรรมดา
    const errorOutput = document.getElementById('errorOutput');

    if (checkButton) {
        checkButton.addEventListener('click', checkStatus);
    }

    async function checkStatus() {
        const trackingId = trackingIdInput.value.trim();

        // เคลียร์ผลลัพธ์เดิม
        statusOutput.innerHTML = ''; // เปลี่ยนจาก innerText เป็น innerHTML
        errorOutput.innerText = '';
        productImage.src = '';
        productImage.style.display = 'none';
        resultContainer.style.display = 'none';

        if (!trackingId) {
            errorOutput.innerText = 'กรุณากรอกรหัสติดตาม';
            errorOutput.style.display = 'block';
            return;
        }
        
        errorOutput.style.display = 'none';
        errorOutput.innerText = '';

        try {
            const response = await fetch('/api/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ trackingId: trackingId })
            });

            const data = await response.json();

            if (data.status === 'success') {
                const result = data.data;
                
                // 1. จัดการรูปภาพ (อยู่ด้านบนข้อความ)
                if (result.imageUrl && result.imageUrl.startsWith('http')) {
                    productImage.src = result.imageUrl;
                    productImage.style.display = 'block';
                } else {
                    productImage.style.display = 'none';
                }
                
                // 2. สร้าง HTML สำหรับแสดงผลลัพธ์แบบตาราง/รายการ
                const outputHTML = `
                    <div class="result-row">
                        <span class="label">สถานะ:</span>
                        <span class="value status-value"><b>${result.status}</b></span>
                    </div>
                    <div class="result-row">
                        <span class="label">รหัสติดตาม:</span>
                        <span class="value">${result.trackingId}</span>
                    </div>
                    <div class="result-row">
                        <span class="label">สินค้า:</span>
                        <span class="value">${result.productName}</span>
                    </div>
                    <div class="result-row">
                        <span class="label">ราคา:</span>
                        <span class="value">${result.price}</span>
                    </div>
                `;
                
                statusOutput.innerHTML = outputHTML; // ใส่ HTML ที่สร้างขึ้น
                resultContainer.style.display = 'block';

            } else {
                errorOutput.innerText = `🚨 ${data.message}`;
                errorOutput.style.display = 'block';
            }

        } catch (error) {
            console.error('Fetch Error:', error);
            errorOutput.innerText = '❌ การเชื่อมต่อ Google Sheet ล้มเหลว';
            errorOutput.style.display = 'block';
        }
    }
});
