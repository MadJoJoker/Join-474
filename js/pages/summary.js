async function addSidebar() {
  fetch('../js/templates/sidebar.html')
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

function includeHeaderAndSidebar() {
  // addLayoutElements('../js/templates/header.html', 'header');
  addLayoutElements('../js/templates/sidebar.html', 'sidebar');
}

function setSmryIcon(triggeredElement, filename) {
  const img = triggeredElement.querySelector("img");
  img.src = '../assets/icons/sidebar/' + filename;
}