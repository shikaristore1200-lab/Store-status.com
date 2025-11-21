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
                const results = data.data; // รับมาเป็น Array
                
                let allCardsHTML = '';

                // *** วนลูปสร้างการ์ดทีละใบ ***
                results.forEach(item => {
                    // เช็ครูป
                    let imageHTML = '';
                    if (item.imageUrl && item.imageUrl.startsWith('http')) {
                        imageHTML = `<img src="${item.imageUrl}" alt="Product Image" class="product-img">`;
                    } else {
                        imageHTML = `
                            <div class="no-image">
                                <i class="fas fa-image"></i> ไม่มีรูปภาพ
                            </div>`;
                    }

                    // สร้าง HTML การ์ดแนวนอน
                    allCardsHTML += `
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
                                    <div class="info-row">
                                        <div class="info-label">สถานะปัจจุบัน</div>
                                        <div class="info-value status-highlight">${item.status}</div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">หมายเลขพัสดุ</div>
                                        <div class="info-value">${item.trackingId}</div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">รายการสินค้า</div>
                                        <div class="info-value">${item.productName}</div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">ยอดชำระ</div>
                                        <div class="info-value">${item.price} บาท</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                });

                // แสดงผลลัพธ์
                resultsWrapper.innerHTML = allCardsHTML;
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
