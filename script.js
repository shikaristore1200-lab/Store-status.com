// ในไฟล์ script.js (ส่วนที่จัดการ Response)

// ... (โค้ดการประกาศตัวแปรและการจัดการ Event เหมือนเดิม) ...

    async function checkStatus() {
        const trackingId = trackingIdInput.value.trim();

        // เคลียร์ค่าเก่าและซ่อนส่วนแสดงผล
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
                const results = data.data; // Array ของรายการที่ตรงกันทั้งหมด
                let allCardsHTML = ''; // ตัวแปรสำหรับเก็บ HTML ของทุกการ์ด

                if (results && results.length > 0) {
                    
                    // *** เริ่มการวนลูปสร้างการ์ดแยกตามจำนวนรายการสินค้า ***
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

                        // 2. สร้างแถวข้อมูลสำหรับตารางรายการปัจจุบัน
                        // ใช้ item.status และ item.price ของรายการนั้นๆ
                        let tableRowsHtml = `
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
                        
                        // เพิ่มการ์ดนี้เข้าในตัวแปรรวม
                        allCardsHTML += cardHTML;
                    });
                    // *** สิ้นสุดการวนลูป ***


                    resultsWrapper.innerHTML = allCardsHTML;
                    resultsWrapper.style.display = 'block';

                } else {
                    showError(`ไม่พบข้อมูลสถานะสำหรับรหัสนี้`);
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
