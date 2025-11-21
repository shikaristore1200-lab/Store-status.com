// ในไฟล์ script.js

document.addEventListener('DOMContentLoaded', () => {
    const trackingIdInput = document.getElementById('trackingIdInput'); // สมมติว่านี่คือ ID ของช่อง input
    const checkButton = document.getElementById('checkButton'); // สมมติว่านี่คือ ID ของปุ่มตรวจสอบ
    
    // Element ใหม่ที่เราเพิ่มใน index.html
    const resultContainer = document.getElementById('resultContainer');
    const productImage = document.getElementById('productImage');
    const statusOutput = document.getElementById('statusOutput');
    const errorOutput = document.getElementById('errorOutput');

    if (checkButton) {
        checkButton.addEventListener('click', checkStatus);
    }

    async function checkStatus() {
        const trackingId = trackingIdInput.value.trim();

        // เคลียร์ผลลัพธ์เดิม
        statusOutput.innerText = '';
        errorOutput.innerText = '';
        productImage.src = '';
        productImage.style.display = 'none';
        resultContainer.style.display = 'none';

        if (!trackingId) {
            errorOutput.innerText = 'กรุณากรอกรหัสติดตาม';
            errorOutput.style.display = 'block';
            return;
        }

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
                errorOutput.style.display = 'none';

                // 1. จัดรูปแบบข้อความสถานะ
                const outputText = `
**สถานะ:** ${result.status}
รหัสติดตาม: ${result.trackingId}
สินค้า: ${result.productName}
ราคา: ${result.price}
                `;
                
                statusOutput.innerText = outputText;
                resultContainer.style.display = 'block';

                // 2. จัดการรูปภาพ
                // ตรวจสอบว่ามี URL ที่ถูกต้องหรือไม่ (ต้องขึ้นต้นด้วย http)
                if (result.imageUrl && result.imageUrl.startsWith('http')) {
                    productImage.src = result.imageUrl;
                    productImage.style.display = 'block'; // แสดงรูปภาพ
                } else {
                    productImage.style.display = 'none'; // ซ่อนถ้าไม่มี URL รูปภาพ
                }

            } else {
                // แสดงข้อความ "ไม่พบรหัสติดตาม"
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
