// 가사 데이터를 불러오고 페이지를 동적으로 생성하는 JavaScript

let lyricsData = null;

// 페이지 로드 시 가사 데이터 불러오기
// 페이지 준비 완료 시 초기 작업
document.addEventListener('`DOMContentLoaded`', async function() {
    try {
        const response = await fetch('lyrics-data.json');
        lyricsData = await response.json();
        
        // 곡 섹션들 생성
        createSongSections();
        
        // 스크롤 이벤트 리스너 추가 (네비게이션 제거로 단순화)
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

// 곡 섹션들 생성 함수
// 곡 섹션들을 동적으로 생성
function createSongSections() {
    // 전역 LyricsData를 읽어 각 곡에 대한 <section>을 만들고 붙임

    // 섹션들을 담을 부모 컨테이너를 가져옴
    const container = document.getElementById('songs-container');
    
    // 순서를 한글로 변환하는 함수
    const getKoreanOrder = (index) => {
        const numbers = ['첫 번째', '두 번째', '세 번째', '네 번째', '다섯 번째', '여섯 번째', '일곱 번째', '여덟 번째', '아홉 번째', '열 번째'];
        return numbers[index] || `${index + 1} 번째`;
    };
    
    // forEach : 가사 데이터의 각 곡을 순회하며 화면 요소 생성
    lyricsData.songs.forEach((song, index) => {
        // 각 곡에 대한 <section> 요소 생성
        const section = document.createElement('section');
        // 이 섹션의 id를 곡 id로 설정(뒤에서 querySelector로 찾기 쉬움)
        section.id = song.id;
        // 현재 곡의 순서를 한글 표현으로 계산
        const orderText = getKoreanOrder(index);
        
        // 이 섹션 내부 HTML을 한 번에 구성(템플릿 리터럴로 가독성 높임)
        // 헤더 : 곡 제목 + '가사 보기' 버튼, 버튼은 인라인 핸들러로 toggleLyrics를 호출
        // 설명 : 클릭 시 showDescription으로, 타이핑 애니메이션으로 표시되는 설명, 점들로 표시
        // 가사 : 초기에는 숨겨진 상태(display:none), 토글 버튼으로 가사 보이기/숨기기
        // <pre> : 가사 내용이 들어갈 영역, <pre>로 줄바꿈/ 공백 보존
        section.innerHTML = `
            <div class="song-header">
                <h2>🎶 ${song.title}</h2>
                <button class="lyrics-toggle" onclick="toggleLyrics('${song.id}')">
                    <i class="fas fa-music"></i>
                    <span>가사 보기</span>
                </button>
            </div>
            <div class="description-trigger" onclick="showDescription('${song.id}')">
                <span class="description-dots" data-order="${orderText}"></span>
                <div class="description-content" id="description-${song.id}">
                    ${song.description}
                </div>
            </div>
            <div class="lyrics-container" id="lyrics-${song.id}" style="display: none;">
                <pre class="lyrics">${song.lyrics}</pre>
            </div>
        `;
        
        //완성된 섹션을 부모 컨테이너에 실제로 추가
        container.appendChild(section);
    });
}

// 설명 타이핑 애니메이션 함수
// 특정 곡 섹션의 설명을 토글하고, 열 때는 타자 애니메이션 표시
function showDescription(songId) {
    // id=songId인 섹션 내부의 .description-trigger 요소 선택
    const trigger = document.querySelector(`#${songId} .description-trigger`);
    // 점(...) 표시 요소. 열릴 때 숨기고 닫을 때 보이게 함
    const dots = trigger.querySelector('.description-dots');
    // 실제 설명 텍스트 상자
    const content = trigger.querySelector('.description-content');
    
    // 이미 표시된 경우 다시 숨기기
    // 인라인 스타일 기준으로 '보이는 상태'인지 확인(초기 상태는 CSS에서 제어)
    if (content.style.display === 'block') {
        content.style.display = 'none'; // 설명 숨김
        dots.style.display = 'inline'; // 점(...)을 다시 보이게
        // 원래 텍스트는 CSS에서 data-order 속성으로 표시됨
        return;
    }
    
    // 점들 숨기기
    dots.style.display = 'none'; // 열릴 때는 점(...) 숨김
    content.style.display = 'block'; // 설명 박스 보이게
    content.innerHTML = ''; //타자 에니메이션을 위해 기존 텍스트를 비우고 0글자부터 시작
    
    // 현재 곡의 설명 텍스트를 가져옴
    // 전역 데이터에서 해당 곡을 찾아 설명 원문을 준비
    const text = lyricsData.songs.find(song => song.id === songId).description;
    // 현재까지 출력한 글자 수(커서 역할)
    let index = 0;
    
    // 타이핑 애니메이션
    // 내부 함수 : 한 글자씩 추가하고 스스로 재호출
    function typeWriter() {
        // 아직 출력할 글자가 남았는지 체크
        if (index < text.length) {
            // 다음 한 글자를 추가
            content.innerHTML += text.charAt(index);
            // 커서 한 칸 전진
            index++;
            //30ms 뒤에 다시 typeWriter실행 -> 반복
            setTimeout(typeWriter, 30); // 타이핑 속도 조절
        }
    }
    
    typeWriter(); // 타자 에니메이션 시작
}

// 가사 토글 함수
// 특정 곡의 가사 영역을 열고 닫음(애니메이션 포함)
function toggleLyrics(songId) {
    // 해당 곡의 가사 컨테이너 DOM을 찾음
    const lyricsContainer = document.getElementById(`lyrics-${songId}`);
    // 섹션 헤더의 토글 버튼
    const toggleButton = document.querySelector(`#${songId} .lyrics-toggle`);
    // 버튼 안의 아이콘 <i>
    const toggleIcon = toggleButton.querySelector('i');
    // 버튼 안의 텍스트 <span>
    const toggleText = toggleButton.querySelector('span');
    
    // 현재 숨김 또는 초기값('')이면 '보이기'로 전환
    if (lyricsContainer.style.display === 'none' || lyricsContainer.style.display === '') {
        // 가사 보이기
        // 먼저 블록으로 보여줌(레이아웃 참여)
        lyricsContainer.style.display = 'block';
        // 아이콘 클래스 설정(Font Awesome 사용 가정)
        toggleIcon.className = 'fas fa-music';
        // 버튼 라벨 변경
        toggleText.textContent = '가사 숨기기';
        
        // 부드러운 애니메이션 효과
        // 시작 상태(투명, 위로 살짝 이동)
        lyricsContainer.style.opacity = '0';
        lyricsContainer.style.transform = 'translateY(-20px)';
        
        // 다음 이벤트 루프로 미뤄, CSS전환이 자연스럽게 작동하도록 함
        setTimeout(() => {
            // 전환 속성 지정
            lyricsContainer.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            lyricsContainer.style.opacity = '1';
            // 최종 상태(불투명, 원위치)로 변화 ->0.3s 동안 애니메이션
            lyricsContainer.style.transform = 'translateY(0)';
        }, 10);
        
    } else {
        // 이미 보이는 중이면 '숨기기'로 전환
        // 사라질 때도 전환 적용
        lyricsContainer.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        lyricsContainer.style.opacity = '0';
        // 위로 살짝 올리며 투명하게
        lyricsContainer.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            // 전환이 끝날 시간(300ms) 후에 display:none으로 변경하여 완전히 숨김
            lyricsContainer.style.display = 'none';
            // 숨김 상태에서도 같은 아이콘을 유지(* 아래 toggleAllLyrics와 아이콘 정책이 다름)
            toggleIcon.className = 'fas fa-music';
            // 버튼 라벨 복귀
            toggleText.textContent = '가사 보기';
        }, 300);
    }
}

// 스크롤 네비게이션 설정
function setupScrollNavigation() {
    // 네비게이션이 제거되었으므로 기본 스크롤 동작만 유지
    console.log('네비게이션이 제거되었습니다.');
}

// 모든 가사 열기/닫기 함수 (추가 기능)
function toggleAllLyrics(show) {
    // true면 모두 열기, false면 모두 닫기
    // 모든 곡을 순회
    lyricsData.songs.forEach(song => {
        // 각 곡의 가사 컨테이너
        const lyricsContainer = document.getElementById(`lyrics-${song.id}`);
        // 각 곡의 토글 버튼
        const toggleButton = document.querySelector(`#${song.id} .lyrics-toggle`);
        // 버튼 아이콘
        const toggleIcon = toggleButton.querySelector('i');
        // 버튼 텍스트
        const toggleText = toggleButton.querySelector('span');
        
        // 모두 열기
        if (show) {
            // 보이기
            lyricsContainer.style.display = 'block';
            lyricsContainer.style.opacity = '1';
            // 즉시 보이는 상태로(개별 토글처럼 에니메이션 들어가지 않음)
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
// 문서 전체에 키다운 이벤트 리스너 등록
document.addEventListener('keydown', function(e) {
    // Ctrl + A: 모든 가사 열기
    // Ctrl이 눌렸고 'a' 키가 눌렸을 때
    if (e.ctrlKey && e.key === 'a') {
        // 브라우저 기본 동작(전체 선택)을 막음
        e.preventDefault();
        // 전곡 가사 열기
        toggleAllLyrics(true);
    }
    
    // Ctrl + H: 모든 가사 닫기
    // Ctrl이 눌렸고 'h' 키가 눌렸을 때
    if (e.ctrlKey && e.key === 'h') {
        // 브라우저 기본 동작을 막음
        e.preventDefault();
        // 전곡 가사 닫기
        toggleAllLyrics(false);
    }
});
