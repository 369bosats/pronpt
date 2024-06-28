let prompts = [];
let genres = new Set();
let userLevel = 1;
let userExp = 0;
let tokenClient;
let gapiInited = false;
let gisInited = false;

const CLIENT_ID = '964550014468-d7hrng7mrs2bf3mcqmb9n3c0nuj8emkh.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBGmQ9uxJFMV2euyZzdOy4VbFZwfmrD41g';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    document.getElementById('prompt-form').addEventListener('submit', addPrompt);
    document.getElementById('search-input').addEventListener('input', filterPrompts);
    document.getElementById('sort-select').addEventListener('change', sortPrompts);
    document.getElementById('add-genre').addEventListener('click', addGenre);
    document.getElementById('authorize_button').addEventListener('click', handleAuthClick);
    document.getElementById('signout_button').addEventListener('click', handleSignoutClick);
});

function initializeApp() {
    const token = localStorage.getItem('gapi_access_token');
    if (token) {
        gapi.client.setToken({ access_token: token });
        loadPromptsFromDrive();
    } else {
        loadPrompts();
        loadGenres();
        loadUserProgress();
        displayPrompts();
        updateGenreList();
        updateUserLevel();
        document.getElementById('authorize_button').style.display = 'block';
    }
}

async function loadPromptsFromDrive() {
    try {
        const response = await gapi.client.drive.files.list({
            q: "name='prompts.json'",
            fields: 'files(id, name)',
        });
        const files = response.result.files;
        if (files && files.length > 0) {
            const fileId = files[0].id;
            const file = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media',
            });
            const data = JSON.parse(file.body);
            prompts = data.prompts;
            genres = new Set(data.genres);
            userLevel = data.userLevel;
            userExp = data.userExp;
            displayPrompts();
            updateGenreList();
            updateUserLevel();
        } else {
            console.log('No files found.');
            loadPrompts();
            loadGenres();
            loadUserProgress();
        }
    } catch (err) {
        console.error('Error loading prompts from Drive:', err);
        loadPrompts();
        loadGenres();
        loadUserProgress();
    }
}

async function savePromptsToDrive() {
    const fileContent = JSON.stringify({
        prompts: prompts,
        genres: Array.from(genres),
        userLevel: userLevel,
        userExp: userExp
    });
    const file = new Blob([fileContent], {type: 'application/json'});
    const metadata = {
        'name': 'prompts.json',
        'mimeType': 'application/json',
    };

    try {
        const response = await gapi.client.drive.files.list({
            q: "name='prompts.json'",
            fields: 'files(id, name)',
        });
        const files = response.result.files;
        if (files && files.length > 0) {
            // Update existing file
            await gapi.client.request({
                path: '/upload/drive/v3/files/' + files[0].id,
                method: 'PATCH',
                params: {uploadType: 'media'},
                body: file,
            });
        } else {
            // Create new file
            await gapi.client.drive.files.create({
                resource: metadata,
                media: {
                    mimeType: 'application/json',
                    body: file,
                },
                fields: 'id',
            });
        }
    } catch (err) {
        console.error('Error saving prompts to Drive:', err);
    }
}

function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        localStorage.setItem('gapi_access_token', resp.access_token);
        document.getElementById('signout_button').style.display = 'block';
        document.getElementById('authorize_button').style.display = 'none';
        await loadPromptsFromDrive();
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        localStorage.removeItem('gapi_access_token');
        document.getElementById('authorize_button').style.display = 'block';
        document.getElementById('signout_button').style.display = 'none';
    }
}

function initializeApp() {
    const token = localStorage.getItem('gapi_access_token');
    if (token) {
        gapi.client.setToken({ access_token: token });
        loadPromptsFromDrive();
    } else {
        loadPrompts();
        loadGenres();
        loadUserProgress();
        displayPrompts();
        updateGenreList();
        updateUserLevel();
        document.getElementById('authorize_button').style.display = 'block';
    }
}

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize_button').style.display = 'block';
    }
}

function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        localStorage.setItem('gapi_access_token', resp.access_token);
        document.getElementById('signout_button').style.display = 'block';
        document.getElementById('authorize_button').style.display = 'none';
        await loadPromptsFromDrive();
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
        tokenClient.requestAccessToken({prompt: ''});
    }
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        localStorage.removeItem('gapi_access_token');
        document.getElementById('authorize_button').style.display = 'block';
        document.getElementById('signout_button').style.display = 'none';
    }
}

async function loadPromptsFromDrive() {
    try {
        const response = await gapi.client.drive.files.list({
            q: "name='prompts.json'",
            fields: 'files(id, name)',
        });
        const files = response.result.files;
        if (files && files.length > 0) {
            const fileId = files[0].id;
            const file = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media',
            });
            const data = JSON.parse(file.body);
            prompts = data.prompts;
            genres = new Set(data.genres);
            userLevel = data.userLevel;
            userExp = data.userExp;
            displayPrompts();
            updateGenreList();
            updateUserLevel();
        } else {
            console.log('No files found.');
            loadPrompts();
            loadGenres();
            loadUserProgress();
        }
    } catch (err) {
        console.error('Error loading prompts from Drive:', err);
        loadPrompts();
        loadGenres();
        loadUserProgress();
    }
}

async function savePromptsToDrive() {
    const fileContent = JSON.stringify({
        prompts: prompts,
        genres: Array.from(genres),
        userLevel: userLevel,
        userExp: userExp
    });
    const file = new Blob([fileContent], {type: 'application/json'});
    const metadata = {
        'name': 'prompts.json',
        'mimeType': 'application/json',
    };

    try {
        const response = await gapi.client.drive.files.list({
            q: "name='prompts.json'",
            fields: 'files(id, name)',
        });
        const files = response.result.files;
        if (files && files.length > 0) {
            // Update existing file
            await gapi.client.request({
                path: '/upload/drive/v3/files/' + files[0].id,
                method: 'PATCH',
                params: {uploadType: 'media'},
                body: file,
            });
        } else {
            // Create new file
            await gapi.client.drive.files.create({
                resource: metadata,
                media: {
                    mimeType: 'application/json',
                    body: file,
                },
                fields: 'id',
            });
        }
    } catch (err) {
        console.error('Error saving prompts to Drive:', err);
    }
}



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
    savePromptsToDrive();
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
    savePromptsToDrive();
}

function deletePrompt(index) {
    if (confirm('この魔法を消去してもよろしいですか？')) {
        prompts.splice(index, 1);
        savePrompts();
        displayPrompts();
        updateGenreList();
    }
    savePromptsToDrive();
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
    savePromptsToDrive();
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
    savePromptsToDrive();
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
    savePromptsToDrive();
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
