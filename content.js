// Create and style the button exactly like your popup

const btn = document.createElement('button');
btn.className = 'download_button';


btn.style.position = 'fixed';
btn.style.top = '60px';
btn.style.right = '120px';
btn.style.height = '40px';
btn.style.width = '40px';
btn.style.borderRadius = '50%';
btn.style.background = 'linear-gradient(135deg, #00b4db, #0083b0)';
btn.style.cursor = 'pointer';
btn.style.boxShadow = '0 0 8px #00b4db, 0 0 15px #0083b0';
btn.style.padding = '8px';
btn.style.display = 'flex';
btn.style.alignItems = 'center';
btn.style.justifyContent = 'center';
btn.style.zIndex = '9999';
btn.style.transition = 'all 0.4s ease';
btn.style.border = '2px solid #00b4db';
btn.style.color = 'white';
btn.title = "Press Ctrl + d for quick download";

// Cool glowing animation on hover
btn.addEventListener('mouseenter', () => {
  btn.style.boxShadow = '0 0 20px #00e5ff, 0 0 30px #00bfff, 0 0 40px #00e5ff';
  btn.style.transform = 'scale(1.2) rotate(10deg)';
  btn.style.borderColor = '#00e5ff';
  btn.style.filter = 'drop-shadow(0 0 8px #00e5ff)';
});
btn.addEventListener('mouseleave', () => {
  btn.style.boxShadow = '0 0 8px #00b4db, 0 0 15px #0083b0';
  btn.style.transform = 'scale(1) rotate(0deg)';
  btn.style.borderColor = '#00b4db';
  btn.style.filter = 'none';
});



// Insert your SVG icon inside button
btn.innerHTML = `
  <svg data-prefix="fas" data-icon="arrow-down-to-line" role="img" viewBox="0 0 384 512" aria-hidden="true" class="svg-inline--fa fa-arrow-down-to-line fa-lg" style="width: 100%; height: 100%; color: black;">
    <path fill="currentColor" d="M32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l320 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512zM214.6 374.6c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 274.7 160 32c0-17.7 14.3-32 32-32s32 14.3 32 32l0 242.7 73.4-73.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-128 128z"></path>
  </svg>
`;

document.body.appendChild(btn);

// Your main download function
async function add_download() {
  // In content scripts, just get URL from window.location.href
  const url = window.location.href;

  try {
    console.log("starting")
    const response = await fetch('http://localhost:3000/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url }),
    });
    const data = await response.json();

    console.log('Server response:', data);
    if (data.status === 'success') {
      const div = document.createElement('div')
      div.innerText = "Download Added Successfully"
      div.style.color = "white"
      div.style.textShadow = "1px 1px black"
      div.style.position = 'fixed'
      div.style.fontSize = "20px"
      div.style.bottom = "50px"
      div.style.width = "100%"
      div.style.textAlign = "center"
      div.style.transition = "0.4s"
      document.body.appendChild(div);

      requestAnimationFrame(() => { // let browser paint it first
      div.style.opacity = "1";
      setTimeout(() => {
        div.style.opacity = "0";
        setTimeout(() => div.remove(), 400); // match transition
      }, 3000);
    });


    }
  } catch (err) {
    console.error('Error sending URL:', err);

    const error_div = document.createElement('div')
    error_div.innerText = "Open All video downloader-Shafat app and try again \n Or Remove add blocker"
    error_div.style.color = "white"
    error_div.style.textShadow = "1px 1px black"
    error_div.style.position = 'fixed'
    error_div.style.fontSize = "20px"
    error_div.style.bottom = "50px"
    error_div.style.width = "100%"
    error_div.style.textAlign = "center"
    error_div.style.transition = "0.4s"
    document.body.appendChild(error_div);

    requestAnimationFrame(() => { // let browser paint it first
      error_div.style.opacity = "1";
      setTimeout(() => {
        error_div.style.opacity = "0";
        setTimeout(() => error_div.remove(), 400); // match transition
      }, 3000);
    });
  }
}

// Click event
btn.addEventListener('click', add_download);

// Ctrl+D (or Cmd+D) listener
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
    e.preventDefault();
    add_download();
  }
});
