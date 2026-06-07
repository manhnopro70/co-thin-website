// ===========================
//  APP.JS – Website Cô Thìn
// ===========================

let appData = null;
let currentGallery = [];
let lightboxIndex = 0;

// ---- Load JSON data ----
async function loadData() {
  try {
    const res = await fetch('data.json');
    appData = await res.json();
    init();
  } catch (e) {
    console.error('Không tải được data.json:', e);
  }
}

function init() {
  renderHero();
  renderAbout();
  renderLessons(appData.lessons);
  renderGallery(appData.gallery);
  renderAnnouncements();
  renderSchedule();
  setupNavbar();
  setupFilters();
  setupGalleryFilters();
  setupLightbox();
  setupModal();
  setupBackToTop();
  setupNavToggle();
  setupScrollSpy();
}

// ---- HERO ----
function renderHero() {
  const t = appData.teacher;
  document.getElementById('heroTitle').innerHTML =
    t.name.split(' ').slice(0, -1).join(' ') + '<br/><span>' + t.name.split(' ').slice(-1)[0] + '</span>';
  document.getElementById('heroSubtitle').textContent = t.school;
  document.getElementById('heroMotto').textContent = t.motto;
  document.getElementById('heroAvatar').src = t.avatar;
  document.getElementById('heroAvatar').alt = t.name;
}

// ---- ABOUT ----
function renderAbout() {
  const t = appData.teacher;
  document.getElementById('aboutBio').textContent = t.bio;
  document.getElementById('aboutInfo').innerHTML = `
    <div class="info-row"><span class="info-icon">🎂</span><div><div class="info-label">Ngày sinh</div><div class="info-val">${t.dob}</div></div></div>
    <div class="info-row"><span class="info-icon">🏫</span><div><div class="info-label">Đơn vị</div><div class="info-val">${t.school}</div></div></div>
    <div class="info-row"><span class="info-icon">📍</span><div><div class="info-label">Địa chỉ</div><div class="info-val">${t.district}</div></div></div>
    <div class="info-row"><span class="info-icon">📚</span><div><div class="info-label">Môn dạy</div><div class="info-val">${t.subjects.join(', ')} – ${t.grades.join(', ')}</div></div></div>
    <div class="info-row"><span class="info-icon">⭐</span><div><div class="info-label">Kinh nghiệm</div><div class="info-val">${t.experience}</div></div></div>
  `;
}

// ---- LESSONS ----
function renderLessons(lessons) {
  const grid = document.getElementById('lessonsGrid');
  grid.innerHTML = lessons.map(l => lessonCardHTML(l)).join('');
  grid.querySelectorAll('.lesson-card').forEach((card, i) => {
    card.addEventListener('click', () => openLessonModal(lessons[i] || appData.lessons.find(x => x.id == card.dataset.id)));
  });
}

function lessonCardHTML(l) {
  const isMath = l.subject === 'Toán';
  const isAdv  = l.level === 'Nâng cao';
  return `
    <div class="lesson-card" data-id="${l.id}" data-subject="${l.subject}" data-grade="${l.grade}">
      <div class="lesson-top">
        <div class="lesson-icon-wrap ${isMath ? 'subject-math' : 'subject-viet'}">${l.icon}</div>
        <div class="lesson-meta">
          <div class="lesson-subject ${isMath ? 'math' : 'viet'}">${l.subject}</div>
          <span class="lesson-grade">${l.grade}</span>
        </div>
      </div>
      <div class="lesson-title">${l.title}</div>
      <div class="lesson-desc">${l.description}</div>
      <div class="lesson-footer">
        <div class="lesson-tags">
          ${l.topics.slice(0,2).map(t => `<span class="lesson-tag">${t}</span>`).join('')}
        </div>
        <span class="lesson-level ${isAdv ? 'level-advanced' : 'level-basic'}">${l.level}</span>
      </div>
      <div class="lesson-view-more">Xem chi tiết →</div>
    </div>`;
}

// ---- LESSON FILTERS ----
function setupFilters() {
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      const cards = document.querySelectorAll('.lesson-card');
      cards.forEach(card => {
        const match = f === 'all'
          || card.dataset.subject === f
          || card.dataset.grade === f;
        card.classList.toggle('hidden', !match);
      });
    });
  });
}

// ---- LESSON MODAL ----
function openLessonModal(l) {
  const isMath = l.subject === 'Toán';
  document.getElementById('modalContent').innerHTML = `
    <div class="modal-subject" style="color:${isMath ? 'var(--amber-dark)' : 'var(--green)'}">${l.icon} ${l.subject}</div>
    <div class="modal-title">${l.title}</div>
    <div class="modal-tags">
      <span class="modal-tag">${l.grade}</span>
      <span class="modal-tag">⏱ ${l.duration}</span>
      <span class="modal-tag">${l.level}</span>
    </div>
    <p class="modal-desc">${l.description}</p>
    <div class="modal-topics">
      <h4>📌 Nội dung chính</h4>
      <ul>${l.topics.map(t => `<li>${t}</li>`).join('')}</ul>
    </div>
    <div class="modal-info">
      <div class="modal-info-item">⏱ ${l.duration}</div>
      <div class="modal-info-item">📚 ${l.subject}</div>
      <div class="modal-info-item">🎓 ${l.grade}</div>
    </div>
    <div style="margin-top:20px; padding:16px; background:var(--cream); border-radius:var(--radius-sm); border:1px solid var(--border);">
      <p style="font-size:0.85rem; color:var(--text-light);">💬 Liên hệ cô Thìn qua Zalo <strong>0388 918 131</strong> để nhận tài liệu chi tiết và bài tập thực hành.</p>
    </div>
  `;
  document.getElementById('lessonModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function setupModal() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('lessonModal').addEventListener('click', e => {
    if (e.target === document.getElementById('lessonModal')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

function closeModal() {
  document.getElementById('lessonModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ---- GALLERY ----
function renderGallery(photos) {
  currentGallery = photos;
  const grid = document.getElementById('galleryGrid');
  grid.innerHTML = photos.map((p, i) => `
    <div class="gallery-item" data-gcat="${p.category}" data-index="${i}">
      <img src="${p.url}" alt="${p.title}" loading="lazy" />
      <div class="gallery-overlay">
        <div class="gallery-caption">
          <h4>${p.title}</h4>
          <p>${p.description}</p>
        </div>
      </div>
      <div class="gallery-cat">${p.category}</div>
    </div>
  `).join('');

  grid.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const visibleItems = [...grid.querySelectorAll('.gallery-item:not(.hidden)')];
      lightboxIndex = visibleItems.indexOf(item);
      openLightbox(visibleItems);
    });
  });
}

// ---- GALLERY FILTERS ----
function setupGalleryFilters() {
  document.querySelectorAll('[data-gfilter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-gfilter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.gfilter;
      document.querySelectorAll('.gallery-item').forEach(item => {
        item.classList.toggle('hidden', f !== 'all' && item.dataset.gcat !== f);
      });
    });
  });
}

// ---- LIGHTBOX ----
function setupLightbox() {
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => moveLightbox(-1));
  document.getElementById('lightboxNext').addEventListener('click', () => moveLightbox(1));
  document.getElementById('lightbox').addEventListener('click', e => {
    if (e.target === document.getElementById('lightbox')) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (!document.getElementById('lightbox').classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') moveLightbox(-1);
    if (e.key === 'ArrowRight') moveLightbox(1);
  });
}

let lightboxVisible = [];

function openLightbox(visibleItems) {
  lightboxVisible = visibleItems;
  showLightboxItem();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showLightboxItem() {
  const item = lightboxVisible[lightboxIndex];
  const img = item.querySelector('img');
  const caption = item.querySelector('.gallery-caption');
  document.getElementById('lightboxImg').src = img.src;
  document.getElementById('lightboxImg').alt = img.alt;
  document.getElementById('lightboxCaption').innerHTML =
    `<strong>${caption.querySelector('h4').textContent}</strong><br/>${caption.querySelector('p').textContent}`;
}

function moveLightbox(dir) {
  lightboxIndex = (lightboxIndex + dir + lightboxVisible.length) % lightboxVisible.length;
  showLightboxItem();
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

// ---- ANNOUNCEMENTS ----
function renderAnnouncements() {
  const list = document.getElementById('announceList');
  list.innerHTML = appData.announcements.map(a => {
    const badgeClass = { important: 'badge-important', event: 'badge-event', normal: 'badge-normal' }[a.type];
    const badgeLabel = { important: '❗ Quan trọng', event: '🎉 Sự kiện', normal: '🔔 Thông báo' }[a.type];
    const dateStr = new Date(a.date).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' });
    return `
      <div class="announce-card type-${a.type}">
        <div class="announce-icon">${a.icon}</div>
        <div class="announce-body">
          <span class="announce-badge ${badgeClass}">${badgeLabel}</span>
          <div class="announce-title">${a.title}</div>
          <div class="announce-date">📅 ${dateStr}</div>
          <div class="announce-text">${a.content}</div>
        </div>
      </div>`;
  }).join('');
}

// ---- SCHEDULE ----
function renderSchedule() {
  const table = document.getElementById('scheduleTable');
  table.innerHTML = appData.schedule.map(d => `
    <div class="schedule-day">
      <div class="schedule-day-name">${d.day}</div>
      <div class="schedule-lessons">
        ${d.lessons.map(l => `<div class="schedule-lesson">📚 ${l}</div>`).join('')}
      </div>
    </div>
  `).join('');
}

// ---- CONTACT FORM ----
function submitForm() {
  const name = document.getElementById('formName').value.trim();
  const phone = document.getElementById('formPhone').value.trim();
  const msg = document.getElementById('formMsg').value.trim();
  if (!name || !msg) {
    alert('Vui lòng nhập họ tên và nội dung!');
    return;
  }
  const text = encodeURIComponent(
    `Xin chào cô Thìn!\nTôi là: ${name}${phone ? '\nSĐT: ' + phone : ''}\n\nNội dung: ${msg}`
  );
  window.open(`https://zalo.me/0388918131?text=${text}`, '_blank');
}
window.submitForm = submitForm;

// ---- NAVBAR ----
function setupNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  });
}

// ---- NAV TOGGLE (mobile) ----
function setupNavToggle() {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  links.querySelectorAll('.nav-link').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
}

// ---- SCROLL SPY ----
function setupScrollSpy() {
  const sections = ['home','lessons','gallery','announcements','contact'];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.nav-link').forEach(l => {
          l.classList.toggle('active', l.dataset.section === entry.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

// ---- BACK TO TOP ----
function setupBackToTop() {
  const btn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---- START ----
document.addEventListener('DOMContentLoaded', loadData);
