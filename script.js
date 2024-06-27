let prompts = [];
let genres = new Set();
let userLevel = 1;
let userExp = 0;

document.addEventListener('DOMContentLoaded', () => {
    loadPrompts();
    loadGenres();
    loadUserProgress();
    document.getElementById('prompt-form').addEventListener('submit', addPrompt);
    document.getElementById('search-input').addEventListener('input', filterPrompts);
    document.getElementById('sort-select').addEventListener('change', sortPrompts);
    document.getElementById('add-genre').addEventListener('click', addGenre);
    displayPrompts();
    updateGenreList();
    updateUserLevel();
});

function addPrompt(e) {
    e.preventDefault();
    
    const title = document.getElementById('prompt-title').value;
    const text = document.getElementById('prompt-text').value;
    const genre = document.getElementById('prompt-genre').value;
    const rating = document.querySelector('input[name="rating"]:checked').value;
    
    const newPrompt = { title, text, genre, rating: parseInt(rating) };
    prompts.push(newPrompt);
    genres.add(genre);
    savePrompts();
    saveGenres();
    displayPrompts();
    updateGenreList();
    
    // Add EXP based on rating
    addExp(rating * 10);
    
    e.target.reset();
}

function displayPrompts(filteredPrompts = prompts) {
    const promptList = document.getElementById('prompts');
    promptList.innerHTML = '';
    
    filteredPrompts.forEach((prompt, index) => {
        const li = document.createElement('li');
        li.className = 'prompt-card';
        li.innerHTML = `
            <h3>${prompt.title}</h3>
            <p>${prompt.text}</p>
            <p><strong>魔法の種類:</strong> ${prompt.genre}</p>
            <p><strong>評価:</strong> ${'★'.repeat(prompt.rating)}${'☆'.repeat(5-prompt.rating)}</p>
            <div class="prompt-actions">
                <button onclick="copyPrompt(${index})" class="crystal-btn">コピー</button>
                <button onclick="editPrompt(${index})" class="crystal-btn">編集</button>
                <button onclick="deletePrompt(${index})" class="crystal-btn">削除</button>
            </div>
        `;
        promptList.appendChild(li);
    });
}

function copyPrompt(index) {
    const promptText = prompts[index].text;
    navigator.clipboard.writeText(promptText)
        .then(() => alert('魔法の言葉をコピーしました！'))
        .catch(err => console.error('コピーに失敗しました:', err));
}

function editPrompt(index) {
    const newTitle = prompt('魔法の名前を編集してください:', prompts[index].title);
    const newText = prompt('魔法の言葉を編集してください:', prompts[index].text);
    const newGenre = prompt('魔法の種類を編集してください:', prompts[index].genre);
    const newRating = prompt('評価を編集してください (1-5):', prompts[index].rating);
    if (newTitle !== null && newText !== null && newGenre !== null && newRating !== null) {
        prompts[index] = { 
            title: newTitle, 
            text: newText, 
            genre: newGenre, 
            rating: parseInt(newRating)
        };
        genres.add(newGenre);
        savePrompts();
        saveGenres();
        displayPrompts();
        updateGenreList();
    }
}

function deletePrompt(index) {
    if (confirm('この魔法を消去してもよろしいですか？')) {
        prompts.splice(index, 1);
        savePrompts();
        displayPrompts();
        updateGenreList();
    }
}

function filterPrompts() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    const filteredPrompts = prompts.filter(prompt => 
        prompt.title.toLowerCase().includes(searchTerm) || 
        prompt.text.toLowerCase().includes(searchTerm) ||
        prompt.genre.toLowerCase().includes(searchTerm)
    );
    
    displayPrompts(filteredPrompts);
}

function sortPrompts() {
    const sortMethod = document.getElementById('sort-select').value;
    
    if (sortMethod === 'stars') {
        prompts.sort((a, b) => b.rating - a.rating);
    } else if (sortMethod === 'name') {
        prompts.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    displayPrompts();
}

function updateGenreList() {
    const genreList = document.getElementById('genre-list');
    const genreDatalist = document.getElementById('genres');
    
    genreList.innerHTML = '';
    genreDatalist.innerHTML = '';
    
    const genreCounts = {};
    prompts.forEach(prompt => {
        genreCounts[prompt.genre] = (genreCounts[prompt.genre] || 0) + 1;
    });
    
    const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
    
    sortedGenres.forEach(([genre, count]) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${genre} <span class="genre-count">(${count})</span>
            <button onclick="deleteGenre('${genre}')" class="crystal-btn">削除</button>
        `;
        genreList.appendChild(li);
        
        const option = document.createElement('option');
        option.value = genre;
        genreDatalist.appendChild(option);
    });
}

function addGenre() {
    const newGenre = document.getElementById('new-genre').value.trim();
    if (newGenre && !genres.has(newGenre)) {
        genres.add(newGenre);
        saveGenres();
        updateGenreList();
        document.getElementById('new-genre').value = '';
    }
}

function deleteGenre(genre) {
    if (confirm(`魔法の種類「${genre}」を削除してもよろしいですか？`)) {
        genres.delete(genre);
        prompts = prompts.filter(prompt => prompt.genre !== genre);
        saveGenres();
        savePrompts();
        displayPrompts();
        updateGenreList();
    }
}

function addExp(exp) {
    userExp += exp;
    const expToNextLevel = userLevel * 100;
    
    if (userExp >= expToNextLevel) {
        userLevel++;
        userExp -= expToNextLevel;
        alert(`レベルアップ！ あなたは今レベル${userLevel}です！`);
    }
    
    updateUserLevel();
    saveUserProgress();
}

function updateUserLevel() {
    const levelSpan = document.querySelector('.level');
    const expFill = document.querySelector('.exp-fill');
    
    levelSpan.textContent = `レベル ${userLevel}`;
    
    const expToNextLevel = userLevel * 100;
    const expPercentage = (userExp / expToNextLevel) * 100;
    expFill.style.width = `${expPercentage}%`;
}

function savePrompts() {
    localStorage.setItem('prompts', JSON.stringify(prompts));
}

function loadPrompts() {
    const savedPrompts = localStorage.getItem('prompts');
    if (savedPrompts) {
        prompts = JSON.parse(savedPrompts);
    }
}

function saveGenres() {
    localStorage.setItem('genres', JSON.stringify(Array.from(genres)));
}

function loadGenres() {
    const savedGenres = localStorage.getItem('genres');
    if (savedGenres) {
        genres = new Set(JSON.parse(savedGenres));
    }
}

function saveUserProgress() {
    localStorage.setItem('userLevel', userLevel);
    localStorage.setItem('userExp', userExp);
}

function loadUserProgress() {
    const savedLevel = localStorage.getItem('userLevel');
    const savedExp = localStorage.getItem('userExp');
    if (savedLevel) userLevel = parseInt(savedLevel);
    if (savedExp) userExp = parseInt(savedExp);
}