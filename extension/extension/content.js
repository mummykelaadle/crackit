function injectCaptureButton() {
    const heading = document.querySelector('h1') || document.querySelector('h2');
  
    if (heading) {
      const button = document.createElement('button');
      button.innerText = 'Capture';
      button.style.marginLeft = '10px';
      button.style.padding = '5px 10px';
      button.style.backgroundColor = '#4CAF50';
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.borderRadius = '5px';
      button.style.cursor = 'pointer';
      button.style.fontSize = '14px';
  
      button.addEventListener('click', () => {
        const article = document.querySelector('.article--viewer');
        const articleContent = article ? article.innerText : '';
  
        if (articleContent) {
          fetch('http://localhost:5000/capture', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: articleContent })
          })
          .then(res => res.text())
          .then(data => {
            console.log('Server Response:', data);
            alert('Captured and sent to server!');
          })
          .catch(err => {
            console.error('Error:', err);
            alert('Failed to send content.');
          });
        } else {
          alert('No article content found.');
        }
      });
  
      heading.parentNode.insertBefore(button, heading.nextSibling);
    }
  }
  
  window.addEventListener('load', () => {
    setTimeout(injectCaptureButton, 2000);
  });
  