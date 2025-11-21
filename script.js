document.getElementById('checkStatus').addEventListener('click', checkStatus);

async function checkStatus() {
    const trackingIdInput = document.getElementById('trackingId');
    const resultBox = document.getElementById('resultBox');
    const trackingId = trackingIdInput.value.trim();

    resultBox.innerHTML = 'กำลังตรวจสอบ...';
    resultBox.classList.remove('hidden');

    if (!trackingId) {
        resultBox.innerHTML = '<div class="status-item"><span class="status-label">ข้อผิดพลาด:</span> <span class="status-value error">กรุณากรอกรหัสติดตาม</span></div>';
        return;
    }

    try {
        const response = await fetch('/api/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ trackingId: trackingId })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            const result = data.data;
            resultBox.innerHTML = `
                <div class="status-item"><span class="status-label">รหัสติดตาม:</span> <span class="status-value">${result.trackingId}</span></div>
                <div class="status-item"><span class="status-label">สินค้า:</span> <span class="status-value">${result.productName}</span></div>
                <div class="status-item"><span class="status-label">ราคา:</span> <span class="status-value">${result.price}</span></div>
                <div class="status-item"><span class="status-label">สถานะล่าสุด:</span> <span class="status-value success">${result.status}</span></div>
            `;
        } else if (response.status === 404 && data.status === 'not_found') {
            resultBox.innerHTML = `<div class="status-item"><span class="status-label">ไม่พบ:</span> <span class="status-value error">${data.message}</span></div>`;
        } else {
            // กรณีเกิดข้อผิดพลาดในการเชื่อมต่อ (เช่น 500 Internal Server Error)
            resultBox.innerHTML = `<div class="status-item"><span class="status-label">ข้อผิดพลาด:</span> <span class="status-value error">🚨 ${data.error || 'การเชื่อมต่อ Google Sheet ล้มเหลว'}</span></div>`;
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        resultBox.innerHTML = '<div class="status-item"><span class="status-label">ข้อผิดพลาด:</span> <span class="status-value error">ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้</span></div>';
    }
}
