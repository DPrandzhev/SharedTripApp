document.addEventListener('DOMContentLoaded', () => {
    const fromLocInput = document.getElementById('fromLoc');
    const toLocInput = document.getElementById('toLoc');
    const travelDateInput = document.getElementById('travelDate');
    const travelTimeInput = document.getElementById('travelTime');
    const travelPriceInput = document.getElementById('travelPrice');
    const extraInfoInput = document.getElementById('extraInfo');

    const dispFrom = document.getElementById('dispFrom');
    const dispTo = document.getElementById('dispTo');
    const dispDate = document.getElementById('dispDate');
    const dispTime = document.getElementById('dispTime');
    const dispPrice = document.getElementById('dispPrice');
    const dispExtraRow = document.getElementById('dispExtraRow');
    const dispExtra = document.getElementById('dispExtra');

    const cardFrom = document.getElementById('cardFrom');
    const cardTo = document.getElementById('cardTo');
    const cardDate = document.getElementById('cardDate');
    const cardTime = document.getElementById('cardTime');
    const cardPrice = document.getElementById('cardPrice');
    const cardFreeSeats = document.getElementById('cardFreeSeats');

    const charCount = document.getElementById('charCount');
    const selectedCarName = document.getElementById('selectedCarName');
    const carOptions = document.querySelectorAll('.car-option');
    const swapBtn = document.getElementById('swapLocations');
    const resetSeatsBtn = document.getElementById('resetSeatsBtn');
    
    const carCanvas = document.getElementById('carCanvas');
    const seatsLayer = document.getElementById('seatsLayer');
    const miniSeatsLayer = document.getElementById('miniSeatsLayer');
    const carBaseImg = document.getElementById('carBaseImg');
    const cardCarImg = document.getElementById('cardCarImg');

    let currentCarType = 'sedan';
    let seatsData = [];

    const carConfig = {
        sedan: { name: 'СЕДАН', img: 'sedan.png' },
        hatchback: { name: 'ХЕЧБЕК', img: 'hatchback.png' },
        suv: { name: 'SUV', img: 'suv.png' },
        minivan: { name: 'МИНИВАН', img: 'minivan.png' }
    };

    function getDefaultSeats(carType) {
        if (carType === 'minivan') {
            return [
                { id: 'driver', label: '<i class="fa-solid fa-user"></i>', status: 'driver', x: 38, y: 100, visible: true },
                { id: 'm1', label: 'М1', status: 'free', x: 134, y: 100, visible: true },
                { id: 'm2', label: 'М2', status: 'free', x: 28, y: 165, visible: true },
                { id: 'm3', label: 'М3', status: 'free', x: 86, y: 165, visible: true },
                { id: 'm4', label: 'М4', status: 'free', x: 144, y: 165, visible: true },
                { id: 'm5', label: 'М5', status: 'free', x: 42, y: 235, visible: true },
                { id: 'm6', label: 'М6', status: 'free', x: 130, y: 235, visible: true }
            ];
        }
        return [
            { id: 'driver', label: '<i class="fa-solid fa-user"></i>', status: 'driver', x: 38, y: 105, visible: true },
            { id: 'm1', label: 'М1', status: 'free', x: 134, y: 105, visible: true },
            { id: 'm2', label: 'М2', status: 'free', x: 28, y: 175, visible: true },
            { id: 'm3', label: 'М3', status: 'free', x: 86, y: 175, visible: true },
            { id: 'm4', label: 'М4', status: 'free', x: 144, y: 175, visible: true }
        ];
    }

    function formatDate(val) {
        if (!val) return '---';
        const parts = val.split('-');
        return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : val;
    }

    function initCarSeats(carType) {
        seatsData = getDefaultSeats(carType);
        renderInteractiveSeats();
    }

    function renderInteractiveSeats() {
        seatsLayer.innerHTML = '';
        miniSeatsLayer.innerHTML = '';

        seatsData.forEach((seat, idx) => {
            if (!seat.visible) return;

            const el = document.createElement('div');
            el.className = `drag-seat seat-${seat.status}-box`;
            el.innerHTML = seat.label;
            el.style.left = `${seat.x}px`;
            el.style.top = `${seat.y}px`;

            makeDraggableAndClickable(el, seat, idx);

            seatsLayer.appendChild(el);

            const miniEl = document.createElement('div');
            miniEl.className = `mini-drag-seat seat-${seat.status}-box`;
            miniEl.id = `mini-seat-${idx}`;
            
            const miniX = (seat.x / 210) * 70;
            const miniY = (seat.y / 380) * 125;

            miniEl.style.left = `${miniX}px`;
            miniEl.style.top = `${miniY}px`;
            miniSeatsLayer.appendChild(miniEl);
        });
    }

    function makeDraggableAndClickable(element, seat, index) {
        let posX = 0, posY = 0, mouseX = 0, mouseY = 0;
        let clickTimer = null;
        let isDragging = false;

        element.onmousedown = (e) => {
            e.preventDefault();
            mouseX = e.clientX;
            mouseY = e.clientY;
            isDragging = false;

            document.onmousemove = (eMove) => {
                eMove.preventDefault();
                
                if (Math.abs(mouseX - eMove.clientX) > 3 || Math.abs(mouseY - eMove.clientY) > 3) {
                    isDragging = true;
                }

                posX = mouseX - eMove.clientX;
                posY = mouseY - eMove.clientY;
                mouseX = eMove.clientX;
                mouseY = eMove.clientY;

                let newY = element.offsetTop - posY;
                let newX = element.offsetLeft - posX;

                const maxW = carCanvas.clientWidth - element.clientWidth;
                const maxH = carCanvas.clientHeight - element.clientHeight;

                newX = Math.max(0, Math.min(newX, maxW));
                newY = Math.max(0, Math.min(newY, maxH));

                element.style.left = `${newX}px`;
                element.style.top = `${newY}px`;

                seatsData[index].x = newX;
                seatsData[index].y = newY;

                const miniEl = document.getElementById(`mini-seat-${index}`);
                if (miniEl) {
                    miniEl.style.left = `${(newX / 210) * 70}px`;
                    miniEl.style.top = `${(newY / 380) * 125}px`;
                }
            };

            document.onmouseup = () => {
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };

        element.onclick = (e) => {
            if (isDragging || seat.id === 'driver') return; // Игнорира клик на шофьора

            if (clickTimer === null) {
                clickTimer = setTimeout(() => {
                    clickTimer = null;
                    if (seat.status === 'free') seat.status = 'reserved';
                    else if (seat.status === 'reserved') seat.status = 'confirmed';
                    else if (seat.status === 'confirmed') seat.status = 'free';

                    renderInteractiveSeats();
                    updateUI();
                }, 250);
            }
        };

        element.ondblclick = (e) => {
            e.preventDefault();
            if (seat.id === 'driver') return; // Забранява изтриването на шофьорското място

            if (clickTimer) {
                clearTimeout(clickTimer);
                clickTimer = null;
            }
            seat.visible = false;
            renderInteractiveSeats();
            updateUI();
        };
    }

    function updateUI() {
        const fromVal = fromLocInput.value.trim() || '---';
        const toVal = toLocInput.value.trim() || '---';
        const dateVal = formatDate(travelDateInput.value);
        const timeVal = travelTimeInput.value || '---';
        const priceVal = travelPriceInput.value ? parseFloat(travelPriceInput.value).toFixed(2) : '0.00';
        const extraVal = extraInfoInput.value;

        dispFrom.textContent = fromVal;
        dispTo.textContent = toVal;
        dispDate.textContent = dateVal;
        dispTime.textContent = timeVal;
        dispPrice.textContent = `${priceVal} €`;

        if (extraVal.trim().length > 0) {
            dispExtraRow.classList.remove('hidden');
            dispExtra.textContent = extraVal;
        } else {
            dispExtraRow.classList.add('hidden');
        }

        cardFrom.textContent = fromVal.toUpperCase();
        cardTo.textContent = toVal.toUpperCase();
        cardDate.textContent = dateVal;
        cardTime.textContent = timeVal;
        cardPrice.textContent = `${priceVal} €`;

        const freeCount = seatsData.filter(s => s.visible && s.status === 'free').length;
        cardFreeSeats.textContent = `${freeCount} свободни`;

        charCount.textContent = extraVal.length;
    }

    [fromLocInput, toLocInput, travelDateInput, travelTimeInput, travelPriceInput, extraInfoInput].forEach(inp => {
        inp.addEventListener('input', updateUI);
    });

    swapBtn.addEventListener('click', () => {
        const tmp = fromLocInput.value;
        fromLocInput.value = toLocInput.value;
        toLocInput.value = tmp;
        updateUI();
    });

    resetSeatsBtn.addEventListener('click', () => {
        initCarSeats(currentCarType);
        updateUI();
    });

    carOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            carOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');

            currentCarType = opt.getAttribute('data-type');
            selectedCarName.textContent = carConfig[currentCarType].name;
            
            carBaseImg.src = carConfig[currentCarType].img;
            cardCarImg.src = carConfig[currentCarType].img;

            initCarSeats(currentCarType);
            updateUI();
        });
    });

    document.getElementById('copyTextBtn').addEventListener('click', () => {
        const freeSeats = seatsData.filter(s => s.visible && s.status === 'free').length;
        const text = `🚗 Споделено пътуване (${carConfig[currentCarType].name})
📍 От: ${fromLocInput.value || '---'}
📍 До: ${toLocInput.value || '---'}
📅 Дата: ${formatDate(travelDateInput.value)}
⏰ Час: ${travelTimeInput.value || '---'}
💰 Цена: ${travelPriceInput.value ? travelPriceInput.value : '0'} € / човек
💺 Свободни места: ${freeSeats}
${extraInfoInput.value ? '📝 Забележка: ' + extraInfoInput.value : ''}`;

        navigator.clipboard.writeText(text).then(() => {
            alert('Текстът е копиран успешно!');
        });
    });

    document.getElementById('generateCardBtn').addEventListener('click', () => {
        const cardElem = document.getElementById('businessCard');

        html2canvas(cardElem, {
            scale: 2,
            logging: false,
            foreignObjectRendering: false
        }).then(canvas => {
            const link = document.createElement('a');
            const filenameFrom = fromLocInput.value.trim() || 'Маршрут';
            const filenameTo = toLocInput.value.trim() || '';
            link.download = `SpodelenoPyatuvane_${filenameFrom}_${filenameTo}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
        }).catch(err => {
            console.error("Грешка при генериране:", err);
            alert("Грешка при генериране. Моля, стартирайте проекта през локален сървър.");
        });
    });

    initCarSeats('sedan');
    updateUI();
});