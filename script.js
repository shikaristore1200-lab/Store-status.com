// ฟังก์ชันสำหรับค้นหาข้อมูลในตาราง (ปรับปรุงการเปรียบเทียบให้เข้มงวดขึ้น)
function findStatus(rows, searchAccountName) {
    // 1. ทำให้ชื่อที่ใช้ค้นหา "สะอาด" (ตัวพิมพ์ใหญ่, ตัดช่องว่าง)
    const normalizedSearchName = searchAccountName.trim().toUpperCase(); 
    
    // ดัชนีตามโครงสร้าง Sheet ใหม่ (ข้ามคอลัมน์ C ที่ Index 2)
    const ACCOUNT_NAME_INDEX = 0; 
    const IMAGE_URL_INDEX = 1;    
    const PRODUCT_NAME_INDEX = 3; 
    const PRICE_INDEX = 4;        
    const REMAINING_INDEX = 5;    
    const STATUS_INDEX = 6;       

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i].c;
        
        // ตรวจสอบว่าคอลัมน์ A (Index 0) มีข้อมูลหรือไม่ก่อนที่จะดึงค่า
        if (!row[ACCOUNT_NAME_INDEX] || !row[ACCOUNT_NAME_INDEX].v) {
            continue; // ข้ามแถวที่คอลัมน์ชื่อบัญชีว่างเปล่า
        }
        
        // 2. ทำให้ชื่อบัญชีจาก Sheet "สะอาด"
        const accountNameFromSheet = String(row[ACCOUNT_NAME_INDEX].v).trim().toUpperCase();
        
        // 3. เปรียบเทียบค่าที่ "สะอาด" แล้ว
        if (accountNameFromSheet === normalizedSearchName) {
            
            // ดึงข้อมูลตาม Index ที่กำหนด (Index 0 ถึง 6)
            const accountName = row[ACCOUNT_NAME_INDEX]?.v || '-';
            const imageUrl = row[IMAGE_URL_INDEX]?.v || '';
            const productName = row[PRODUCT_NAME_INDEX]?.v || '-'; 
            const price = row[PRICE_INDEX]?.v || '0';
            const remaining = row[REMAINING_INDEX]?.v || '0';
            const status = row[STATUS_INDEX]?.v || 'ไม่ระบุสถานะ'; 
            
            return {
                accountName: accountName,
                imageUrl: imageUrl,
                productName: productName,
                price: price,
                remaining: remaining,
                status: status
            };
        }
    }
    return null; // ไม่พบชื่อบัญชี
}
