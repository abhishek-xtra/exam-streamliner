/* Applies the saved light/dark theme before the page paints (a file, not inline, so the security policy can forbid inline scripts). */
try{ if(localStorage.getItem('xm.theme')==='dark') document.documentElement.dataset.theme='dark'; }catch(e){}
