document.addEventListener('DOMContentLoaded', () => {

     const searchInput = document.getElementById('search');
    const tableBody = document.getElementById('formTableBody');

    searchInput?.addEventListener('input', fv => {
        const searchTerm = searchInput.value.toLowerCase();
        const rows = tableBody.getElementsByTagName('tr');
        Array.from(rows).forEach(row => {
            const title = row.cells[0].textContent.toLowerCase();
            const genre = row.cells[3].textContent.toLowerCase();
            const chkboxChecked = document.getElementById('searchByGenre').checked;
            row.style.display = (chkboxChecked ? genre.includes(searchTerm) : title.includes(searchTerm)) ? '' : 'none';
        });
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