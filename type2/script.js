// PDF 다운로드 기능
function downloadPDF() {
    const element = document.querySelector('.form-wrapper');
    const opt = {
        margin: [10, 10, 10, 10],
        filename: '2026년_청년예술지원_지원신청서.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true,
            allowTaint: true
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
        },
        pagebreak: { 
            mode: ['avoid-all', 'css', 'legacy'],
            before: '.form-section',
            after: '.portfolio-item'
        }
    };

    // PDF 생성 시작 알림
    const button = document.querySelector('.pdf-download-btn');
    const originalText = button.innerHTML;
    button.innerHTML = '<span>PDF 생성 중...</span>';
    button.disabled = true;

    html2pdf().from(element).set(opt).save().then(() => {
        // PDF 생성 완료 후 버튼 복원
        button.innerHTML = originalText;
        button.disabled = false;
    }).catch((error) => {
        console.error('PDF 생성 중 오류 발생:', error);
        alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        button.innerHTML = originalText;
        button.disabled = false;
    });
}

// 폼 데이터 저장/불러오기 (로컬 스토리지 활용)
function saveFormData() {
    const formData = {};
    
    // 텍스트 입력 필드
    document.querySelectorAll('input[type="text"], input[type="url"], input[type="date"], input[type="number"], textarea').forEach(input => {
        if (input.name || input.id) {
            formData[input.name || input.id] = input.value;
        }
    });

    // 라디오 버튼
    document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
        formData[radio.name] = radio.value;
    });

    // 체크박스
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        const key = checkbox.name || checkbox.id || `checkbox_${Array.from(document.querySelectorAll('input[type="checkbox"]')).indexOf(checkbox)}`;
        if (!formData[key]) formData[key] = [];
        if (checkbox.checked) {
            formData[key].push(checkbox.value || 'checked');
        }
    });

    localStorage.setItem('youthArtsApplication', JSON.stringify(formData));
}

function loadFormData() {
    const savedData = localStorage.getItem('youthArtsApplication');
    if (!savedData) return;

    try {
        const formData = JSON.parse(savedData);
        
        // 텍스트 입력 필드 복원
        Object.keys(formData).forEach(key => {
            const element = document.querySelector(`[name="${key}"], #${key}`);
            if (element && (element.type === 'text' || element.type === 'url' || element.type === 'date' || element.type === 'number' || element.tagName === 'TEXTAREA')) {
                element.value = formData[key];
            }
        });

        // 라디오 버튼 복원
        Object.keys(formData).forEach(key => {
            const radio = document.querySelector(`input[type="radio"][name="${key}"][value="${formData[key]}"]`);
            if (radio) {
                radio.checked = true;
            }
        });

        // 체크박스 복원
        Object.keys(formData).forEach(key => {
            if (Array.isArray(formData[key])) {
                formData[key].forEach(value => {
                    const checkbox = document.querySelector(`input[type="checkbox"][name="${key}"][value="${value}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }
        });
    } catch (error) {
        console.error('저장된 데이터 불러오기 실패:', error);
    }
}

// 자동 저장 기능
function setupAutoSave() {
    // 모든 입력 필드에 변경 이벤트 리스너 추가
    document.addEventListener('input', debounce(saveFormData, 1000));
    document.addEventListener('change', debounce(saveFormData, 1000));
}

// 디바운스 함수 (너무 자주 저장되는 것을 방지)
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 폼 유효성 검사
function validateForm() {
    const requiredFields = document.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    const errors = [];

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            errors.push(`${field.getAttribute('data-label') || field.name || '필수 필드'}는 필수 입력 사항입니다.`);
            field.style.borderColor = '#dc3545';
        } else {
            field.style.borderColor = '#ddd';
        }
    });

    // 신청주체 선택 확인
    const applicantType = document.querySelector('input[name="applicant_type"]:checked');
    if (!applicantType) {
        isValid = false;
        errors.push('신청주체를 선택해주세요.');
    }

    // 국적 선택 확인
    const nationality = document.querySelector('input[name="nationality"]:checked');
    if (!nationality) {
        isValid = false;
        errors.push('국적을 선택해주세요.');
    }

    if (!isValid) {
        alert('다음 항목들을 확인해주세요:\n\n' + errors.join('\n'));
    }

    return isValid;
}

// 문자 수 카운터
function setupCharacterCounter() {
    document.querySelectorAll('textarea').forEach(textarea => {
        const maxLength = textarea.getAttribute('maxlength');
        if (maxLength) {
            const counter = document.createElement('div');
            counter.className = 'character-counter';
            counter.style.fontSize = '9px';
            counter.style.color = '#666';
            counter.style.textAlign = 'right';
            counter.style.marginTop = '2px';
            
            const updateCounter = () => {
                const remaining = maxLength - textarea.value.length;
                counter.textContent = `${textarea.value.length}/${maxLength}`;
                counter.style.color = remaining < 50 ? '#dc3545' : '#666';
            };
            
            textarea.addEventListener('input', updateCounter);
            textarea.parentNode.appendChild(counter);
            updateCounter();
        }
    });
}

// 테이블 행 추가/삭제 기능
function setupDynamicTables() {
    // 참여자 테이블에 행 추가/삭제 버튼 추가
    const participantTable = document.querySelector('.participant-table tbody');
    if (participantTable) {
        addTableControls(participantTable, 'participant');
    }

    // 일정 테이블에 행 추가/삭제 버튼 추가
    const scheduleTable = document.querySelector('.schedule-table tbody');
    if (scheduleTable) {
        addTableControls(scheduleTable, 'schedule');
    }

    // 멘토링 테이블에 행 추가/삭제 버튼 추가
    const mentoringTable = document.querySelector('.mentoring-table tbody');
    if (mentoringTable) {
        addTableControls(mentoringTable, 'mentoring');
    }
}

function addTableControls(tbody, type) {
    const controlDiv = document.createElement('div');
    controlDiv.className = 'table-controls';
    controlDiv.style.textAlign = 'right';
    controlDiv.style.margin = '10px 0';

    const addButton = document.createElement('button');
    addButton.textContent = '+ 행 추가';
    addButton.type = 'button';
    addButton.className = 'btn-add';
    addButton.style.cssText = 'padding: 5px 10px; margin-right: 5px; font-size: 9px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;';

    const removeButton = document.createElement('button');
    removeButton.textContent = '- 행 삭제';
    removeButton.type = 'button';
    removeButton.className = 'btn-remove';
    removeButton.style.cssText = 'padding: 5px 10px; font-size: 9px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;';

    addButton.addEventListener('click', () => addTableRow(tbody, type));
    removeButton.addEventListener('click', () => removeTableRow(tbody));

    controlDiv.appendChild(addButton);
    controlDiv.appendChild(removeButton);
    tbody.parentNode.appendChild(controlDiv);
}

function addTableRow(tbody, type) {
    const firstRow = tbody.querySelector('tr');
    if (!firstRow) return;

    const newRow = firstRow.cloneNode(true);
    
    // 입력 필드 초기화
    newRow.querySelectorAll('input, textarea').forEach(input => {
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });

    // 참여자 테이블의 경우 번호 업데이트
    if (type === 'participant') {
        const rowNumber = tbody.children.length + 1;
        const firstCell = newRow.querySelector('td');
        if (firstCell) {
            firstCell.textContent = rowNumber;
        }
    }

    tbody.appendChild(newRow);
}

function removeTableRow(tbody) {
    if (tbody.children.length > 1) {
        tbody.removeChild(tbody.lastElementChild);
    } else {
        alert('최소 1개의 행은 유지되어야 합니다.');
    }
}

// 인쇄 스타일 최적화
function setupPrintStyles() {
    const printButton = document.createElement('button');
    printButton.textContent = '🖨 인쇄';
    printButton.className = 'print-btn';
    printButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 150px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 10px 15px;
        cursor: pointer;
        font-size: 12px;
        z-index: 1000;
    `;

    printButton.addEventListener('click', () => {
        window.print();
    });

    document.body.appendChild(printButton);
}

// 진행률 표시
function setupProgressIndicator() {
    const progressDiv = document.createElement('div');
    progressDiv.className = 'progress-indicator';
    progressDiv.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 1000;
    `;

    const updateProgress = () => {
        const totalFields = document.querySelectorAll('input, textarea, select').length;
        const filledFields = Array.from(document.querySelectorAll('input, textarea, select')).filter(field => {
            if (field.type === 'radio' || field.type === 'checkbox') {
                return document.querySelector(`input[name="${field.name}"]:checked`);
            }
            return field.value.trim() !== '';
        }).length;

        const progress = Math.round((filledFields / totalFields) * 100);
        progressDiv.textContent = `작성 진행률: ${progress}%`;
    };

    document.addEventListener('input', debounce(updateProgress, 500));
    document.addEventListener('change', debounce(updateProgress, 500));
    
    document.body.appendChild(progressDiv);
    updateProgress();
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 저장된 데이터 불러오기
    loadFormData();
    
    // 자동 저장 설정
    setupAutoSave();
    
    // 문자 수 카운터 설정
    setupCharacterCounter();
    
    // 동적 테이블 설정
    setupDynamicTables();
    
    // 인쇄 버튼 설정
    setupPrintStyles();
    
    // 진행률 표시 설정
    setupProgressIndicator();

    // 페이지 이탈 시 경고
    window.addEventListener('beforeunload', function(e) {
        const hasUnsavedChanges = document.querySelector('input:not([value=""]), textarea:not(:empty)');
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = '작성 중인 내용이 있습니다. 정말 나가시겠습니까?';
            return '작성 중인 내용이 있습니다. 정말 나가시겠습니까?';
        }
    });

    console.log('2026년 청년예술지원 신청서 초기화 완료');
});