document.addEventListener('DOMContentLoaded', () => {
    const trackingIdInput = document.getElementById('trackingIdInput');
    const checkButton = document.getElementById('checkButton');
    const resultContainer = document.getElementById('resultContainer');
    const productImage = document.getElementById('productImage');
    const noImagePlaceholder = document.getElementById('noImagePlaceholder');
    const statusOutput = document.getElementById('statusOutput');
    const errorOutput = document.getElementById('errorOutput');

    if (checkButton) {
        checkButton.addEventListener('click', checkStatus);
    }

    // กด Enter เพื่อค้นหาได้ด้วย
    trackingIdInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            checkStatus();
        }
    });

    async function checkStatus() {
        const trackingId = trackingIdInput.value.trim();

        // Reset UI
        statusOutput.innerHTML = '';
        errorOutput.style.display = 'none';
        resultContainer.style.display = 'none';
        
        // Reset Image
        productImage.src = '';
        productImage.style.display = 'none';
        noImagePlaceholder.style.display = 'none';

        if (!trackingId) {
            showError('กรุณาระบุหมายเลขพัสดุ');
            return;
        }

        // เปลี่ยนปุ่มเป็นสถานะกำลังโหลด
        const originalBtnText = checkButton.innerHTML;
        checkButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> กำลังค้นหา...';
        checkButton.disabled = true;

        try {
            const response = await fetch('/api/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trackingId: trackingId })
            });

            const data = await response.json();

            if (data.status === 'success') {
                const result = data.data;
                
                // 1. จัดการรูปภาพ
                if (result.imageUrl && result.imageUrl.startsWith('http')) {
                    productImage.src = result.imageUrl;
                    productImage.style.display = 'block';
                } else {
                    noImagePlaceholder.style.display = 'flex';
                }
                
                // 2. สร้าง HTML ตารางข้อมูล (Label ซ้าย - Value ขวา)
                const outputHTML = `
                    <div class="info-row">
                        <div class="info-label">สถานะปัจจุบัน</div>
                        <div class="info-value status-highlight">${result.status}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">หมายเลขพัสดุ</div>
                        <div class="info-value">${result.trackingId}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">รายการสินค้า</div>
                        <div class="info-value">${result.productName}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">ยอดชำระ</div>
                        <div class="info-value">${result.price} บาท</div>
                    </div>
                `;
                
                statusOutput.innerHTML = outputHTML;
                resultContainer.style.display = 'block';

            } else {
                showError(`ไม่พบข้อมูล: ${data.message}`);
            }

        } catch (error) {
            console.error('Fetch Error:', error);
            showError('เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ');
        } finally {
            // คืนค่าปุ่มกลับสู่ปกติ
            checkButton.innerHTML = originalBtnText;
            checkButton.disabled = false;
        }
    }

    function showError(msg) {
        errorOutput.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
        errorOutput.style.display = 'block';
    }
});
