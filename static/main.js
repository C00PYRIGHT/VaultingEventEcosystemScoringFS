
document.addEventListener('DOMContentLoaded', () => {

     const searchInput = document.getElementById('search');
    const tableBody = document.getElementById('TableBody');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const dropdownButton = document.getElementById('dropdownMenuButton');
    const cells = tableBody?.getElementsByTagName('th');
    const noresults = document.getElementById('noresults');
    const searchForm = document.getElementById('searchForm');
    var cellIndex = 0;


    if(tableBody){
    Array.from(cells).forEach((cell, index) => {
        console.log(cell.innerHTML);
        
        if (cell.innerHTML === '&nbsp;') return; 
        if (index === 0) {
            dropdownButton.innerHTML = cell.innerHTML;
        }
        const menuItem = document.createElement('a');
        menuItem.className = 'dropdown-item';
        menuItem.innerHTML = cell.innerHTML;
        menuItem.href = '#';
        dropdownMenu?.appendChild(menuItem);
        menuItem.addEventListener('click', fv => {
            const thisCellIndex = index;
            fv.preventDefault();
            let searchScope = fv.target.innerHTML;
            console.log('Selected column:'+ searchScope);
            dropdownButton.innerHTML = searchScope;
            console.log('Cell index:'+ thisCellIndex);
            cellIndex = thisCellIndex;


        });
        
    });
    };
    const form = document.getElementById('noSubmitForm'); // vagy .form-inline
    if( form ){
        form.addEventListener('submit', e => {
            e.preventDefault(); // megakadályozza az alapértelmezett submit-et
        });
    };

    searchInput?.addEventListener('input', fv => {
        fv.preventDefault();
        const searchTerm = searchInput.value.toLowerCase();
        const rows = tableBody.getElementsByTagName('tr');
        let visibleRowCount = 0;

        Array.from(rows).forEach((row, index) => {
            if (index === 0) return; // Skip header row
            const title = row.cells[cellIndex].textContent.toLowerCase();
            row.style.display = (title.includes(searchTerm)) ? '' : 'none';
            if (title.includes(searchTerm)) {
                row.style.display = '';
                if (searchTerm.length > 0){
                row.cells[cellIndex].innerHTML = row.cells[cellIndex].textContent.replace(new RegExp(searchTerm, 'gi'), match => `<span class="bg-warning">${match}</span>`);
                }else{
                row.cells[cellIndex].innerHTML = row.cells[cellIndex].textContent;}
                visibleRowCount++;
            } else {
                row.style.display = 'none';
            }
        });
        if (visibleRowCount === 0) {
                        try{
            noresults.style.display = '';

            }catch(err){    
                console.error('Noresults element not found:', err);
            }

        }else{
            try{
            noresults.style.display = 'none';

            }catch(err){    
                console.error('Noresults element not found:', err);
            }
        }
    }); 


    const togglewatcheds = document.querySelectorAll('.togglewatched');

    togglewatcheds.forEach(togglewatched => {
        togglewatched.addEventListener('click', async fv => {
            try{
            const movieId = togglewatched.value;
            const watched = togglewatched.checked;
            const response = await fetch('/togglewatched/' + movieId, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ watched }) 
            });
        }catch (error) {
            console.error('Error toggling watched status:', error);
        };
            });

        
    });






    /* A Bootstrap Alert blokk eltüntetése */

    const rowElement = document.getElementById('alert-row');
    rowElement?.style && setTimeout(() => {
        let opacity = 1;
        const fadeOutInterval = setInterval(() => {
            if (opacity <= 0) {
                clearInterval(fadeOutInterval); // Animáció leállítása
                rowElement.remove(); // Elem eltávolítása a DOM-ból
            } else {
                opacity -= 0.1;
                rowElement.style.opacity = opacity;
            }
        }, 50); // 50ms intervallum a zökkenőmentes animációért
    }, 4000); // 4 másodperces késleltetés

    const successToastEl = document.getElementById('formSuccessToast');
    if (successToastEl) {
        const toast = new bootstrap.Toast(successToastEl, { delay: 3000 });
        toast.show();
    }

        const failToastEl = document.getElementById('formFailToast');
        if (failToastEl) {
        const toast = new bootstrap.Toast(failToastEl, { delay: 3000 });
        toast.show();
        }

  











});