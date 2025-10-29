let currentSlide = 1;
const totalSlides = 7;

function showSlide(slideNumber) {
    // 모든 슬라이드 숨기기
    const slides = document.querySelectorAll('.slide');
    slides.forEach(slide => slide.classList.remove('active'));
    
    // 선택된 슬라이드 보이기
    const targetSlide = document.getElementById(`slide-${slideNumber}`);
    if (targetSlide) {
        targetSlide.classList.add('active');
    }
    
    // 현재 슬라이드 번호 업데이트
    currentSlide = slideNumber;
    document.getElementById('current-slide').textContent = currentSlide;
    
    // 인디케이터 업데이트
    updateIndicators();
    
    // 네비게이션 버튼 상태 업데이트
    updateNavButtons();
}

function nextSlide() {
    if (currentSlide < totalSlides) {
        showSlide(currentSlide + 1);
    }
}

function previousSlide() {
    if (currentSlide > 1) {
        showSlide(currentSlide - 1);
    }
}

function goToSlide(slideNumber) {
    if (slideNumber >= 1 && slideNumber <= totalSlides) {
        showSlide(slideNumber);
    }
}

function updateIndicators() {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        if (index + 1 === currentSlide) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

function updateNavButtons() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    prevBtn.disabled = currentSlide === 1;
    nextBtn.disabled = currentSlide === totalSlides;
}

// 키보드 네비게이션
document.addEventListener('keydown', function(event) {
    switch(event.key) {
        case 'ArrowRight':
        case ' ':
            event.preventDefault();
            nextSlide();
            break;
        case 'ArrowLeft':
            event.preventDefault();
            previousSlide();
            break;
        case 'Home':
            event.preventDefault();
            goToSlide(1);
            break;
        case 'End':
            event.preventDefault();
            goToSlide(totalSlides);
            break;
    }
});

// 터치/스와이프 지원
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(event) {
    touchStartX = event.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(event) {
    touchEndX = event.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // 왼쪽으로 스와이프 = 다음 슬라이드
            nextSlide();
        } else {
            // 오른쪽으로 스와이프 = 이전 슬라이드
            previousSlide();
        }
    }
}

// PDF 다운로드 함수
function downloadPDF() {
    const button = document.querySelector('.pdf-download-btn');
    const navigation = document.querySelector('.navigation');
    const indicators = document.querySelector('.slide-indicators');
    
    // 버튼과 네비게이션 숨기기
    button.style.display = 'none';
    navigation.style.display = 'none';
    indicators.style.display = 'none';
    
    // 모든 슬라이드를 보이도록 설정
    const slides = document.querySelectorAll('.slide');
    const slideWrapper = document.querySelector('.slide-wrapper');
    
    // 원래 스타일 저장
    const originalStyles = {
        wrapper: {
            width: slideWrapper.style.width,
            height: slideWrapper.style.height,
            aspectRatio: slideWrapper.style.aspectRatio
        },
        slides: Array.from(slides).map(slide => ({
            position: slide.style.position,
            opacity: slide.style.opacity,
            transform: slide.style.transform,
            display: slide.style.display
        }))
    };
    
    // PDF용 스타일 적용
    slideWrapper.style.width = '210mm';
    slideWrapper.style.height = 'auto';
    slideWrapper.style.aspectRatio = 'unset';
    
        slides.forEach((slide, index) => {
        slide.style.position = 'relative';
        slide.style.opacity = '1';
        slide.style.transform = 'none';
        slide.style.display = 'block';
        slide.style.pageBreakAfter = index < slides.length - 1 ? 'always' : 'auto';
        slide.style.height = '210mm'; // 4:3 비율에 맞춘 높이
        slide.style.marginBottom = index < slides.length - 1 ? '10mm' : '0';
    });    const opt = {
        margin: [10, 10, 10, 10],
        filename: '예술창작활동지원_사업계획서.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true,
            allowTaint: false
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            putOnlyUsedFonts: true,
            floatPrecision: 16
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };
    
    html2pdf().set(opt).from(slideWrapper).save().then(() => {
        // 원래 스타일로 복원
        slideWrapper.style.width = originalStyles.wrapper.width;
        slideWrapper.style.height = originalStyles.wrapper.height;
        slideWrapper.style.aspectRatio = originalStyles.wrapper.aspectRatio;
        
        slides.forEach((slide, index) => {
            const originalStyle = originalStyles.slides[index];
            slide.style.position = originalStyle.position;
            slide.style.opacity = originalStyle.opacity;
            slide.style.transform = originalStyle.transform;
            slide.style.display = originalStyle.display;
            slide.style.pageBreakAfter = 'auto';
            slide.style.height = '';
            slide.style.marginBottom = '';
        });
        
        // 현재 슬라이드만 보이도록 설정
        showSlide(currentSlide);
        
        // UI 요소 다시 보이기
        button.style.display = 'flex';
        navigation.style.display = 'flex';
        indicators.style.display = 'flex';
    });
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 총 슬라이드 수 설정
    document.getElementById('total-slides').textContent = totalSlides;
    
    // 첫 번째 슬라이드 표시
    showSlide(1);
    
    // 슬라이드 자동 높이 조정
    adjustSlideHeight();
});

// 창 크기 변경 시 슬라이드 높이 재조정
window.addEventListener('resize', adjustSlideHeight);

function adjustSlideHeight() {
    const slideWrapper = document.querySelector('.slide-wrapper');
    const containerHeight = window.innerHeight;
    const containerWidth = window.innerWidth;
    
    // 4:3 비율 유지하면서 최적 크기 계산
    const maxWidth = containerWidth * 0.85;
    const maxHeight = containerHeight * 0.85;
    
    let width, height;
    
    if (maxWidth / 4 * 3 <= maxHeight) {
        // 너비 기준으로 계산
        width = maxWidth;
        height = maxWidth / 4 * 3;
    } else {
        // 높이 기준으로 계산
        height = maxHeight;
        width = height / 3 * 4;
    }
    
    slideWrapper.style.width = `${width}px`;
    slideWrapper.style.height = `${height}px`;
}

// 프레젠테이션 모드 토글 (F11)
document.addEventListener('keydown', function(event) {
    if (event.key === 'F11') {
        event.preventDefault();
        toggleFullscreen();
    }
});

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}