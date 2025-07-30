export function initBackButton(){
    const btn = document.getElementById('backBtn');
    if(btn){
        btn.addEventListener('click', () => window.history.back());
    }
}