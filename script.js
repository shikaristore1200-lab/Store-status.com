// ในไฟล์ script.js

document.addEventListener('DOMContentLoaded', () => {
    // องค์ประกอบ Input และ Button
    const trackingIdInput = document.getElementById('trackingIdInput'); 
    const checkButton = document.getElementById('checkButton'); 
    
    // องค์ประกอบแสดงผลลัพธ์
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
                
                // 1. จัดการรูปภาพ (โค้ดนี้จะรันก่อนการแสดงข้อความผลลัพธ์)
                // รูปภาพจะแสดงในตำแหน่งที่กำหนดใน index.html (ซึ่งอยู่ด้านบน pre)
                if (result.imageUrl && result.imageUrl.startsWith('http')) {
                    productImage.src = result.imageUrl;
                    productImage.style.display = 'block'; // แสดงรูปภาพ
                } else {
                    productImage.style.display = 'none'; // ซ่อนถ้าไม่มี URL รูปภาพ
                }
                
                // 2. จัดรูปแบบข้อความสถานะ
                const outputText = `
**สถานะ:** ${result.status}
รหัสติดตาม: ${result.trackingId}
สินค้า: ${result.productName}
ราคา: ${result.price}
                `;
                
                statusOutput.innerText = outputText;
                resultContainer.style.display = 'block'; // แสดงกล่องผลลัพธ์ทั้งหมด

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
