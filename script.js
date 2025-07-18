// 가사 데이터를 불러오고 페이지를 동적으로 생성하는 JavaScript

let lyricsData = null;

// 페이지 로드 시 가사 데이터 불러오기
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('lyrics-data.json');
        lyricsData = await response.json();
        
        // 네비게이션 생성
        createNavigation();
        
        // 곡 섹션들 생성
        createSongSections();
        
        // 스크롤 이벤트 리스너 추가
        setupScrollNavigation();
        
    } catch (error) {
        console.error('가사 데이터를 불러오는 중 오류가 발생했습니다:', error);
        
        // 에러 발생 시 기본 메시지 표시
        document.getElementById('songs-container').innerHTML = `
            <div class="error-message">
                <h2>⚠️ 가사 데이터를 불러올 수 없습니다</h2>
                <p>lyrics-data.json 파일을 확인해주세요.</p>
            </div>
        `;
    }
});

// 네비게이션 생성 함수
function createNavigation() {
    const navList = document.getElementById('nav-list');
    
    lyricsData.songs.forEach((song, index) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        a.href = `#${song.id}`;
        a.textContent = `${String(index + 1).padStart(2, '0')}. ${song.title}`;
        
        li.appendChild(a);
        navList.appendChild(li);
    });
}

// 곡 섹션들 생성 함수
function createSongSections() {
    const container = document.getElementById('songs-container');
    
    lyricsData.songs.forEach((song, index) => {
        const section = document.createElement('section');
        section.id = song.id;
        
        section.innerHTML = `
            <div class="song-header">
                <h2>🎶 ${song.title}</h2>
                <button class="lyrics-toggle" onclick="toggleLyrics('${song.id}')">
                    <i class="fas fa-music"></i>
                    <span>가사 보기</span>
                </button>
            </div>
            <div class="description-trigger" onclick="showDescription('${song.id}')">
                <span class="description-dots">---</span>
                <div class="description-content" id="description-${song.id}">
                    ${song.description}
                </div>
            </div>
            <div class="lyrics-container" id="lyrics-${song.id}" style="display: none;">
                <pre class="lyrics">${song.lyrics}</pre>
            </div>
        `;
        
        container.appendChild(section);
    });
}

// 설명 타이핑 애니메이션 함수
function showDescription(songId) {
    const trigger = document.querySelector(`#${songId} .description-trigger`);
    const dots = trigger.querySelector('.description-dots');
    const content = trigger.querySelector('.description-content');
    
    // 이미 표시된 경우 다시 숨기기
    if (content.style.display === 'block') {
        content.style.display = 'none';
        dots.style.display = 'inline';
        dots.textContent = '---';
        return;
    }
    
    // 점들 숨기기
    dots.style.display = 'none';
    content.style.display = 'block';
    content.innerHTML = '';
    
    const text = lyricsData.songs.find(song => song.id === songId).description;
    let index = 0;
    
    // 타이핑 애니메이션
    function typeWriter() {
        if (index < text.length) {
            content.innerHTML += text.charAt(index);
            index++;
            setTimeout(typeWriter, 30); // 타이핑 속도 조절
        }
    }
    
    typeWriter();
}

// 가사 토글 함수
function toggleLyrics(songId) {
    const lyricsContainer = document.getElementById(`lyrics-${songId}`);
    const toggleButton = document.querySelector(`#${songId} .lyrics-toggle`);
    const toggleIcon = toggleButton.querySelector('i');
    const toggleText = toggleButton.querySelector('span');
    
    if (lyricsContainer.style.display === 'none' || lyricsContainer.style.display === '') {
        // 가사 보이기
        lyricsContainer.style.display = 'block';
        toggleIcon.className = 'fas fa-music';
        toggleText.textContent = '가사 숨기기';
        
        // 부드러운 애니메이션 효과
        lyricsContainer.style.opacity = '0';
        lyricsContainer.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            lyricsContainer.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            lyricsContainer.style.opacity = '1';
            lyricsContainer.style.transform = 'translateY(0)';
        }, 10);
        
    } else {
        // 가사 숨기기
        lyricsContainer.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        lyricsContainer.style.opacity = '0';
        lyricsContainer.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            lyricsContainer.style.display = 'none';
            toggleIcon.className = 'fas fa-music';
            toggleText.textContent = '가사 보기';
        }, 300);
    }
}

// 스크롤 네비게이션 설정
function setupScrollNavigation() {
    // 네비게이션 링크에 부드러운 스크롤 효과 추가
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 100; // 헤더 높이 고려
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 현재 보고 있는 섹션 하이라이트
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('nav a');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    });
}

// 모든 가사 열기/닫기 함수 (추가 기능)
function toggleAllLyrics(show) {
    lyricsData.songs.forEach(song => {
        const lyricsContainer = document.getElementById(`lyrics-${song.id}`);
        const toggleButton = document.querySelector(`#${song.id} .lyrics-toggle`);
        const toggleIcon = toggleButton.querySelector('i');
        const toggleText = toggleButton.querySelector('span');
        
        if (show) {
            lyricsContainer.style.display = 'block';
            lyricsContainer.style.opacity = '1';
            lyricsContainer.style.transform = 'translateY(0)';
            toggleIcon.className = 'fas fa-chevron-up';
            toggleText.textContent = '가사 숨기기';
        } else {
            lyricsContainer.style.display = 'none';
            toggleIcon.className = 'fas fa-chevron-down';
            toggleText.textContent = '가사 보기';
        }
    });
}

// 키보드 단축키 (선택적 기능)
document.addEventListener('keydown', function(e) {
    // Ctrl + A: 모든 가사 열기
    if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        toggleAllLyrics(true);
    }
    
    // Ctrl + H: 모든 가사 닫기
    if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        toggleAllLyrics(false);
    }
});
