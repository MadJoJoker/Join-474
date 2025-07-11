// leitet auf die seite zurück, über welche man auf help.html kam

export function initBackButton(){
    const btn = document.getElementById('backBtn');
    if(btn){
        btn.addEventListener('click', () => window.history.back());
    }
}