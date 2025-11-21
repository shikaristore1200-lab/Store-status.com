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

        resultsWrapper.innerHTML = '';
        resultsWrapper.style.display = 'none';
        errorOutput.style.display = 'none';
        
        if (!trackingId) {
            showError('กรุณาระบุชื่อบัญชี'); 
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
                const results = data.data; 
                let allCardsHTML = ''; 

                if (results && results.length > 0) {
                    
                    // *** วนลูปสร้างการ์ดแยกสำหรับแต่ละรายการ ***
                    results.forEach((item, index) => {
                        
                        // 1. จัดการ HTML รูปภาพสำหรับรายการปัจจุบัน
                        let imageHTML = '';
                        if (item.imageUrl && item.imageUrl.startsWith('http')) {
                            imageHTML = `<img src="${item.imageUrl}" alt="Product Image" class="product-img-dynamic">`;
                        } else {
                            imageHTML = `
                                <div class="no-image">
                                    <i class="fas fa-image"></i> ไม่มีรูปภาพ
                                </div>`;
                        }

                        // 2. สร้างแถวข้อมูลตามลำดับใหม่ที่คุณต้องการ
                        let tableRowsHtml = `
                            <div class="info-row">
                                <div class="info-label">ชื่อบัญชี</div>
                                <div class="info-value">${item.accountName}</div> 
                            </div>
                            
                            <div class="info-row">
                                <div class="info-label">สถานะปัจจุบัน</div>
                                <div class="info-value status-highlight">${item.status}</div>
                            </div>
                            
                            <div class="info-row">
                                <div class="info-label">รายการสินค้า</div>
                                <div class="info-value">${item.productName}</div>
                            </div>
                            <div class="info-row">
                                <div class="info-label">ยอดชำระ</div>
                                <div class="info-value">${item.price} บาท</div>
                            </div>

                            <div class="info-row">
                                <div class="info-label">ค้างชำระ</div>
                                <div class="info-value">${item.pendingPayment} บาท</div>
                            </div>
                        `;

                        // 3. ประกอบร่างเป็นการ์ด (Section) แยกสำหรับรายการนี้
                        const cardHTML = `
                            <div class="result-section">
                                <div class="result-header">
                                    <h3><i class="fas fa-box"></i> รายการสินค้าที่ ${index + 1}</h3>
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
                        
                        allCardsHTML += cardHTML;
                    });
                    
                    resultsWrapper.innerHTML = allCardsHTML;
                    resultsWrapper.style.display = 'block';

                } else {
                    showError(`ไม่พบข้อมูลสถานะสำหรับชื่อบัญชีนี้`);
                }

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
