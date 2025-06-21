function setIcon(triggeredElement, filename) {
  const img = triggeredElement.querySelector("img");
  img.src = './assets/icons/sidebar/' + filename;
}

async function addSidebar() {
  fetch('./assets/img/templates/sidebar.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('sidebar').innerHTML = data;
    }
  )
}

async function addLayoutElements(path, id) {
  fetch(path)
    .then(response => response.text())
    .then(data => {
      document.getElementById(id).innerHTML = data;
    }
  )
}

function init() {
  // addLayoutElements('./assets/img/templates/header.html', 'sidebar');
  addLayoutElements('./assets/img/templates/sidebar.html', 'sidebar');
}

