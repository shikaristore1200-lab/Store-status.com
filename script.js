document.addEventListener('DOMContentLoaded', () => {
    const trackingIdInput = document.getElementById('trackingIdInput');
    const checkButton = document.getElementById('checkButton');
    const resultsWrapper = document.getElementById('resultsWrapper');
    const errorOutput = document.getElementById('errorOutput');

    if (checkButton) {
        checkButton.addEventListener('click', checkStatus);
    }

    trackingIdInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            checkStatus();
        }
    });

    async function checkStatus() {
        const trackingId = trackingIdInput.value.trim();

        // เคลียร์ค่าเก่า
        resultsWrapper.innerHTML = '';
        resultsWrapper.style.display = 'none';
        errorOutput.style.display = 'none';
        
        if (!trackingId) {
            showError('กรุณาระบุหมายเลขพัสดุ');
            return;
        }

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
                const results = data.data; // รับมาเป็น Array ของรายการทั้งหมด
                const firstItem = results[0]; // ใช้รายการแรกเป็นข้อมูลหลัก

                if (!firstItem) {
                    showError(`ไม่พบรหัสติดตาม "${trackingId}" ในระบบ.`);
                    return;
                }
                
                // 1. สร้าง HTML รูปภาพ (ใช้รูปภาพจากรายการแรก)
                let imageHTML = '';
                if (firstItem.imageUrl && firstItem.imageUrl.startsWith('http')) {
                    imageHTML = `<img src="${firstItem.imageUrl}" alt="Product Image" class="product-img-dynamic">`;
                } else {
                    imageHTML = `
                        <div class="no-image">
                            <i class="fas fa-image"></i> ไม่มีรูปภาพ
                        </div>`;
                }

                // 2. สร้างแถวข้อมูลในตาราง
                let tableRowsHtml = '';
                
                // ใส่แถวสถานะปัจจุบันและรหัสติดตาม (ใช้ข้อมูลจากรายการแรก)
                tableRowsHtml += `
                    <div class="info-row">
                        <div class="info-label">สถานะปัจจุบัน</div>
                        <div class="info-value status-highlight">${firstItem.status}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">หมายเลขพัสดุ</div>
                        <div class="info-value">${firstItem.trackingId}</div>
                    </div>
                `;

                // วนลูปสร้างแถวสำหรับรายการสินค้าและยอดชำระของทุกออเดอร์
                results.forEach((item, index) => {
                    const orderNumber = results.length > 1 ? ` (${index + 1})` : '';

                    tableRowsHtml += `
                        <div class="info-row">
                            <div class="info-label">รายการสินค้า${orderNumber}</div>
                            <div class="info-value">${item.productName}</div>
                        </div>
                        <div class="info-row">
                            <div class="info-label">ยอดชำระ${orderNumber}</div>
                            <div class="info-value">${item.price} บาท</div>
                        </div>
                    `;
                });

                // 3. ประกอบร่างเป็นการ์ดเดียว
                const finalCardHTML = `
                    <div class="result-section">
                        <div class="result-header">
                            <h3><i class="fas fa-clipboard-check"></i> รายละเอียดการจัดส่ง</h3>
                        </div>
                        <div class="result-body">
                            <div class="image-col">
                                ${imageHTML}
                            </div>
                            
                            <div class="info-col">
                                <div class="info-grid">
                                    ${tableRowsHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // แสดงผลลัพธ์
                resultsWrapper.innerHTML = finalCardHTML;
                resultsWrapper.style.display = 'block';

            } else {
                showError(`ไม่พบข้อมูล: ${data.message}`);
            }

        } catch (error) {
            console.error('Fetch Error:', error);
            showError('เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ');
        } finally {
            checkButton.innerHTML = originalBtnText;
            checkButton.disabled = false;
        }
    }

    function showError(msg) {
        errorOutput.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
        errorOutput.style.display = 'block';
    }
});
