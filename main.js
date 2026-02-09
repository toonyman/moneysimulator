let currentResult = null;

// 페이지 전환 함수
function showResultPage() {
    document.getElementById('inputPage').classList.add('hidden');
    document.getElementById('resultPage').classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goBack() {
    document.getElementById('resultPage').classList.remove('active');
    document.getElementById('inputPage').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 저축 계산 함수
function calculate() {
    const principal = parseFloat(document.getElementById('principal').value) || 0;
    const monthly = parseFloat(document.getElementById('monthly').value) || 0;
    const rate = parseFloat(document.getElementById('rate').value) / 100 || 0;
    const period = parseInt(document.getElementById('period').value) || 0;
    const periodUnit = document.getElementById('periodUnit').value;

    if (period <= 0) {
        alert('저축 기간을 1 이상으로 설정해주세요.');
        return;
    }

    // 기간을 월 단위로 변환
    let totalMonths;
    let displayPeriod;
    
    switch(periodUnit) {
        case 'days':
            totalMonths = period / 30; // 대략적으로 30일 = 1개월
            displayPeriod = `${period}일`;
            break;
        case 'months':
            totalMonths = period;
            displayPeriod = `${period}개월`;
            break;
        case 'years':
            totalMonths = period * 12;
            displayPeriod = `${period}년`;
            break;
    }

    // 복리 계산
    const monthlyRate = rate / 12;
    const months = Math.ceil(totalMonths);
    
    let balance = principal;
    let totalDeposit = principal;
    const periodBalances = [principal];
    
    // 차트 표시를 위한 간격 계산
    let chartInterval;
    if (periodUnit === 'days') {
        chartInterval = Math.ceil(months / 10); // 최대 10개 포인트
    } else if (periodUnit === 'months') {
        chartInterval = Math.max(1, Math.ceil(months / 12)); // 최대 12개 포인트
    } else {
        chartInterval = 12; // 년 단위는 매년
    }

    for (let i = 1; i <= months; i++) {
        balance = balance * (1 + monthlyRate) + monthly;
        totalDeposit += monthly;
        
        if (i % chartInterval === 0 || i === months) {
            periodBalances.push(balance);
        }
    }

    const finalAmount = balance;
    const totalInterest = finalAmount - totalDeposit;
    const returnRate = totalDeposit > 0 ? (totalInterest / totalDeposit) * 100 : 0;

    // 단리 계산 (비교용) - 월 단위로 계산
    const years = totalMonths / 12;
    const simpleInterest = totalDeposit * rate * years;
    const simpleFinalAmount = totalDeposit + simpleInterest;
    const difference = finalAmount - simpleFinalAmount;

    // 결과 저장
    currentResult = {
        principal,
        monthly,
        rate: rate * 100,
        period,
        periodUnit,
        displayPeriod,
        totalMonths,
        finalAmount,
        totalDeposit,
        totalInterest,
        returnRate,
        periodBalances,
        chartInterval,
        simpleFinalAmount,
        simpleInterest,
        difference
    };

    // 결과 표시
    displayResults(currentResult);
    displayChart(currentResult);
    displayComparison(currentResult);
    
    // 결과 페이지로 전환
    showResultPage();
}

function displayResults(result) {
    document.getElementById('finalAmount').textContent = formatCurrency(result.finalAmount);
    document.getElementById('interestEarned').textContent = `이자 수익: ${formatCurrency(result.totalInterest)}`;
    document.getElementById('totalDeposit').textContent = formatCurrency(result.totalDeposit);
    document.getElementById('totalInterest').textContent = formatCurrency(result.totalInterest);
    document.getElementById('returnRate').textContent = result.returnRate.toFixed(2) + '%';
}

function displayChart(result) {
    const chartBars = document.getElementById('chartBars');
    chartBars.innerHTML = '';

    const balances = result.periodBalances;
    const maxBalance = Math.max(...balances);

    balances.forEach((balance, index) => {
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        const heightPercent = (balance / maxBalance) * 100;
        
        setTimeout(() => {
            bar.style.height = `${heightPercent}%`;
        }, index * 50);

        const label = document.createElement('div');
        label.className = 'chart-bar-label';
        
        // 기간 단위에 따라 라벨 표시
        if (result.periodUnit === 'days') {
            const days = index * result.chartInterval;
            label.textContent = days === 0 ? '시작' : `${days}일`;
        } else if (result.periodUnit === 'months') {
            const months = index * result.chartInterval;
            label.textContent = months === 0 ? '시작' : `${months}월`;
        } else {
            const years = Math.floor(index * result.chartInterval / 12);
            label.textContent = years === 0 ? '시작' : `${years}년`;
        }
        
        const value = document.createElement('div');
        value.className = 'chart-bar-value';
        value.textContent = formatCurrency(balance, true);

        bar.appendChild(label);
        bar.appendChild(value);
        chartBars.appendChild(bar);
    });
}

function displayComparison(result) {
    const comparisonBody = document.getElementById('comparisonBody');
    
    comparisonBody.innerHTML = `
                <tr>
                    <td><strong>복리 계산</strong></td>
                    <td class="highlight-number">${formatCurrency(result.finalAmount)}</td>
                    <td class="highlight-number">${formatCurrency(result.totalInterest)}</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td><strong>단리 계산</strong></td>
                    <td>${formatCurrency(result.simpleFinalAmount)}</td>
                    <td>${formatCurrency(result.simpleInterest)}</td>
                    <td style="color: var(--accent); font-weight: 700;">
                        -${formatCurrency(result.difference)}
                    </td>
                </tr>
                <tr style="background: rgba(42, 157, 143, 0.1);">
                    <td colspan="4" style="text-align: center; font-weight: 700; color: var(--success);">
                        💡 복리 효과로 ${formatCurrency(result.difference)} 더 벌 수 있습니다!
                    </td>
                </tr>
            `;
}

function formatCurrency(amount, short = false) {
    if (short && amount >= 100000000) {
        return (amount / 100000000).toFixed(1) + '억';
    } else if (short && amount >= 10000) {
        return (amount / 10000).toFixed(0) + '만';
    }
    return amount.toLocaleString('ko-KR') + '원';
}

// 엔터키로 계산 실행
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                calculate();
            }
        });
    });
});
