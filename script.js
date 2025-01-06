document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const blocksContainer = document.getElementById('blocksContainer');
    const scoreDisplay = document.getElementById('score');
    const highScoreDisplay = document.getElementById('highScore');
    const messageDisplay = document.getElementById('message');
    const startButton = document.getElementById('startButton');
    const profileForm = document.getElementById('profileForm');
    const profileNameInput = document.getElementById('profileName');
    const profilePasswordInput = document.getElementById('profilePassword');
    const profileSelect = document.getElementById('profileSelect');
    const profilePasswordCheckInput = document.getElementById('profilePasswordCheck');
    const editProfileForm = document.getElementById('editProfileForm');
    const newProfileNameInput = document.getElementById('newProfileName');
    const newProfilePasswordInput = document.getElementById('newProfilePassword');
    const avatarForm = document.getElementById('avatarForm');
    const avatarInput = document.getElementById('avatarInput');
    const avatar = document.getElementById('avatar');
    const currentProfileInfo = document.getElementById('currentProfileInfo');
    const currentProfileName = document.getElementById('currentProfileName');
    const currentProfileAvatar = document.getElementById('currentProfileAvatar');
    let score = 0;
    let currentProfile = null;
    
    // Загрузить профили из локального хранилища
    let profiles = JSON.parse(localStorage.getItem('profiles')) || {};

    // Обновить выпадающий список профилей
    updateProfileSelect();

    profileForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const profileName = profileNameInput.value.trim();
        const profilePassword = profilePasswordInput.value.trim();
        if (profileName && profilePassword && !profiles[profileName]) {
            const hashedPassword = btoa(profilePassword); // Простое хэширование (не для продакшн-использования)
            profiles[profileName] = { highScore: 0, password: hashedPassword, avatar: '' };
            localStorage.setItem('profiles', JSON.stringify(profiles));
            profileNameInput.value = '';
            profilePasswordInput.value = '';
            updateProfileSelect();
        }
    });

    profileSelect.addEventListener('change', () => {
        const selectedProfile = profileSelect.value;
        if (selectedProfile) {
            const enteredPassword = profilePasswordCheckInput.value.trim();
            const storedPassword = profiles[selectedProfile].password;
            if (btoa(enteredPassword) === storedPassword) {
                currentProfile = selectedProfile;
                highScoreDisplay.textContent = profiles[selectedProfile].highScore;
                currentProfileName.textContent = selectedProfile;
                currentProfileInfo.style.display = 'block';
                if (profiles[selectedProfile].avatar) {
                    currentProfileAvatar.src = profiles[selectedProfile].avatar;
                    currentProfileAvatar.style.display = 'block';
                } else {
                    currentProfileAvatar.style.display = 'none';
                }
            } else {
                alert('Неправильный пароль!');
                profileSelect.value = '';
                currentProfile = null;
                highScoreDisplay.textContent = '0';
                currentProfileInfo.style.display = 'none';
            }
        } else {
            currentProfile = null;
            highScoreDisplay.textContent = '0';
            currentProfileInfo.style.display = 'none';
        }
    });

    editProfileForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!currentProfile) {
            alert('Пожалуйста, выберите профиль!');
            return;
        }

        const newProfileName = newProfileNameInput.value.trim();
        const newProfilePassword = newProfilePasswordInput.value.trim();
        if (newProfileName) {
            profiles[newProfileName] = profiles[currentProfile];
            delete profiles[currentProfile];
            currentProfile = newProfileName;
        }
        if (newProfilePassword) {
            profiles[currentProfile].password = btoa(newProfilePassword);
        }
        localStorage.setItem('profiles', JSON.stringify(profiles));
        newProfileNameInput.value = '';
        newProfilePasswordInput.value = '';
        updateProfileSelect();
        profileSelect.value = currentProfile;
        highScoreDisplay.textContent = profiles[currentProfile].highScore;
        currentProfileName.textContent = currentProfile;
    });

    avatarInput.addEventListener('change', (event) => {
        if (!currentProfile) {
            alert('Пожалуйста, выберите профиль!');
            return;
        }

        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profiles[currentProfile].avatar = e.target.result;
                localStorage.setItem('profiles', JSON.stringify(profiles));
                avatar.src = e.target.result;
                avatar.style.display = 'block';
                currentProfileAvatar.src = e.target.result;
                currentProfileAvatar.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    startButton.addEventListener('click', startGame);

    function startGame() {
        if (!currentProfile) {
            alert('Пожалуйста, выберите профиль!');
            return;
        }
        startButton.style.display = 'none';
        grid.style.visibility = 'visible';
        blocksContainer.style.visibility = 'visible';
        score = 0;
        scoreDisplay.textContent = score;
    }

    // Создание сетки
    for (let i = 0; i < 100; i++) {
        const gridItem = document.createElement('div');
        grid.appendChild(gridItem);
    }

    // Примеры блоков разной формы
    const blocks = [
        [1, 1, 1, 0, 0, 0, 0, 0, 0],  // Прямая линия
        [1, 1, 0, 1, 1, 0, 0, 0, 0],  // Квадрат 2x2
        [1, 1, 1, 1, 0, 0, 0, 0, 0],  // L-образный блок
        [1, 0, 0, 1, 1, 1, 0, 0, 0],  // T-образный блок
        [1, 1, 1, 0, 1, 0, 0, 0, 0]   // Форма креста
    ];

    // Создание блоков
    blocks.forEach((block, blockIndex) => {
        const blockElement = document.createElement('div');
        blockElement.classList.add('block');
        block.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            if (cell === 1) {
                cellElement.classList.add('filled');
                // Установим разный цвет для блоков
                cellElement.style.backgroundColor = getColor(blockIndex, index);
            }
            blockElement.appendChild(cellElement);
        });
        blocksContainer.appendChild(blockElement);

        // Добавление перетаскивания
        blockElement.draggable = true;
        blockElement.addEventListener('dragstart', dragStart);
        blockElement.addEventListener('dragend', dragEnd);
    });

    let draggedBlock = null;

    function dragStart(event) {
        draggedBlock = event.target;
        draggedBlock.classList.add('dragging');
        setTimeout(() => {
            draggedBlock.style.display = 'none';
        }, 0);
    }

    function dragEnd(event) {
        setTimeout(() => {
            draggedBlock.style.display = 'flex';
            draggedBlock.classList.remove('dragging');
            draggedBlock = null;
        }, 0);
    }

    grid.addEventListener('dragover', dragOver);
    grid.addEventListener('drop', drop);

    function dragOver(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        if (draggedBlock) {
            const cells = Array.from(draggedBlock.children);
            const gridCells = Array.from(grid.children);
            const dropIndex = gridCells.indexOf(event.target);

            if (dropIndex !== -1 && isWithin3x3(dropIndex)) {
                let canPlace = true;
                cells.forEach((cell, index) => {
                    if (cell.classList.contains('filled')) {
                        const gridIndex = dropIndex + Math.floor(index / 3) * 10 + (index % 3);
                        if (gridIndex >= gridCells.length || gridCells[gridIndex].classList.contains('filled')) {
                            canPlace = false;
                        }
                    }
                });

                if (canPlace) {
                    cells.forEach((cell, index) => {
                        if (cell.classList.contains('filled')) {
                            const gridIndex = dropIndex + Math.floor(index / 3) * 10 + (index % 3);
                            if (gridIndex < gridCells.length) {
                                gridCells[gridIndex].classList.add('filled');
                                gridCells[gridIndex].style.backgroundColor = cell.style.backgroundColor;
                            }
                        }
                    });
                    score += cells.length;  // Начисление баллов за каждый размещённый блок
                    scoreDisplay.textContent = score;

                    // Проверка на завершение квадрата или прямоугольника
                    if (checkForCompleteLines(dropIndex, gridCells)) {
                        score += 50;  // Дополнительные баллы за квадрат или прямоугольник
                        scoreDisplay.textContent = score;
                        messageDisplay.textContent = "Лучший!";
                        setTimeout(() => {
                            messageDisplay.textContent = "";
                        }, 2000);
                    }

                    // Обновление рекорда
                    if (score > profiles[currentProfile].highScore) {
                        profiles[currentProfile].highScore = score;
                        localStorage.setItem('profiles', JSON.stringify(profiles));
                        highScoreDisplay.textContent = profiles[currentProfile].highScore;
                    }
                } else {
                    messageDisplay.textContent = "Не подходит!";
                    setTimeout(() => {
                        messageDisplay.textContent = "";
                    }, 2000);
                }
            } else {
                messageDisplay.textContent = "Не подходит!";
                setTimeout(() => {
                    messageDisplay.textContent = "";
                }, 2000);
            }
        }
    }

    function isWithin3x3(index) {
        const row = Math.floor(index / 10);
        const col = index % 10;
        return row < 8 && col < 8;
    }

    function checkForCompleteLines(dropIndex, gridCells) {
        const row = Math.floor(dropIndex / 10);
        const col = dropIndex % 10;

        // Проверка строк
        for (let i = 0; i < 10; i++) {
            if (!gridCells[row * 10 + i].classList.contains('filled')) {
                return false;
            }
        }

        // Проверка столбцов
        for (let i = 0; i < 10; i++) {
            if (!gridCells[i * 10 + col].classList.contains('filled')) {
                return false;
            }
        }

        return true;
    }

    function getColor(blockIndex, cellIndex) {
        const colors = ['#ff6f61', '#6b5b95', '#88b04b', '#f7cac9', '#92a8d1'];
        return colors[(blockIndex + cellIndex) % colors.length];
    }

    function updateProfileSelect() {
        profileSelect.innerHTML = '<option value="">Выберите профиль</option>';
        for (const profile in profiles) {
            const option = document.createElement('option');
            option.value = profile;
            option.textContent = profile;
            profileSelect.appendChild(option);
        }
    }
});