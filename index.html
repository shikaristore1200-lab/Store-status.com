// ... (ส่วนการกำหนด YOUR_SHEET_ID, YOUR_GID และฟังก์ชัน checkStatus ยังคงเดิม) ...

// ฟังก์ชันสำหรับค้นหาข้อมูลในตาราง (มีการข้าม Index 2)
function findStatus(rows, searchAccountName) {
    const normalizedSearchName = searchAccountName.toUpperCase(); 
    
    // ดัชนีใหม่ตามโครงสร้าง Sheet ที่เว้น C ไว้
    const ACCOUNT_NAME_INDEX = 0; // A
    const IMAGE_URL_INDEX = 1;    // B
    // Index 2 ถูกข้ามไป (คอลัมน์ C)
    const PRODUCT_NAME_INDEX = 3; // D <--- เริ่มดึงข้อมูลถัดไปที่นี่
    const PRICE_INDEX = 4;        // E
    const REMAINING_INDEX = 5;    // F
    const STATUS_INDEX = 6;       // G

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i].c;
        
        // ค้นหาจากคอลัมน์ A (index 0) 'ชื่อบัญชี'
        const accountNameFromSheet = row[ACCOUNT_NAME_INDEX]?.v ? String(row[ACCOUNT_NAME_INDEX].v).toUpperCase() : '';
        
        if (accountNameFromSheet === normalizedSearchName) {
            
            // ดึงข้อมูลตาม Index ใหม่
            const accountName = row[ACCOUNT_NAME_INDEX]?.v || '-';
            const imageUrl = row[IMAGE_URL_INDEX]?.v || '';
            
            // ใช้ Index 3 สำหรับ ชื่อสินค้า (ข้าม C)
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

// ฟังก์ชัน displayStatus **ไม่ต้องแก้ไข**
// เพราะมันยังคงใช้ชื่อตัวแปรเดิม (accountName, productName, price, ฯลฯ)
