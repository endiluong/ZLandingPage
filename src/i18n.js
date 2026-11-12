// All visible text, in English and Vietnamese. Elements opt in with
// data-i18n="key". The Vietnamese is a draft for the owner to correct.
export const TEXT = {
  en: {
    morning: 'Morning', day: 'Day', evening: 'Evening', night: 'Night',
    full: 'Full', clay: 'Clay', wire: 'Wireframe', curtains: 'Curtains',
    's0.eyebrow': 'Room tour',
    's0.body': 'Scroll to walk through my room: code, coffee, shrimp and paint in one small space.',
    's1.eyebrow': '01 · The desk', 's1.title': 'Day Koder',
    's1.body': 'Where the daytime goes. Code on the main screen, charts and cameras on the one above.',
    's2.eyebrow': '02 · The backlog wall', 's2.title': 'Kits waiting, kits finished',
    's2.body': 'Top shelf: boxes still waiting their turn. Below: the ones that made it.',
    's3.eyebrow': '03 · The print corner', 's3.title': "When the kit doesn't exist, print it",
    's3.body': 'A filament printer for parts and jigs, a resin printer for busts and fine detail.',
    's4.eyebrow': '04 · Water and coffee', 's4.title': 'A shrimp tank and an espresso bar',
    's4.body': 'A shallow tank with ferns growing out of the water, next to the machine that starts every day. Click the curtains to open or close them.',
    's5.eyebrow': '05 · The paint corner', 's5.title': 'Nite Painter',
    's5.body': 'Spray booth, five airbrushes, a compressor under the table, and whichever bust is on the stand this week.',
    's6.eyebrow': '06 · The display shelf', 's6.title': 'Finished, primed and waiting',
    's6.body': 'Finished figures on top, grey prints in the middle, paint below. The bean bag is for sitting and looking at them.',
    's7.eyebrow': "That's the room", 's7.title': 'Thanks for visiting',
    's7.body': 'Links coming soon.',
  },
  vi: {
    morning: 'Sáng', day: 'Trưa', evening: 'Chiều', night: 'Đêm',
    full: 'Đầy đủ', clay: 'Đất sét', wire: 'Khung dây', curtains: 'Rèm',
    's0.eyebrow': 'Tham quan phòng',
    's0.body': 'Cuộn để dạo một vòng quanh phòng mình: code, cà phê, tép và sơn trong một không gian nhỏ.',
    's1.eyebrow': '01 · Bàn làm việc', 's1.title': 'Day Koder',
    's1.body': 'Nơi ban ngày trôi qua. Màn hình chính để code, màn hình trên theo dõi biểu đồ và camera.',
    's2.eyebrow': '02 · Bức tường backlog', 's2.title': 'Kit chờ ráp, kit đã xong',
    's2.body': 'Kệ trên: những hộp còn chờ đến lượt. Kệ dưới: những mẫu đã hoàn thành.',
    's3.eyebrow': '03 · Góc in 3D', 's3.title': 'Không có kit thì tự in',
    's3.body': 'Máy in sợi nhựa cho linh kiện và đồ gá, máy in resin cho bust và chi tiết nhỏ.',
    's4.eyebrow': '04 · Nước và cà phê', 's4.title': 'Hồ tép và quầy espresso',
    's4.body': 'Hồ cạn với dương xỉ vươn lên khỏi mặt nước, cạnh chiếc máy mở đầu mỗi ngày. Bấm vào rèm để mở hoặc đóng.',
    's5.eyebrow': '05 · Góc sơn', 's5.title': 'Nite Painter',
    's5.body': 'Buồng phun sơn, năm cây airbrush, máy nén khí dưới bàn và chiếc bust đang nằm trên giá tuần này.',
    's6.eyebrow': '06 · Kệ trưng bày', 's6.title': 'Đã xong, đã lót và đang chờ',
    's6.body': 'Mô hình hoàn thiện ở trên, bản in xám ở giữa, sơn ở dưới. Ghế lười là để ngồi ngắm.',
    's7.eyebrow': 'Hết một vòng', 's7.title': 'Cảm ơn đã ghé thăm',
    's7.body': 'Liên kết sẽ cập nhật sau.',
  },
};

export function applyLanguage(lang) {
  const table = TEXT[lang] || TEXT.en;
  document.documentElement.lang = lang;
  for (const el of document.querySelectorAll('[data-i18n]')) {
    const value = table[el.dataset.i18n];
    if (value) el.textContent = value;
  }
}
