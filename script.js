let wuxingChart;

document.getElementById('wuxingForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const birthdate = document.getElementById('birthdate').value;
    const birthtime = document.getElementById('birthtime').value;

    // 將日期和時間轉換為八字
    const bazi = calculateBazi(birthdate, birthtime);

    // 計算五行分數
    const wuxingScores = calculateWuxingScores(bazi);

    // 分析五行最多和最缺
    const { maxElement, minElement } = analyzeWuxing(wuxingScores);

    // 顯示結果
    document.getElementById('result').style.display = 'block';
    document.getElementById('baziResult').innerHTML = `
        <p><strong>八字:</strong> ${bazi.join(' ')}</p>
    `;
    document.getElementById('wuxingResult').innerHTML = `
        <p><strong>五行最多:</strong> ${maxElement}</p>
        <p><strong>五行最缺:</strong> ${minElement}</p>
    `;

    // 繪製圖表
    if (wuxingChart) {
        wuxingChart.destroy();
    }
    const ctx = document.getElementById('wuxingChart').getContext('2d');
    wuxingChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['金', '木', '水', '火', '土'],
            datasets: [{
                label: '五行分數',
                data: [wuxingScores.metal, wuxingScores.wood, wuxingScores.water, wuxingScores.fire, wuxingScores.earth],
                backgroundColor: [
                    'rgba(255, 206, 86, 0.2)', // 金
                    'rgba(75, 192, 192, 0.2)', // 木
                    'rgba(54, 162, 235, 0.2)', // 水
                    'rgba(255, 99, 132, 0.2)', // 火
                    'rgba(153, 102, 255, 0.2)'  // 土
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)', // 金
                    'rgba(75, 192, 192, 1)', // 木
                    'rgba(54, 162, 235, 1)', // 水
                    'rgba(255, 99, 132, 1)', // 火
                    'rgba(153, 102, 255, 1)'  // 土
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});

// 計算八字（四柱）
function calculateBazi(birthdate, birthtime) {
    const date = new Date(birthdate + 'T' + birthtime);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 月份從 0 開始，需要加 1
    const day = date.getDate();
    const hour = date.getHours();

    // 天干地支對照表
    const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    // 計算年柱
    const yearStemIndex = (year - 4) % 10;
    const yearBranchIndex = (year - 4) % 12;
    const yearStem = heavenlyStems[yearStemIndex];
    const yearBranch = earthlyBranches[yearBranchIndex];

    // 計算月柱（根據節氣簡化）
    const monthStemIndex = (yearStemIndex * 2 + month) % 10;
    const monthBranchIndex = (month + 1) % 12;
    const monthStem = heavenlyStems[monthStemIndex];
    const monthBranch = earthlyBranches[monthBranchIndex];

    // 計算日柱（基於 1900-01-01 為甲子日的偏移量）
    const baseDate = new Date(1900, 0, 1); // 1900-01-01 是甲子日
    const diffDays = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));
    const dayStemIndex = diffDays % 10;
    const dayBranchIndex = diffDays % 12;
    const dayStem = heavenlyStems[dayStemIndex];
    const dayBranch = earthlyBranches[dayBranchIndex];

    // 計算時柱
    const hourBranchIndex = Math.floor((hour + 1) / 2) % 12;
    const hourStemIndex = (dayStemIndex * 2 + hourBranchIndex) % 10;
    const hourStem = heavenlyStems[hourStemIndex];
    const hourBranch = earthlyBranches[hourBranchIndex];

    return [yearStem + yearBranch, monthStem + monthBranch, dayStem + dayBranch, hourStem + hourBranch];
}

// 計算五行分數
function calculateWuxingScores(bazi) {
    const wuxingMap = {
        '甲': 'wood', '乙': 'wood', '丙': 'fire', '丁': 'fire',
        '戊': 'earth', '己': 'earth', '庚': 'metal', '辛': 'metal',
        '壬': 'water', '癸': 'water',
        '子': 'water', '丑': 'earth', '寅': 'wood', '卯': 'wood',
        '辰': 'earth', '巳': 'fire', '午': 'fire', '未': 'earth',
        '申': 'metal', '酉': 'metal', '戌': 'earth', '亥': 'water'
    };

    const scores = { metal: 0, wood: 0, water: 0, fire: 0, earth: 0 };

    // 統計五行分數
    bazi.forEach(pillar => {
        const stem = pillar[0];
        const branch = pillar[1];
        scores[wuxingMap[stem]] += 1;
        scores[wuxingMap[branch]] += 1;
    });

    return scores;
}

// 分析五行最多和最缺
function analyzeWuxing(scores) {
    const elements = Object.keys(scores); // ['metal', 'wood', 'water', 'fire', 'earth']
    let maxElement = elements[0];
    let minElement = elements[0];

    elements.forEach(element => {
        if (scores[element] > scores[maxElement]) {
            maxElement = element;
        }
        if (scores[element] < scores[minElement]) {
            minElement = element;
        }
    });

    // 將英文五行轉換為中文
    const wuxingChinese = { metal: '金', wood: '木', water: '水', fire: '火', earth: '土' };
    return {
        maxElement: wuxingChinese[maxElement],
        minElement: wuxingChinese[minElement]
    };
}