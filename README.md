ความสำเร็จ
1. config better-auth เข้ากับ drizzle
2. set Dashboard shadcn
3. ตั้งค่าให้ auth เปิดใช้ emailPassword และกำหนด Cache เพื่อ Optimize ระบบให้เร็วไม่ต้องยิง query ทุกครั้งที่ตรวจสอบ session
3. อยู่ระหว่างทำ login กับ signUp
4. ทำ signUp เสร็จแล้ว ตรวจสอบ session ได้
5. ทำ signIn เสร็จ ติดตั้ง Arcjet เพื่อป้องกันการโจมตี ทำ Rate Limit Brute Force
6. วางแนวป้องกันก่อนเข้าถึง singUp ต่อ cloneRequest
7. ทำ EmailVerify หลังจาก signUp จะแจ้งให้ verify email พร้อมตัวจับเวลา
8. ทำ Forgot Password และ Reset Password
9. Profile
    1. session management
    2. change password
    3. set password
    4. linked account
    5. 2FA สามารถเปิดปิดได้ ถ้าเปิดใช้จะเพิ่ม passkey เข้าใน browser แล้วขอรับรหัสจากระบบ เข้าใช้งานได้ 2 วีธีคือผ่าน code หรือ backupcode
    6. เปิดใช้ Admin เริ่มกระบวนการ permission
    7. ใช้งาน userlist ได้
    8. ใช้งาน select Role ได้