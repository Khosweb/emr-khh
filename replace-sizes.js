const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'page.js');
let content = fs.readFileSync(filePath, 'utf8');

// List of replacements
const replacements = [
  // 1. Login Screen Card Width & Padding
  [
    `w-full max-w-md glassmorphism rounded-3xl shadow-2xl shadow-rose-200/30 p-8 flex flex-col gap-8 relative z-10 border border-white/40 transition-all duration-300 hover:shadow-rose-200/40`,
    `w-full max-w-lg glassmorphism rounded-3xl shadow-2xl shadow-rose-200/30 p-10 flex flex-col gap-8 relative z-10 border border-white/40 transition-all duration-300 hover:shadow-rose-200/40`
  ],
  // Login Titles
  [
    `text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-900 via-rose-800 to-pink-700 bg-clip-text text-transparent mt-2`,
    `text-4xl font-extrabold tracking-tight bg-gradient-to-r from-rose-900 via-rose-800 to-pink-700 bg-clip-text text-transparent mt-2`
  ],
  [
    `text-xs text-pink-600/80 font-bold tracking-wide uppercase`,
    `text-sm text-pink-600/80 font-bold tracking-wide uppercase`
  ],
  // Login inputs & labels
  [
    `<label className="text-xs font-bold text-rose-800/80 tracking-wider uppercase">Username</label>`,
    `<label className="text-sm font-bold text-rose-800/80 tracking-wider uppercase">Username</label>`
  ],
  [
    `<label className="text-xs font-bold text-rose-800/80 tracking-wider uppercase">Password</label>`,
    `<label className="text-sm font-bold text-rose-800/80 tracking-wider uppercase">Password</label>`
  ],
  [
    `className="w-full bg-white/50 border border-rose-100/80 rounded-xl px-4 py-3.5 text-sm text-rose-955 placeholder-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition duration-300"`,
    `className="w-full bg-white/50 border border-rose-100/80 rounded-xl px-4 py-3.5 text-base text-rose-955 placeholder-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition duration-300"`
  ],
  [
    `className="w-full bg-white/50 border border-rose-100/80 rounded-xl px-4 py-3.5 text-sm text-rose-900 placeholder-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition duration-300"`,
    `className="w-full bg-white/50 border border-rose-100/80 rounded-xl px-4 py-3.5 text-base text-rose-900 placeholder-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition duration-300"`
  ],
  // Login Error message
  [
    `className="bg-rose-100/80 border border-rose-200 text-rose-600 text-xs p-3 rounded-lg text-center font-bold"`,
    `className="bg-rose-100/80 border border-rose-200 text-rose-600 text-sm p-3 rounded-lg text-center font-bold"`
  ],
  // Login button
  [
    `className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-rose-200/80 hover:shadow-xl hover:shadow-rose-300/80 disabled:opacity-50 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"`,
    `className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white py-3.5 rounded-xl text-base font-bold shadow-lg shadow-rose-200/80 hover:shadow-xl hover:shadow-rose-300/80 disabled:opacity-50 transition duration-200 flex items-center justify-center gap-2 cursor-pointer"`
  ],
  // Login Demo box labels
  [
    `className="border-t border-rose-100/80 pt-6 flex flex-col gap-3.5"`,
    `className="border-t border-rose-100/80 pt-6 flex flex-col gap-3.5"`
  ],
  [
    `<span className="text-[11px] text-center text-pink-600/60 font-bold uppercase tracking-wider">ทดลองใช้งานโปรแกรมด้วยข้อมูลจำลอง (Demo Mode)</span>`,
    `<span className="text-xs text-center text-pink-600/60 font-bold uppercase tracking-wider">ทดลองใช้งานโปรแกรมด้วยข้อมูลจำลอง (Demo Mode)</span>`
  ],
  [
    `className="bg-rose-50/40 hover:bg-rose-100/50 border border-rose-100/50 text-rose-800 text-xs font-extrabold py-3 px-4 rounded-xl text-center transition hover:scale-[1.02] shadow-sm cursor-pointer"`,
    `className="bg-rose-50/40 hover:bg-rose-100/50 border border-rose-100/50 text-rose-800 text-sm font-extrabold py-3 px-4 rounded-xl text-center transition hover:scale-[1.02] shadow-sm cursor-pointer"`
  ],
  [
    `className="text-[10px] text-center text-rose-600 leading-normal font-semibold"`,
    `className="text-xs text-center text-rose-600 leading-normal font-semibold"`
  ],

  // 2. Header and Shortcuts
  [
    `<h1 className="text-sm font-extrabold text-white tracking-wide leading-none">HOSxP EMR</h1>`,
    `<h1 className="text-lg font-extrabold text-white tracking-wide leading-none">HOSxP EMR</h1>`
  ],
  [
    `<p className="text-[9px] text-rose-200 font-bold tracking-wider uppercase mt-0.5">Records Portal</p>`,
    `<p className="text-sm text-rose-200 font-bold tracking-wider uppercase mt-0.5">Records Portal</p>`
  ],
  // Search box and input (to white search input and search button)
  [
    `          {/* Search Input */}
          <div className="relative flex-1 max-w-xs sm:max-w-sm">
            <input
              type="text"
              placeholder="ค้นหา HN (เช่น 1234567)"
              className="w-full bg-white border border-rose-200/50 rounded-xl pl-10 pr-3 py-2 text-xs text-zinc-800 placeholder-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 transition duration-200"
              value={searchHn}
              onChange={(e) => setSearchHn(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
            />
            <div className="absolute left-3.5 top-2.5 text-pink-450">
              <SearchIcon />
            </div>
          </div>`,
    `          {/* Search Input */}
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ค้นหา HN (เช่น 1234567)"
                className="w-full bg-white border border-rose-200/50 rounded-xl pl-11 pr-3 py-2 text-base text-zinc-800 placeholder-rose-300 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-400 transition duration-200 font-medium"
                value={searchHn}
                onChange={(e) => setSearchHn(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchPatient()}
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-450 flex items-center">
                <SearchIcon />
              </div>
            </div>
            <button
              onClick={() => handleSearchPatient()}
              className="bg-white hover:bg-rose-50/50 text-pink-600 border border-transparent hover:border-rose-100 text-base py-2 px-5 rounded-xl font-extrabold shadow-sm active:scale-95 transition-all duration-200 cursor-pointer flex items-center shrink-0"
            >
              ค้นหา
            </button>
          </div>`
  ],
  // User info
  [
    `<p className="text-xs font-bold text-white">{session.user.name}</p>`,
    `<p className="text-base font-bold text-white">{session.user.name}</p>`
  ],
  [
    `<p className="text-[10px] text-rose-200 font-bold">`,
    `<p className="text-sm text-rose-200 font-bold">`
  ],
  [
    `className="bg-white/20 border border-white/30 text-white text-[9px] font-extrabold py-1 px-2.5 rounded-full tracking-wide"`,
    `className="bg-white/20 border border-white/30 text-white text-xs font-extrabold py-1 px-2.5 rounded-full tracking-wide"`
  ],
  // Warning/Defaults search
  [
    `className="w-full bg-rose-100 border border-rose-200 text-pink-600 text-sm p-4 rounded-xl text-center self-start shadow-sm font-semibold"`,
    `className="w-full bg-rose-100 border border-rose-200 text-pink-600 text-base p-4 rounded-xl text-center self-start shadow-sm font-semibold"`
  ],
  [
    `<h3 className="text-md font-bold text-rose-900">ยังไม่ได้ระบุข้อมูลผู้ป่วย</h3>`,
    `<h3 className="text-lg font-bold text-rose-900">ยังไม่ได้ระบุข้อมูลผู้ป่วย</h3>`
  ],
  [
    `<p className="text-sm text-pink-600/60 mt-1 max-w-sm font-medium">`,
    `<p className="text-base text-pink-600/60 mt-1 max-w-sm font-medium">`
  ],

  // 3. Patient Profile card
  [
    `<h2 className="text-xl font-bold text-rose-955 flex items-center gap-2.5">`,
    `<h2 className="text-3xl font-bold text-rose-955 flex items-center gap-2.5">`
  ],
  [
    `className="text-xs bg-rose-500/10 border border-rose-200 text-pink-600 font-extrabold px-2 py-0.5 rounded-md"`,
    `className="text-base bg-rose-500/10 border border-rose-200 text-pink-600 font-extrabold px-2.5 py-0.5 rounded-md"`
  ],
  [
    `className="flex flex-wrap items-center gap-4 text-xs text-rose-800/80 mt-1 justify-center md:justify-start font-medium"`,
    `className="flex flex-wrap items-center gap-4 text-base text-rose-800/90 mt-1 justify-center md:justify-start font-medium"`
  ],
  // Chronics
  [
    `<h4 className="text-emerald-700 font-extrabold text-xs tracking-wider uppercase">โรคประจำตัว (Chronic Diseases)</h4>`,
    `<h4 className="text-emerald-700 font-extrabold text-sm md:text-base tracking-wider uppercase">โรคประจำตัว (Chronic Diseases)</h4>`
  ],
  [
    `className="text-xs text-emerald-800 font-extrabold flex items-center gap-1"`,
    `className="text-base text-emerald-800 font-extrabold flex items-center gap-1"`
  ],
  [
    `className="bg-emerald-50/20 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 text-xs self-stretch md:self-auto font-extrabold ring-1 ring-emerald-50"`,
    `className="bg-emerald-50/20 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 text-base self-stretch md:self-auto font-extrabold ring-1 ring-emerald-50"`
  ],
  // Allergies
  [
    `<h4 className="text-red-700 font-extrabold text-xs tracking-wider uppercase">ระวัง: ประวัติแพ้ยา (Drug Allergy)</h4>`,
    `<h4 className="text-red-700 font-extrabold text-sm md:text-base tracking-wider uppercase">ระวัง: ประวัติแพ้ยา (Drug Allergy)</h4>`
  ],
  [
    `className="mt-1.5 text-xs text-red-700 font-extrabold leading-relaxed"`,
    `className="mt-1.5 text-base text-red-700 font-extrabold leading-relaxed"`
  ],
  [
    `className="bg-rose-50/30 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-xs self-stretch md:self-auto font-extrabold ring-1 ring-rose-100"`,
    `className="bg-rose-50/30 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 text-base self-stretch md:self-auto font-extrabold ring-1 ring-rose-100"`
  ],
  [
    `💊 {a.agent} → <span className="text-red-900 font-semibold">{a.symptom}</span>`,
    `💊 {a.agent} → <span className="text-red-955 font-bold">{a.symptom}</span>`
  ],

  // 4. Left Visits Timeline Column
  [
    `<h3 className="font-extrabold text-white text-sm">ประวัติการตรวจรักษา ({patientData.visits ? patientData.visits.length : 0} Visits)</h3>`,
    `<h3 className="font-extrabold text-white text-lg">ประวัติการตรวจรักษา ({patientData.visits ? patientData.visits.length : 0} Visits)</h3>`
  ],
  [
    `<span className="text-[10px] bg-white/20 border border-white/30 text-white py-0.5 px-2.5 rounded-full font-bold shadow-sm">ล่าสุด</span>`,
    `<span className="text-sm bg-white/20 border border-white/30 text-white py-0.5 px-2.5 rounded-full font-bold shadow-sm">ล่าสุด</span>`
  ],
  [
    `className={\`text-[11px] font-bold \${isSelected ? 'text-rose-955' : 'text-rose-800'}\`}`,
    `className={\`text-sm md:text-base font-bold \${isSelected ? 'text-rose-955' : 'text-rose-800'}\`}`
  ],
  [
    `<span className="text-[9px] text-rose-400 font-mono font-bold">`,
    `<span className="text-sm text-rose-400 font-mono font-bold">`
  ],
  [
    `<span className="text-xs text-rose-900 font-semibold truncate flex-1">{v.department}</span>`,
    `<span className="text-base text-rose-900 font-semibold truncate flex-1">{v.department}</span>`
  ],
  [
    `\${hasAn ? 'bg-amber-100 border border-amber-200 text-amber-700' : 'bg-rose-50 border border-rose-100/80 text-rose-600'}`,
    `\${hasAn ? 'bg-amber-100 border border-amber-200 text-amber-700' : 'bg-rose-50 border border-rose-100/80 text-rose-600'}`
  ],
  [
    `className={\`text-[9px] font-extrabold px-2 py-0.5 rounded-full shrink-0 \${`,
    `className={\`text-sm font-extrabold px-2 py-0.5 rounded-full shrink-0 \${`
  ],
  [
    `className="p-8 text-center text-zinc-400 text-xs"`,
    `className="p-8 text-center text-zinc-400 text-sm"`
  ],

  // 5. Right Visits Details Pane header
  [
    `<span className="text-xs text-rose-200 font-bold">รายละเอียดของ Visit:</span>`,
    `<span className="text-sm text-rose-200 font-bold">รายละเอียดของ Visit:</span>`
  ],
  [
    `<strong className="text-sm text-white font-extrabold">{selectedVn || 'กรุณาเลือก Visit'}</strong>`,
    `<strong className="text-base text-white font-extrabold">{selectedVn || 'กรุณาเลือก Visit'}</strong>`
  ],
  [
    `<span className="text-[10px] bg-white/20 border border-white/30 text-white py-0.5 px-2.5 rounded-full font-bold">`,
    `<span className="text-xs bg-white/20 border border-white/30 text-white py-0.5 px-2.5 rounded-full font-bold">`
  ],
  // Tab wrapper container
  [
    `className="flex overflow-x-auto bg-rose-50/20 border-b border-rose-100 text-xs font-bold px-4 pt-2.5 gap-1.5 scrollbar-thin"`,
    `className="flex overflow-x-auto bg-rose-50/20 border-b border-rose-100 text-sm font-bold px-4 pt-2.5 gap-1.5 scrollbar-thin"`
  ],

  // 6. Loading screen & Fallbacks inside Details Pane
  [
    `<span className="text-xs font-semibold">กำลังโหลดรายละเอียด Visit...</span>`,
    `<span className="text-sm font-semibold">กำลังโหลดรายละเอียด Visit...</span>`
  ],
  [
    `className="h-full flex flex-col items-center justify-center text-pink-600/40 text-xs py-12 font-medium"`,
    `className="h-full flex flex-col items-center justify-center text-pink-600/40 text-sm py-12 font-medium"`
  ],

  // 7. Vitals (Screening) tab content
  [
    `<span className="text-[10px] text-pink-600 font-extrabold uppercase tracking-wider">ความดันโลหิต (BP)</span>`,
    `<span className="text-xs text-pink-600 font-extrabold uppercase tracking-wider">ความดันโลหิต (BP)</span>`
  ],
  [
    `<span className="text-[10px] text-rose-600/80 font-bold">mmHg</span>`,
    `<span className="text-xs text-rose-600/80 font-bold">mmHg</span>`
  ],
  [
    `<span className="text-[10px] text-pink-700 font-extrabold uppercase tracking-wider">ชีพจร (Pulse)</span>`,
    `<span className="text-xs text-pink-700 font-extrabold uppercase tracking-wider">ชีพจร (Pulse)</span>`
  ],
  [
    `<span className="text-[10px] text-pink-600/80 font-bold">ครั้ง/นาที</span>`,
    `<span className="text-xs text-pink-600/80 font-bold">ครั้ง/นาที</span>`
  ],
  [
    `<span className="text-[10px] text-amber-700 font-extrabold uppercase tracking-wider">อุณหภูมิ (Temp)</span>`,
    `<span className="text-xs text-amber-700 font-extrabold uppercase tracking-wider">อุณหภูมิ (Temp)</span>`
  ],
  [
    `<span className="text-[10px] text-amber-600/80 font-bold">°C</span>`,
    `<span className="text-xs text-amber-600/80 font-bold">°C</span>`
  ],
  [
    `<span className="text-[10px] text-zinc-700 font-extrabold uppercase tracking-wider">น้ำหนัก/ส่วนสูง</span>`,
    `<span className="text-xs text-zinc-700 font-extrabold uppercase tracking-wider">น้ำหนัก/ส่วนสูง</span>`
  ],
  [
    `<strong className="text-sm text-zinc-955 truncate font-extrabold">
                                W: {visitDetails.screening?.bw || '-'} kg / H: {visitDetails.screening?.height || '-'} cm
                              </strong>`,
    `<strong className="text-base text-zinc-955 truncate font-extrabold">
                                W: {visitDetails.screening?.bw || '-'} kg / H: {visitDetails.screening?.height || '-'} cm
                              </strong>`
  ],
  [
    `<span className="text-[10px] text-zinc-600 font-bold">`,
    `<span className="text-xs text-zinc-600 font-bold">`
  ],
  // Vitals main values
  [
    `<strong className="text-xl text-rose-950 font-extrabold">`,
    `<strong className="text-2xl text-rose-955 font-extrabold">`
  ],
  [
    `<strong className="text-xl text-pink-950 font-extrabold flex items-center gap-1.5 animate-pulse">`,
    `<strong className="text-2xl text-pink-955 font-extrabold flex items-center gap-1.5 animate-pulse">`
  ],
  [
    `<strong className="text-xl text-amber-955 font-extrabold">`,
    `<strong className="text-2xl text-amber-955 font-extrabold">`
  ],
  // Titles & text blocks CC, HPI, PE
  [
    `<h4 className="text-xs font-bold text-pink-600 uppercase tracking-wide">อาการสำคัญ (Chief Complaint)</h4>`,
    `<h4 className="text-sm font-bold text-pink-600 uppercase tracking-wide">อาการสำคัญ (Chief Complaint)</h4>`
  ],
  [
    `className="bg-rose-50/10 border border-rose-100/80 p-4 rounded-xl text-xs text-rose-955 leading-relaxed font-medium"`,
    `className="bg-rose-50/10 border border-rose-100/80 p-4 rounded-xl text-sm text-rose-955 leading-relaxed font-medium"`
  ],
  [
    `<h4 className="text-xs font-bold text-pink-600 uppercase tracking-wide">ประวัติปัจจุบัน (History of Present Illness)</h4>`,
    `<h4 className="text-sm font-bold text-pink-600 uppercase tracking-wide">ประวัติปัจจุบัน (History of Present Illness)</h4>`
  ],
  [
    `className="bg-rose-50/10 border border-rose-100/80 p-4 rounded-xl text-xs text-zinc-700 leading-relaxed font-medium"`,
    `className="bg-rose-50/10 border border-rose-100/80 p-4 rounded-xl text-sm text-zinc-700 leading-relaxed font-medium"`
  ],
  [
    `<h4 className="text-xs font-bold text-pink-600 uppercase tracking-wide">การตรวจร่างกาย (Physical Exam)</h4>`,
    `<h4 className="text-sm font-bold text-pink-600 uppercase tracking-wide">การตรวจร่างกาย (Physical Exam)</h4>`
  ],
  [
    `className="bg-rose-50/10 border border-rose-100/80 p-4 rounded-xl text-xs font-mono text-zinc-600 leading-relaxed whitespace-pre-line"`,
    `className="bg-rose-50/10 border border-rose-100/80 p-4 rounded-xl text-sm font-mono text-zinc-600 leading-relaxed whitespace-pre-line"`
  ],

  // 8. Diagnoses & Procedures
  [
    `<h4 className="text-xs font-bold text-pink-600 uppercase tracking-wide">การวินิจฉัยโรค (Diagnoses)</h4>`,
    `<h4 className="text-sm font-bold text-pink-600 uppercase tracking-wide">การวินิจฉัยโรค (Diagnoses)</h4>`
  ],
  [
    `<table className="w-full text-left text-xs border-collapse">`,
    `<table className="w-full text-left text-sm border-collapse">`
  ],
  [
    `className="text-[10px] text-pink-600/70 mt-0.5 font-medium"`,
    `className="text-xs text-pink-600/70 mt-0.5 font-medium"`
  ],
  [
    `className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${`,
    `className={\`text-xs font-bold px-2 py-0.5 rounded-full \${`
  ],
  [
    `<h4 className="text-xs font-bold text-pink-600 uppercase tracking-wide">หัตถการและการผ่าตัด (Procedures / Operation)</h4>`,
    `<h4 className="text-sm font-bold text-pink-600 uppercase tracking-wide">หัตถการและการผ่าตัด (Procedures / Operation)</h4>`
  ],

  // 9. Prescriptions
  [
    `<h4 className="text-xs font-bold text-pink-600 uppercase tracking-wide">รายการยารักษาโรคที่สั่งจ่าย (Prescribed Medications)</h4>`,
    `<h4 className="text-sm font-bold text-pink-600 uppercase tracking-wide">รายการยารักษาโรคที่สั่งจ่าย (Prescribed Medications)</h4>`
  ],
  [
    `className="p-3 text-zinc-700 text-xs italic font-semibold"`,
    `className="p-3 text-zinc-700 text-sm italic font-semibold"`
  ],

  // 10. Lab Results
  [
    `<h4 className="text-xs font-bold text-pink-600 uppercase tracking-wide">ผลตรวจทางห้องปฏิบัติการ (Laboratory Results)</h4>`,
    `<h4 className="text-sm font-bold text-pink-600 uppercase tracking-wide">ผลตรวจทางห้องปฏิบัติการ (Laboratory Results)</h4>`
  ],
  [
    `className="p-3 text-[10px] font-bold text-rose-500 uppercase tracking-wider"`,
    `className="p-3 text-xs font-bold text-rose-500 uppercase tracking-wider"`
  ],
  [
    `className={\`text-[10px] py-0.5 px-2.5 rounded-full font-bold border \${`,
    `className={\`text-xs py-0.5 px-2.5 rounded-full font-bold border \${`
  ],

  // 11. X-ray Reports
  [
    `<h4 className="text-xs font-bold text-pink-600 uppercase tracking-wide">รายงานผลการตรวจทางรังสีวิทยา (Radiology X-ray Reports)</h4>`,
    `<h4 className="text-sm font-bold text-pink-600 uppercase tracking-wide">รายงานผลการตรวจทางรังสีวิทยา (Radiology X-ray Reports)</h4>`
  ],
  [
    `className="text-rose-500 text-[10px] font-bold uppercase tracking-wider"`,
    `className="text-rose-500 text-xs font-bold uppercase tracking-wider"`
  ],
  [
    `className="text-xs text-pink-600/80 font-semibold"`,
    `className="text-sm text-pink-600/80 font-semibold"`
  ],
  [
    `className="text-xs text-rose-955 font-extrabold"`,
    `className="text-sm text-rose-955 font-extrabold"`
  ],
  [
    `className="text-xs text-rose-900 font-mono font-bold"`,
    `className="text-sm text-rose-900 font-mono font-bold"`
  ],
  [
    `className="text-xs text-pink-600 font-mono font-bold"`,
    `className="text-sm text-pink-600 font-mono font-bold"`
  ],
  [
    `className="text-xs text-rose-900 font-bold"`,
    `className="text-sm text-rose-900 font-bold"`
  ],
  [
    `className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 py-0.5 px-2 rounded-full font-extrabold"`,
    `className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 py-0.5 px-2 rounded-full font-extrabold"`
  ],
  [
    `className="bg-rose-50/30 border border-rose-100 rounded-lg p-4 text-xs font-mono text-rose-955 leading-relaxed overflow-x-auto whitespace-pre-wrap font-semibold"`,
    `className="bg-rose-50/30 border border-rose-100 rounded-lg p-4 text-sm font-mono text-rose-955 leading-relaxed overflow-x-auto whitespace-pre-wrap font-semibold"`
  ],

  // 12. Appointments & Referrals
  [
    `<h4 className="text-xs font-bold text-pink-600 uppercase tracking-wide">ใบนัดหมายติดตามผล (Appointments)</h4>`,
    `<h4 className="text-sm font-bold text-pink-600 uppercase tracking-wide">ใบนัดหมายติดตามผล (Appointments)</h4>`
  ],
  [
    `className="flex flex-col gap-1.5 text-xs text-rose-900 font-semibold"`,
    `className="flex flex-col gap-1.5 text-sm text-rose-900 font-semibold"`
  ],
  [
    `className="text-xs text-pink-600/80 font-bold"`,
    `className="text-sm text-pink-600/80 font-bold"`
  ],
  [
    `className="text-sm text-rose-955 font-extrabold"`,
    `className="text-base text-rose-955 font-extrabold"`
  ],
  [
    `className="bg-white p-2 border border-rose-100 rounded text-[11px] text-rose-800 mt-1 leading-relaxed shadow-sm font-medium"`,
    `className="bg-white p-2 border border-rose-100 rounded text-xs text-rose-800 mt-1 leading-relaxed shadow-sm font-medium"`
  ],
  [
    `<h4 className="text-xs font-bold text-pink-600 uppercase tracking-wide">การส่งต่อผู้ป่วย (Refer Out)</h4>`,
    `<h4 className="text-sm font-bold text-pink-600 uppercase tracking-wide">การส่งต่อผู้ป่วย (Refer Out)</h4>`
  ],
  [
    `className="text-[10px] bg-rose-500/10 border border-rose-200 text-pink-600 font-extrabold px-2 py-0.5 rounded"`,
    `className="text-xs bg-rose-500/10 border border-rose-200 text-pink-600 font-extrabold px-2 py-0.5 rounded"`
  ],
  [
    `className="bg-white p-2 rounded text-[11px] text-rose-800 border border-rose-100 leading-relaxed font-semibold shadow-sm"`,
    `className="bg-white p-2 rounded text-xs text-rose-800 border border-rose-100 leading-relaxed font-semibold shadow-sm"`
  ],
  [
    `<h4 className="text-xs font-bold text-pink-600 uppercase tracking-wide">การรับโอนผู้ป่วย (Refer In)</h4>`,
    `<h4 className="text-sm font-bold text-pink-600 uppercase tracking-wide">การรับโอนผู้ป่วย (Refer In)</h4>`
  ],
  [
    `className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-extrabold px-2 py-0.5 rounded"`,
    `className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-extrabold px-2 py-0.5 rounded"`
  ],
  [
    `className="bg-white p-2 rounded text-[11px] text-zinc-600 border border-zinc-100 leading-relaxed font-medium"`,
    `className="bg-white p-2 rounded text-xs text-zinc-600 border border-zinc-100 leading-relaxed font-medium"`
  ],
  [
    `className="bg-rose-50/30 border border-rose-100 p-4 rounded-xl flex flex-col gap-2 text-xs text-rose-900"`,
    `className="bg-rose-50/30 border border-rose-100 p-4 rounded-xl flex flex-col gap-2 text-sm text-rose-900"`
  ],
  [
    `className="bg-emerald-50/5 border border-emerald-500/20 p-4 rounded-xl flex flex-col gap-2 text-xs text-zinc-800 font-semibold"`,
    `className="bg-emerald-50/5 border border-emerald-500/20 p-4 rounded-xl flex flex-col gap-2 text-sm text-zinc-800 font-semibold"`
  ]
];

console.log('Starting replacements...');
let count = 0;
for (const [target, replacement] of replacements) {
  if (content.includes(target)) {
    content = content.replace(target, replacement);
    count++;
  } else {
    console.warn(`WARNING: Target string not found for: "${target.substring(0, 100)}..."`);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Successfully completed ${count} replacements out of ${replacements.length}.`);
